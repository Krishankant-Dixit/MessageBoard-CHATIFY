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
import { theme } from '../theme';

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
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 48 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Card */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <View style={[styles.avatarContainer, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>

          {/* Profile Info */}
          <Text style={styles.displayName}>{displayName}</Text>
          
          <TouchableOpacity 
            style={styles.addressContainer}
            onPress={handleCopyAddress}
            activeOpacity={0.7}
          >
            <Text style={styles.addressLabel}>Wallet Address</Text>
            <Text style={styles.addressValue}>{formatAddress(account)}</Text>
            <Text style={styles.copyHint}>Tap to copy</Text>
          </TouchableOpacity>

          {/* Demo Badge */}
          {DEMO_MODE && (
            <View style={styles.demoBadgeNew}>
              <Text style={styles.demoBadgeIcon}>🎭</Text>
              <Text style={styles.demoBadgeText}>Demo Identity</Text>
            </View>
          )}
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Account</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleCopyAddress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuItemIcon}>📋</Text>
                <View>
                  <Text style={styles.menuItemTitle}>Full Address</Text>
                  <Text style={styles.menuItemSubtitle}>{account}</Text>
                </View>
              </View>
              <Text style={styles.menuItemAction}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Network Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Connection</Text>
          <View style={styles.sectionCard}>
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuItemIcon}>🌐</Text>
                <View>
                  <Text style={styles.menuItemTitle}>Status</Text>
                  <View style={styles.statusBadgeNew}>
                    <View style={[styles.statusDotNew, { backgroundColor: theme.colors.online }]} />
                    <Text style={styles.statusTextNew}>Connected</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.menuDivider} />

            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuItemIcon}>⛓️</Text>
                <View>
                  <Text style={styles.menuItemTitle}>Network</Text>
                  <Text style={styles.menuItemValue}>{network || 'Unknown'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.menuDivider} />

            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuItemIcon}>🔗</Text>
                <View>
                  <Text style={styles.menuItemTitle}>Chain ID</Text>
                  <Text style={styles.menuItemValue}>{chainId || '-'}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ENS Username (Future Feature) */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Username</Text>
          <View style={[styles.sectionCard, styles.disabledCard]}>
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuItemIcon}>🔗</Text>
                <View>
                  <Text style={[styles.menuItemTitle, styles.disabledText]}>ENS Username</Text>
                  <Text style={[styles.menuItemSubtitle, styles.disabledSubtext]}>Connect your ENS domain</Text>
                </View>
              </View>
              <Text style={[styles.comingSoonBadge, styles.badgeSmall]}>Coming Soon</Text>
            </View>
          </View>
        </View>

        {/* Private Rooms (Future Feature) */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Privacy</Text>
          <View style={[styles.sectionCard, styles.disabledCard]}>
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuItemIcon}>🔒</Text>
                <View>
                  <Text style={[styles.menuItemTitle, styles.disabledText]}>Private Rooms</Text>
                  <Text style={[styles.menuItemSubtitle, styles.disabledSubtext]}>Encrypted rooms with users</Text>
                </View>
              </View>
              <Text style={[styles.comingSoonBadge, styles.badgeSmall]}>Coming Soon</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.disconnectButton}
            onPress={handleDisconnect}
            activeOpacity={0.8}
          >
            <Text style={styles.disconnectButtonText}>Disconnect Wallet</Text>
          </TouchableOpacity>
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
    paddingHorizontal: theme.spacing.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  emptyIcon: {
    fontSize: 56,
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
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },

  // Profile Header Card
  profileCard: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarInitials: {
    fontSize: 40,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  displayName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  
  // Address Container
  addressContainer: {
    width: '100%',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundTertiary,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  addressLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  addressValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.semibold,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  copyHint: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },

  // Demo Badge New
  demoBadgeNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.primary + '15',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  demoBadgeIcon: {
    fontSize: 12,
  },
  demoBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
  },

  // Sections
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  sectionCard: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    overflow: 'hidden',
  },
  disabledCard: {
    opacity: 0.6,
  },

  // Menu Items
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.md,
  },
  menuItemIcon: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  menuItemTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 1,
  },
  menuItemSubtitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  menuItemValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    marginTop: 1,
  },
  menuItemAction: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.md,
  },
  menuDivider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginHorizontal: theme.spacing.md,
  },

  // Status
  statusBadgeNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: 2,
  },
  statusDotNew: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusTextNew: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.online,
  },

  // Coming Soon Badge
  comingSoonBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.backgroundTertiary,
    overflow: 'hidden',
  },
  badgeSmall: {
    fontSize: theme.typography.fontSize.xs,
  },

  // Disabled Text
  disabledText: {
    color: theme.colors.textSecondary,
  },
  disabledSubtext: {
    color: theme.colors.borderLight,
  },

  // Actions
  actions: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  disconnectButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.error,
    alignItems: 'center',
  },
  disconnectButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.error,
  },
});
