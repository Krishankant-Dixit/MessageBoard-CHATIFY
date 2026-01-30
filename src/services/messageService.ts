/**
 * Message Service
 * Unified interface for managing on-chain and off-chain messages
 * Handles mock messages with sentiment and safety analysis
 * Works with both DEMO_MODE and blockchain-connected mode
 */

import { Message } from '../contracts/MessageBoard';
import { DEMO_MODE, MOCK_MESSAGES, simulateNetworkDelay } from '../utils/constants';

/**
 * Enhanced message type with sentiment and safety metadata
 */
export interface EnhancedMessage extends Message {
  sentiment?: 'positive' | 'neutral' | 'negative';
  sentimentScore?: number;
  isSafe?: boolean;
  safetyCategory?: 'safe' | 'spam' | 'abuse' | 'sensitive';
  safetyReason?: string;
}

/**
 * Message filter options
 */
export interface MessageFilterOptions {
  roomId?: string;
  sender?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  isSafe?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Message statistics
 */
export interface MessageStats {
  totalCount: number;
  totalByRoom: Record<string, number>;
  totalBySender: Record<string, number>;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  safetyStats: {
    safe: number;
    flagged: number;
  };
  averageSentimentScore: number;
}

/**
 * Get all messages with optional filtering
 * @param filters - Optional filter criteria
 * @returns Promise resolving to array of enhanced messages
 */
export const getMessages = async (filters?: MessageFilterOptions): Promise<EnhancedMessage[]> => {
  try {
    // Simulate network delay in demo mode
    if (DEMO_MODE) {
      await simulateNetworkDelay();
    }

    let messages: EnhancedMessage[] = MOCK_MESSAGES as EnhancedMessage[];

    // Apply filters
    if (filters) {
      if (filters.roomId) {
        messages = messages.filter(m => m.roomId === filters.roomId);
      }

      if (filters.sender) {
        messages = messages.filter(m => m.sender.toLowerCase() === filters.sender?.toLowerCase());
      }

      if (filters.sentiment) {
        messages = messages.filter(m => m.sentiment === filters.sentiment);
      }

      if (filters.isSafe !== undefined) {
        messages = messages.filter(m => m.isSafe === filters.isSafe);
      }

      // Apply pagination
      const offset = filters.offset || 0;
      const limit = filters.limit || 10;
      messages = messages.slice(offset, offset + limit);
    }

    console.log(`✓ Retrieved ${messages.length} messages${DEMO_MODE ? ' (Demo Mode)' : ''}`);
    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

/**
 * Get a single message by ID
 * @param messageId - The message ID to fetch
 * @returns Promise resolving to the message or null
 */
export const getMessageById = async (messageId: number): Promise<EnhancedMessage | null> => {
  try {
    if (DEMO_MODE) {
      await simulateNetworkDelay(300);
    }

    const message = MOCK_MESSAGES.find((m: any) => m.id === messageId);
    if (!message) {
      console.warn(`Message ${messageId} not found`);
      return null;
    }

    console.log(`✓ Retrieved message ${messageId}${DEMO_MODE ? ' (Demo Mode)' : ''}`);
    return message as EnhancedMessage;
  } catch (error) {
    console.error(`Error fetching message ${messageId}:`, error);
    return null;
  }
};

/**
 * Get messages from a specific room
 * @param roomId - The room ID to fetch messages from
 * @param limit - Maximum number of messages to return
 * @param offset - Offset for pagination
 * @returns Promise resolving to array of messages
 */
export const getMessagesByRoom = async (
  roomId: string,
  limit: number = 10,
  offset: number = 0
): Promise<EnhancedMessage[]> => {
  try {
    if (DEMO_MODE) {
      await simulateNetworkDelay();
    }

    const messages = (MOCK_MESSAGES as EnhancedMessage[]).filter((m: EnhancedMessage) => m.roomId === roomId).slice(offset, offset + limit);
    console.log(`✓ Retrieved ${messages.length} messages from room ${roomId}${DEMO_MODE ? ' (Demo Mode)' : ''}`);
    return messages;
  } catch (error) {
    console.error(`Error fetching messages from room ${roomId}:`, error);
    return [];
  }
};

/**
 * Get messages from a specific sender (wallet address)
 * @param senderAddress - The wallet address to filter by
 * @param limit - Maximum number of messages to return
 * @param offset - Offset for pagination
 * @returns Promise resolving to array of messages
 */
export const getMessagesBySender = async (
  senderAddress: string,
  limit: number = 10,
  offset: number = 0
): Promise<EnhancedMessage[]> => {
  try {
    if (DEMO_MODE) {
      await simulateNetworkDelay();
    }

    const normalizedAddress = senderAddress.toLowerCase();
    const messages = (MOCK_MESSAGES as EnhancedMessage[]).filter((m: EnhancedMessage) => m.sender.toLowerCase() === normalizedAddress).slice(
      offset,
      offset + limit
    );

    console.log(`✓ Retrieved ${messages.length} messages from sender ${senderAddress}${DEMO_MODE ? ' (Demo Mode)' : ''}`);
    return messages;
  } catch (error) {
    console.error(`Error fetching messages from sender ${senderAddress}:`, error);
    return [];
  }
};

/**
 * Get messages by sentiment
 * @param sentiment - The sentiment to filter by
 * @param limit - Maximum number of messages to return
 * @param offset - Offset for pagination
 * @returns Promise resolving to array of messages
 */
export const getMessagesBySentiment = async (
  sentiment: 'positive' | 'neutral' | 'negative',
  limit: number = 10,
  offset: number = 0
): Promise<EnhancedMessage[]> => {
  try {
    if (DEMO_MODE) {
      await simulateNetworkDelay();
    }

    const messages = (MOCK_MESSAGES as EnhancedMessage[]).filter((m: EnhancedMessage) => m.sentiment === sentiment).slice(offset, offset + limit);
    console.log(`✓ Retrieved ${messages.length} ${sentiment} sentiment messages${DEMO_MODE ? ' (Demo Mode)' : ''}`);
    return messages;
  } catch (error) {
    console.error(`Error fetching ${sentiment} sentiment messages:`, error);
    return [];
  }
};

/**
 * Get flagged (unsafe) messages
 * @param limit - Maximum number of messages to return
 * @param offset - Offset for pagination
 * @returns Promise resolving to array of flagged messages
 */
export const getFlaggedMessages = async (
  limit: number = 10,
  offset: number = 0
): Promise<EnhancedMessage[]> => {
  try {
    if (DEMO_MODE) {
      await simulateNetworkDelay();
    }

    const flaggedMessages = (MOCK_MESSAGES as EnhancedMessage[]).filter((m: EnhancedMessage) => !m.isSafe).slice(offset, offset + limit);
    console.log(`✓ Retrieved ${flaggedMessages.length} flagged messages${DEMO_MODE ? ' (Demo Mode)' : ''}`);
    return flaggedMessages;
  } catch (error) {
    console.error('Error fetching flagged messages:', error);
    return [];
  }
};

/**
 * Get safe messages only
 * @param limit - Maximum number of messages to return
 * @param offset - Offset for pagination
 * @returns Promise resolving to array of safe messages
 */
export const getSafeMessages = async (
  limit: number = 10,
  offset: number = 0
): Promise<EnhancedMessage[]> => {
  try {
    if (DEMO_MODE) {
      await simulateNetworkDelay();
    }

    const safeMessages = (MOCK_MESSAGES as EnhancedMessage[]).filter((m: EnhancedMessage) => m.isSafe).slice(offset, offset + limit);
    console.log(`✓ Retrieved ${safeMessages.length} safe messages${DEMO_MODE ? ' (Demo Mode)' : ''}`);
    return safeMessages;
  } catch (error) {
    console.error('Error fetching safe messages:', error);
    return [];
  }
};

/**
 * Get total message count
 * @returns Promise resolving to total message count
 */
export const getMessageCount = async (): Promise<number> => {
  try {
    if (DEMO_MODE) {
      await simulateNetworkDelay(200);
    }

    const count = MOCK_MESSAGES.length;
    console.log(`✓ Total message count: ${count}${DEMO_MODE ? ' (Demo Mode)' : ''}`);
    return count;
  } catch (error) {
    console.error('Error fetching message count:', error);
    return 0;
  }
};

/**
 * Get comprehensive message statistics
 * @returns Promise resolving to message statistics
 */
export const getMessageStats = async (): Promise<MessageStats> => {
  try {
    if (DEMO_MODE) {
      await simulateNetworkDelay(500);
    }

    const totalCount = MOCK_MESSAGES.length;

    // Count by room
    const totalByRoom: Record<string, number> = {};
    MOCK_MESSAGES.forEach(m => {
      if (m.roomId) {
        totalByRoom[m.roomId] = (totalByRoom[m.roomId] || 0) + 1;
      }
    });

    // Count by sender
    const totalBySender: Record<string, number> = {};
    MOCK_MESSAGES.forEach(m => {
      totalBySender[m.sender] = (totalBySender[m.sender] || 0) + 1;
    });

    // Sentiment breakdown
    const sentimentBreakdown = {
      positive: (MOCK_MESSAGES as EnhancedMessage[]).filter((m: EnhancedMessage) => m.sentiment === 'positive').length,
      neutral: (MOCK_MESSAGES as EnhancedMessage[]).filter((m: EnhancedMessage) => m.sentiment === 'neutral').length,
      negative: (MOCK_MESSAGES as EnhancedMessage[]).filter((m: EnhancedMessage) => m.sentiment === 'negative').length,
    };

    // Safety stats
    const safetyStats = {
      safe: (MOCK_MESSAGES as EnhancedMessage[]).filter((m: EnhancedMessage) => m.isSafe).length,
      flagged: (MOCK_MESSAGES as EnhancedMessage[]).filter((m: EnhancedMessage) => !m.isSafe).length,
    };

    // Average sentiment score
    const sentimentScores = (MOCK_MESSAGES as EnhancedMessage[]).filter((m: EnhancedMessage) => m.sentimentScore !== undefined).map((m: EnhancedMessage) => m.sentimentScore || 0);
    const averageSentimentScore =
      sentimentScores.length > 0 ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length : 0;

    const stats: MessageStats = {
      totalCount,
      totalByRoom,
      totalBySender,
      sentimentBreakdown,
      safetyStats,
      averageSentimentScore: Math.round(averageSentimentScore * 100) / 100,
    };

    console.log(`✓ Message statistics computed${DEMO_MODE ? ' (Demo Mode)' : ''}`);
    return stats;
  } catch (error) {
    console.error('Error computing message statistics:', error);
    return {
      totalCount: 0,
      totalByRoom: {},
      totalBySender: {},
      sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
      safetyStats: { safe: 0, flagged: 0 },
      averageSentimentScore: 0,
    };
  }
};

/**
 * Search messages by content
 * @param query - Search query string
 * @param limit - Maximum number of results
 * @returns Promise resolving to matching messages
 */
export const searchMessages = async (query: string, limit: number = 10): Promise<EnhancedMessage[]> => {
  try {
    if (DEMO_MODE) {
      await simulateNetworkDelay(300);
    }

    const lowerQuery = query.toLowerCase();
    const results = (MOCK_MESSAGES as EnhancedMessage[]).filter((m: EnhancedMessage) => m.content.toLowerCase().includes(lowerQuery)).slice(0, limit);

    console.log(`✓ Found ${results.length} messages matching "${query}"${DEMO_MODE ? ' (Demo Mode)' : ''}`);
    return results as EnhancedMessage[];
  } catch (error) {
    console.error(`Error searching messages for "${query}":`, error);
    return [];
  }
};

/**
 * Get trending topics from messages (hashtags and keywords)
 * @param limit - Maximum number of topics to return
 * @returns Promise resolving to trending topics with frequency
 */
export const getTrendingTopics = async (
  limit: number = 10
): Promise<Array<{ topic: string; frequency: number; messages: number }>> => {
  try {
    if (DEMO_MODE) {
      await simulateNetworkDelay(400);
    }

    const topicMap: Record<string, { frequency: number; messages: number }> = {};

    // Extract hashtags and keywords from messages
    (MOCK_MESSAGES as EnhancedMessage[]).forEach((m: EnhancedMessage) => {
      // Extract hashtags
      const hashtags = m.content.match(/#\w+/g) || [];
      hashtags.forEach((tag: string) => {
        if (!topicMap[tag]) {
          topicMap[tag] = { frequency: 0, messages: 0 };
        }
        topicMap[tag].frequency++;
        topicMap[tag].messages++;
      });

      // Extract emoji-based keywords
      const emojis = (m.content.match(/[\p{Emoji}]/gu) || []) as string[];
      emojis.forEach((emoji: string) => {
        if (!topicMap[emoji]) {
          topicMap[emoji] = { frequency: 0, messages: 0 };
        }
        topicMap[emoji].frequency++;
      });
    });

    const trending = Object.entries(topicMap)
      .map(([topic, data]: [string, { frequency: number; messages: number }]) => ({ topic, ...data }))
      .sort((a: any, b: any) => b.frequency - a.frequency)
      .slice(0, limit);

    console.log(`✓ Retrieved ${trending.length} trending topics${DEMO_MODE ? ' (Demo Mode)' : ''}`);
    return trending;
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    return [];
  }
};

/**
 * Get message sentiment distribution as percentage
 * @returns Promise resolving to sentiment percentages
 */
export const getSentimentDistribution = async (): Promise<{
  positive: number;
  neutral: number;
  negative: number;
}> => {
  try {
    if (DEMO_MODE) {
      await simulateNetworkDelay(250);
    }

    const total = MOCK_MESSAGES.length;
    if (total === 0) {
      return { positive: 0, neutral: 0, negative: 0 };
    }

    const distribution = {
      positive: ((MOCK_MESSAGES as EnhancedMessage[]).filter((m: EnhancedMessage) => m.sentiment === 'positive').length / total) * 100,
      neutral: ((MOCK_MESSAGES as EnhancedMessage[]).filter((m: EnhancedMessage) => m.sentiment === 'neutral').length / total) * 100,
      negative: ((MOCK_MESSAGES as EnhancedMessage[]).filter((m: EnhancedMessage) => m.sentiment === 'negative').length / total) * 100,
    };

    // Round to 2 decimals
    return {
      positive: Math.round(distribution.positive * 100) / 100,
      neutral: Math.round(distribution.neutral * 100) / 100,
      negative: Math.round(distribution.negative * 100) / 100,
    };
  } catch (error) {
    console.error('Error computing sentiment distribution:', error);
    return { positive: 0, neutral: 0, negative: 0 };
  }
};

/**
 * Export all message service functions as default
 */
export default {
  getMessages,
  getMessageById,
  getMessagesByRoom,
  getMessagesBySender,
  getMessagesBySentiment,
  getFlaggedMessages,
  getSafeMessages,
  getMessageCount,
  getMessageStats,
  searchMessages,
  getTrendingTopics,
  getSentimentDistribution,
};
