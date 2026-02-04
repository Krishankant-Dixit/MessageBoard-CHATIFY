/**
 * Web-Safe Storage Abstraction
 * Handles storage operations for both native and web platforms
 * On web platform, uses in-memory cache instead of AsyncStorage
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IS_WEB = Platform.OS === 'web';

// In-memory cache for web platform
const memoryCache: Map<string, string> = new Map();

/**
 * Safely set an item in storage
 * Uses AsyncStorage on native, in-memory cache on web
 */
export const setStorageItem = async (
  key: string,
  value: string
): Promise<void> => {
  try {
    if (IS_WEB) {
      // Use in-memory cache for web
      memoryCache.set(key, value);
      console.log(`✓ Storage (web): ${key} set`);
      return;
    }

    // Use AsyncStorage for native
    await AsyncStorage.setItem(key, value);
    console.log(`✓ Storage (native): ${key} set`);
  } catch (error) {
    console.error(`Error setting storage item [${key}]:`, error);
    // On web, always succeed silently (in-memory cache)
    // On native, throw error for caller to handle
    if (!IS_WEB) {
      throw error;
    }
  }
};

/**
 * Safely get an item from storage
 * Uses AsyncStorage on native, in-memory cache on web
 */
export const getStorageItem = async (key: string): Promise<string | null> => {
  try {
    if (IS_WEB) {
      // Use in-memory cache for web
      const value = memoryCache.get(key) || null;
      if (value) {
        console.log(`✓ Storage (web): ${key} retrieved`);
      }
      return value;
    }

    // Use AsyncStorage for native
    const value = await AsyncStorage.getItem(key);
    if (value) {
      console.log(`✓ Storage (native): ${key} retrieved`);
    }
    return value;
  } catch (error) {
    console.error(`Error getting storage item [${key}]:`, error);
    // On web, return null (in-memory cache)
    // On native, throw error for caller to handle
    if (!IS_WEB) {
      throw error;
    }
    return null;
  }
};

/**
 * Safely remove an item from storage
 * Uses AsyncStorage on native, in-memory cache on web
 */
export const removeStorageItem = async (key: string): Promise<void> => {
  try {
    if (IS_WEB) {
      // Use in-memory cache for web
      memoryCache.delete(key);
      console.log(`✓ Storage (web): ${key} removed`);
      return;
    }

    // Use AsyncStorage for native
    await AsyncStorage.removeItem(key);
    console.log(`✓ Storage (native): ${key} removed`);
  } catch (error) {
    console.error(`Error removing storage item [${key}]:`, error);
    // On web, always succeed silently (in-memory cache)
    // On native, throw error for caller to handle
    if (!IS_WEB) {
      throw error;
    }
  }
};

/**
 * Safely clear all storage
 * Uses AsyncStorage on native, in-memory cache on web
 */
export const clearAllStorage = async (): Promise<void> => {
  try {
    if (IS_WEB) {
      // Clear in-memory cache
      memoryCache.clear();
      console.log('✓ Storage (web): all items cleared');
      return;
    }

    // Clear AsyncStorage on native
    await AsyncStorage.clear();
    console.log('✓ Storage (native): all items cleared');
  } catch (error) {
    console.error('Error clearing storage:', error);
    // On web, always succeed silently (in-memory cache)
    // On native, throw error for caller to handle
    if (!IS_WEB) {
      throw error;
    }
  }
};

/**
 * Check if platform is web
 */
export const isWebPlatform = (): boolean => {
  return IS_WEB;
};

/**
 * Get all keys in storage
 * Uses AsyncStorage on native, in-memory cache on web
 */
export const getAllStorageKeys = async (): Promise<string[]> => {
  try {
    if (IS_WEB) {
      return Array.from(memoryCache.keys());
    }

    return [...(await AsyncStorage.getAllKeys())];
  } catch (error) {
    console.error('Error getting storage keys:', error);
    return [];
  }
};
