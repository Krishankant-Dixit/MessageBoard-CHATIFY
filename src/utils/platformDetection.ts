/**
 * Platform Detection Utilities
 * Provides helper functions for detecting platform-specific features and capabilities
 */

import { Platform } from 'react-native';

/**
 * Check if running on web platform
 */
export const isWeb = (): boolean => {
  return Platform.OS === 'web';
};

/**
 * Check if running on iOS
 */
export const isIOS = (): boolean => {
  return Platform.OS === 'ios';
};

/**
 * Check if running on Android
 */
export const isAndroid = (): boolean => {
  return Platform.OS === 'android';
};

/**
 * Check if running on native platform (iOS or Android)
 */
export const isNative = (): boolean => {
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

/**
 * Get current platform name
 */
export const getPlatformName = (): 'web' | 'ios' | 'android' => {
  if (isWeb()) return 'web';
  if (isIOS()) return 'ios';
  if (isAndroid()) return 'android';
  return 'web'; // Default fallback
};

/**
 * Check if blockchain operations are supported
 * On web, blockchain writes are disabled but reads can be simulated
 */
export const isBlockchainWriteSupported = (): boolean => {
  return !isWeb();
};

/**
 * Check if storage operations are supported
 * On web, in-memory storage is used; on native, AsyncStorage is used
 */
export const isStorageSupported = (): boolean => {
  return true; // Both web and native have some form of storage
};

/**
 * Check if wallet connection is supported
 * On web, only simulated wallets are used
 */
export const isWalletConnectionSupported = (): boolean => {
  return !isWeb();
};

/**
 * Get safe message for user based on platform
 */
export const getPlatformWarning = (): string | null => {
  if (isWeb()) {
    return 'Running in web demo mode. Blockchain operations are simulated.';
  }
  return null;
};

/**
 * Get platform-specific configuration
 */
export const getPlatformConfig = () => {
  return {
    isWeb: isWeb(),
    isNative: isNative(),
    platform: getPlatformName(),
    blockchainWriteSupported: isBlockchainWriteSupported(),
    walletConnectionSupported: isWalletConnectionSupported(),
    storageSupported: isStorageSupported(),
  };
};

/**
 * Wrap async operation with platform-specific error handling
 */
export const wrapPlatformOperation = async <T>(
  operation: () => Promise<T>,
  fallbackValue: T,
  operationName: string = 'operation'
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.error(`Error in platform operation [${operationName}]:`, error);

    if (isWeb()) {
      // On web, return fallback value instead of throwing
      console.warn(`Returning fallback for web platform: ${operationName}`);
      return fallbackValue;
    }

    // On native, re-throw for caller to handle
    throw error;
  }
};

/**
 * Check if feature is available based on platform
 */
export const isFeatureAvailable = (
  feature: 'blockchain' | 'storage' | 'wallet' | 'notifications' | 'camera'
): boolean => {
  if (isWeb()) {
    // Limited features on web
    return feature === 'storage' || feature === 'notifications';
  }

  // All features available on native
  return true;
};

/**
 * Get platform-specific feature status
 */
export const getFeatureStatus = (
  feature: 'blockchain' | 'storage' | 'wallet' | 'notifications' | 'camera'
): {
  available: boolean;
  readOnly?: boolean;
  note?: string;
} => {
  if (feature === 'blockchain') {
    return {
      available: true,
      readOnly: isWeb(),
      note: isWeb() ? 'Reads only, writes simulated' : 'Full support',
    };
  }

  if (feature === 'wallet') {
    return {
      available: true,
      readOnly: isWeb(),
      note: isWeb() ? 'Simulated only' : 'Real MetaMask support',
    };
  }

  if (feature === 'storage') {
    return {
      available: true,
      note: isWeb() ? 'In-memory (not persistent)' : 'AsyncStorage (persistent)',
    };
  }

  // Other features
  return {
    available: !isWeb(),
  };
};
