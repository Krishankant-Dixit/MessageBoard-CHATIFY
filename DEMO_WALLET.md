# Demo Wallet System Documentation

Comprehensive demo wallet system that generates and stores fake Ethereum addresses for testing and development.

## Overview

A fully functional wallet experience without blockchain connectivity. Perfect for development, testing, demo presentations, and MVP prototyping.

**Status**: ✅ Complete and Production-Ready (for demo/development use)

## Quick Start

### 1. Connect Wallet

```typescript
import { useWeb3 } from './context/Web3Context';

function MyComponent() {
  const { connectWallet, disconnectWallet, account, isConnected } = useWeb3();

  return (
    <View>
      {!isConnected ? (
        <Button title="Connect Wallet" onPress={connectWallet} />
      ) : (
        <>
          <Text>Connected: {account}</Text>
          <Button title="Disconnect" onPress={disconnectWallet} />
        </>
      )}
    </View>
  );
}
```

### 2. Get Wallet Information

```typescript
import { getWalletDisplayInfo } from './utils/demoWalletHelpers';

const info = await getWalletDisplayInfo();
console.log('Address:', info.address);
console.log('Balance:', info.balance, 'ETH');
console.log('Connected:', info.isConnected);
```

### 3. Initialize on App Startup

```typescript
import { initializeDemoWallet } from './utils/demoWalletHelpers';

useEffect(() => {
  const setupWallet = async () => {
    const wallet = await initializeDemoWallet('My App User');
    console.log('Wallet ready:', wallet.address);
  };
  setupWallet();
}, []);
```

## Features

✅ **Wallet Generation** - Random & deterministic Ethereum addresses  
✅ **Persistent Storage** - AsyncStorage integration with auto-restore  
✅ **Auto-Reconnect** - Restores connection on app restart  
✅ **Connection State** - Full lifecycle management  
✅ **Export/Import** - Backup and restore functionality  
✅ **Validation** - Address validation and formatting  
✅ **Testing Tools** - Debug screen and test suite  

## Core Functions

### Web3Context (useWeb3)

```typescript
const {
  connectWallet,        // Connect demo wallet
  disconnectWallet,     // Disconnect and clear state
  account,              // Current wallet address
  isConnected,          // Connection status
  network,              // Current network name
  chainId,              // Current chain ID
} = useWeb3();
```

### Helper Functions

```typescript
import {
  initializeDemoWallet,          // Initialize on startup
  hasExistingDemoWallet,         // Check if wallet exists
  resetDemoWallet,               // Generate new wallet
  getWalletDisplayInfo,          // Get formatted info for UI
  getConnectionStatus,           // Get connection state
  validateAndFormatAddress,      // Validate address
  formatWalletAddress,           // Format 0x1234...5678
} from './utils/demoWalletHelpers';
```

### Service Functions

```typescript
import {
  generateDemoWallet,                 // Generate random wallet
  generateDemoWalletFromSeed,         // Deterministic generation
  getOrCreateDemoWallet,              // Get or create wallet
  storeDemoWallet,                    // Store wallet
  getStoredDemoWallet,                // Retrieve wallet
  deleteDemoWallet,                   // Delete wallet
  storeConnectionState,               // Store connection
  getConnectionState,                 // Get connection
  clearConnectionState,               // Clear connection
  exportWalletData,                   // Export backup
  importWalletData,                   // Restore backup
  isValidEthereumAddress,             // Validate address
  getDemoWalletBalance,               // Get mock balance
} from './services/demoWalletService';
```

## Common Use Cases

### Auto-Connect on App Launch

```typescript
useEffect(() => {
  const autoConnect = async () => {
    const status = await getConnectionStatus();
    if (status.isConnected) {
      await connectWallet();
    }
  };
  autoConnect();
}, []);
```

### Display Formatted Address

```typescript
import { formatWalletAddress } from './utils/demoWalletHelpers';

const formatted = formatWalletAddress(address);
// Shows: 0x742d...0bEb
```

### Validate User Input

```typescript
const result = validateAndFormatAddress(userInput);
if (!result.isValid) {
  setError(result.error);
  return;
}
console.log('Valid address:', result.formatted);
```

### Reset Wallet

```typescript
const newWallet = await resetDemoWallet('New User');
console.log('New wallet:', newWallet.address);
```

### Export/Import Wallet

```typescript
// Export
const backup = await exportWalletData();
// Restore
await importWalletData(backup);
```

## Storage

**Wallet Data** (`@chatify:demo_wallet`)
```typescript
{
  address: string;           // Ethereum address
  privateKey: string;        // Private key (demo only!)
  name: string;              // User name
  createdAt: number;         // Timestamp
  lastConnected: number | null;
}
```

**Connection State** (`@chatify:demo_connection_state`)
```typescript
{
  isConnected: boolean;
  walletAddress: string | null;
  chainId: number | null;
  network: string | null;
  connectedAt: number | null;
}
```

## Implementation Files

**Created:**
- `src/services/demoWalletService.ts` - Core service (267 lines)
- `src/utils/demoWalletHelpers.ts` - Helpers (216 lines)
- `src/screens/DemoWalletInfoScreen.tsx` - Debug screen (307 lines)
- `src/tests/demoWalletTests.ts` - Test suite (290 lines)

**Modified:**
- `src/context/Web3Context.tsx` - Added demo wallet integration
- `src/screens/index.ts` - Export new screen

## Testing

### Run Tests

```typescript
import { runAllDemoWalletTests } from './tests/demoWalletTests';
const results = await runAllDemoWalletTests();
```

### Debug Screen

Add to navigation for interactive testing:
```typescript
import { DemoWalletInfoScreen } from './screens/DemoWalletInfoScreen';

<Stack.Screen 
  name="DemoWalletInfo" 
  component={DemoWalletInfoScreen}
  options={{ title: 'Wallet Info' }}
/>
```

## Security ⚠️

**For DEMO/TESTING ONLY**
- Private keys stored in plain text (no encryption)
- AsyncStorage is not secure storage
- Not suitable for real funds
- For development/demo use only

## Architecture

```
Web3Context (useWeb3)
    ↓
demoWalletService (core operations)
    ↓
AsyncStorage (persistent storage)
    
demoWalletHelpers (convenience functions)
    ↓
demoWalletService
```

## Integration Flow

1. **App Launch** → Load stored connection state
2. **If connected** → Restore wallet, restore UI
3. **User connects** → Generate/retrieve wallet, store state
4. **User disconnects** → Clear state, keep wallet data
5. **App restart** → Auto-restore from storage

## Examples

### Complete Integration

```typescript
function App() {
  const { connectWallet, account, isConnected } = useWeb3();
  const [walletInfo, setWalletInfo] = useState(null);

  useEffect(() => {
    loadInfo();
  }, [isConnected]);

  const loadInfo = async () => {
    const info = await getWalletDisplayInfo();
    setWalletInfo(info);
  };

  return (
    <View>
      <Text>My Wallet</Text>
      {isConnected && walletInfo ? (
        <>
          <Text>{walletInfo.name}</Text>
          <Text>{walletInfo.formattedAddress}</Text>
          <Text>{walletInfo.balance} ETH</Text>
        </>
      ) : (
        <Button title="Connect" onPress={connectWallet} />
      )}
    </View>
  );
}
```

### Wallet Management Component

```typescript
function WalletManager() {
  const { connectWallet, disconnectWallet, isConnected } = useWeb3();
  const [walletAge, setWalletAge] = useState(null);

  useEffect(() => {
    const checkAge = async () => {
      const age = await getWalletAge();
      setWalletAge(age);
    };
    checkAge();
  }, [isConnected]);

  const handleReset = async () => {
    await resetDemoWallet();
    // UI updates automatically
  };

  return (
    <View>
      <Button 
        title={isConnected ? "Disconnect" : "Connect"} 
        onPress={isConnected ? disconnectWallet : connectWallet}
      />
      <Button title="Reset Wallet" onPress={handleReset} />
      {walletAge && (
        <Text>Age: {walletAge.days}d {walletAge.hours}h</Text>
      )}
    </View>
  );
}
```

## Statistics

- **Total Code**: ~1,700+ lines
- **Files Created**: 4
- **Files Modified**: 2
- **Test Modules**: 7
- **Documentation**: 500+ lines

## Next Steps

1. Add wallet UI to login/profile screens
2. Customize wallet naming and avatars
3. Add network switching UI
4. Create wallet management screen
5. Implement transaction history (optional)

---

**Status**: ✅ Complete and fully functional  
**Date**: January 29, 2026  
**Ready for**: Development, testing, demos, MVP prototyping
