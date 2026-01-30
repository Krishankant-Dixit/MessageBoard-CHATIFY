import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { BackButton, ProfileAvatar } from '../components';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import { useFadeInAnimation } from '../hooks';
import { Message } from '../contracts/MessageBoard';
import { MessageEdit, formatTimestamp, formatAddress } from '../utils/helpers';
import { DEMO_MODE } from '../utils/constants';

type ChatRoomScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChatRoom'>;
type ChatRoomScreenRouteProp = RouteProp<RootStackParamList, 'ChatRoom'>;

interface ChatRoomScreenProps {
  navigation: ChatRoomScreenNavigationProp;
  route: ChatRoomScreenRouteProp;
}

export const ChatRoomScreen: React.FC<ChatRoomScreenProps> = ({ navigation, route }) => {
  const { roomId, roomName } = route.params;
  const { user } = useAuth();
  const { isConnected } = useWeb3();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);

  const chatType = (route.params as any)?.chatType as 'personal' | 'group' | 'company' | undefined;
  const chatAvatar = (route.params as any)?.chatAvatar as string | undefined;
  const chatTypeLabel = chatType === 'company' ? 'Company' : chatType === 'group' ? 'Group' : 'Personal';
  const isGroupChat = chatType === 'group' || chatType === 'company';

  const getSentimentLabel = (sentiment?: Message['sentiment']): string => {
    switch (sentiment) {
      case 'positive':
        return 'Positive';
      case 'negative':
        return 'Negative';
      default:
        return 'Neutral';
    }
  };

  const getSentimentColor = (sentiment?: Message['sentiment']): string => {
    switch (sentiment) {
      case 'positive':
        return theme.colors.success;
      case 'negative':
        return theme.colors.error;
      default:
        return theme.colors.warning;
    }
  };

  const getSafetyLabel = (category?: Message['safetyCategory']): string => {
    switch (category) {
      case 'spam':
        return 'Spam';
      case 'abuse':
        return 'Abuse';
      case 'sensitive':
        return 'Sensitive';
      default:
        return 'Safe';
    }
  };

  const getSafetyColor = (category?: Message['safetyCategory']): string => {
    switch (category) {
      case 'spam':
      case 'abuse':
        return theme.colors.error;
      case 'sensitive':
        return theme.colors.warning;
      default:
        return theme.colors.success;
    }
  };

  const MessageRow: React.FC<{
    item: Message;
    isMine: boolean;
    showSenderLabel: boolean;
    onLongPress: () => void;
  }> = ({ item, isMine, showSenderLabel, onLongPress }) => {
    const fadeAnim = useFadeInAnimation(250);

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <TouchableOpacity onLongPress={onLongPress}>
          <View style={[styles.messageRow, isMine ? styles.messageRowMine : styles.messageRowOther]}>
            <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
              {showSenderLabel && (
                <Text style={styles.senderLabel} numberOfLines={1}>
                  {formatAddress(item.sender)}
                </Text>
              )}
              <Text style={[styles.messageText, isMine ? styles.messageTextMine : styles.messageTextOther]}>
                {item.content}
              </Text>
              {(item.sentiment || item.safetyCategory) && (
                <View style={styles.badgeRow}>
                  {item.sentiment && (
                    <View
                      style={[
                        styles.badgePill,
                        { borderColor: getSentimentColor(item.sentiment) },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: getSentimentColor(item.sentiment) },
                        ]}
                      >
                        {getSentimentLabel(item.sentiment)}
                      </Text>
                    </View>
                  )}
                  {item.safetyCategory && (
                    <View
                      style={[
                        styles.badgePill,
                        { borderColor: getSafetyColor(item.safetyCategory) },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: getSafetyColor(item.safetyCategory) },
                        ]}
                      >
                        {getSafetyLabel(item.safetyCategory)}
                      </Text>
                    </View>
                  )}
                </View>
              )}
              <View style={styles.metaRow}>
                {item.isEdited && <Text style={styles.editedTag}>edited</Text>}
                <Text style={styles.timeText}>{formatTimestamp(item.timestamp)}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Demo messages
  const demoMessages: Message[] = [
    {
      id: 1,
      content: 'Welcome to the chat room!',
      sender: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      timestamp: Date.now() / 1000 - 3600,
      roomId,
      isPrivate: false,
      isEdited: false,
      editCount: 0,
      sentiment: 'positive',
      safetyCategory: 'safe',
    },
    {
      id: 2,
      content: 'This is a secure, blockchain-based messaging system.',
      sender: '0x1234567890abcdef1234567890abcdef12345678',
      timestamp: Date.now() / 1000 - 1800,
      roomId,
      isPrivate: false,
      isEdited: false,
      editCount: 0,
      sentiment: 'neutral',
      safetyCategory: 'safe',
    },
    {
      id: 3,
      content: 'All messages are immutable and tamper-proof!',
      sender: user?.walletAddress || user?.email || '0xUser',
      timestamp: Date.now() / 1000 - 900,
      roomId,
      isPrivate: false,
      isEdited: true,
      editCount: 1,
      sentiment: 'positive',
      safetyCategory: 'safe',
      editHistory: [
        {
          oldContent: 'All messages are stored on blockchain',
          newContent: 'All messages are immutable and tamper-proof!',
          editedAt: Date.now() / 1000 - 600,
          blockchainHash: '0xabc123...',
        },
      ],
    },
  ];

  useEffect(() => {
    navigation.setOptions({ 
      headerShown: false,
    });
    loadMessages();
  }, [roomId]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setMessages(demoMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      content: inputText,
      sender: user?.walletAddress || user?.email || '0xUser',
      timestamp: Date.now() / 1000,
      roomId,
      isPrivate: false,
      isEdited: false,
      editCount: 0,
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // Simulate blockchain transaction
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleEdit = (messageId: number) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setEditingMessageId(messageId);
      setInputText(message.content);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingMessageId || !inputText.trim()) return;

    const updatedMessages = messages.map(msg => {
      if (msg.id === editingMessageId) {
        const editHistory = msg.editHistory || [];
        editHistory.push({
          oldContent: msg.content,
          newContent: inputText,
          editedAt: Date.now() / 1000,
          blockchainHash: `0x${Math.random().toString(36).slice(2, 11)}`,
        });

        return {
          ...msg,
          content: inputText,
          isEdited: true,
          editCount: (msg.editCount || 0) + 1,
          editHistory,
        };
      }
      return msg;
    });

    setMessages(updatedMessages);
    setInputText('');
    setEditingMessageId(null);

    Alert.alert('Success', 'Message edited! Edit history stored on blockchain.');
  };

  const showEditHistory = (message: Message) => {
    if (!message.editHistory || message.editHistory.length === 0) {
      Alert.alert('No Edits', 'This message has not been edited.');
      return;
    }

    const historyText = message.editHistory
      .map((edit, index) => 
        `Edit ${index + 1} (${formatTimestamp(edit.editedAt)}):\n` +
        `Old: "${edit.oldContent}"\n` +
        `New: "${edit.newContent}"\n` +
        `Hash: ${edit.blockchainHash?.slice(0, 10)}...`
      )
      .join('\n\n');

    Alert.alert('Edit History', historyText);
  };

  const isMyMessage = (sender: string) => {
    return sender === user?.walletAddress || sender === user?.email;
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = isMyMessage(item.sender);
    const showSenderLabel = !isMine && isGroupChat;

    return (
      <MessageRow
        item={item}
        isMine={isMine}
        showSenderLabel={showSenderLabel}
        onLongPress={() => {
          if (isMine) {
            Alert.alert(
              'Message Options',
              'What would you like to do?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Edit Message', onPress: () => handleEdit(item.id) },
                ...(item.isEdited ? [{ text: 'View Edit History', onPress: () => showEditHistory(item) }] : []),
              ]
            );
          } else if (item.isEdited) {
            showEditHistory(item);
          }
        }}
      />
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      {/* Custom Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, theme.spacing.md) }]}>
        <View style={styles.headerLeft}>
          <BackButton onPress={() => navigation.goBack()} />
          <View style={styles.roomInfo}>
            <View style={styles.roomIconContainer}>
              <MaterialCommunityIcons
                name={chatAvatar || 'message-text'}
                size={18}
                color={theme.colors.textOnPrimary}
              />
            </View>
            <View style={styles.roomDetails}>
              <Text style={styles.roomTitle} numberOfLines={1}>{roomName}</Text>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{chatTypeLabel}</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <View style={styles.connectionStatus}>
            <View style={[styles.statusDot, styles.statusDotActive]} />
            <Text style={styles.connectionText}>Connected</Text>
          </View>
          <ProfileAvatar />
        </View>
      </View>

      {DEMO_MODE && (
        <View style={styles.demoBanner}>
          <Text style={styles.demoBannerText}>
            🎯 Demo Mode: Blockchain delivery and AI insights are simulated for the hackathon demo.
          </Text>
        </View>
      )}

      {/* Messages List */}
      <View style={styles.chatBackground}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          inverted={false}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={[styles.futureFeatureBanner, { backgroundColor: theme.colors.backgroundSecondary }]}>
              <MaterialCommunityIcons name="note-text-outline" size={18} color={theme.colors.textSecondary} />
              <View style={styles.futureFeatureContent}>
                <Text style={[styles.futureFeatureTitle, { color: theme.colors.text }]}>Edit History (Coming Soon)</Text>
                <Text style={[styles.futureFeatureDesc, { color: theme.colors.textSecondary }]}>View full edit audit trail for all messages</Text>
              </View>
            </View>
          }
        />
      </View>

      {/* Input Container */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom || theme.spacing.sm }]}>
        {editingMessageId && (
          <View style={styles.editingBanner}>
            <View style={styles.editingInfo}>
              <MaterialCommunityIcons name="pencil" size={16} color={theme.colors.primary} />
              <Text style={styles.editingText}>Editing message</Text>
            </View>
            <TouchableOpacity 
              onPress={() => {
                setEditingMessageId(null);
                setInputText('');
              }}
              style={styles.cancelButton}
            >
              <MaterialCommunityIcons name="close" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.composerWrapper}>
          {!isConnected && (
            <Text style={styles.inputHelperText}>Connect wallet to send messages.</Text>
          )}
          <View style={styles.inputRow}>
            <TouchableOpacity 
              style={styles.composerIconButton}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="emoticon-outline" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={styles.inputComposer}>
              <TextInput
                style={styles.input}
                placeholder="Message"
                placeholderTextColor={theme.colors.inputPlaceholder}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                editable={isConnected}
              />
            </View>
            
            <TouchableOpacity
              style={[
                styles.sendButtonComposer,
                (!inputText.trim() || !isConnected) && styles.sendButtonComposerDisabled
              ]}
              onPress={editingMessageId ? handleSaveEdit : handleSend}
              disabled={!inputText.trim() || !isConnected}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={editingMessageId ? 'check' : 'send'}
                size={16}
                color={theme.colors.textOnPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  // Custom Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.md,
  },
  headerCenter: {
    flex: 1,
  },
  appName: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
    letterSpacing: 0.3,
    marginBottom: 1,
  },
  roomTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    backgroundColor: theme.colors.backgroundTertiary,
    borderRadius: theme.borderRadius.md,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusDotActive: {
    backgroundColor: theme.colors.online,
  },
  connectionText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  roomDetails: {
    flex: 1,
  },
  roomIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  roomIcon: {
    fontSize: 18,
  },
  typeBadge: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  typeBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: theme.colors.online,
    marginRight: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  // Chat Background
  chatBackground: {
    flex: 1,
    backgroundColor: theme.colors.chatBackground,
  },
  messagesList: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  messageRow: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.xs,
  },
  messageRowMine: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  bubbleMine: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: theme.borderRadius.xs,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.15,
  },
  bubbleOther: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderBottomLeftRadius: theme.borderRadius.xs,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  senderLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  messageText: {
    fontSize: theme.typography.fontSize.base,
    lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.normal,
    marginBottom: 2,
  },
  messageTextMine: {
    color: theme.colors.textOnPrimary,
  },
  messageTextOther: {
    color: theme.colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: theme.spacing.xs,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  badgePill: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    backgroundColor: theme.colors.backgroundElevated,
  },
  badgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  editedTag: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  timeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  futureFeatureBanner: {
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.6,
  },
  futureFeatureIcon: {
    fontSize: 18,
    marginRight: theme.spacing.md,
  },
  futureFeatureContent: {
    flex: 1,
  },
  futureFeatureTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
  },
  futureFeatureDesc: {
    fontSize: theme.typography.fontSize.xs,
  },
  demoBanner: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    backgroundColor: theme.colors.backgroundSecondary,
    borderColor: theme.colors.borderLight,
  },
  demoBannerText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  
  // Input Container
  inputContainer: {
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  editingBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.backgroundTertiary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  editingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  editingIcon: {
    fontSize: theme.typography.fontSize.md,
  },
  editingText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  cancelButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  // WhatsApp-style Composer
  composerWrapper: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  inputHelperText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  composerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  composerIconEmoji: {
    fontSize: 18,
  },
  inputComposer: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 38,
    maxHeight: 100,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  input: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '400',
    lineHeight: 20,
    paddingVertical: 0,
  },
  sendButtonComposer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  sendButtonComposerDisabled: {
    backgroundColor: theme.colors.backgroundSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonComposerText: {
    fontSize: 16,
    color: theme.colors.textOnPrimary,
    fontWeight: theme.typography.fontWeight.bold,
  },
});
