import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Button, Input, Card } from '../components';
import { theme } from '../theme';
import { useWeb3, formatAddress } from '../context/Web3Context';
import { MAX_MESSAGE_LENGTH, NETWORK_NAMES } from '../utils/constants';
import {
  analyzeMessageSafety,
  generateSmartSuggestions,
  extractTopics,
} from '../services/geminiService';

type PostMessageScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<any, 'NewMessage'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface PostMessageScreenProps {
  navigation: PostMessageScreenNavigationProp;
}

interface SafetyResult {
  isSafe: boolean;
  category?: string;
  recommendation: string;
}

export const PostMessageScreen: React.FC<PostMessageScreenProps> = ({
  navigation,
}) => {
  const { account, chainId, postMessage } = useWeb3();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [safetyResult, setSafetyResult] = useState<SafetyResult | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);

  const remainingChars = MAX_MESSAGE_LENGTH - message.length;
  const networkName = chainId ? NETWORK_NAMES[chainId] || 'Unknown' : 'Ethereum';
  const isValid = message.trim().length > 0 && remainingChars >= 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (message.trim() && message.length > 10) {
        analyzeMessageWithAI();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [message]);

  const analyzeMessageWithAI = async () => {
    setAnalyzing(true);
    try {
      const safety = await analyzeMessageSafety(message);
      setSafetyResult(safety);

      const newSuggestions = await generateSmartSuggestions(
        message,
        'professional business communication'
      );
      setSuggestions(newSuggestions);

      const newTopics = await extractTopics(message);
      setTopics(newTopics);
    } catch (error) {
      console.warn('AI analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePost = async () => {
    if (!isValid) {
      Alert.alert('Error', 'Please enter a valid message');
      return;
    }

    if (safetyResult && !safetyResult.isSafe) {
      Alert.alert(
        'Content Warning',
        `Your message may be inappropriate (${safetyResult.category}). Do you want to post anyway?`,
        [
          { text: 'Cancel', onPress: () => {} },
          {
            text: 'Post Anyway',
            onPress: () => postToBlockchain(),
          },
        ]
      );
      return;
    }

    postToBlockchain();
  };

  const postToBlockchain = async () => {
    setLoading(true);
    try {
      const txHash = await postMessage(message);
      
      Alert.alert(
        'Success ✓',
        `Message posted to blockchain!\nTx: ${txHash.slice(0, 10)}...`,
        [
          {
            text: 'OK',
            onPress: () => {
              setMessage('');
              setSafetyResult(null);
              setSuggestions([]);
              setTopics([]);
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error posting message:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to post message'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderSafetyIndicator = () => {
    if (!safetyResult) return null;

    const icon = safetyResult.isSafe ? '✓' : '⚠️';
    const color = safetyResult.isSafe ? theme.colors.success : theme.colors.error;

    return (
      <View style={[styles.safetyCard, { borderLeftColor: color }]}>
        <Text style={[styles.safetyText, { color }]}>
          {icon} {safetyResult.recommendation}
        </Text>
      </View>
    );
  };

  const renderSuggestions = () => {
    if (suggestions.length === 0) return null;

    return (
      <Card style={styles.suggestionsCard}>
        <Text style={styles.suggestionsTitle}>💡 Smart Suggestions</Text>
        {suggestions.map((suggestion, index) => (
          <View key={index} style={styles.suggestionItem}>
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </View>
        ))}
      </Card>
    );
  };

  const renderTopics = () => {
    if (topics.length === 0) return null;

    return (
      <View style={styles.topicsContainer}>
        <Text style={styles.topicsLabel}>Topics Detected:</Text>
        <View style={styles.topicsList}>
          {topics.map((topic, index) => (
            <View key={index} style={styles.topicTag}>
              <Text style={styles.topicText}>#{topic}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>New Message</Text>
            <Text style={styles.subtitle}>Post to the blockchain</Text>
          </View>
        </View>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>From:</Text>
            <Text style={styles.infoValue}>
              {account ? formatAddress(account) : 'Not connected'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Network:</Text>
            <Text style={styles.infoValue}>{networkName}</Text>
          </View>
        </Card>

        <View style={styles.inputContainer}>
          <Input
            label="Message"
            placeholder="What's on your mind?"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={6}
            maxLength={MAX_MESSAGE_LENGTH}
            style={styles.textArea}
            containerStyle={styles.inputWrapper}
          />
          <View style={styles.charCountContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={[
                  styles.charCount,
                  remainingChars < 0 && styles.charCountError,
                ]}
              >
                {remainingChars} characters remaining
              </Text>
              {analyzing && (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primary}
                  style={{ marginLeft: theme.spacing.md }}
                />
              )}
            </View>
          </View>
        </View>

        {renderSafetyIndicator()}
        {renderTopics()}
        {renderSuggestions()}

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Tips</Text>
          <Text style={styles.tipsText}>
            • AI analyzes content for safety and appropriateness{'\n'}
            • Topics are extracted automatically{'\n'}
            • Suggestions appear while you type{'\n'}
            • Messages stored permanently on blockchain
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="secondary"
            style={styles.cancelButton}
          />
          <Button
            title={loading ? 'Posting...' : 'Post Message'}
            onPress={handlePost}
            disabled={!isValid || loading || analyzing}
            style={styles.postButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xxl + 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  backIcon: {
    fontSize: 24,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.bold,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  infoCard: {
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.backgroundTertiary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  infoLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  inputContainer: {
    marginBottom: theme.spacing.xl,
  },
  inputWrapper: {
    marginBottom: 0,
  },
  textArea: {
    minHeight: 140,
    textAlignVertical: 'top',
    paddingTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    lineHeight: theme.typography.fontSize.base * 1.5,
  },
  charCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  charCount: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  charCountError: {
    color: theme.colors.error,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  safetyCard: {
    backgroundColor: theme.colors.backgroundTertiary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderLeftWidth: 4,
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  safetyText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    lineHeight: theme.typography.fontSize.sm * 1.5,
  },
  topicsContainer: {
    marginBottom: theme.spacing.xl,
  },
  topicsLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  topicsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  topicTag: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  topicText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  suggestionsCard: {
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.backgroundTertiary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  suggestionsTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  suggestionItem: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderDark,
    marginBottom: theme.spacing.xs,
  },
  suggestionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.fontSize.sm * 1.5,
  },
  tipsCard: {
    backgroundColor: theme.colors.backgroundTertiary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  tipsTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  tipsText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.fontSize.sm * 1.6,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  cancelButton: {
    flex: 1,
  },
  postButton: {
    flex: 2,
  },
});
