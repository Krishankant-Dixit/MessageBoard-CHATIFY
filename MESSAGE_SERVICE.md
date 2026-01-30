# Message Service Documentation

## Overview

The **Message Service** is a comprehensive unified interface for managing on-chain and off-chain messages in Chatify. It provides powerful APIs for querying, filtering, and analyzing messages with sentiment and safety metadata.

## Key Features

✅ **8 Mock On-Chain Messages** - Pre-populated with real data
✅ **Sentiment Analysis** - Positive/Neutral/Negative with scores (0-1)
✅ **Safety Flags** - Content moderation with categories
✅ **Advanced Filtering** - Room, sender, sentiment, safety
✅ **Statistics & Analytics** - Comprehensive message insights
✅ **Search & Discovery** - Full-text search and trending topics
✅ **Demo Mode Aware** - Simulates network delays
✅ **Type-Safe** - Full TypeScript support

## Files

| File | Purpose |
|------|---------|
| [src/services/messageService.ts](src/services/messageService.ts) | Main service with 12 query functions |
| [src/services/messageServiceExamples.ts](src/services/messageServiceExamples.ts) | 20 usage examples |
| [src/utils/constants.ts](src/utils/constants.ts) | 8 enhanced mock messages with sentiment & safety |
| [src/contracts/MessageBoard.ts](src/contracts/MessageBoard.ts) | Updated Message interface |

## Mock Messages

The service includes **8 pre-populated messages** with:
- **Wallet addresses** (from MOCK_USERS)
- **Timestamps** (realistic time progression)
- **Sentiment** (positive/neutral/negative)
- **Sentiment Scores** (0-1 range)
- **Safety Flags** (safe/spam/abuse/sensitive)
- **Room IDs** (general/dev/design)

### Message Distribution

```
Room Distribution:
  #general: 3 messages
  #dev: 2 messages
  #design: 2 messages
  (1 message without room)

Sentiment Distribution:
  Positive: 7 messages (87.5%)
  Neutral: 1 message (12.5%)
  Negative: 0 messages (0%)

Safety:
  Safe: 8/8 (100%)
  Flagged: 0/8 (0%)
```

## API Reference

### Message Retrieval

#### `getMessages(filters?: MessageFilterOptions): Promise<EnhancedMessage[]>`
Get messages with optional filtering and pagination.

```typescript
// Get all messages
const all = await messageService.getMessages();

// With pagination
const paginated = await messageService.getMessages({
  limit: 5,
  offset: 0,
});

// Complex filter
const filtered = await messageService.getMessages({
  roomId: 'dev',
  sentiment: 'positive',
  isSafe: true,
  limit: 10,
});
```

#### `getMessageById(messageId: number): Promise<EnhancedMessage | null>`
Get a single message by its ID.

```typescript
const message = await messageService.getMessageById(1);
if (message) {
  console.log(message.content);
  console.log(message.sentiment);
}
```

### Room-Based Queries

#### `getMessagesByRoom(roomId: string, limit?: number, offset?: number): Promise<EnhancedMessage[]>`
Get messages from a specific chat room.

```typescript
const generalMessages = await messageService.getMessagesByRoom('general', 10, 0);
const devMessages = await messageService.getMessagesByRoom('dev');
const designMessages = await messageService.getMessagesByRoom('design');
```

### Sender-Based Queries

#### `getMessagesBySender(senderAddress: string, limit?: number, offset?: number): Promise<EnhancedMessage[]>`
Get all messages from a specific wallet address.

```typescript
const userMessages = await messageService.getMessagesBySender(
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
);
```

### Sentiment-Based Queries

#### `getMessagesBySentiment(sentiment: 'positive' | 'neutral' | 'negative', limit?: number, offset?: number): Promise<EnhancedMessage[]>`
Get messages filtered by sentiment.

```typescript
const positive = await messageService.getMessagesBySentiment('positive');
const neutral = await messageService.getMessagesBySentiment('neutral');
const negative = await messageService.getMessagesBySentiment('negative');
```

#### `getSentimentDistribution(): Promise<{ positive: number; neutral: number; negative: number }>`
Get sentiment as percentages.

```typescript
const distribution = await messageService.getSentimentDistribution();
// { positive: 87.5, neutral: 12.5, negative: 0 }
```

### Safety-Based Queries

#### `getSafeMessages(limit?: number, offset?: number): Promise<EnhancedMessage[]>`
Get only content-moderated safe messages.

```typescript
const safeMessages = await messageService.getSafeMessages();
```

#### `getFlaggedMessages(limit?: number, offset?: number): Promise<EnhancedMessage[]>`
Get messages flagged as unsafe.

```typescript
const flaggedMessages = await messageService.getFlaggedMessages();
flaggedMessages.forEach(msg => {
  console.log(`Category: ${msg.safetyCategory}`);
  console.log(`Reason: ${msg.safetyReason}`);
});
```

### Statistics & Analytics

#### `getMessageCount(): Promise<number>`
Get total message count.

```typescript
const count = await messageService.getMessageCount();
console.log(`Total messages: ${count}`); // 8
```

#### `getMessageStats(): Promise<MessageStats>`
Get comprehensive message statistics.

```typescript
const stats = await messageService.getMessageStats();
console.log(stats.totalCount);           // 8
console.log(stats.totalByRoom);          // { general: 3, dev: 2, design: 2 }
console.log(stats.totalBySender);        // { address: count, ... }
console.log(stats.sentimentBreakdown);   // { positive: 7, neutral: 1, negative: 0 }
console.log(stats.safetyStats);          // { safe: 8, flagged: 0 }
console.log(stats.averageSentimentScore); // 0.82
```

### Search & Discovery

#### `searchMessages(query: string, limit?: number): Promise<EnhancedMessage[]>`
Full-text search in message content.

```typescript
const results = await messageService.searchMessages('blockchain', 10);
const webResults = await messageService.searchMessages('web3');
```

#### `getTrendingTopics(limit?: number): Promise<Array<{ topic: string; frequency: number; messages: number }>>`
Extract and rank trending hashtags and emojis.

```typescript
const trending = await messageService.getTrendingTopics(5);
// [
//   { topic: '🚀', frequency: 2, messages: 2 },
//   { topic: '#blockchain', frequency: 1, messages: 1 },
//   ...
// ]
```

## Type Definitions

### EnhancedMessage
Extended message with sentiment and safety metadata.

```typescript
interface EnhancedMessage extends Message {
  sentiment?: 'positive' | 'neutral' | 'negative';
  sentimentScore?: number;        // 0-1
  isSafe?: boolean;
  safetyCategory?: 'safe' | 'spam' | 'abuse' | 'sensitive';
  safetyReason?: string;
}
```

### MessageFilterOptions
Flexible filtering options.

```typescript
interface MessageFilterOptions {
  roomId?: string;
  sender?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  isSafe?: boolean;
  limit?: number;    // Default: 10
  offset?: number;   // Default: 0
}
```

### MessageStats
Comprehensive statistics object.

```typescript
interface MessageStats {
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
```

## Usage Examples

### Example 1: Get Messages from a Room
```typescript
import messageService from '../services/messageService';

const generalMessages = await messageService.getMessagesByRoom('general');
generalMessages.forEach(msg => {
  console.log(`${msg.sender}: ${msg.content}`);
  console.log(`Sentiment: ${msg.sentiment} (${msg.sentimentScore})`);
});
```

### Example 2: Filter Positive Safe Messages
```typescript
const positiveAndSafe = await messageService.getMessages({
  sentiment: 'positive',
  isSafe: true,
  limit: 5,
});
```

### Example 3: Get User's Message Activity
```typescript
const userMessages = await messageService.getMessagesBySender(walletAddress);
const userStats = {
  totalMessages: userMessages.length,
  averageSentiment: userMessages.reduce((s, m) => s + (m.sentimentScore || 0), 0) / userMessages.length,
  flaggedCount: userMessages.filter(m => !m.isSafe).length,
};
```

### Example 4: Dashboard Data
```typescript
const [stats, distribution, trending] = await Promise.all([
  messageService.getMessageStats(),
  messageService.getSentimentDistribution(),
  messageService.getTrendingTopics(10),
]);

const dashboardData = {
  stats,
  distribution,
  trending,
  lastUpdated: new Date().toISOString(),
};
```

### Example 5: Content Moderation
```typescript
const flaggedMessages = await messageService.getFlaggedMessages();
const byCategory = {};

flaggedMessages.forEach(msg => {
  const cat = msg.safetyCategory || 'unknown';
  if (!byCategory[cat]) byCategory[cat] = [];
  byCategory[cat].push(msg);
});

// Review messages by category
Object.entries(byCategory).forEach(([category, messages]) => {
  console.log(`${category}: ${messages.length} messages`);
});
```

## Demo Mode Behavior

When `DEMO_MODE = true` (default):
- All queries return mock data
- Network delays are simulated (200-500ms)
- No blockchain calls are made
- Console logs indicate "Demo Mode"

Example console output:
```
✓ Retrieved 8 messages (Demo Mode)
✓ Retrieved 3 messages from room general (Demo Mode)
✓ Message statistics computed (Demo Mode)
✓ Found 2 messages matching "blockchain" (Demo Mode)
```

## Production Mode

When `DEMO_MODE = false`:
- Still returns mock data (as blockchain isn't connected)
- No network delays
- Console logs are cleaner
- Ready for blockchain integration

To switch to production:
```typescript
// src/utils/constants.ts
export const DEMO_MODE = false;  // Disable demo mode
```

## Integration Example

```typescript
import { useEffect, useState } from 'react';
import messageService from '../services/messageService';
import type { EnhancedMessage, MessageStats } from '../services/messageService';

export function ChatAnalytics() {
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [stats, setStats] = useState<MessageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [msgs, statsData] = await Promise.all([
        messageService.getMessages({ limit: 20 }),
        messageService.getMessageStats(),
      ]);
      setMessages(msgs);
      setStats(statsData);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Message Analytics</h2>
      <p>Total Messages: {stats?.totalCount}</p>
      <p>Sentiment Breakdown: {JSON.stringify(stats?.sentimentBreakdown)}</p>
      <p>Safety Stats: {JSON.stringify(stats?.safetyStats)}</p>
      
      <h3>Recent Messages</h3>
      <ul>
        {messages.map(msg => (
          <li key={msg.id}>
            <strong>{msg.sender}</strong>: {msg.content}
            <br />
            <small>
              Sentiment: {msg.sentiment} ({msg.sentimentScore})
              | Safe: {msg.isSafe ? '✓' : '✗'}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Performance Notes

- **Query Speed**: All queries complete in <600ms due to in-memory mock data
- **Pagination**: Implement pagination with `limit` and `offset` for large datasets
- **Filtering**: Apply filters on the client-side (optimized for demo mode)
- **Caching**: Consider caching statistics for dashboards that update frequently

## Future Enhancements

When integrating with actual blockchain:
1. Replace `MOCK_MESSAGES` with contract calls
2. Implement proper pagination at the contract level
3. Add caching layer for frequently accessed data
4. Support real-time message streaming via WebSockets
5. Add off-chain indexing for better search performance

## Testing

See [src/services/messageServiceExamples.ts](src/services/messageServiceExamples.ts) for 20 complete working examples covering:
- Basic message retrieval
- Room-based queries
- Sender-based queries
- Sentiment filtering
- Safety filtering
- Statistics & analytics
- Search & discovery
- Real-world use cases

## API Summary

| Function | Returns | Notes |
|----------|---------|-------|
| `getMessages()` | `EnhancedMessage[]` | Main query function with filters |
| `getMessageById()` | `EnhancedMessage \| null` | Single message lookup |
| `getMessagesByRoom()` | `EnhancedMessage[]` | Room-specific queries |
| `getMessagesBySender()` | `EnhancedMessage[]` | Sender wallet queries |
| `getMessagesBySentiment()` | `EnhancedMessage[]` | Sentiment-based filtering |
| `getSafeMessages()` | `EnhancedMessage[]` | Content-moderated safe messages |
| `getFlaggedMessages()` | `EnhancedMessage[]` | Messages flagged for review |
| `getMessageCount()` | `number` | Total message count |
| `getMessageStats()` | `MessageStats` | Comprehensive statistics |
| `searchMessages()` | `EnhancedMessage[]` | Full-text search |
| `getTrendingTopics()` | `Array<{topic, frequency, messages}>` | Hashtag & emoji trending |
| `getSentimentDistribution()` | `{positive, neutral, negative}` | Percentage distribution |

---

**Total Lines of Code**: ~470 (messageService.ts) + ~370 (examples) + ~250 (constants)

**Total Functions**: 12 service functions + 20 working examples

**Mock Messages**: 8 with full sentiment & safety metadata
