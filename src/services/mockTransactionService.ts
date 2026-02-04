/**
 * Mock Transaction Service
 * Provides simulated blockchain transactions for web demo mode
 * Generates realistic mock transaction hashes and responses
 */

import { DEMO_NETWORK_DELAY, simulateNetworkDelay } from '../utils/constants';

/**
 * Mock transaction response
 */
export interface MockTransaction {
  hash: string;
  from: string;
  to?: string;
  data: string;
  value: string;
  gasLimit: string;
  gasPrice: string;
  nonce: number;
  blockNumber?: number;
  transactionIndex?: number;
  status?: 1 | 0;
  timestamp: number;
}

/**
 * Mock receipt response
 */
export interface MockReceipt {
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  from: string;
  to?: string;
  contractAddress?: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  logs: any[];
  logsBloom: string;
  status: 1 | 0;
  transactionIndex: number;
  confirmations: number;
  timestamp: number;
}

let mockNonce = 0;
let mockBlockNumber = 18500000;

/**
 * Generate a realistic mock transaction hash
 */
export const generateMockTxHash = (): string => {
  const randomBytes = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, '0')
  ).join('');
  return `0x${randomBytes}`;
};

/**
 * Generate a realistic mock block hash
 */
export const generateMockBlockHash = (): string => {
  const randomBytes = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, '0')
  ).join('');
  return `0x${randomBytes}`;
};

/**
 * Simulate posting a message transaction
 */
export const simulatePostMessageTransaction = async (
  walletAddress: string,
  messageContent: string
): Promise<MockTransaction> => {
  await simulateNetworkDelay(500);

  mockNonce++;

  const tx: MockTransaction = {
    hash: generateMockTxHash(),
    from: walletAddress,
    data: messageContent.slice(0, 66),
    value: '0',
    gasLimit: '100000',
    gasPrice: '20000000000',
    nonce: mockNonce,
    timestamp: Date.now(),
  };

  console.log('✓ Mock transaction created:', tx.hash);
  return tx;
};

/**
 * Simulate transaction confirmation
 */
export const simulateTransactionConfirmation = async (
  txHash: string,
  walletAddress: string
): Promise<MockReceipt> => {
  await simulateNetworkDelay(1000);

  mockBlockNumber++;
  const confirmations = Math.floor(Math.random() * 10) + 1;

  const receipt: MockReceipt = {
    transactionHash: txHash,
    blockNumber: mockBlockNumber,
    blockHash: generateMockBlockHash(),
    from: walletAddress,
    cumulativeGasUsed: '50000',
    gasUsed: '50000',
    logs: [],
    logsBloom: '0x' + '0'.repeat(512),
    status: 1,
    transactionIndex: Math.floor(Math.random() * 100),
    confirmations,
    timestamp: Date.now(),
  };

  console.log('✓ Mock receipt generated:', receipt);
  return receipt;
};

/**
 * Get mock transaction details
 */
export const getMockTransactionDetails = async (
  txHash: string
): Promise<MockTransaction | null> => {
  await simulateNetworkDelay(300);

  // Simulate transaction not found with 10% probability
  if (Math.random() < 0.1) {
    console.log('✓ Mock transaction not found (pending)');
    return null;
  }

  return {
    hash: txHash,
    from: '0x0000000000000000000000000000000000000000',
    data: '0x',
    value: '0',
    gasLimit: '100000',
    gasPrice: '20000000000',
    nonce: Math.floor(Math.random() * 1000),
    blockNumber: mockBlockNumber,
    transactionIndex: Math.floor(Math.random() * 100),
    status: 1,
    timestamp: Date.now(),
  };
};

/**
 * Simulate message read operation
 */
export const simulateReadMessages = async (
  count: number = 10
): Promise<Array<{ id: number; timestamp: number }>> => {
  await simulateNetworkDelay(800);

  const messages = Array.from({ length: Math.min(count, 20) }, (_, i) => ({
    id: i + 1,
    timestamp: Date.now() - (i * 3600 * 1000),
  }));

  console.log(`✓ Mock read: ${messages.length} messages`);
  return messages;
};

/**
 * Simulate message count operation
 */
export const simulateGetMessageCount = async (
  roomId?: string
): Promise<number> => {
  await simulateNetworkDelay(300);

  const count = Math.floor(Math.random() * 100) + 10;
  console.log(`✓ Mock message count: ${count}`);
  return count;
};

/**
 * Simulate wallet balance query
 */
export const simulateGetBalance = async (
  address: string
): Promise<string> => {
  await simulateNetworkDelay(500);

  const balanceEth = (Math.random() * 5 + 0.1).toFixed(4);
  console.log(`✓ Mock balance for ${address}: ${balanceEth} ETH`);
  return balanceEth;
};

/**
 * Simulate contract call (read-only)
 */
export const simulateContractCall = async (
  method: string,
  params?: any[]
): Promise<any> => {
  await simulateNetworkDelay(400);

  console.log(`✓ Mock contract call: ${method}(${params?.join(', ') || ''})`);
  return null;
};

/**
 * Reset mock state (useful for testing)
 */
export const resetMockState = (): void => {
  mockNonce = 0;
  mockBlockNumber = 18500000;
  console.log('✓ Mock state reset');
};
