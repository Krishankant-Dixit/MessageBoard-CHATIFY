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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components';
import { DEMO_MODE } from '../utils/constants';

type SettingsScreenNavigationProp = NativeStackNavigationProp<any, 'Settings'>;

interface SettingsScreenProps {
  navigation: SettingsScreenNavigationProp;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors, spacing, isDarkMode, toggleTheme } = useTheme();
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [demoModeEnabled, setDemoModeEnabled] = useState(DEMO_MODE);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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

  const renderSettingItem = (
    icon: string,
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
        <Text style={styles.settingIcon}>{icon}</Text>
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
        <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
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
          <Text style={[styles.title, { color: colors.text }]}>
            Settings
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Manage your app preferences
          </Text>
        </View>

        {/* Appearance */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Appearance
          </Text>
          
          {renderSettingItem(
            '🌙',
            'Dark Mode',
            isDarkMode ? 'Currently using dark theme' : 'Currently using light theme',
            handleThemeToggle,
            <Switch
              value={isDarkMode}
              onValueChange={handleThemeToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isDarkMode ? colors.primary : colors.backgroundTertiary}
            />
          )}
        </Card>

        {/* Demo Mode */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Development
          </Text>
          
          {renderSettingItem(
            '🎭',
            'Demo Mode',
            'Use mock wallet & blockchain data',
            handleDemoModeToggle,
            <Switch
              value={demoModeEnabled}
              onValueChange={handleDemoModeToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={demoModeEnabled ? colors.primary : colors.backgroundTertiary}
            />
          )}
        </Card>

        {/* Notifications */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Notifications
          </Text>
          
          {renderSettingItem(
            '🔔',
            'Enable Notifications',
            'Receive push notifications for new messages',
            handleNotificationsToggle,
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={notificationsEnabled ? colors.primary : colors.backgroundTertiary}
            />
          )}
        </Card>

        {/* Storage */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Storage
          </Text>
          
          {renderSettingItem(
            '🗑️',
            'Clear Cache',
            'Remove locally stored data',
            handleClearCache,
            isClearingCache ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : undefined
          )}
        </Card>

        {/* About Project */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            About Project
          </Text>
          
          {renderSettingItem(
            '🏗️',
            'Chatify',
            'Decentralized blockchain chat',
            () => {}
          )}

          <View style={[styles.divider, { backgroundColor: colors.borderDark }]} />

          {renderSettingItem(
            '📦',
            'Version',
            '1.0.0',
            () => Alert.alert('Version Info', 'Chatify v1.0.0\nBlockchain-Powered Secure Messaging')
          )}

          <View style={[styles.divider, { backgroundColor: colors.borderDark }]} />

          {renderSettingItem(
            '⛓️',
            'Technology Stack',
            'React Native • Ethereum • Web3',
            () => Alert.alert('Tech Stack', 'React Native\nExpo\nEtherverse & Smart Contracts\nAI Sentiment Analysis')
          )}

          <View style={[styles.divider, { backgroundColor: colors.borderDark }]} />

          {renderSettingItem(
            '🔗',
            'Documentation',
            'View project documentation',
            () => Alert.alert('Documentation', 'See README.md for complete documentation and setup instructions')
          )}

          <View style={[styles.divider, { backgroundColor: colors.borderDark }]} />

          {renderSettingItem(
            '💡',
            'Features',
            'Message sentiment • Safety analysis • Wallet integration',
            () => Alert.alert('Key Features', '✓ Blockchain messaging\n✓ AI sentiment analysis\n✓ Wallet authentication\n✓ Real-time updates\n✓ Modern UI/UX')
          )}
        </Card>

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
    paddingHorizontal: 24,
  },

  // Header
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
  },
  chevron: {
    fontSize: 24,
    marginLeft: 8,
  },
  divider: {
    height: 1,
  },

  // Footer
  footer: {
    marginTop: 48,
    paddingTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    marginBottom: 4,
  },
  footerDate: {
    fontSize: 12,
  },
});
