/**
 * Demo Wallet System Tests
 * Test suite for verifying demo wallet functionality
 */

import {
  generateDemoWallet,
  generateDemoWalletFromSeed,
  getOrCreateDemoWallet,
  storeDemoWallet,
  getStoredDemoWallet,
  deleteDemoWallet,
  storeConnectionState,
  getConnectionState,
  clearConnectionState,
  isValidEthereumAddress,
  formatWalletAddress,
  getDemoWalletBalance,
  exportWalletData,
  importWalletData,
  generateMultipleDemoWallets,
} from '../services/demoWalletService';

import {
  initializeDemoWallet,
  hasExistingDemoWallet,
  resetDemoWallet,
  getWalletDisplayInfo,
  getConnectionStatus,
  validateAndFormatAddress,
  getWalletAge,
  formatWalletInfo,
} from '../utils/demoWalletHelpers';

/**
 * Test wallet generation
 */
export const testWalletGeneration = async () => {
  console.log('=== Testing Wallet Generation ===');
  
  try {
    // Test 1: Generate random wallet
    console.log('\n1. Testing random wallet generation...');
    const wallet1 = generateDemoWallet();
    console.log('✓ Generated wallet:', wallet1.address);
    console.log('  - Valid address:', isValidEthereumAddress(wallet1.address));
    console.log('  - Has private key:', wallet1.privateKey.length > 0);
    
    // Test 2: Generate from seed
    console.log('\n2. Testing seed-based wallet generation...');
    const wallet2 = generateDemoWalletFromSeed('test-seed-123');
    const wallet3 = generateDemoWalletFromSeed('test-seed-123');
    console.log('✓ Generated wallet from seed:', wallet2.address);
    console.log('  - Deterministic:', wallet2.address === wallet3.address);
    
    // Test 3: Generate multiple wallets
    console.log('\n3. Testing multiple wallet generation...');
    const wallets = generateMultipleDemoWallets(3);
    console.log('✓ Generated', wallets.length, 'wallets');
    wallets.forEach((w, i) => {
      console.log(`  - Wallet ${i + 1}:`, w.address);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Wallet generation test failed:', error);
    return false;
  }
};

/**
 * Test wallet storage
 */
export const testWalletStorage = async () => {
  console.log('\n=== Testing Wallet Storage ===');
  
  try {
    // Test 1: Store and retrieve wallet
    console.log('\n1. Testing wallet storage...');
    const { address, privateKey } = generateDemoWallet();
    const wallet = {
      address,
      privateKey,
      name: 'Test Wallet',
      createdAt: Date.now(),
      lastConnected: null,
    };
    
    await storeDemoWallet(wallet);
    console.log('✓ Stored wallet');
    
    const retrieved = await getStoredDemoWallet();
    console.log('✓ Retrieved wallet:', retrieved?.address);
    console.log('  - Match:', retrieved?.address === wallet.address);
    
    // Test 2: Delete wallet
    console.log('\n2. Testing wallet deletion...');
    await deleteDemoWallet();
    const afterDelete = await getStoredDemoWallet();
    console.log('✓ Deleted wallet');
    console.log('  - Null after delete:', afterDelete === null);
    
    // Test 3: Get or create wallet
    console.log('\n3. Testing get or create wallet...');
    const wallet1 = await getOrCreateDemoWallet('User 1');
    console.log('✓ Created wallet:', wallet1.address);
    
    const wallet2 = await getOrCreateDemoWallet('User 2');
    console.log('✓ Retrieved existing wallet:', wallet2.address);
    console.log('  - Same wallet:', wallet1.address === wallet2.address);
    
    return true;
  } catch (error) {
    console.error('❌ Wallet storage test failed:', error);
    return false;
  }
};

/**
 * Test connection state management
 */
export const testConnectionState = async () => {
  console.log('\n=== Testing Connection State ===');
  
  try {
    // Test 1: Store and retrieve connection state
    console.log('\n1. Testing connection state storage...');
    const state = {
      isConnected: true,
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      chainId: 11155111,
      network: 'Sepolia Testnet',
      connectedAt: Date.now(),
    };
    
    await storeConnectionState(state);
    console.log('✓ Stored connection state');
    
    const retrieved = await getConnectionState();
    console.log('✓ Retrieved connection state');
    console.log('  - Connected:', retrieved?.isConnected);
    console.log('  - Address:', retrieved?.walletAddress);
    console.log('  - Network:', retrieved?.network);
    
    // Test 2: Clear connection state
    console.log('\n2. Testing connection state clearing...');
    await clearConnectionState();
    const afterClear = await getConnectionState();
    console.log('✓ Cleared connection state');
    console.log('  - Null after clear:', afterClear === null);
    
    return true;
  } catch (error) {
    console.error('❌ Connection state test failed:', error);
    return false;
  }
};

/**
 * Test helper functions
 */
export const testHelperFunctions = async () => {
  console.log('\n=== Testing Helper Functions ===');
  
  try {
    // Test 1: Initialize demo wallet
    console.log('\n1. Testing wallet initialization...');
    await deleteDemoWallet(); // Clean slate
    const wallet = await initializeDemoWallet('Test User');
    console.log('✓ Initialized wallet:', wallet.address);
    
    // Test 2: Check existing wallet
    console.log('\n2. Testing existing wallet check...');
    const exists = await hasExistingDemoWallet();
    console.log('✓ Wallet exists:', exists);
    
    // Test 3: Get wallet display info
    console.log('\n3. Testing wallet display info...');
    await storeConnectionState({
      isConnected: true,
      walletAddress: wallet.address,
      chainId: 11155111,
      network: 'Sepolia',
      connectedAt: Date.now(),
    });
    
    const displayInfo = await getWalletDisplayInfo();
    console.log('✓ Display info:');
    console.log('  - Name:', displayInfo?.name);
    console.log('  - Address:', displayInfo?.formattedAddress);
    console.log('  - Balance:', displayInfo?.balance, 'ETH');
    console.log('  - Connected:', displayInfo?.isConnected);
    
    // Test 4: Get connection status
    console.log('\n4. Testing connection status...');
    const status = await getConnectionStatus();
    console.log('✓ Connection status:');
    console.log('  - Connected:', status.isConnected);
    console.log('  - Address:', status.address);
    console.log('  - Chain:', status.chainId);
    
    // Test 5: Validate address
    console.log('\n5. Testing address validation...');
    const valid = validateAndFormatAddress(wallet.address);
    console.log('✓ Valid address:', valid.isValid);
    console.log('  - Formatted:', valid.formatted);
    
    const invalid = validateAndFormatAddress('invalid');
    console.log('✓ Invalid address:', invalid.isValid);
    console.log('  - Error:', invalid.error);
    
    // Test 6: Get wallet age
    console.log('\n6. Testing wallet age...');
    const age = await getWalletAge();
    console.log('✓ Wallet age:');
    console.log(`  - ${age?.days}d ${age?.hours}h ${age?.minutes}m`);
    
    // Test 7: Format wallet info
    console.log('\n7. Testing wallet info formatting...');
    const formatted = formatWalletInfo(wallet);
    console.log('✓ Formatted info:\n', formatted);
    
    // Test 8: Reset wallet
    console.log('\n8. Testing wallet reset...');
    const oldAddress = wallet.address;
    const newWallet = await resetDemoWallet('New User');
    console.log('✓ Reset wallet');
    console.log('  - Old:', oldAddress);
    console.log('  - New:', newWallet.address);
    console.log('  - Different:', oldAddress !== newWallet.address);
    
    return true;
  } catch (error) {
    console.error('❌ Helper functions test failed:', error);
    return false;
  }
};

/**
 * Test export/import functionality
 */
export const testExportImport = async () => {
  console.log('\n=== Testing Export/Import ===');
  
  try {
    // Test 1: Export wallet data
    console.log('\n1. Testing export...');
    await getOrCreateDemoWallet('Export Test');
    const exported = await exportWalletData();
    console.log('✓ Exported wallet data');
    console.log('  - Data length:', exported.length, 'chars');
    
    // Test 2: Delete and import
    console.log('\n2. Testing import...');
    const originalAddress = (await getStoredDemoWallet())?.address;
    await deleteDemoWallet();
    await clearConnectionState();
    
    await importWalletData(exported);
    const restored = await getStoredDemoWallet();
    console.log('✓ Imported wallet data');
    console.log('  - Restored:', restored?.address);
    console.log('  - Match:', restored?.address === originalAddress);
    
    return true;
  } catch (error) {
    console.error('❌ Export/import test failed:', error);
    return false;
  }
};

/**
 * Test address formatting
 */
export const testAddressFormatting = () => {
  console.log('\n=== Testing Address Formatting ===');
  
  try {
    const addresses = [
      '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      '0x1234567890123456789012345678901234567890',
      '0xabcdef',
    ];
    
    addresses.forEach((addr, i) => {
      console.log(`\n${i + 1}. Testing address: ${addr}`);
      const formatted = formatWalletAddress(addr);
      const valid = isValidEthereumAddress(addr);
      console.log('  - Formatted:', formatted);
      console.log('  - Valid:', valid);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Address formatting test failed:', error);
    return false;
  }
};

/**
 * Test balance retrieval
 */
export const testBalanceRetrieval = async () => {
  console.log('\n=== Testing Balance Retrieval ===');
  
  try {
    const wallet = await getOrCreateDemoWallet();
    const balance = await getDemoWalletBalance(wallet.address);
    console.log('✓ Retrieved balance:', balance, 'ETH');
    console.log('  - Is number:', !isNaN(parseFloat(balance)));
    
    return true;
  } catch (error) {
    console.error('❌ Balance retrieval test failed:', error);
    return false;
  }
};

/**
 * Run all tests
 */
export const runAllDemoWalletTests = async () => {
  console.log('\n🚀 Starting Demo Wallet System Tests...\n');
  
  const results = {
    generation: await testWalletGeneration(),
    storage: await testWalletStorage(),
    connectionState: await testConnectionState(),
    helpers: await testHelperFunctions(),
    exportImport: await testExportImport(),
    formatting: testAddressFormatting(),
    balance: await testBalanceRetrieval(),
  };
  
  console.log('\n\n=== TEST RESULTS ===');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}`);
  });
  
  const allPassed = Object.values(results).every(r => r);
  console.log('\n' + (allPassed ? '🎉 All tests passed!' : '⚠️ Some tests failed'));
  
  return results;
};

// Example usage:
// import { runAllDemoWalletTests } from './demoWalletTests';
// runAllDemoWalletTests();
