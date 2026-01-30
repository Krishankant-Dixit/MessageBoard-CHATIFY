import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components';
import { DEMO_MODE } from '../utils/constants';

type SettingsScreenNavigationProp = NativeStackNavigationProp<any, 'Settings'>;

interface SettingsScreenProps {
  navigation: SettingsScreenNavigationProp;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors, spacing, isDarkMode, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [demoModeEnabled, setDemoModeEnabled] = useState(DEMO_MODE);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

  const handleThemeToggle = async () => {
    await toggleTheme();
  };

  const handleDemoModeToggle = () => {
    setDemoModeEnabled(!demoModeEnabled);
    Alert.alert(
      'Demo Mode',
      `Demo mode is ${!demoModeEnabled ? 'enabled' : 'disabled'}. Restart the app for changes to take effect.`
    );
  };

  const handleNotificationsToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all locally stored data except your theme preference. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsClearingCache(true);
              
              // Get all keys
              const keys = await AsyncStorage.getAllKeys();
              
              // Filter out theme preference key to preserve it
              const keysToRemove = keys.filter(key => key !== '@theme_preference');
              
              // Remove all keys except theme
              if (keysToRemove.length > 0) {
                await AsyncStorage.multiRemove(keysToRemove);
              }
              
              setIsClearingCache(false);
              Alert.alert('Success', 'Cache cleared successfully!');
            } catch (error) {
              setIsClearingCache(false);
              Alert.alert('Error', 'Failed to clear cache');
              console.error('Clear cache error:', error);
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to log out');
            }
          },
        },
      ]
    );
  };

  const renderSettingItem = (
    icon: IconName,
    title: string,
    description: string,
    onPress: () => void,
    rightComponent?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIconWrap}>
          <MaterialCommunityIcons name={icon} size={20} color={colors.textSecondary} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            {description}
          </Text>
        </View>
      </View>
      {rightComponent || (
        <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        </View>

        {/* Appearance */}
        <View style={styles.sectionGroup}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Appearance</Text>
          <View style={[styles.settingsCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderLight }]}>
            {renderSettingItem(
              'weather-night',
              'Dark Mode',
              isDarkMode ? 'Using dark theme' : 'Using light theme',
              handleThemeToggle,
              <Switch
                value={isDarkMode}
                onValueChange={handleThemeToggle}
                trackColor={{ false: colors.borderDark, true: colors.primary }}
                thumbColor={isDarkMode ? colors.primary : colors.backgroundTertiary}
              />
            )}
          </View>
        </View>

        {/* Notifications & Demo */}
        <View style={styles.sectionGroup}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Preferences</Text>
          <View style={[styles.settingsCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderLight }]}>
            {renderSettingItem(
              'bell-outline',
              'Notifications',
              notificationsEnabled ? 'Enabled' : 'Disabled',
              handleNotificationsToggle,
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: colors.borderDark, true: colors.primary }}
                thumbColor={notificationsEnabled ? colors.primary : colors.backgroundTertiary}
              />
            )}
            <View style={[styles.itemDivider, { backgroundColor: colors.borderLight }]} />
            {renderSettingItem(
              'theater',
              'Demo Mode',
              demoModeEnabled ? 'Enabled' : 'Disabled',
              handleDemoModeToggle,
              <Switch
                value={demoModeEnabled}
                onValueChange={handleDemoModeToggle}
                trackColor={{ false: colors.borderDark, true: colors.primary }}
                thumbColor={demoModeEnabled ? colors.primary : colors.backgroundTertiary}
              />
            )}
          </View>
        </View>

        {/* Data & Storage */}
        <View style={styles.sectionGroup}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Data</Text>
          <View style={[styles.settingsCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderLight }]}>
            {renderSettingItem(
              'trash-can-outline',
              'Clear Cache',
              'Remove locally stored data',
              handleClearCache,
              isClearingCache ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : undefined
            )}
          </View>
        </View>

        {/* DAO Moderation (Future Feature) */}
        <View style={[styles.sectionGroup, styles.disabledGroup]}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>DAO Moderation</Text>
          <View style={[styles.settingsCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderLight }]}>
            {renderSettingItem(
              'account-group-outline',
              'Community Moderation',
              'Vote on decisions',
              () => {},
              <MaterialCommunityIcons name="lock-outline" size={16} color={colors.textSecondary} />
            )}
            <View style={[styles.itemDivider, { backgroundColor: colors.borderLight }]} />
            {renderSettingItem(
              'bank-outline',
              'DAO Treasury',
              'Manage treasury',
              () => {},
              <MaterialCommunityIcons name="lock-outline" size={16} color={colors.textSecondary} />
            )}
            <View style={[styles.itemDivider, { backgroundColor: colors.borderLight }]} />
            {renderSettingItem(
              'chart-box-outline',
              'Governance',
              'Create proposals',
              () => {},
              <MaterialCommunityIcons name="lock-outline" size={16} color={colors.textSecondary} />
            )}
          </View>
        </View>

        {/* About & Info */}
        <View style={styles.sectionGroup}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>About</Text>
          <View style={[styles.settingsCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderLight }]}>
            {renderSettingItem(
              'book-open-page-variant-outline',
              'About Chatify',
              'Features & roadmap',
              () => navigation.navigate('About' as any)
            )}
            <View style={[styles.itemDivider, { backgroundColor: colors.borderLight }]} />
            {renderSettingItem(
              'package-variant-closed',
              'Version',
              '1.0.0',
              () => Alert.alert('Version Info', 'Chatify v1.0.0\nBlockchain-Powered Secure Messaging')
            )}
            <View style={[styles.itemDivider, { backgroundColor: colors.borderLight }]} />
            {renderSettingItem(
              'lan-connect',
              'Tech Stack',
              'React Native • Web3',
              () => Alert.alert('Tech Stack', 'React Native\nExpo\nEtherverse & Smart Contracts\nAI Sentiment Analysis')
            )}
            <View style={[styles.itemDivider, { backgroundColor: colors.borderLight }]} />
            {renderSettingItem(
              'link-variant',
              'Documentation',
              'View docs',
              () => Alert.alert('Documentation', 'See README.md for complete documentation and setup instructions')
            )}
            <View style={[styles.itemDivider, { backgroundColor: colors.borderLight }]} />
            {renderSettingItem(
              'lightbulb-outline',
              'Features',
              'Blockchain • AI • Web3',
              () => Alert.alert('Key Features', '✓ Blockchain messaging\n✓ AI sentiment analysis\n✓ Wallet authentication\n✓ Real-time updates\n✓ Modern UI/UX')
            )}
          </View>
        </View>

        {/* Account */}
        <View style={styles.sectionGroup}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Account</Text>
          <View style={[styles.settingsCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderLight }]}>
            {renderSettingItem(
              'logout',
              'Logout',
              'Sign out of your account',
              handleLogout
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Made with ❤️ for Web3
          </Text>
          <Text style={[styles.footerDate, { color: colors.textSecondary }]}>
            © 2026 Chatify
          </Text>
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
    paddingHorizontal: 16,
  },

  // Header
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 0,
  },

  // Sections
  sectionGroup: {
    marginBottom: 20,
  },
  disabledGroup: {
    opacity: 0.6,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  settingsCard: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 12,
  },
  settingIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 20,
    textAlign: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 1,
  },
  settingDescription: {
    fontSize: 12,
  },
  chevron: {
    fontSize: 18,
    marginLeft: 8,
  },
  itemDivider: {
    height: 1,
    marginHorizontal: 14,
  },
  lockIcon: {
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  divider: {
    height: 1,
  },
  disabledSection: {
    opacity: 0.6,
  },
  futureFeatureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  comingSoonLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  disabledIcon: {
    fontSize: 14,
  },

  // Footer
  footer: {
    marginTop: 28,
    paddingTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    marginBottom: 4,
  },
  footerDate: {
    fontSize: 11,
  },
});
