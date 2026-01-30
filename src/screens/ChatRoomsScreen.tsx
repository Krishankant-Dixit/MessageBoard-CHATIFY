import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Button, Card, ProfileAvatar } from '../components';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { ChatRoom } from '../utils/helpers';

type ChatRoomsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<any, 'Chats'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface ChatRoomsScreenProps {
  navigation: ChatRoomsScreenNavigationProp;
}

export const ChatRoomsScreen: React.FC<ChatRoomsScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Demo rooms for UI demonstration
  const demoRooms: ChatRoom[] = [
    {
      id: 'room_1',
      name: 'General',
      type: 'public',
      description: 'Open discussion for everyone',
      members: ['user1', 'user2', 'user3'],
      createdBy: 'admin',
      createdAt: Date.now() / 1000 - 86400 * 30,
      avatar: 'message-text',
    },
    {
      id: 'room_2',
      name: 'Engineering Team',
      type: 'company',
      description: 'Engineering department discussions',
      companyId: 'company_1',
      members: ['user1', 'user4', 'user5'],
      createdBy: 'manager',
      createdAt: Date.now() / 1000 - 86400 * 15,
      avatar: 'account-group',
    },
    {
      id: 'room_3',
      name: 'Project Alpha',
      type: 'private',
      description: 'Private project discussions',
      members: ['user1', 'user2'],
      createdBy: 'user1',
      createdAt: Date.now() / 1000 - 86400 * 7,
      avatar: 'lock-outline',
    },
    {
      id: 'room_4',
      name: 'Marketing',
      type: 'company',
      description: 'Marketing team collaboration',
      companyId: 'company_1',
      members: ['user1', 'user6', 'user7'],
      createdBy: 'marketing_lead',
      createdAt: Date.now() / 1000 - 86400 * 20,
      avatar: 'bullhorn',
    },
  ];

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setLoading(true);
    try {
      // Simulate loading rooms from blockchain/backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRooms(demoRooms);
    } catch (error) {
      console.error('Error loading rooms:', error);
      Alert.alert('Error', 'Failed to load chat rooms');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRooms();
    setRefreshing(false);
  };

  const getRoomTypeIcon = (type: ChatRoom['type']) => {
    switch (type) {
      case 'public':
        return 'earth';
      case 'private':
        return 'lock-outline';
      case 'company':
        return 'office-building';
      default:
        return 'message-text';
    }
  };

  const renderRoomItem = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ChatRoom', { roomId: item.id, roomName: item.name })}
    >
      <Card style={styles.roomCard}>
        <View style={styles.roomHeader}>
          <View style={styles.roomInfo}>
            <View style={styles.roomAvatar}>
              <MaterialCommunityIcons
                name={item.avatar || getRoomTypeIcon(item.type)}
                size={22}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.roomDetails}>
              <Text style={styles.roomName}>{item.name}</Text>
              <Text style={styles.roomDescription}>{item.description}</Text>
            </View>
          </View>
          <View style={styles.roomMeta}>
            <Text style={styles.roomType}>{item.type}</Text>
            <Text style={styles.memberCount}>{item.members.length} members</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top || theme.spacing.md }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Chat Rooms</Text>
          <Text style={styles.headerSubtitle}>
            {user?.name || 'User'}
          </Text>
        </View>
        <ProfileAvatar
          onLogout={() => {
            // Navigation handled automatically by auth context changes
          }}
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity style={[styles.filterButton, styles.filterButtonActive]}>
          <Text style={[styles.filterText, styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Public</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Private</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Company</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={renderRoomItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No chat rooms yet</Text>
            <Text style={styles.emptySubtext}>Create your first room to get started!</Text>
          </View>
        }
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom || theme.spacing.md }]}>
        <Button
          title="Create Room"
          onPress={() => Alert.alert('Feature', 'Create room feature coming soon!')}
          size="large"
          style={styles.createButton}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.backgroundTertiary,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  filterTextActive: {
    color: theme.colors.text,
  },
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl * 2,
  },
  roomCard: {
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roomAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  roomDetails: {
    flex: 1,
  },
  roomName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  roomDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  roomMeta: {
    alignItems: 'flex-end',
  },
  roomType: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.xs,
  },
  memberCount: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textTertiary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.sm,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  createButton: {
    width: '100%',
  },
});
