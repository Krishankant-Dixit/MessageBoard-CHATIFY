import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { ProfileAvatar } from './ProfileAvatar';

interface AppHeaderProps {
  /**
   * Header title
   */
  title: string;
  /**
   * Optional subtitle
   */
  subtitle?: string;
  /**
   * Show avatar
   */
  showAvatar?: boolean;
  /**
   * Show settings icon
   */
  showSettings?: boolean;
  /**
   * Settings button callback
   */
  onSettingsPress?: () => void;
  /**
   * Avatar press callback (overrides default ProfileAvatar behavior)
   */
  onAvatarPress?: () => void;
  /**
   * Custom left component
   */
  leftComponent?: React.ReactNode;
  /**
   * Custom right component
   */
  rightComponent?: React.ReactNode;
  /**
   * Custom styles
   */
  style?: ViewStyle;
  /**
   * Whether to show shadow
   */
  showShadow?: boolean;
  /**
   * Header variant
   */
  variant?: 'default' | 'minimal' | 'prominent';
}

/**
 * AppHeader Component
 * Reusable header with avatar, title, settings icon
 * Responsive to theme changes with subtle shadow
 */
export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showAvatar = true,
  showSettings = false,
  onSettingsPress,
  onAvatarPress,
  leftComponent,
  rightComponent,
  style,
  showShadow = true,
  variant = 'default',
}) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const renderSettings = () => {
    if (!showSettings) return null;

    return (
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={onSettingsPress}
        activeOpacity={0.7}
      >
        <Text style={styles.settingsIcon}>⚙️</Text>
      </TouchableOpacity>
    );
  };

  const renderAvatar = () => {
    if (!showAvatar) return null;

    if (onAvatarPress) {
      return (
        <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.7}>
          <ProfileAvatar />
        </TouchableOpacity>
      );
    }

    return <ProfileAvatar onSettings={onSettingsPress} />;
  };

  return (
    <View
      style={[
        styles.container,
        variant === 'minimal' && styles.containerMinimal,
        variant === 'prominent' && styles.containerProminent,
        showShadow && styles.containerShadow,
        { paddingTop: insets.top || theme.spacing.md },
        { backgroundColor: colors.card },
        { borderBottomColor: colors.border },
        style,
      ]}
    >
      {/* Left Section */}
      <View style={styles.leftSection}>
        {leftComponent || (
          <View style={styles.titleContainer}>
            <Text
              style={[
                styles.title,
                variant === 'prominent' && styles.titleProminent,
                { color: colors.text },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={[
                  styles.subtitle,
                  { color: colors.textSecondary },
                ]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Right Section */}
      <View style={styles.rightSection}>
        {rightComponent || (
          <>
            {showSettings && renderSettings()}
            {showAvatar && renderAvatar()}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
  },
  containerMinimal: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 0,
  },
  containerProminent: {
    paddingBottom: theme.spacing.lg,
  },
  containerShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  
  // Left Section
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
  titleProminent: {
    fontSize: theme.typography.fontSize.xxl,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    marginTop: 2,
  },
  
  // Right Section
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.backgroundTertiary,
  },
  settingsIcon: {
    fontSize: 20,
  },
});
