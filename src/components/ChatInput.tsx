import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Text,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme';

interface ChatInputProps {
  /**
   * Current input value
   */
  value: string;
  /**
   * Callback when text changes
   */
  onChangeText: (text: string) => void;
  /**
   * Callback when send button is pressed
   */
  onSend: () => void;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Whether input is disabled
   */
  disabled?: boolean;
  /**
   * Maximum character length
   */
  maxLength?: number;
  /**
   * Show character counter
   */
  showCharCounter?: boolean;
  /**
   * Custom container style
   */
  containerStyle?: ViewStyle;
  /**
   * Custom input style
   */
  inputStyle?: ViewStyle;
  /**
   * Whether to show keyboard avoiding view
   */
  useKeyboardAvoidingView?: boolean;
  /**
   * Callback when focus changes
   */
  onFocusChange?: (focused: boolean) => void;
  /**
   * Additional action button (e.g., emoji, attachment)
   */
  actionButton?: {
    icon: string;
    onPress: () => void;
  };
}

/**
 * ChatInput Component
 * Google Chat-like minimal input with send button
 * Supports keyboard avoiding, character counter, and custom actions
 */
export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChangeText,
  onSend,
  placeholder = 'Message...',
  disabled = false,
  maxLength = 1000,
  showCharCounter = false,
  containerStyle,
  inputStyle,
  useKeyboardAvoidingView = true,
  onFocusChange,
  actionButton,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleFocus = () => {
    setIsFocused(true);
    onFocusChange?.(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    onFocusChange?.(false);
  };

  const handleSend = () => {
    if (!disabled && value.trim().length > 0) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      onSend();
    }
  };

  const charCount = value.length;
  const isLimitWarning = charCount > maxLength * 0.8;
  const isSendDisabled = disabled || value.trim().length === 0;

  const inputElement = (
    <View style={[styles.container, containerStyle]}>
      {/* Input Row */}
      <View style={[styles.inputRow, isFocused && styles.inputRowFocused]}>
        {/* Action Button */}
        {actionButton && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={actionButton.onPress}
            disabled={disabled}
          >
            <MaterialCommunityIcons
              name={actionButton.icon}
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}

        {/* Text Input */}
        <TextInput
          style={[
            styles.input,
            isFocused && styles.inputFocused,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          maxLength={maxLength}
          editable={!disabled}
          scrollEnabled={Platform.OS === 'android'}
          textAlignVertical="center"
        />

        {/* Send Button */}
        <Animated.View
          style={[
            styles.sendButtonContainer,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.sendButton,
              isSendDisabled && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={isSendDisabled}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="send"
              size={18}
              color={theme.colors.textOnPrimary}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Character Counter */}
      {showCharCounter && maxLength && (
        <View style={styles.counterContainer}>
          <Text
            style={[
              styles.counter,
              isLimitWarning && styles.counterWarning,
              charCount === maxLength && styles.counterError,
            ]}
          >
            {charCount}/{maxLength}
          </Text>
        </View>
      )}
    </View>
  );

  if (useKeyboardAvoidingView) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={styles.keyboardAvoidingView}
      >
        {inputElement}
      </KeyboardAvoidingView>
    );
  }

  return inputElement;
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    width: '100%',
  },
  container: {
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 44,
  },
  inputRowFocused: {
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
  },
  actionButton: {
    padding: theme.spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonIcon: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '400',
    maxHeight: 100,
    paddingVertical: theme.spacing.sm,
  },
  inputFocused: {
    color: theme.colors.text,
  },
  sendButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.xs,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.border,
    opacity: 0.5,
  },
  sendIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  counterContainer: {
    paddingTop: theme.spacing.xs,
    paddingRight: theme.spacing.md,
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  counter: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '400',
  },
  counterWarning: {
    color: theme.colors.warning,
  },
  counterError: {
    color: theme.colors.error,
  },
});
