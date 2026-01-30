/**
 * Demo Wallet Helper Utilities
 * Provides convenience functions for demo wallet operations
 */

import {
  type DemoWallet,
  type ConnectionState,
  getOrCreateDemoWallet,
  getStoredDemoWallet,
  deleteDemoWallet,
  storeConnectionState,
  getConnectionState,
  clearConnectionState,
  formatWalletAddress,
  isValidEthereumAddress,
  getDemoWalletBalance,
  generateMultipleDemoWallets,
} from '../services/demoWalletService';

/**
 * Initialize demo wallet on app startup
 * Returns the wallet if it exists, otherwise creates a new one
 */
export const initializeDemoWallet = async (userName?: string): Promise<DemoWallet> => {
  const name = userName || 'Demo User';
  return await getOrCreateDemoWallet(name);
};

/**
 * Check if user has an existing demo wallet
 */
export const hasExistingDemoWallet = async (): Promise<boolean> => {
  const wallet = await getStoredDemoWallet();
  return wallet !== null;
};

/**
 * Reset demo wallet (delete and create new)
 */
export const resetDemoWallet = async (userName?: string): Promise<DemoWallet> => {
  await deleteDemoWallet();
  await clearConnectionState();
  return await getOrCreateDemoWallet(userName || 'Demo User');
};

/**
 * Get wallet info for display
 */
export const getWalletDisplayInfo = async (): Promise<{
  address: string;
  formattedAddress: string;
  name: string;
  balance: string;
  isConnected: boolean;
} | null> => {
  const wallet = await getStoredDemoWallet();
  const connectionState = await getConnectionState();
  
  if (!wallet) {
    return null;
  }
  
  const balance = await getDemoWalletBalance(wallet.address);
  
  return {
    address: wallet.address,
    formattedAddress: formatWalletAddress(wallet.address),
    name: wallet.name,
    balance,
    isConnected: connectionState?.isConnected || false,
  };
};

/**
 * Update connection status
 */
export const updateConnectionStatus = async (
  isConnected: boolean,
  chainId?: number,
  network?: string
): Promise<void> => {
  const wallet = await getStoredDemoWallet();
  
  if (!wallet) {
    throw new Error('No wallet found');
  }
  
  const state: ConnectionState = {
    isConnected,
    walletAddress: wallet.address,
    chainId: chainId || null,
    network: network || null,
    connectedAt: isConnected ? Date.now() : null,
  };
  
  await storeConnectionState(state);
};

/**
 * Get connection status
 */
export const getConnectionStatus = async (): Promise<{
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  network: string | null;
}> => {
  const state = await getConnectionState();
  
  if (!state) {
    return {
      isConnected: false,
      address: null,
      chainId: null,
      network: null,
    };
  }
  
  return {
    isConnected: state.isConnected,
    address: state.walletAddress,
    chainId: state.chainId,
    network: state.network,
  };
};

/**
 * Validate and format Ethereum address
 */
export const validateAndFormatAddress = (address: string): {
  isValid: boolean;
  formatted: string;
  error?: string;
} => {
  if (!address) {
    return {
      isValid: false,
      formatted: '',
      error: 'Address is required',
    };
  }
  
  if (!isValidEthereumAddress(address)) {
    return {
      isValid: false,
      formatted: address,
      error: 'Invalid Ethereum address',
    };
  }
  
  return {
    isValid: true,
    formatted: formatWalletAddress(address),
  };
};

/**
 * Generate test wallets for development
 */
export const generateTestWallets = (count: number = 5): DemoWallet[] => {
  return generateMultipleDemoWallets(count);
};

/**
 * Get wallet age (how long ago it was created)
 */
export const getWalletAge = async (): Promise<{
  days: number;
  hours: number;
  minutes: number;
} | null> => {
  const wallet = await getStoredDemoWallet();
  
  if (!wallet) {
    return null;
  }
  
  const now = Date.now();
  const ageMs = now - wallet.createdAt;
  
  const minutes = Math.floor(ageMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  return {
    days,
    hours: hours % 24,
    minutes: minutes % 60,
  };
};

/**
 * Get last connection time
 */
export const getLastConnectionTime = async (): Promise<Date | null> => {
  const wallet = await getStoredDemoWallet();
  
  if (!wallet || !wallet.lastConnected) {
    return null;
  }
  
  return new Date(wallet.lastConnected);
};

/**
 * Format wallet info for display
 */
export const formatWalletInfo = (wallet: DemoWallet): string => {
  const created = new Date(wallet.createdAt).toLocaleDateString();
  const lastConnected = wallet.lastConnected
    ? new Date(wallet.lastConnected).toLocaleString()
    : 'Never';
  
  return `
Name: ${wallet.name}
Address: ${wallet.address}
Short: ${formatWalletAddress(wallet.address)}
Created: ${created}
Last Connected: ${lastConnected}
  `.trim();
};

// Re-export for convenience
export {
  formatWalletAddress,
  isValidEthereumAddress,
  getDemoWalletBalance,
};

export type { DemoWallet, ConnectionState };
