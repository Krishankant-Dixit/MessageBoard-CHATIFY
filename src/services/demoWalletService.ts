import { ethers } from 'ethers';
import { Platform } from 'react-native';
import {
  setStorageItem,
  getStorageItem,
  removeStorageItem,
  isWebPlatform,
} from '../utils/webSafeStorage';

/**
 * Demo Wallet Service
 * Generates and manages fake Ethereum addresses for demo/testing purposes
 * Stores wallet data persistently using web-safe storage (AsyncStorage on native, in-memory on web)
 */

const IS_WEB = Platform.OS === 'web';

const DEMO_WALLET_STORAGE_KEY = '@chatify:demo_wallet';
const DEMO_CONNECTION_STATE_KEY = '@chatify:demo_connection_state';

export interface DemoWallet {
  address: string;
  privateKey: string;
  name: string;
  createdAt: number;
  lastConnected: number | null;
}

export interface ConnectionState {
  isConnected: boolean;
  walletAddress: string | null;
  chainId: number | null;
  network: string | null;
  connectedAt: number | null;
}

/**
 * Generate a new random Ethereum wallet
 * Returns address and private key (for demo purposes only)
 */
export const generateDemoWallet = (): { address: string; privateKey: string } => {
  // Create a random wallet using ethers
  const wallet = ethers.Wallet.createRandom();
  
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
};

/**
 * Generate a demo wallet from a seed phrase
 * Useful for deterministic wallet generation in testing
 */
export const generateDemoWalletFromSeed = (seed: string): { address: string; privateKey: string } => {
  // Create a deterministic wallet from seed
  const mnemonic = ethers.Mnemonic.fromPhrase(
    ethers.Mnemonic.entropyToPhrase(ethers.id(seed).slice(2, 34))
  );
  const wallet = ethers.HDNodeWallet.fromMnemonic(mnemonic);
  
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
};

/**
 * Store demo wallet data
 */
export const storeDemoWallet = async (wallet: DemoWallet): Promise<void> => {
  try {
    await setStorageItem(DEMO_WALLET_STORAGE_KEY, JSON.stringify(wallet));
    console.log('✓ Demo wallet stored:', wallet.address);
  } catch (error) {
    console.error('Error storing demo wallet:', error);
    // Don't throw on web - storage is handled gracefully
    if (!isWebPlatform()) {
      throw error;
    }
  }
};

/**
 * Retrieve stored demo wallet
 */
export const getStoredDemoWallet = async (): Promise<DemoWallet | null> => {
  try {
    const stored = await getStorageItem(DEMO_WALLET_STORAGE_KEY);
    if (stored) {
      const wallet = JSON.parse(stored) as DemoWallet;
      console.log('✓ Demo wallet retrieved:', wallet.address);
      return wallet;
    }
    return null;
  } catch (error) {
    console.error('Error retrieving demo wallet:', error);
    // Return null gracefully on error
    return null;
  }
};

/**
 * Delete stored demo wallet
 */
export const deleteDemoWallet = async (): Promise<void> => {
  try {
    await removeStorageItem(DEMO_WALLET_STORAGE_KEY);
    console.log('✓ Demo wallet deleted');
  } catch (error) {
    console.error('Error deleting demo wallet:', error);
    // Don't throw on web
    if (!isWebPlatform()) {
      throw error;
    }
  }
};

/**
 * Create or retrieve demo wallet
 * If wallet exists, returns it; otherwise creates a new one
 */
export const getOrCreateDemoWallet = async (name: string = 'Demo User'): Promise<DemoWallet> => {
  try {
    // Check if wallet already exists
    const existing = await getStoredDemoWallet();
    if (existing) {
      return existing;
    }

    // Generate new wallet
    const { address, privateKey } = generateDemoWallet();
    const wallet: DemoWallet = {
      address,
      privateKey,
      name,
      createdAt: Date.now(),
      lastConnected: null,
    };

    // Store it
    await storeDemoWallet(wallet);
    return wallet;
  } catch (error) {
    console.error('Error getting/creating demo wallet:', error);
    throw error;
  }
};

/**
 * Store connection state
 */
export const storeConnectionState = async (state: ConnectionState): Promise<void> => {
  try {
    await setStorageItem(DEMO_CONNECTION_STATE_KEY, JSON.stringify(state));
    console.log('✓ Connection state stored');
  } catch (error) {
    console.error('Error storing connection state:', error);
    // Don't throw on web
    if (!isWebPlatform()) {
      throw error;
    }
  }
};

/**
 * Retrieve connection state
 */
export const getConnectionState = async (): Promise<ConnectionState | null> => {
  try {
    const stored = await getStorageItem(DEMO_CONNECTION_STATE_KEY);
    if (stored) {
      return JSON.parse(stored) as ConnectionState;
    }
    return null;
  } catch (error) {
    console.error('Error retrieving connection state:', error);
    return null;
  }
};

/**
 * Clear connection state
 */
export const clearConnectionState = async (): Promise<void> => {
  try {
    await removeStorageItem(DEMO_CONNECTION_STATE_KEY);
    console.log('✓ Connection state cleared');
  } catch (error) {
    console.error('Error clearing connection state:', error);
    // Don't throw on web
    if (!isWebPlatform()) {
      throw error;
    }
  }
};

/**
 * Update last connected timestamp for a wallet
 */
export const updateWalletLastConnected = async (): Promise<void> => {
  try {
    const wallet = await getStoredDemoWallet();
    if (wallet) {
      wallet.lastConnected = Date.now();
      await storeDemoWallet(wallet);
    }
  } catch (error) {
    console.error('Error updating wallet last connected:', error);
  }
};

/**
 * Check if a wallet address is valid Ethereum address
 */
export const isValidEthereumAddress = (address: string): boolean => {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
};

/**
 * Format wallet address for display
 */
export const formatWalletAddress = (address: string): string => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Get wallet balance (mock for demo mode)
 */
export const getDemoWalletBalance = async (address: string): Promise<string> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock balance
  const mockBalance = (Math.random() * 5 + 0.1).toFixed(4);
  return mockBalance;
};

/**
 * Generate multiple demo wallets for testing
 */
export const generateMultipleDemoWallets = (count: number): DemoWallet[] => {
  const wallets: DemoWallet[] = [];
  
  for (let i = 0; i < count; i++) {
    const { address, privateKey } = generateDemoWallet();
    wallets.push({
      address,
      privateKey,
      name: `Demo User ${i + 1}`,
      createdAt: Date.now(),
      lastConnected: null,
    });
  }
  
  return wallets;
};

/**
 * Export wallet data (for backup/testing)
 */
export const exportWalletData = async (): Promise<string> => {
  try {
    const wallet = await getStoredDemoWallet();
    const connectionState = await getConnectionState();
    
    const exportData = {
      wallet,
      connectionState,
      exportedAt: Date.now(),
    };
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting wallet data:', error);
    throw error;
  }
};

/**
 * Import wallet data (from backup/testing)
 */
export const importWalletData = async (data: string): Promise<void> => {
  try {
    const parsed = JSON.parse(data);
    
    if (parsed.wallet) {
      await storeDemoWallet(parsed.wallet);
    }
    
    if (parsed.connectionState) {
      await storeConnectionState(parsed.connectionState);
    }
    
    console.log('✓ Wallet data imported successfully');
  } catch (error) {
    console.error('Error importing wallet data:', error);
    throw error;
  }
};
