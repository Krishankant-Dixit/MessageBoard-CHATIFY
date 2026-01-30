# DEMO_MODE Implementation Guide

## Overview
A global `DEMO_MODE` flag has been implemented to disable blockchain and AI calls, using local mock data with simulated network delays for testing and demonstration purposes.

## Configuration

### Enable/Disable DEMO_MODE
Edit [src/utils/constants.ts](src/utils/constants.ts) line 12:

```typescript
export const DEMO_MODE = true;  // Set to false for production
```

### Network Delay Simulation
Customize the simulated network delay (in milliseconds):

```typescript
export const DEMO_NETWORK_DELAY = 500;  // Default: 500ms
```

## Features

### 1. **Blockchain Calls Disabled**
When `DEMO_MODE = true`:
- Wallet connection uses mock data (no RPC calls)
- Message posting returns mock transaction hashes
- Message fetching uses `MOCK_MESSAGES` instead of contract calls
- All blockchain interactions are simulated

**Affected in [src/context/Web3Context.tsx](src/context/Web3Context.tsx):**
- `connectWallet()` - Returns demo wallet instantly
- `postMessage()` - Returns mock transaction hash
- `getMessages()` - Returns mock messages from constants
- `getMessageCount()` - Returns mock count from mock data

### 2. **AI/Gemini Calls Disabled**
When `DEMO_MODE = true`:
- All Gemini API calls are skipped
- Mock responses are returned with simulated delays
- `isGeminiReady()` always returns `false` in demo mode

**Affected in [src/services/geminiService.ts](src/services/geminiService.ts):**
- `initializeGemini()` - Skips initialization in demo mode
- `analyzeMessageSafety()` - Returns mock safety response
- `summarizeMessages()` - Returns mock summary
- `generateSmartSuggestions()` - Returns mock suggestions
- `extractTopics()` - Returns mock topics
- `analyzeSentiment()` - Returns mock sentiment
- `translateMessage()` - Returns mock translation
- `generateResponseSuggestion()` - Returns mock suggestion

### 3. **Local Mock Data**
All mock data is stored in [src/utils/constants.ts](src/utils/constants.ts):

#### Mock Users
```typescript
export const MOCK_USERS = [
  { address: DEMO_WALLET_ADDRESS, name: 'Alice Developer', avatar: '👨‍💻' },
  { address: '0x1234...', name: 'Bob Designer', avatar: '🎨' },
  { address: '0xabcd...', name: 'Charlie Manager', avatar: '👔' },
  { address: '0x9876...', name: 'Diana Marketer', avatar: '📱' },
]
```

#### Mock Chat Rooms
- **#general** - Public discussion and announcements
- **#dev** - Technical discussions and code reviews
- **#design** - UI/UX design discussions

#### Mock Messages
5 pre-populated messages across different rooms with realistic timestamps and content.

### 4. **Network Delay Simulation**
All mock API/blockchain calls include a simulated network delay:

```typescript
export const simulateNetworkDelay = (ms: number = DEMO_NETWORK_DELAY): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
```

This provides realistic loading states and UX for testing without actual API calls.

## Usage Examples

### Checking DEMO_MODE Status
```typescript
import { DEMO_MODE } from '../utils/constants';

if (DEMO_MODE) {
  console.log('Running in demo mode - using mock data');
}
```

### Accessing Mock Data
```typescript
import { MOCK_MESSAGES, MOCK_USERS, MOCK_CHAT_ROOMS } from '../utils/constants';

const mockMessages = MOCK_MESSAGES;  // 5 pre-populated messages
const mockUsers = MOCK_USERS;        // 4 demo users
const mockRooms = MOCK_CHAT_ROOMS;   // 3 public chat rooms
```

### Simulating Network Delay
```typescript
import { simulateNetworkDelay, DEMO_NETWORK_DELAY } from '../utils/constants';

// Use default delay (500ms)
await simulateNetworkDelay();

// Custom delay
await simulateNetworkDelay(1000);
```

## Switching to Production

To enable actual blockchain and AI features:

1. **Disable DEMO_MODE** in [src/utils/constants.ts](src/utils/constants.ts):
   ```typescript
   export const DEMO_MODE = false;
   ```

2. **Configure Environment Variables:**
   ```bash
   EXPO_PUBLIC_RPC_URL=<your-rpc-url>
   EXPO_PUBLIC_GEMINI_API_KEY=<your-gemini-api-key>
   ```

3. **Deploy Smart Contract:**
   - Update `MESSAGE_BOARD_ADDRESS` in the contract configuration
   - Ensure contract ABI is correctly imported

## Files Modified

1. **[src/utils/constants.ts](src/utils/constants.ts)**
   - Added `DEMO_MODE` flag
   - Added `DEMO_NETWORK_DELAY` constant
   - Added `MOCK_USERS`, `MOCK_CHAT_ROOMS`, `MOCK_MESSAGES` mock data
   - Added `simulateNetworkDelay()` helper function

2. **[src/services/geminiService.ts](src/services/geminiService.ts)**
   - Imported `DEMO_MODE` and `simulateNetworkDelay`
   - Updated `initializeGemini()` to skip initialization in demo mode
   - Updated `isGeminiReady()` to return false in demo mode
   - Added demo mode checks and mock responses to all AI functions

3. **[src/context/Web3Context.tsx](src/context/Web3Context.tsx)**
   - Imported `DEMO_MODE`, `simulateNetworkDelay`, and `MOCK_MESSAGES`
   - Updated `connectWallet()` with demo mode wallet connection
   - Updated `postMessage()` to return mock transaction hash in demo mode
   - Updated `getMessages()` to use mock data in demo mode
   - Updated `getMessageCount()` to use mock count in demo mode
   - Updated `getDemoMessages()` to use centralized mock data

## Benefits

✅ **No Blockchain Required** - Test without RPC connection or deployed contracts  
✅ **No AI API Key** - Test AI features without Gemini API configuration  
✅ **Realistic UX** - Simulated network delays provide realistic loading states  
✅ **Easy Toggling** - Single flag switches between demo and production  
✅ **Centralized Mock Data** - All mock data in one place for easy updates  
✅ **Production Ready** - No demo code in production builds when flag is disabled  

## Testing Checklist

- [ ] Demo mode enabled - blockchain calls use mock data
- [ ] Demo mode enabled - AI calls use mock responses
- [ ] Network delays are simulated (check console timing)
- [ ] Mock messages appear in chat
- [ ] Mock users appear in user lists
- [ ] Mock rooms appear in room lists
- [ ] Toggle theme works in demo mode
- [ ] Post message returns mock transaction hash
- [ ] Disable demo mode - actual blockchain calls are attempted
- [ ] Disable demo mode - actual AI calls are attempted
