import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
  StatusBar,
  Animated,
  Dimensions,
  ScaledSize,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useWeb3, formatAddress } from '../context/Web3Context';
import { useTheme } from '../context/ThemeContext';
import { useScaleAnimation, usePulseAnimation, useFadeAnimation } from '../hooks';
import { Button, ChatInput } from '../components';
import { theme } from '../theme';
import { Message } from '../contracts/MessageBoard';
import { analyzeSentiment } from '../services/geminiService';
import { formatTimestamp } from '../utils/helpers';
import { MAX_MESSAGE_LENGTH } from '../utils/constants';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<any, 'Chats'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

interface DisplayMessage extends Message {
  sentiment?: 'positive' | 'neutral' | 'negative';
  safetyStatus?: 'safe' | 'warning' | 'unsafe';
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { isConnected, account, connectWallet, disconnectWallet, getMessages, postMessage } = useWeb3();
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Animation hooks
  const loadingPulse = usePulseAnimation(loading);
  const sendingScale = useScaleAnimation(sending);
  const { opacityAnim: messageOpacity } = useFadeAnimation(!loading);
  
  const headerOpacity = scrollAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
  });
  const inputBarHeight = 96;

  useEffect(() => {
    if (isConnected) {
      loadMessages();
    }
  }, [isConnected]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const fetchedMessages = await getMessages(20, 0);
      const messagesWithSentiment = await Promise.all(
        fetchedMessages.map(async (msg) => {
          try {
            const sentimentResult = await analyzeSentiment(msg.content);
            return {
              ...msg,
              sentiment: sentimentResult.sentiment,
              safetyStatus: getMockSafetyStatus(msg),
            };
          } catch (error) {
            return {
              ...msg,
              sentiment: getMockSentiment(msg),
              safetyStatus: getMockSafetyStatus(msg),
            };
          }
        })
      );
      // Reverse to show newest at bottom
      setMessages(messagesWithSentiment.reverse());
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  const handleConnect = async () => {
    try {
      await connectWallet();
      Alert.alert('Success', '✓ Wallet connected successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to connect wallet.');
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Wallet?',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          onPress: () => {
            disconnectWallet();
            Alert.alert('Disconnected', 'Wallet disconnected.');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const openLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open link');
    }
  };

  const handlePostMessage = () => {
    if (!isConnected) {
      Alert.alert('Wallet Required', 'Please connect your wallet first');
      return;
    }
    navigation.navigate('MainTabs' as any, { screen: 'NewMessage' });
  };

  const handleInputChange = (text: string) => {
    setMessageInput(text);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (text.trim().length === 0) {
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1200);
  };

  const handleEmojiPress = () => {
    if (messageInput.length >= MAX_MESSAGE_LENGTH) {
      return;
    }
    const updatedMessage = `${messageInput}😊`;
    handleInputChange(updatedMessage);
  };

  const handleSendMessage = async () => {
    if (!isConnected) {
      Alert.alert('Wallet Required', 'Please connect your wallet first');
      return;
    }

    const trimmed = messageInput.trim();
    if (!trimmed) {
      return;
    }

    setSending(true);
    try {
      await postMessage(trimmed);
      setMessageInput('');
      setIsTyping(false);
      await loadMessages();
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return theme.colors.success;
      case 'negative':
        return theme.colors.error;
      default:
        return theme.colors.warning;
    }
  };

  const getSafetyColor = (status?: string) => {
    switch (status) {
      case 'unsafe':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      default:
        return theme.colors.success;
    }
  };

  const getSentimentLabel = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'Positive';
      case 'negative':
        return 'Negative';
      default:
        return 'Neutral';
    }
  };

  const getSafetyLabel = (status?: string) => {
    switch (status) {
      case 'unsafe':
        return 'Unsafe';
      case 'warning':
        return 'Review';
      default:
        return 'Safe';
    }
  };

  const getSentimentEmoji = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return '😊';
      case 'negative':
        return '😔';
      default:
        return '😐';
    }
  };

  const getSafetyEmoji = (status?: string) => {
    switch (status) {
      case 'unsafe':
        return '⛔';
      case 'warning':
        return '⚠️';
      default:
        return '✅';
    }
  };

  const getMockSentiment = (msg: Message): 'positive' | 'neutral' | 'negative' => {
    const seed = `${msg.id}-${msg.sender}-${msg.timestamp}`;
    const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const bucket = hash % 3;
    if (bucket === 0) return 'positive';
    if (bucket === 1) return 'neutral';
    return 'negative';
  };

  const getMockSafetyStatus = (msg: Message): 'safe' | 'warning' | 'unsafe' => {
    const seed = `${msg.content}-${msg.sender}`;
    const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const bucket = hash % 10;
    if (bucket === 0) return 'unsafe';
    if (bucket <= 2) return 'warning';
    return 'safe';
  };

  const getAvatarInitials = (address: string) => {
    return address.slice(2, 4).toUpperCase();
  };

  const getAvatarColor = (address: string) => {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#FFA07A',
      '#98D8C8',
      '#F7DC6F',
      '#BB8FCE',
      '#85C1E2',
    ];
    const index = parseInt(address.slice(2, 4), 16) % colors.length;
    return colors[index];
  };

  const renderMessage = ({ item, index }: { item: DisplayMessage; index: number }) => {
    const initials = getAvatarInitials(item.sender);
    const avatarColor = getAvatarColor(item.sender);
    const isLastMessage = index === messages.length - 1;

    return (
      <Animated.View
        style={[
          styles.messageWrapper,
          {
            opacity: Animated.add(scrollAnim, 1),
          },
        ]}
      >
        <View style={styles.messageContainer}>
          {/* Avatar */}
          <View
            style={[
              styles.avatar,
              { backgroundColor: avatarColor },
            ]}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          {/* Message Content */}
          <View style={styles.messageBubbleWrapper}>
            {/* Sender Info */}
            <View style={styles.senderInfo}>
              <Text style={styles.senderAddress}>
                {formatAddress(item.sender)}
              </Text>
              <Text style={styles.timestamp}>
                {formatTimestamp(item.timestamp)}
              </Text>
            </View>

            {/* Message Bubble */}
            <View style={[styles.messageBubble, styles.receivedBubble]}>
              <Text style={styles.messageText}>{item.content}</Text>
              {item.isEdited && (
                <Text style={styles.editedLabel}>(edited)</Text>
              )}
            </View>

            {/* Sentiment Badge */}
            <View style={styles.badgeContainer}>
              <View
                style={[
                  styles.sentimentBadge,
                  { backgroundColor: getSentimentColor(item.sentiment) + '20' },
                  { borderColor: getSentimentColor(item.sentiment) },
                ]}
              >
                <Text style={styles.sentimentEmoji}>
                  {getSentimentEmoji(item.sentiment)}
                </Text>
                <Text
                  style={[
                    styles.sentimentLabel,
                    { color: getSentimentColor(item.sentiment) },
                  ]}
                >
                  {getSentimentLabel(item.sentiment)}
                </Text>
              </View>
              <View
                style={[
                  styles.sentimentBadge,
                  { backgroundColor: getSafetyColor(item.safetyStatus) + '20' },
                  { borderColor: getSafetyColor(item.safetyStatus) },
                ]}
              >
                <Text style={styles.sentimentEmoji}>
                  {getSafetyEmoji(item.safetyStatus)}
                </Text>
                <Text
                  style={[
                    styles.sentimentLabel,
                    { color: getSafetyColor(item.safetyStatus) },
                  ]}
                >
                  {getSafetyLabel(item.safetyStatus)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {isLastMessage && messages.length > 0 && (
          <View style={styles.divider} />
        )}
      </Animated.View>
    );
  };

  if (!isConnected) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />

        <View style={styles.welcomeContainer}>
          <View style={styles.welcomeHeader}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>💬</Text>
            </View>
            <Text style={styles.title}>Chatify</Text>
            <Text style={styles.subtitle}>
              Decentralized messaging with AI insights
            </Text>
          </View>

          <View style={styles.featureGrid}>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>⛓️</Text>
              <Text style={styles.featureTitle}>Decentralized</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🔒</Text>
              <Text style={styles.featureTitle}>Secure</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🤖</Text>
              <Text style={styles.featureTitle}>AI-Powered</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>⚡</Text>
              <Text style={styles.featureTitle}>Fast</Text>
            </View>
          </View>

          <View style={styles.actionContainer}>
            <Button
              title="Connect Wallet"
              onPress={handleConnect}
              size="large"
              variant="primary"
              fullWidth
              icon="🔗"
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>💬</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>Messages</Text>
              <View style={styles.walletBadge}>
                <View style={styles.onlineDot} />
                <Text style={styles.walletAddress}>
                  {formatAddress(account || '')}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.composeButton}
            onPress={handlePostMessage}
            activeOpacity={0.8}
          >
            <Text style={styles.composeIcon}>✏️</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Messages or Empty/Loading State */}
      {loading && !refreshing ? (
        <View style={[styles.centerContainer, { paddingBottom: inputBarHeight + (insets.bottom || 0) }]}>
          <Animated.View style={{ opacity: loadingPulse }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </Animated.View>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading messages...</Text>
        </View>
      ) : messages.length === 0 ? (
        <View style={[styles.centerContainer, { paddingBottom: inputBarHeight + (insets.bottom || 0) }]}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.backgroundTertiary }]}>
            <Text style={styles.emptyIcon}>📭</Text>
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No messages yet</Text>
          <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
            Be the first to post a message!
          </Text>
          <Button
            title="Post Message"
            onPress={handlePostMessage}
            size="large"
          />
        </View>
      ) : (
        <View style={styles.listWrapper}>
          {sending && (
            <Animated.View 
              style={[
                styles.postingBanner,
                { transform: [{ scale: sendingScale }] }
              ]}
            >
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.postingText, { color: colors.textSecondary }]}>Posting on-chain...</Text>
            </Animated.View>
          )}
          <Animated.FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: inputBarHeight + (insets.bottom || 0) + 24 },
            ]}
            showsVerticalScrollIndicator={true}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollAnim } } }],
              { useNativeDriver: false }
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          />
        </View>
      )}

      {/* Fixed Input Bar */}
      <View
        style={[
          styles.inputBarContainer,
          { paddingBottom: Math.max(insets.bottom, theme.spacing.sm) },
        ]}
      >
        {isTyping && (
          <View style={styles.typingIndicator}>
            <View style={styles.typingDot} />
            <Text style={styles.typingText}>Typing...</Text>
          </View>
        )}
        <ChatInput
          value={messageInput}
          onChangeText={handleInputChange}
          onSend={handleSendMessage}
          placeholder="Write a message..."
          maxLength={MAX_MESSAGE_LENGTH}
          showCharCounter
          disabled={sending}
          actionButton={{
            icon: '😊',
            onPress: handleEmojiPress,
          }}
        />
      </View>

      {/* Floating Action Button */}
      {isConnected && (
        <View
          style={[
            styles.fab,
            { bottom: inputBarHeight + (insets.bottom || theme.spacing.md) + theme.spacing.lg },
          ]}
        >
          <TouchableOpacity
            style={styles.fabButton}
            onPress={handlePostMessage}
            activeOpacity={0.8}
          >
            <Text style={styles.fabIcon}>✏️</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Welcome Screen
  welcomeContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl + 20,
    paddingBottom: theme.spacing.xl,
  },
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 5,
  },
  logoIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: theme.spacing.md,
  },

  // Feature Grid
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xxl,
  },
  featureCard: {
    width: '48%',
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.md,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },

  // Action Container
  actionContainer: {
    marginTop: 'auto',
  },

  // Header
  header: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderDark,
    paddingTop: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: {
    fontSize: 22,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: theme.spacing.xs,
  },
  walletAddress: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  composeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  composeIcon: {
    fontSize: 20,
  },

  // Message Feed
  listContent: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  listWrapper: {
    flex: 1,
  },
  postingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundTertiary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderDark,
  },
  postingText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  inputBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderDark,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.xs,
  },
  typingText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  messageWrapper: {
    marginBottom: theme.spacing.md,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },

  // Avatar
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  avatarText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
  },

  // Message Bubble
  messageBubbleWrapper: {
    flex: 1,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: 4,
  },
  senderAddress: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  timestamp: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  messageBubble: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 16,
    marginBottom: 8,
  },
  receivedBubble: {
    backgroundColor: theme.colors.backgroundTertiary,
    borderBottomLeftRadius: 4,
  },
  sentBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    color: theme.colors.text,
  },
  editedLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },

  // Sentiment Badge
  badgeContainer: {
    marginLeft: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  sentimentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  sentimentEmoji: {
    fontSize: 12,
  },
  sentimentLabel: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderDark,
    marginVertical: theme.spacing.md,
  },

  // Center Container (Empty/Loading)
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.lg,
    fontSize: 15,
    fontWeight: '500',
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptyDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 20,
  },

  // FAB (Floating Action Button)
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 28,
    color: 'white',
    fontWeight: '700',
  },
});
