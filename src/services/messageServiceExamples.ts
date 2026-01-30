/**
 * Message Service Usage Examples
 * Demonstrates how to use the comprehensive message service API
 */

import messageService, {
  EnhancedMessage,
  MessageFilterOptions,
} from '../services/messageService';

// ============================================================================
// BASIC MESSAGE RETRIEVAL
// ============================================================================

/**
 * Example 1: Get all messages
 */
export async function exampleGetAllMessages() {
  const messages = await messageService.getMessages();
  console.log(`Total messages: ${messages.length}`);
  messages.forEach(msg => {
    console.log(`[${msg.timestamp}] ${msg.sender}: ${msg.content}`);
  });
}

/**
 * Example 2: Get paginated messages
 */
export async function exampleGetPaginatedMessages() {
  const messages = await messageService.getMessages({
    limit: 5,
    offset: 0,
  });
  console.log(`First 5 messages: ${messages.length}`);
}

/**
 * Example 3: Get a single message by ID
 */
export async function exampleGetMessageById() {
  const message = await messageService.getMessageById(1);
  if (message) {
    console.log(`Message 1: ${message.content}`);
    console.log(`Sentiment: ${message.sentiment} (${message.sentimentScore})`);
    console.log(`Safe: ${message.isSafe}`);
  }
}

// ============================================================================
// ROOM-BASED QUERIES
// ============================================================================

/**
 * Example 4: Get messages from a specific room
 */
export async function exampleGetMessagesByRoom() {
  const generalRoomMessages = await messageService.getMessagesByRoom('general', 10, 0);
  console.log(`Messages in #general: ${generalRoomMessages.length}`);
  generalRoomMessages.forEach(msg => {
    console.log(`  - ${msg.sender}: ${msg.content}`);
  });
}

/**
 * Example 5: Get all messages using room filter
 */
export async function exampleRoomFilter() {
  const filters: MessageFilterOptions = {
    roomId: 'dev',
    limit: 10,
  };
  const devMessages = await messageService.getMessages(filters);
  console.log(`Development room messages: ${devMessages.length}`);
}

// ============================================================================
// SENDER-BASED QUERIES
// ============================================================================

/**
 * Example 6: Get messages from a specific sender
 */
export async function exampleGetMessagesBySender() {
  const walletAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
  const userMessages = await messageService.getMessagesBySender(walletAddress);
  console.log(`Messages from ${walletAddress}: ${userMessages.length}`);
}

// ============================================================================
// SENTIMENT-BASED QUERIES
// ============================================================================

/**
 * Example 7: Get positive messages
 */
export async function exampleGetPositiveMessages() {
  const positiveMessages = await messageService.getMessagesBySentiment('positive');
  console.log(`Positive messages: ${positiveMessages.length}`);
  positiveMessages.forEach(msg => {
    console.log(`  [${msg.sentimentScore}] ${msg.content}`);
  });
}

/**
 * Example 8: Get messages by sentiment using filters
 */
export async function exampleSentimentFilter() {
  const filters: MessageFilterOptions = {
    sentiment: 'positive',
    limit: 5,
  };
  const topPositive = await messageService.getMessages(filters);
  console.log(`Top 5 positive messages: ${topPositive.length}`);
}

/**
 * Example 9: Get sentiment distribution
 */
export async function exampleSentimentDistribution() {
  const distribution = await messageService.getSentimentDistribution();
  console.log(`Sentiment Distribution:`);
  console.log(`  Positive: ${distribution.positive}%`);
  console.log(`  Neutral: ${distribution.neutral}%`);
  console.log(`  Negative: ${distribution.negative}%`);
}

// ============================================================================
// SAFETY-BASED QUERIES
// ============================================================================

/**
 * Example 10: Get safe messages only
 */
export async function exampleGetSafeMessages() {
  const safeMessages = await messageService.getSafeMessages();
  console.log(`Safe messages: ${safeMessages.length}`);
}

/**
 * Example 11: Get flagged messages
 */
export async function exampleGetFlaggedMessages() {
  const flaggedMessages = await messageService.getFlaggedMessages();
  console.log(`Flagged messages: ${flaggedMessages.length}`);
  flaggedMessages.forEach(msg => {
    console.log(`  - Category: ${msg.safetyCategory}`);
    console.log(`  - Reason: ${msg.safetyReason}`);
    console.log(`  - Content: ${msg.content}`);
  });
}

/**
 * Example 12: Get safe messages using filter
 */
export async function exampleSafetyFilter() {
  const filters: MessageFilterOptions = {
    isSafe: true,
    limit: 10,
  };
  const safeContent = await messageService.getMessages(filters);
  console.log(`Safe messages (using filter): ${safeContent.length}`);
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

/**
 * Example 13: Get comprehensive message statistics
 */
export async function exampleGetMessageStats() {
  const stats = await messageService.getMessageStats();
  console.log('Message Statistics:');
  console.log(`  Total Messages: ${stats.totalCount}`);
  console.log(`  By Room:`, stats.totalByRoom);
  console.log(`  By Sender:`, stats.totalBySender);
  console.log(`  Sentiment Breakdown:`, stats.sentimentBreakdown);
  console.log(`  Safety Stats:`, stats.safetyStats);
  console.log(`  Average Sentiment Score: ${stats.averageSentimentScore}`);
}

/**
 * Example 14: Get message count
 */
export async function exampleGetMessageCount() {
  const count = await messageService.getMessageCount();
  console.log(`Total on-chain messages: ${count}`);
}

/**
 * Example 15: Get trending topics
 */
export async function exampleGetTrendingTopics() {
  const trending = await messageService.getTrendingTopics(5);
  console.log('Top 5 Trending Topics:');
  trending.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.topic} (${item.frequency} mentions)`);
  });
}

// ============================================================================
// SEARCH & DISCOVERY
// ============================================================================

/**
 * Example 16: Search messages by content
 */
export async function exampleSearchMessages() {
  const results = await messageService.searchMessages('blockchain', 10);
  console.log(`Found ${results.length} messages containing "blockchain"`);
  results.forEach(msg => {
    console.log(`  - ${msg.content}`);
  });
}

// ============================================================================
// COMPLEX FILTERS
// ============================================================================

/**
 * Example 17: Complex filter - positive messages in dev room
 */
export async function exampleComplexFilter() {
  const filters: MessageFilterOptions = {
    roomId: 'dev',
    sentiment: 'positive',
    isSafe: true,
    limit: 5,
  };
  const results = await messageService.getMessages(filters);
  console.log(`Positive safe messages in #dev: ${results.length}`);
  results.forEach(msg => {
    console.log(`  [${msg.sentimentScore}] ${msg.content}`);
  });
}

/**
 * Example 18: Multiple queries in sequence
 */
export async function exampleMultipleQueries() {
  // Get user's messages
  const userMessages = await messageService.getMessagesBySender('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');

  // Filter for positive ones
  const positiveUserMessages = userMessages.filter(m => m.sentiment === 'positive');

  // Get their average sentiment
  const avgSentiment =
    positiveUserMessages.reduce((sum, m) => sum + (m.sentimentScore || 0), 0) / positiveUserMessages.length;

  console.log(`User's average positive sentiment: ${avgSentiment}`);
}

// ============================================================================
// REAL-WORLD USE CASES
// ============================================================================

/**
 * Example 19: Dashboard data collection
 */
export async function exampleDashboardData() {
  // Collect data for a dashboard
  const [stats, distribution, trending, count] = await Promise.all([
    messageService.getMessageStats(),
    messageService.getSentimentDistribution(),
    messageService.getTrendingTopics(10),
    messageService.getMessageCount(),
  ]);

  const dashboardData = {
    totalMessages: count,
    stats,
    sentimentDistribution: distribution,
    trendingTopics: trending,
    lastUpdated: new Date().toISOString(),
  };

  console.log('Dashboard Data:', dashboardData);
  return dashboardData;
}

/**
 * Example 20: Content moderation workflow
 */
export async function exampleModerationWorkflow() {
  // Get flagged messages for review
  const flaggedMessages = await messageService.getFlaggedMessages();

  // Group by category
  const byCategory = flaggedMessages.reduce(
    (acc: Record<string, EnhancedMessage[]>, msg: EnhancedMessage) => {
      const category = msg.safetyCategory || 'unknown';
      if (!acc[category]) acc[category] = [];
      acc[category].push(msg);
      return acc;
    },
    {} as Record<string, EnhancedMessage[]>
  );

  console.log('Messages Flagged for Review:');
  Object.entries(byCategory).forEach(([category, messages]: [string, EnhancedMessage[]]) => {
    console.log(`  ${category}: ${messages.length} messages`);
    messages.forEach((msg: EnhancedMessage) => {
      console.log(`    - "${msg.content}"`);
      console.log(`      Reason: ${msg.safetyReason}`);
    });
  });

  return byCategory;
}

export default {
  exampleGetAllMessages,
  exampleGetPaginatedMessages,
  exampleGetMessageById,
  exampleGetMessagesByRoom,
  exampleRoomFilter,
  exampleGetMessagesBySender,
  exampleGetPositiveMessages,
  exampleSentimentFilter,
  exampleSentimentDistribution,
  exampleGetSafeMessages,
  exampleGetFlaggedMessages,
  exampleSafetyFilter,
  exampleGetMessageStats,
  exampleGetMessageCount,
  exampleGetTrendingTopics,
  exampleSearchMessages,
  exampleComplexFilter,
  exampleMultipleQueries,
  exampleDashboardData,
  exampleModerationWorkflow,
};
