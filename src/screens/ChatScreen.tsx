import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ChatBubble, ChatInput, BackButton, ProfileAvatar } from '../components';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { Message } from '../contracts/MessageBoard';
import { formatTimestamp } from '../utils/helpers';

type ChatScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChatRoom'>;
type ChatScreenRouteProp = RouteProp<RootStackParamList, 'ChatRoom'>;

interface ChatScreenProps {
  navigation: ChatScreenNavigationProp;
  route: ChatScreenRouteProp;
}

/**
 * ChatScreen Component
 * Modern chat interface with Google Chat-like design
 * Uses inverted FlatList, ChatBubble, and ChatInput components
 */
export const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const { roomId, roomName } = route.params;
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);

  // Demo messages (reversed for inverted list)
  const demoMessages: Message[] = [
    {
      id: 1,
      content: 'Welcome to the chat room! 🎉',
      sender: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      timestamp: Date.now() / 1000 - 3600,
      roomId,
      isPrivate: false,
      isEdited: false,
      editCount: 0,
    },
    {
      id: 2,
      content: 'This is a secure, blockchain-based messaging system with end-to-end encryption.',
      sender: '0x1234567890abcdef1234567890abcdef12345678',
      timestamp: Date.now() / 1000 - 1800,
      roomId,
      isPrivate: false,
      isEdited: false,
      editCount: 0,
    },
    {
      id: 3,
      content: 'All messages are immutable and tamper-proof! ✨',
      sender: user?.walletAddress || user?.email || '0xUser',
      timestamp: Date.now() / 1000 - 900,
      roomId,
      isPrivate: false,
      isEdited: true,
      editCount: 1,
    },
  ];

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    loadMessages();
  }, [roomId]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setMessages(demoMessages.reverse()); // Reverse for inverted list
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    if (editingMessageId) {
      handleSaveEdit();
      return;
    }

    const newMessage: Message = {
      id: Date.now(),
      content: inputText.trim(),
      sender: user?.walletAddress || user?.email || '0xUser',
      timestamp: Date.now() / 1000,
      roomId,
      isPrivate: false,
      isEdited: false,
      editCount: 0,
    };

    // Add to top of inverted list
    setMessages([newMessage, ...messages]);
    setInputText('');

    // Auto-scroll to latest message
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, 100);

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
        return {
          ...msg,
          content: inputText.trim(),
          isEdited: true,
          editCount: (msg.editCount || 0) + 1,
        };
      }
      return msg;
    });

    setMessages(updatedMessages);
    setInputText('');
    setEditingMessageId(null);

    Alert.alert('Success', 'Message edited successfully!');
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setInputText('');
  };

  const isMyMessage = (sender: string): boolean => {
    return sender === user?.walletAddress || sender === user?.email;
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMine = isMyMessage(item.sender);
    const previousMessage = messages[index + 1]; // Next in array is previous in inverted list
    const isLastInGroup = !previousMessage || previousMessage.sender !== item.sender;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={() => {
          if (isMine) {
            Alert.alert(
              'Message Options',
              'What would you like to do?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Edit', onPress: () => handleEdit(item.id) },
                { text: 'Delete', onPress: () => {}, style: 'destructive' },
              ]
            );
          }
        }}
      >
        <ChatBubble
          message={item.content}
          variant={isMine ? 'sent' : 'received'}
          timestamp={item.timestamp}
          isEdited={item.isEdited}
          sender={isMine ? undefined : item.sender}
          showTimestamp={true}
          showEdited={true}
          isLastInGroup={isLastInGroup}
          grouped={!isLastInGroup}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top || theme.spacing.md }]}>
        <View style={styles.headerLeft}>
          <BackButton onPress={() => navigation.goBack()} />
          
          <View style={styles.roomInfo}>
            <View style={styles.roomAvatar}>
              <MaterialCommunityIcons name="message-text" size={18} color={theme.colors.textOnPrimary} />
            </View>
            <View style={styles.roomDetails}>
              <Text style={styles.roomTitle} numberOfLines={1}>
                {roomName}
              </Text>
              <View style={styles.statusBadge}>
                <View style={styles.onlineDot} />
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
          </View>
        </View>
        
        <ProfileAvatar />
      </View>

      {/* Messages List (Inverted) */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        inverted={true}
        showsVerticalScrollIndicator={false}
        style={styles.chatBackground}
        keyboardShouldPersistTaps="handled"
      />

      {/* Editing Banner */}
      {editingMessageId && (
        <View style={styles.editingBanner}>
          <View style={styles.editingInfo}>
            <MaterialCommunityIcons name="pencil" size={16} color={theme.colors.primary} />
            <Text style={styles.editingText}>Editing message</Text>
          </View>
          <TouchableOpacity onPress={cancelEdit} style={styles.cancelButton}>
            <MaterialCommunityIcons name="close" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Chat Input */}
      <ChatInput
        value={inputText}
        onChangeText={setInputText}
        onSend={handleSend}
        placeholder="Type a message..."
        maxLength={1000}
        showCharCounter={false}
        useKeyboardAvoidingView={true}
        containerStyle={{ paddingBottom: insets.bottom || theme.spacing.sm }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  roomAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  roomIcon: {
    fontSize: 20,
  },
  roomDetails: {
    flex: 1,
  },
  roomTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.online,
    marginRight: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  // Chat Area
  chatBackground: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  messagesList: {
    paddingVertical: theme.spacing.md,
    flexGrow: 1,
  },
  
  // Editing Banner
  editingBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundTertiary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
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
    backgroundColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelIcon: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.bold,
  },
});
