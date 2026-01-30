// Application constants

/**
 * DEMO_MODE: Global flag to enable demo/test mode
 * When enabled:
 * - All blockchain calls are disabled (returns mock data)
 * - All AI/Gemini calls are disabled (returns mock responses)
 * - Uses local mock data for all operations
 * - Simulates network delays for realistic UX
 * 
 * Set to false for production or when blockchain/AI is properly configured
 */
export const DEMO_MODE = true;

/**
 * Network delay simulation in demo mode (milliseconds)
 * Simulates realistic API/blockchain response times
 */
export const DEMO_NETWORK_DELAY = 500;

// Demo wallet address for testing
// In production, this would be replaced with actual wallet connection
export const DEMO_WALLET_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

// Default network ID (Ethereum Sepolia Testnet for development)
export const DEFAULT_CHAIN_ID = 11155111;

// RPC URL for blockchain connection
// For development: Use Sepolia testnet RPC
// Update with your RPC provider URL from Infura, Alchemy, or other service
export const RPC_URL = process.env.EXPO_PUBLIC_RPC_URL || 
  'https://sepolia.infura.io/v3/YOUR_INFURA_KEY';

// Gemini API Key for AI features
export const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

// Message constraints
export const MAX_MESSAGE_LENGTH = 280;

// Network names and RPC URLs
export const NETWORK_NAMES: { [key: number]: string } = {
  1: 'Ethereum Mainnet',
  5: 'Goerli Testnet',
  11155111: 'Sepolia Testnet',
  137: 'Polygon Mainnet',
  80001: 'Polygon Mumbai',
  42161: 'Arbitrum One',
  421613: 'Arbitrum Goerli',
};

// Network RPC URLs (for reference)
export const NETWORK_RPC_URLS: { [key: number]: string } = {
  1: 'https://eth.public-rpc.com',
  5: 'https://goerli.blockpi.network/v1/rpc/public',
  11155111: 'https://sepolia.infura.io/v3/YOUR_KEY',
  137: 'https://polygon-rpc.com',
  80001: 'https://rpc-mumbai.maticvigil.com',
  42161: 'https://arb1.arbitrum.io/rpc',
  421613: 'https://goerli-rollup.arbitrum.io/rpc',
};

// Contract addresses (update with your deployed contracts)
export const CONTRACT_ADDRESSES: { [key: number]: string } = {
  1: '0x...', // Mainnet
  11155111: '0x...', // Sepolia
  137: '0x...', // Polygon
};

// API Endpoints
export const API_ENDPOINTS = {
  // Update with your backend API endpoints
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  messages: '/api/messages',
  rooms: '/api/rooms',
  users: '/api/users',
};

/**
 * Mock data for DEMO_MODE
 * These are used when blockchain and AI calls are disabled
 */
export const MOCK_USERS = [
  {
    address: DEMO_WALLET_ADDRESS,
    name: 'Alice Developer',
    avatar: '👨‍💻',
  },
  {
    address: '0x1234567890abcdef1234567890abcdef12345678',
    name: 'Bob Designer',
    avatar: '🎨',
  },
  {
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    name: 'Charlie Manager',
    avatar: '👔',
  },
  {
    address: '0x9876543210fedcba9876543210fedcba98765432',
    name: 'Diana Marketer',
    avatar: '📱',
  },
];

export const MOCK_CHAT_ROOMS = [
  {
    id: 'general',
    name: '🌐 General',
    type: 'public' as const,
    description: 'General discussion and announcements',
    members: MOCK_USERS.map(u => u.address),
    createdBy: DEMO_WALLET_ADDRESS,
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 30,
    avatar: '🌐',
  },
  {
    id: 'dev',
    name: '👨‍💻 Development',
    type: 'public' as const,
    description: 'Technical discussions and code reviews',
    members: [DEMO_WALLET_ADDRESS, MOCK_USERS[0].address, MOCK_USERS[1].address],
    createdBy: DEMO_WALLET_ADDRESS,
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 20,
    avatar: '👨‍💻',
  },
  {
    id: 'design',
    name: '🎨 Design',
    type: 'public' as const,
    description: 'UI/UX design discussions',
    members: [DEMO_WALLET_ADDRESS, MOCK_USERS[1].address],
    createdBy: MOCK_USERS[1].address,
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 15,
    avatar: '🎨',
  },
];

export const MOCK_MESSAGES = [
  {
    id: 1,
    sender: DEMO_WALLET_ADDRESS,
    content: '🚀 Welcome to Chatify - Blockchain-powered secure messaging!',
    timestamp: Math.floor(Date.now() / 1000) - 86400 * 5,
    isEdited: false,
    editCount: 0,
    roomId: 'general',
    sentiment: 'positive' as const,
    sentimentScore: 0.85,
    isSafe: true,
    safetyCategory: 'safe' as const,
  },
  {
    id: 2,
    sender: MOCK_USERS[0].address,
    content: 'This is amazing! A decentralized chat built with React Native and Ethereum.',
    timestamp: Math.floor(Date.now() / 1000) - 86400 * 5 + 3600,
    isEdited: false,
    editCount: 0,
    roomId: 'general',
    sentiment: 'positive' as const,
    sentimentScore: 0.9,
    isSafe: true,
    safetyCategory: 'safe' as const,
  },
  {
    id: 3,
    sender: MOCK_USERS[1].address,
    content: 'All messages are immutably stored on the blockchain. Web3 at its finest! 🎉',
    timestamp: Math.floor(Date.now() / 1000) - 86400 * 5 + 7200,
    isEdited: false,
    editCount: 0,
    roomId: 'general',
    sentiment: 'positive' as const,
    sentimentScore: 0.88,
    isSafe: true,
    safetyCategory: 'safe' as const,
  },
  {
    id: 4,
    sender: DEMO_WALLET_ADDRESS,
    content: 'Started working on the new contract interface',
    timestamp: Math.floor(Date.now() / 1000) - 3600 * 2,
    isEdited: false,
    editCount: 0,
    roomId: 'dev',
    sentiment: 'neutral' as const,
    sentimentScore: 0.5,
    isSafe: true,
    safetyCategory: 'safe' as const,
  },
  {
    id: 5,
    sender: MOCK_USERS[0].address,
    content: 'Great! Let me know if you need help with the ABI integration',
    timestamp: Math.floor(Date.now() / 1000) - 3600,
    isEdited: false,
    editCount: 0,
    roomId: 'dev',
    sentiment: 'positive' as const,
    sentimentScore: 0.75,
    isSafe: true,
    safetyCategory: 'safe' as const,
  },
  {
    id: 6,
    sender: MOCK_USERS[2].address,
    content: 'The UI is looking fantastic! Love the clean design 🎨',
    timestamp: Math.floor(Date.now() / 1000) - 1800,
    isEdited: false,
    editCount: 0,
    roomId: 'design',
    sentiment: 'positive' as const,
    sentimentScore: 0.92,
    isSafe: true,
    safetyCategory: 'safe' as const,
  },
  {
    id: 7,
    sender: MOCK_USERS[1].address,
    content: 'Thanks! We focused on minimalism and user experience.',
    timestamp: Math.floor(Date.now() / 1000) - 900,
    isEdited: false,
    editCount: 0,
    roomId: 'design',
    sentiment: 'positive' as const,
    sentimentScore: 0.8,
    isSafe: true,
    safetyCategory: 'safe' as const,
  },
  {
    id: 8,
    sender: MOCK_USERS[3].address,
    content: 'This project has great potential for growth and adoption 📈',
    timestamp: Math.floor(Date.now() / 1000) - 300,
    isEdited: false,
    editCount: 0,
    roomId: 'general',
    sentiment: 'positive' as const,
    sentimentScore: 0.87,
    isSafe: true,
    safetyCategory: 'safe' as const,
  },
];

/**
 * Utility function to simulate network delay
 * Useful for testing loading states and UX
 */
export const simulateNetworkDelay = (ms: number = DEMO_NETWORK_DELAY): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

