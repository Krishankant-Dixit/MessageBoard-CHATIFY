import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Animated,
} from 'react-native';
import { theme } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  icon?: string;
  variant?: 'default' | 'filled' | 'outlined';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  icon,
  variant = 'default',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <TextInput
          style={[
            styles.input,
            styles[variant],
            error && styles.inputError,
            isFocused && styles.inputFocused,
            icon && styles.inputWithIcon,
            style,
          ]}
          placeholderTextColor={theme.colors.inputPlaceholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.xs,
    marginBottom: theme.spacing.sm,
    fontWeight: theme.typography.fontWeight.medium,
    letterSpacing: theme.typography.letterSpacing.normal,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    left: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    zIndex: 1,
  },
  input: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '400',
    minHeight: 48,
  },
  default: {
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
  },
  filled: {
    backgroundColor: theme.colors.backgroundTertiary,
    borderWidth: 0,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  inputWithIcon: {
    paddingLeft: theme.spacing.xl + theme.spacing.md,
  },
  inputFocused: {
    borderColor: theme.colors.inputFocusBorder,
    borderWidth: 2,
  },
  inputError: {
    borderColor: theme.colors.error,
    borderWidth: 2,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.xs,
    marginTop: theme.spacing.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
