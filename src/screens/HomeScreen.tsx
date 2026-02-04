import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SectionList,
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
import { DEMO_MODE, MAX_MESSAGE_LENGTH, IS_WEB } from '../utils/constants';

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

type ChatType = 'personal' | 'group' | 'company';

interface ChatItem {
  id: string;
  name: string;
  type: ChatType;
  avatar: string; // MaterialCommunityIcons name
  lastMessage: string;
  timestamp: number;
  unreadCount: number;
}

const pinnedChats: ChatItem[] = [
  {
    id: 'pinned_chatify_team',
    name: 'CHATIFY Team',
    type: 'company',
    avatar: 'office-building',
    lastMessage: 'Launch checklist ready for review.',
    timestamp: Math.floor(Date.now() / 1000) - 300,
    unreadCount: 2,
  },
  {
    id: 'pinned_web3_builders',
    name: 'Web3 Builders',
    type: 'group',
    avatar: 'account-group',
    lastMessage: 'Contract demo is live on Sepolia.',
    timestamp: Math.floor(Date.now() / 1000) - 1800,
    unreadCount: 4,
  },
];

const recentChats: ChatItem[] = [
  {
    id: 'chat_acme_corp',
    name: 'Acme Corp',
    type: 'company',
    avatar: 'factory',
    lastMessage: 'Please share the Q1 onboarding deck.',
    timestamp: Math.floor(Date.now() / 1000) - 3600,
    unreadCount: 0,
  },
  {
    id: 'chat_design_sync',
    name: 'Design Sync',
    type: 'group',
    avatar: 'palette',
    lastMessage: 'Updated the spacing system and typography.',
    timestamp: Math.floor(Date.now() / 1000) - 7200,
    unreadCount: 1,
  },
  {
    id: 'chat_personal_alex',
    name: 'Alex Chen',
    type: 'personal',
    avatar: 'account',
    lastMessage: 'Let’s align on the demo flow tomorrow.',
    timestamp: Math.floor(Date.now() / 1000) - 8600,
    unreadCount: 0,
  },
  {
    id: 'chat_hr_updates',
    name: 'HR Updates',
    type: 'company',
    avatar: 'bullhorn-outline',
    lastMessage: 'Reminder: benefits enrollment closes Friday.',
    timestamp: Math.floor(Date.now() / 1000) - 10800,
    unreadCount: 3,
  },
  {
    id: 'chat_personal_maya',
    name: 'Maya Patel',
    type: 'personal',
    avatar: 'account-circle',
    lastMessage: 'Pushed the latest UI polish changes.',
    timestamp: Math.floor(Date.now() / 1000) - 14400,
    unreadCount: 0,
  },
  {
    id: 'chat_product_guild',
    name: 'Product Guild',
    type: 'group',
    avatar: 'account-group-outline',
    lastMessage: 'Roadmap items are finalized for review.',
    timestamp: Math.floor(Date.now() / 1000) - 20000,
    unreadCount: 6,
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { isConnected, account, network, connectWallet, disconnectWallet, getMessages, postMessage } = useWeb3();
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
            console.warn('Sentiment analysis failed:', error);
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
      // Fallback: show demo messages instead of crashing
      console.log('ℹ Loading demo messages as fallback');
      const fallbackMessages: DisplayMessage[] = [];
      setMessages(fallbackMessages);
      
      if (!IS_WEB) {
        Alert.alert('Error', 'Failed to load messages');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadMessages();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleConnect = async () => {
    try {
      await connectWallet();
      const message = IS_WEB 
        ? '✓ Demo wallet connected!' 
        : '✓ Wallet connected successfully!';
      Alert.alert('Success', message);
      if (DEMO_MODE) {
        navigation.navigate('MainTabs' as any, { screen: 'Chats' });
      }
    } catch (error) {
      console.error('Connection error:', error);
      let errorMessage = 'Failed to connect wallet.';
      if (IS_WEB) {
        errorMessage = 'Demo wallet connection failed. Please refresh and try again.';
      }
      Alert.alert('Error', errorMessage);
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
      
      const successMessage = IS_WEB 
        ? 'Message sent (simulated)' 
        : 'Message sent successfully';
      Alert.alert('Success ✓', successMessage);
      
      // Reload messages after sending
      try {
        await loadMessages();
      } catch (error) {
        console.warn('Failed to reload messages after sending:', error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      let errorMessage = 'Failed to send message';
      if (IS_WEB) {
        errorMessage = 'Failed to send message in demo mode. Please try again.';
      }
      Alert.alert('Error', errorMessage);
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

  const getChatTypeLabel = (type: ChatType): string => {
    switch (type) {
      case 'company':
        return 'Company';
      case 'group':
        return 'Group';
      default:
        return 'Personal';
    }
  };

  const getDayLabel = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (isSameDay(date, today)) return 'Today';
    if (isSameDay(date, yesterday)) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const renderMessage = ({ item, index }: { item: DisplayMessage; index: number }) => {
    const initials = getAvatarInitials(item.sender);
    const avatarColor = getAvatarColor(item.sender);
    const isLastMessage = index === messages.length - 1;
    const isSender = account ? item.sender.toLowerCase() === account.toLowerCase() : false;
    const currentDay = getDayLabel(item.timestamp);
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const prevDay = prevMessage ? getDayLabel(prevMessage.timestamp) : null;
    const showDayDivider = !prevDay || prevDay !== currentDay;

    return (
      <Animated.View
        style={[
          styles.messageWrapper,
          { opacity: messageOpacity },
        ]}
      >
        {showDayDivider && (
          <View style={styles.dateDivider}>
            <Text style={styles.dateDividerText}>{currentDay}</Text>
          </View>
        )}

        <View style={[styles.messageContainer, isSender && styles.messageContainerRight]}>
          {/* Avatar */}
          {!isSender && (
            <View
              style={[
                styles.avatar,
                { backgroundColor: avatarColor },
              ]}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}

          {/* Message Content */}
          <View style={[styles.messageBubbleWrapper, isSender && styles.messageBubbleWrapperRight]}>
            {/* Sender Info */}
            <View style={[styles.senderInfo, isSender && styles.senderInfoRight]}>
              <Text style={styles.senderAddress}>
                {isSender ? 'You' : formatAddress(item.sender)}
              </Text>
            </View>

            {/* Message Bubble */}
            <View style={[styles.messageBubble, isSender ? styles.sentBubble : styles.receivedBubble]}>
              <Text style={[styles.messageText, isSender && styles.messageTextSent]}>
                {item.content}
              </Text>
              {item.isEdited && (
                <Text style={styles.editedLabel}>(edited)</Text>
              )}
            </View>

            {/* Timestamp */}
            <Text style={[styles.timestamp, isSender && styles.timestampRight]}>
              {formatTimestamp(item.timestamp)}
            </Text>

            {/* Sentiment Badge */}
            <View style={[styles.badgeContainer, isSender && styles.badgeContainerRight]}>
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

          {isSender && (
            <View
              style={[
                styles.avatar,
                { backgroundColor: avatarColor },
              ]}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
        </View>

        {isLastMessage && messages.length > 0 && (
          <View style={styles.divider} />
        )}
      </Animated.View>
    );
  };

  const chatSections = [
    { title: 'Pinned', data: pinnedChats },
    { title: 'Recent Chats', data: recentChats },
  ];

  const renderChatItem = ({ item }: { item: ChatItem }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate(
            'ChatRoom' as any,
            {
              roomId: item.id,
              roomName: item.name,
              chatType: item.type,
              chatAvatar: item.avatar,
            } as any
          )
        }
      >
        <Animated.View style={[styles.chatItem, { opacity: messageOpacity }]}
        >
          <View style={styles.chatAvatar}>
            <MaterialCommunityIcons
              name={item.avatar as any}
              size={24}
              color={theme.colors.primary}
            />
          </View>
          <View style={styles.chatInfo}>
            <View style={styles.chatRow}>
              <Text style={styles.chatName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.chatTime}>{formatTimestamp(item.timestamp)}</Text>
            </View>
            <View style={styles.chatMetaRow}>
              <View style={styles.chatTypePill}>
                <Text style={styles.chatTypeText}>{getChatTypeLabel(item.type)}</Text>
              </View>
              <Text style={styles.chatPreview} numberOfLines={1}>
                {item.lastMessage}
              </Text>
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unreadCount}</Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

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
            paddingTop: Math.max(insets.top, theme.spacing.lg),
          },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <MaterialCommunityIcons name="message-text" size={22} color={theme.colors.textOnPrimary} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Messages</Text>
              <View style={styles.walletBadge}>
                <View style={styles.onlineDot} />
                <Text style={styles.walletAddress}>
                  {formatAddress(account || '')}
                </Text>
                {DEMO_MODE && (
                  <View style={styles.demoWalletPill}>
                    <Text style={styles.demoWalletText}>Demo Wallet</Text>
                  </View>
                )}
              </View>
              <Text style={styles.networkLabel}>
                {DEMO_MODE ? 'Sepolia (Demo)' : network || 'Unknown Network'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.composeButton}
            onPress={handlePostMessage}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="square-edit-outline" size={20} color={theme.colors.textOnPrimary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {!isConnected && (
        <View style={[styles.connectBanner, { borderColor: colors.borderLight }]}
        >
          <Text style={[styles.connectBannerText, { color: colors.textSecondary }]}>
            Connect your wallet to post messages.
          </Text>
          <Button
            title="Connect Wallet"
            onPress={handleConnect}
            size="small"
            variant="primary"
            icon="link-variant"
          />
        </View>
      )}

      {/* Recent Chats List */}
      <View style={styles.listWrapper}>
        {loading && !refreshing && (
          <View style={styles.loadingInline}>
            <Animated.View style={{ opacity: loadingPulse }}>
              <ActivityIndicator size="small" color={colors.primary} />
            </Animated.View>
            <Text style={[styles.loadingTextInline, { color: colors.textSecondary }]}>
              Syncing chats...
            </Text>
          </View>
        )}
        <Animated.SectionList
          sections={chatSections}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
          )}
          contentContainerStyle={styles.chatListContent}
          stickySectionHeadersEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.chatDivider} />}
          showsVerticalScrollIndicator={false}
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xl,
  },
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  logoIcon: {
    fontSize: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: theme.spacing.sm,
  },

  // Feature Grid
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  featureCard: {
    width: '48%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: theme.spacing.md,
  },
  featureTitle: {
    fontSize: 13,
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
    paddingTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
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
  demoWalletPill: {
    marginLeft: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  demoWalletText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  networkLabel: {
    marginTop: 2,
    fontSize: 11,
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
  chatListContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  sectionHeader: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  chatDivider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginLeft: 64,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  chatAvatarText: {
    fontSize: 22,
  },
  chatInfo: {
    flex: 1,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: 6,
  },
  chatName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  chatTime: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  chatTypePill: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  chatTypeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  chatPreview: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textOnPrimary,
  },
  loadingInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  loadingTextInline: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  connectBanner: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    backgroundColor: theme.colors.backgroundSecondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  connectBannerText: {
    fontSize: 12,
    fontWeight: '500',
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
  inputHelperText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
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
  messageContainerRight: {
    justifyContent: 'flex-end',
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
  messageBubbleWrapperRight: {
    alignItems: 'flex-end',
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: 4,
  },
  senderInfoRight: {
    justifyContent: 'flex-end',
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
  timestampRight: {
    textAlign: 'right',
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
  messageTextSent: {
    color: theme.colors.textOnPrimary,
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
  badgeContainerRight: {
    justifyContent: 'flex-end',
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
  dateDivider: {
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    marginBottom: theme.spacing.md,
  },
  dateDividerText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
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
