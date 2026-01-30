// Message Board Smart Contract ABI and Configuration
// Solidity Contract: MessageBoard.sol

export const MESSAGE_BOARD_ABI = [
  // Post a new message
  {
    inputs: [{ name: 'message', type: 'string' }],
    name: 'postMessage',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Get total message count
  {
    inputs: [],
    name: 'getMessageCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Get a specific message by ID
  {
    inputs: [{ name: 'messageId', type: 'uint256' }],
    name: 'getMessage',
    outputs: [
      { name: 'sender', type: 'address' },
      { name: 'content', type: 'string' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'isEdited', type: 'bool' },
      { name: 'editCount', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // Get paginated messages
  {
    inputs: [
      { name: 'offset', type: 'uint256' },
      { name: 'limit', type: 'uint256' },
    ],
    name: 'getMessages',
    outputs: [
      {
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'sender', type: 'address' },
          { name: 'content', type: 'string' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'isEdited', type: 'bool' },
          { name: 'editCount', type: 'uint256' },
        ],
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // Edit a message
  {
    inputs: [
      { name: 'messageId', type: 'uint256' },
      { name: 'newContent', type: 'string' },
    ],
    name: 'editMessage',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Event: MessagePosted
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'messageId', type: 'uint256' },
      { indexed: true, name: 'sender', type: 'address' },
      { indexed: false, name: 'content', type: 'string' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
    name: 'MessagePosted',
    type: 'event',
  },
  // Event: MessageEdited
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'messageId', type: 'uint256' },
      { indexed: true, name: 'sender', type: 'address' },
      { indexed: false, name: 'oldContent', type: 'string' },
      { indexed: false, name: 'newContent', type: 'string' },
    ],
    name: 'MessageEdited',
    type: 'event',
  },
];

// Contract address (UPDATE AFTER DEPLOYMENT)
// Deploy via Remix IDE: https://remix.ethereum.org
// Network: Ethereum Sepolia Testnet (Chain ID: 11155111)
export const MESSAGE_BOARD_ADDRESS =
  process.env.EXPO_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

// Network ID
export const MESSAGE_BOARD_NETWORK = 11155111; // Sepolia Testnet

// Message Edit history interface
export interface MessageEdit {
  oldContent: string;
  newContent: string;
  editedAt: number;
  blockchainHash?: string;
}

// Message type definition with all optional fields
export interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: number;
  isEdited: boolean;
  editCount: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  sentimentScore?: number;
  isSafe?: boolean;
  safetyCategory?: 'safe' | 'spam' | 'abuse' | 'sensitive';
  safetyReason?: string;
  roomId?: string;
  isPrivate?: boolean;
  editHistory?: MessageEdit[];
  reactions?: Record<string, string[]>; // reaction -> list of userIds (optional, maintained off-chain)
}

// Add reaction types (off-chain)
export interface ReactionSummary {
  reaction: string;
  count: number;
  reactedByMe?: boolean;
  users?: string[]; // user IDs or addresses
}