/**
 * Gemini AI Service
 * Handles integration with Google's Generative AI API
 * Provides message analysis, summarization, and smart suggestions
 * 
 * Respects DEMO_MODE flag - when enabled, returns mock responses without API calls
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { DEMO_MODE, simulateNetworkDelay } from '../utils/constants';

// Initialize Gemini with API key from environment
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;

/**
 * Initialize Gemini AI client
 * Must be called before using any Gemini functions
 */
export const initializeGemini = (apiKey: string) => {
  if (apiKey && !DEMO_MODE) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
};

/**
 * Check if Gemini is properly initialized
 */
export const isGeminiReady = (): boolean => {
  if (DEMO_MODE) return false; // Always disabled in demo mode
  return genAI !== null && GEMINI_API_KEY !== '';
};

/**
 * Analyze message for inappropriate content
 * Returns safety assessment and recommendations
 */
export const analyzeMessageSafety = async (
  message: string
): Promise<{
  isSafe: boolean;
  category?: string;
  recommendation: string;
}> => {
  try {
    // Demo mode: return mock safety response
    if (DEMO_MODE) {
      await simulateNetworkDelay();
      return {
        isSafe: true,
        recommendation: '✓ Message looks good! (Demo mode)',
      };
    }

    if (!isGeminiReady()) {
      return {
        isSafe: true,
        recommendation: 'Content moderation unavailable',
      };
    }

    const model = genAI!.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Analyze this message for safety and appropriateness in a corporate chat environment. 
    Respond with ONLY a JSON object containing:
    - "isSafe": boolean
    - "category": string (if unsafe, what category: spam, abuse, sensitive, etc)
    - "recommendation": string (brief recommendation)
    
    Message: "${message}"
    
    IMPORTANT: Respond ONLY with valid JSON, no other text.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
      const parsed = JSON.parse(text);
      return {
        isSafe: parsed.isSafe !== false,
        category: parsed.category,
        recommendation: parsed.recommendation || 'Message is appropriate',
      };
    } catch {
      return {
        isSafe: true,
        recommendation: 'Content moderation unavailable',
      };
    }
  } catch (error) {
    console.error('Error analyzing message safety:', error);
    return {
      isSafe: true,
      recommendation: 'Content moderation unavailable',
    };
  }
};

/**
 * Summarize a list of messages into a concise summary
 * Useful for catching up on conversations
 */
export const summarizeMessages = async (
  messages: Array<{ sender: string; content: string; timestamp: string }>
): Promise<string> => {
  try {
    // Demo mode: return mock summary
    if (DEMO_MODE) {
      await simulateNetworkDelay();
      return '📝 Demo: This conversation covers key technical discussions about blockchain integration and design improvements. (Demo mode - mock summary)';
    }

    if (!isGeminiReady()) {
      return 'Summarization unavailable';
    }

    const model = genAI!.getGenerativeModel({ model: 'gemini-pro' });

    const messageText = messages
      .map((m) => `${m.sender} (${m.timestamp}): ${m.content}`)
      .join('\n');

    const prompt = `Provide a concise 2-3 sentence summary of this chat conversation suitable for a busy professional. Focus on action items and key decisions.

Chat messages:
${messageText}`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error summarizing messages:', error);
    return 'Summary unavailable';
  }
};

/**
 * Generate smart suggestions based on conversation context
 * Helps users compose better messages
 */
export const generateSmartSuggestions = async (
  currentMessage: string,
  conversationContext: string
): Promise<string[]> => {
  try {
    // Demo mode: return mock suggestions
    if (DEMO_MODE) {
      await simulateNetworkDelay();
      return [
        '✓ "Can you provide more details on the timeline?"',
        '✓ "This looks great! Let\'s discuss implementation next week."',
        '✓ "I agree, and we should also consider the budget impact."',
      ];
    }

    if (!isGeminiReady()) {
      return [];
    }

    const model = genAI!.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Based on the conversation context and current message, suggest 3 brief, professional alternatives to improve the message. Return ONLY a JSON array of strings, no other text.

Context: ${conversationContext}
Current message: "${currentMessage}"

Example format: ["suggestion 1", "suggestion 2", "suggestion 3"]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
    } catch {
      return [];
    }
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return [];
  }
};

/**
 * Extract key topics/hashtags from a message
 * Useful for organizing and searching messages
 */
export const extractTopics = async (message: string): Promise<string[]> => {
  try {
    // Demo mode: return mock topics
    if (DEMO_MODE) {
      await simulateNetworkDelay();
      return ['blockchain', 'development', 'web3'];
    }

    if (!isGeminiReady()) {
      return [];
    }

    const model = genAI!.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Extract 2-5 key topics or hashtags from this message. Return ONLY a JSON array of strings (the hashtags without # symbol), no other text.

Message: "${message}"

Example format: ["topic1", "topic2", "topic3"]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  } catch (error) {
    console.error('Error extracting topics:', error);
    return [];
  }
};

/**
 * Sentiment analysis of a message
 * Helps understand tone and emotion
 */
export const analyzeSentiment = async (
  message: string
): Promise<{
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  explanation: string;
}> => {
  try {
    // Demo mode: return mock sentiment
    if (DEMO_MODE) {
      await simulateNetworkDelay();
      return {
        sentiment: 'positive',
        score: 0.8,
        explanation: 'Message has an enthusiastic and collaborative tone (Demo mode)',
      };
    }

    if (!isGeminiReady()) {
      return {
        sentiment: 'neutral',
        score: 0,
        explanation: 'Sentiment analysis unavailable',
      };
    }

    const model = genAI!.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Analyze the sentiment of this message. Respond with ONLY a JSON object:
    - "sentiment": one of "positive", "neutral", or "negative"
    - "score": number from -1 (very negative) to 1 (very positive)
    - "explanation": brief explanation in one sentence
    
Message: "${message}"`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
      const parsed = JSON.parse(text);
      return {
        sentiment: parsed.sentiment || 'neutral',
        score: parsed.score || 0,
        explanation: parsed.explanation || 'Unable to analyze',
      };
    } catch {
      return {
        sentiment: 'neutral',
        score: 0,
        explanation: 'Sentiment analysis unavailable',
      };
    }
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return {
      sentiment: 'neutral',
      score: 0,
      explanation: 'Sentiment analysis unavailable',
    };
  }
};

/**
 * Translate message to another language
 */
export const translateMessage = async (
  message: string,
  targetLanguage: string
): Promise<string> => {
  try {
    // Demo mode: return mock translation
    if (DEMO_MODE) {
      await simulateNetworkDelay();
      return `[${targetLanguage}] ${message} (Demo mode - mock translation)`;
    }

    if (!isGeminiReady()) {
      return 'Translation unavailable';
    }

    const model = genAI!.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Translate this message to ${targetLanguage}. Return ONLY the translation, no other text.

Message: "${message}"`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error translating message:', error);
    return 'Translation unavailable';
  }
};

/**
 * Generate a professional response suggestion
 * Helps users draft replies quickly
 */
export const generateResponseSuggestion = async (
  receivedMessage: string,
  conversationTopic: string
): Promise<string> => {
  try {
    // Demo mode: return mock suggestion
    if (DEMO_MODE) {
      await simulateNetworkDelay();
      return 'Thanks for sharing! I think this approach makes sense. Let\'s discuss further in our next sync. (Demo mode - mock suggestion)';
    }

    if (!isGeminiReady()) {
      return '';
    }

    const model = genAI!.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Generate a professional, concise response suggestion (1-2 sentences) to this message in a corporate environment. Be helpful and courteous.

Topic: ${conversationTopic}
Message: "${receivedMessage}"

Return ONLY the suggested response, no other text.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error generating response suggestion:', error);
    return '';
  }
};

export default {
  initializeGemini,
  isGeminiReady,
  analyzeMessageSafety,
  summarizeMessages,
  generateSmartSuggestions,
  extractTopics,
  analyzeSentiment,
  translateMessage,
  generateResponseSuggestion,
};
