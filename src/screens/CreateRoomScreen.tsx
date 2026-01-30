import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Input, Card } from '../components';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { generateRoomId, ChatRoom } from '../utils/helpers';

type CreateRoomScreenNavigationProp = NativeStackNavigationProp<any>;

interface CreateRoomScreenProps {
  navigation: CreateRoomScreenNavigationProp;
}

export const CreateRoomScreen: React.FC<CreateRoomScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [roomType, setRoomType] = useState<'public' | 'private' | 'company'>('public');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!roomName.trim()) {
      Alert.alert('Error', 'Please enter a room name');
      return;
    }

    setLoading(true);
    try {
      // Simulate creating room on blockchain
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newRoom: ChatRoom = {
        id: generateRoomId(),
        name: roomName,
        type: roomType,
        description: description || undefined,
        members: [user?.id || ''],
        createdBy: user?.id || '',
        createdAt: Date.now() / 1000,
      };

      Alert.alert(
        'Success',
        'Chat room created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating room:', error);
      Alert.alert('Error', 'Failed to create chat room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + theme.spacing.lg }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Create Chat Room</Text>
        <Text style={styles.subtitle}>Set up a new space for collaboration</Text>

        <Card style={styles.formCard}>
          <Input
            label="Room Name"
            placeholder="e.g., Engineering Team"
            value={roomName}
            onChangeText={setRoomName}
            maxLength={50}
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Description (Optional)"
            placeholder="What is this room about?"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            maxLength={200}
            containerStyle={styles.inputContainer}
          />

          <Text style={styles.sectionLabel}>Room Type</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[styles.typeButton, roomType === 'public' && styles.typeButtonActive]}
              onPress={() => setRoomType('public')}
            >
              <MaterialCommunityIcons name="earth" size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.typeTitle, roomType === 'public' && styles.typeTextActive]}>
                Public
              </Text>
              <Text style={styles.typeDescription}>Anyone can join</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, roomType === 'private' && styles.typeButtonActive]}
              onPress={() => setRoomType('private')}
            >
              <MaterialCommunityIcons name="lock-outline" size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.typeTitle, roomType === 'private' && styles.typeTextActive]}>
                Private
              </Text>
              <Text style={styles.typeDescription}>Invite only</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, roomType === 'company' && styles.typeButtonActive]}
              onPress={() => setRoomType('company')}
            >
              <MaterialCommunityIcons name="office-building" size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.typeTitle, roomType === 'company' && styles.typeTextActive]}>
                Company
              </Text>
              <Text style={styles.typeDescription}>Company members only</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <View style={styles.infoCard}>
          <View style={styles.infoTitleRow}>
            <MaterialCommunityIcons name="note-text-outline" size={18} color={theme.colors.textSecondary} />
            <Text style={styles.infoTitle}>Room Information</Text>
          </View>
          <Text style={styles.infoText}>
            • All messages are stored on blockchain{'\n'}
            • Messages are immutable and tamper-proof{'\n'}
            • Edit history is permanently recorded{'\n'}
            • Room settings can be managed later
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
            title="Create Room"
            onPress={handleCreate}
            loading={loading}
            disabled={!roomName.trim()}
            style={styles.createButton}
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
    padding: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  backText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  formCard: {
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  sectionLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  typeButton: {
    flex: 1,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.backgroundTertiary,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  typeIcon: {
    fontSize: 28,
    marginBottom: theme.spacing.xs,
  },
  typeTitle: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  typeTextActive: {
    color: theme.colors.primary,
  },
  typeDescription: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: theme.colors.backgroundTertiary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    marginBottom: theme.spacing.lg,
  },
  infoTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  cancelButton: {
    flex: 1,
  },
  createButton: {
    flex: 1,
  },
});
