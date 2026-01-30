import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'glass' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  variant = 'default',
  padding = 'medium' 
}) => {
  const cardStyles = [
    styles.card,
    styles[variant],
    styles[`padding_${padding}`],
    style,
  ];

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  
  // Variants
  default: {
    backgroundColor: theme.colors.card,
  },
  elevated: {
    backgroundColor: theme.colors.backgroundElevated,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  glass: {
    backgroundColor: theme.colors.glassEffect,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  // Padding variants
  padding_none: {
    padding: 0,
  },
  padding_small: {
    padding: theme.spacing.sm,
  },
  padding_medium: {
    padding: theme.spacing.md,
  },
  padding_large: {
    padding: theme.spacing.lg,
  },
});
