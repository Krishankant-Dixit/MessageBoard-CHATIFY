import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Clipboard,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useWeb3, formatAddress } from '../context/Web3Context';
import { Card, Button } from '../components';
import { DEMO_MODE } from '../utils/constants';

type ProfileScreenNavigationProp = NativeStackNavigationProp<any, 'Profile'>;

interface ProfileScreenProps {
  navigation: ProfileScreenNavigationProp;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { account, isConnected, network, chainId, disconnectWallet } = useWeb3();
  const { colors, isDarkMode } = useTheme();
  const [connecting, setConnecting] = useState(false);

  const handleCopyAddress = () => {
    if (account) {
      Clipboard.setString(account);
      Alert.alert('Copied!', 'Wallet address copied to clipboard');
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Wallet?',
      'Are you sure you want to disconnect?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          onPress: () => {
            disconnectWallet();
            Alert.alert('Disconnected', 'Wallet disconnected successfully.');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const getAvatarColor = (address: string): string => {
    const colorPalette = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#FFA07A',
      '#98D8C8',
      '#F7DC6F',
      '#BB8FCE',
      '#85C1E2',
    ];
    const index = parseInt(address.slice(2, 4), 16) % colorPalette.length;
    return colorPalette[index];
  };

  const getAvatarInitials = (address: string): string => {
    return address.slice(2, 4).toUpperCase();
  };

  if (!isConnected || !account) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
          <Text style={styles.emptyIcon}>👤</Text>
          <Text style={styles.emptyTitle}>Profile Unavailable</Text>
          <Text style={styles.emptyDescription}>Connect your wallet to view your profile</Text>
          <Button title="Go to Chats" onPress={() => navigation.goBack()} size="large" />
        </View>
      </View>
    );
  }

  const avatarColor = getAvatarColor(account);
  const initials = getAvatarInitials(account);
  const displayName = `Chatify User ${initials}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 48 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          {/* Large Avatar */}
          <View style={[styles.avatarLarge, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>

          {/* Username */}
          <Text style={styles.userName}>{displayName}</Text>

          {/* Demo Badge */}
          {DEMO_MODE && (
            <View style={[styles.demoBadge, { backgroundColor: colors.warning + '20' }]}>
              <Text style={[styles.demoBadgeText, { color: colors.warning }]}>🎭 Demo Identity</Text>
            </View>
          )}
        </View>

        {/* Wallet Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Wallet Address</Text>
          
          <View style={styles.addressBox}>
            <Text style={styles.addressText}>{account}</Text>
            <TouchableOpacity onPress={handleCopyAddress} style={styles.copyBtn}>
              <Text style={styles.copyBtnIcon}>📋</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleCopyAddress} style={styles.copyFullBtn}>
            <Text style={styles.copyFullBtnIcon}>📋</Text>
            <Text style={styles.copyFullBtnText}>Copy Address</Text>
          </TouchableOpacity>
        </Card>

        {/* Network Status */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Network Status</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.statusText, { color: colors.success }]}>Connected</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Network</Text>
            <Text style={styles.infoValue}>{network || 'Unknown'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Chain ID</Text>
            <Text style={styles.infoValue}>{chainId || '-'}</Text>
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Disconnect Wallet"
            onPress={handleDisconnect}
            variant="outline"
            size="large"
            fullWidth
            style={styles.disconnectBtn}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 20,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarInitials: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  demoBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.warning,
  },
  demoBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Sections
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },

  // Address Box
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundTertiary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.text,
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  copyBtn: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  copyBtnIcon: {
    fontSize: 18,
  },
  copyFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary + '15',
  },
  copyFullBtnIcon: {
    fontSize: 16,
  },
  copyFullBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },

  // Info Rows
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderDark,
    marginVertical: theme.spacing.sm,
  },

  // Status
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Actions
  actions: {
    marginTop: theme.spacing.lg,
  },
  disconnectBtn: {
    borderColor: theme.colors.error,
  },
});
