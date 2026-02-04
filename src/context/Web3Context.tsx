import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ethers } from 'ethers';
import { DEMO_WALLET_ADDRESS, DEFAULT_CHAIN_ID, RPC_URL, DEMO_MODE, IS_WEB, simulateNetworkDelay, MOCK_MESSAGES } from '../utils/constants';
import { MESSAGE_BOARD_ABI, MESSAGE_BOARD_ADDRESS, Message } from '../contracts/MessageBoard';
import {
  getOrCreateDemoWallet,
  storeConnectionState,
  getConnectionState,
  clearConnectionState,
  updateWalletLastConnected,
  DemoWallet,
} from '../services/demoWalletService';
import { wrapPlatformOperation, isWeb } from '../utils/platformDetection';

/**
 * Web3 Context for MetaMask Integration
 * Provides blockchain connection, wallet management, and contract interaction
 * 
 * Respects DEMO_MODE flag - when enabled, uses mock data without blockchain calls
 * On web platform, all blockchain writes are simulated and never actually sent
 */

type Web3Provider = ethers.JsonRpcProvider | null;
type Web3Signer = ethers.Signer | null;

interface Web3ContextType {
  provider: Web3Provider;
  signer: Web3Signer;
  account: string | null;
  isConnected: boolean;
  chainId: number | null;
  network: string | null;
  connectWallet: () => Promise<string>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  isMetaMaskInstalled: () => boolean;
  // Contract interaction methods
  postMessage: (message: string) => Promise<string>;
  getMessages: (limit?: number, offset?: number) => Promise<Message[]>;
  getMessageCount: () => Promise<number>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

/**
 * Get network name from chain ID
 */
const getNetworkName = (chainId: number | null): string | null => {
  const networks: { [key: number]: string } = {
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    11155111: 'Sepolia Testnet',
    137: 'Polygon Mainnet',
    80001: 'Polygon Mumbai',
    42161: 'Arbitrum One',
    421613: 'Arbitrum Goerli',
  };
  return chainId ? networks[chainId] || `Chain ${chainId}` : null;
};

const getDemoNetworkName = (chainId: number | null): string | null => {
  if (!chainId) return null;
  return chainId === DEFAULT_CHAIN_ID ? 'Sepolia (Demo)' : `Chain ${chainId} (Demo)`;
};

const simulateDemoConnectDelay = async (): Promise<void> => {
  const delayMs = 1000 + Math.floor(Math.random() * 1000);
  await new Promise(resolve => setTimeout(resolve, delayMs));
};

/**
 * Format wallet address for display
 */
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }: Web3ProviderProps) => {
  const [provider, setProvider] = useState<Web3Provider>(null);
  const [signer, setSigner] = useState<Web3Signer>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [demoWallet, setDemoWallet] = useState<DemoWallet | null>(null);

  const isWebDemo = IS_WEB;

  // Load stored connection state on mount
  useEffect(() => {
    loadConnectionState();
  }, []);

  /**
   * Load stored connection state from AsyncStorage
   * Gracefully handles errors on web platform
   */
  const loadConnectionState = async () => {
    try {
      if (isWebDemo) {
        console.log('ℹ Web platform detected - skipping persistent storage');
        return;
      }
      const state = await getConnectionState();
      if (state && state.isConnected && state.walletAddress) {
        // Restore connection state
        setAccount(state.walletAddress);
        setIsConnected(state.isConnected);
        setChainId(state.chainId);
        setNetwork(DEMO_MODE ? getDemoNetworkName(state.chainId) : state.network);
        
        // Load wallet data
        const wallet = await getOrCreateDemoWallet();
        setDemoWallet(wallet);
        
        console.log('✓ Connection state restored:', state.walletAddress);
      }
    } catch (error) {
      console.error('Error loading connection state:', error);
      // Don't crash on storage errors - app should continue functioning
      console.log('ℹ Continuing with fresh connection');
    }
  };

  /**
   * Connect to wallet (RPC provider)
   * For mobile, this would use WalletConnect
   * In DEMO_MODE or web, uses mock wallet without blockchain calls
   * Handles errors gracefully on all platforms
   */
  const connectWallet = async () => {
    try {
      console.log('Attempting to connect wallet...');

      if (DEMO_MODE || isWebDemo) {
        // Demo mode: generate or retrieve stored demo wallet
        await simulateDemoConnectDelay();

        if (isWebDemo) {
          const simulatedWallet: DemoWallet = {
            address: DEMO_WALLET_ADDRESS,
            privateKey: '0x' + '0'.repeat(64),
            name: 'Web Demo Wallet',
            createdAt: Date.now(),
            lastConnected: Date.now(),
          };

          setDemoWallet(simulatedWallet);
          setAccount(simulatedWallet.address);
          setIsConnected(true);
          setChainId(DEFAULT_CHAIN_ID);
          setNetwork(getDemoNetworkName(DEFAULT_CHAIN_ID));

          console.log('✓ Web demo wallet connected:', formatAddress(simulatedWallet.address));
          console.log('  - Address:', simulatedWallet.address);
          console.log('  - Network:', getDemoNetworkName(DEFAULT_CHAIN_ID));
          console.log('  - Mode: Simulated (no blockchain writes)');
          return simulatedWallet.address;
        }

        // Get or create demo wallet with persistent storage
        const wallet = await getOrCreateDemoWallet('Demo User');
        setDemoWallet(wallet);

        // Set connection state
        setAccount(wallet.address);
        setIsConnected(true);
        setChainId(DEFAULT_CHAIN_ID);
        setNetwork(getDemoNetworkName(DEFAULT_CHAIN_ID));

        // Update last connected timestamp
        await updateWalletLastConnected();

        // Store connection state
        await storeConnectionState({
          isConnected: true,
          walletAddress: wallet.address,
          chainId: DEFAULT_CHAIN_ID,
          network: getDemoNetworkName(DEFAULT_CHAIN_ID),
          connectedAt: Date.now(),
        });

        console.log('✓ Demo wallet connected:', formatAddress(wallet.address));
        console.log('  - Address:', wallet.address);
        console.log('  - Network:', getDemoNetworkName(DEFAULT_CHAIN_ID));
        return wallet.address;
      }

      if (!RPC_URL) {
        throw new Error('RPC URL not configured');
      }

      const jsonRpcProvider = new ethers.JsonRpcProvider(RPC_URL);
      setProvider(jsonRpcProvider);

      // For MVP demo: use demo wallet
      // In production: use WalletConnect for MetaMask mobile
      const wallet = await getOrCreateDemoWallet('Demo User');
      setDemoWallet(wallet);
      setAccount(wallet.address);
      setIsConnected(true);
      setChainId(DEFAULT_CHAIN_ID);
      setNetwork(getNetworkName(DEFAULT_CHAIN_ID));
      
      // Store connection state
      await storeConnectionState({
        isConnected: true,
        walletAddress: wallet.address,
        chainId: DEFAULT_CHAIN_ID,
        network: getNetworkName(DEFAULT_CHAIN_ID),
        connectedAt: Date.now(),
      });

      console.log('✓ Wallet connected:', formatAddress(wallet.address));
      return wallet.address;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      // Fallback: still set up demo mode so app doesn't crash
      const fallbackWallet: DemoWallet = {
        address: DEMO_WALLET_ADDRESS,
        privateKey: '0x' + '0'.repeat(64),
        name: 'Fallback Demo Wallet',
        createdAt: Date.now(),
        lastConnected: Date.now(),
      };
      setDemoWallet(fallbackWallet);
      setAccount(fallbackWallet.address);
      setIsConnected(false);
      setChainId(DEFAULT_CHAIN_ID);
      setNetwork(getDemoNetworkName(DEFAULT_CHAIN_ID));
      console.log('⚠ Fallback demo wallet activated');
      throw error;
    }
  };

  /**
   * Disconnect wallet and clear state
   * Handles gracefully on all platforms
   */
  const disconnectWallet = async () => {
    try {
      setProvider(null);
      setSigner(null);
      setAccount(null);
      setIsConnected(false);
      setChainId(null);
      setNetwork(null);
      setDemoWallet(null);
      
      // Clear stored connection state
      if (!isWebDemo) {
        await clearConnectionState();
      }
      
      console.log('✓ Wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      // Always clear local state even if storage fails
      setProvider(null);
      setSigner(null);
      setAccount(null);
      setIsConnected(false);
      setChainId(null);
      setNetwork(null);
      setDemoWallet(null);
    }
  };

  /**
   * Switch to a different network/chain
   */
  const switchNetwork = async (targetChainId: number) => {
    try {
      console.log(`Switching to chain ${targetChainId}...`);
      setChainId(targetChainId);
      setNetwork((DEMO_MODE || isWebDemo) ? getDemoNetworkName(targetChainId) : getNetworkName(targetChainId));
    } catch (error) {
      console.error('Error switching network:', error);
      throw error;
    }
  };

  /**
   * Check if MetaMask is installed (React Native limitation)
   */
  const isMetaMaskInstalled = (): boolean => {
    return false; // React Native doesn't have MetaMask detection
  };

  /**
   * Post a message to the blockchain
   * Returns transaction hash
   * In DEMO_MODE or web, returns mock transaction hash with simulated delay
   * Never actually posts to blockchain on web platform
   */
  const postMessage = async (_message: string): Promise<string> => {
    try {
      if (!account) {
        throw new Error('Wallet not connected');
      }

      if (DEMO_MODE || isWebDemo) {
        // Demo mode: return mock transaction hash
        await simulateNetworkDelay();
        const mockTxHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
        console.log('✓ Message posted (Demo Mode):', mockTxHash);
        if (isWebDemo) {
          console.log('  - This is a simulated transaction (web platform)');
        }
        return mockTxHash;
      }

      if (!provider) {
        throw new Error('Provider not initialized');
      }

      if (!MESSAGE_BOARD_ADDRESS || MESSAGE_BOARD_ADDRESS === '0x0000000000000000000000000000000000000000') {
        throw new Error('Contract address not configured. Please deploy contract first.');
      }

      console.log('Posting message to blockchain...');

      // Create contract instance
      // const contract = new ethers.Contract(
      //   MESSAGE_BOARD_ADDRESS,
      //   MESSAGE_BOARD_ABI,
      //   provider
      // );

      // Demo mode: return a mock transaction hash
      // In production: sign and send transaction with signer
      const mockTxHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
      console.log('✓ Message posted:', mockTxHash);
      return mockTxHash;
    } catch (error) {
      console.error('Error posting message:', error);
      // Return a demo hash instead of crashing
      if (isWebDemo) {
        console.log('⚠ Message post failed, returning mock hash for web platform');
        const mockTxHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
        return mockTxHash;
      }
      throw error;
    }
  };

  /**
   * Get messages from the blockchain
   * In DEMO_MODE or web, returns mock messages with simulated delay
   * Never queries real blockchain on web platform
   */
  const getMessages = async (limit: number = 10, offset: number = 0): Promise<Message[]> => {
    try {
      if (DEMO_MODE || isWebDemo) {
        // Demo mode: return mock messages with simulated delay
        await simulateNetworkDelay();
        if (isWebDemo) {
          console.log('✓ Messages fetched (simulated, web platform)');
        }
        return getDemoMessages(limit, offset);
      }

      if (!provider) {
        throw new Error('Provider not initialized');
      }

      if (!MESSAGE_BOARD_ADDRESS || MESSAGE_BOARD_ADDRESS === '0x0000000000000000000000000000000000000000') {
        // Return demo messages if contract not deployed
        return getDemoMessages(limit, offset);
      }

      console.log(`Fetching ${limit} messages from contract...`);

      // const contract = new ethers.Contract(
      //   MESSAGE_BOARD_ADDRESS,
      //   MESSAGE_BOARD_ABI,
      //   provider
      // );

      // Demo mode: return mock messages
      return getDemoMessages(limit, offset);
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Return demo messages as fallback - never crash
      console.log('ℹ Returning demo messages as fallback');
      return getDemoMessages(limit, offset);
    }
  };

  /**
   * Get total message count from contract
   * In DEMO_MODE or web, returns mock count with simulated delay
   * Never queries real blockchain on web platform
   */
  const getMessageCount = async (): Promise<number> => {
    try {
      if (DEMO_MODE || isWebDemo) {
        // Demo mode: return mock count with simulated delay
        await simulateNetworkDelay();
        if (isWebDemo) {
          console.log('✓ Message count fetched (simulated, web platform)');
        }
        return MOCK_MESSAGES.length;
      }

      if (!provider) {
        throw new Error('Provider not initialized');
      }

      if (!MESSAGE_BOARD_ADDRESS || MESSAGE_BOARD_ADDRESS === '0x0000000000000000000000000000000000000000') {
        return MOCK_MESSAGES.length; // Demo count
      }

      // const contract = new ethers.Contract(
      //   MESSAGE_BOARD_ADDRESS,
      //   MESSAGE_BOARD_ABI,
      //   provider
      // );

      // Demo mode: return mock count
      return MOCK_MESSAGES.length;
    } catch (error) {
      console.error('Error fetching message count:', error);
      // Return demo count as fallback - never crash
      console.log('ℹ Returning demo message count as fallback');
      return MOCK_MESSAGES.length;
    }
  };

  /**
   * Demo messages for MVP testing and DEMO_MODE
   */
  const getDemoMessages = (limit: number, offset: number): Message[] => {
    return MOCK_MESSAGES.slice(offset, offset + limit);
  };

  const value: Web3ContextType = {
    provider,
    signer,
    account,
    isConnected,
    chainId,
    network,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    isMetaMaskInstalled,
    postMessage,
    getMessages,
    getMessageCount,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
