// Modern minimalist theme with light and dark variants
// Consistent with design system (colors, spacing, typography)

export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryGradientStart: string;
  primaryGradientEnd: string;
  
  // Secondary accent
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  backgroundElevated: string;
  chatBackground: string;
  
  // Message colors
  messageReceived: string;
  messageSent: string;
  messageSentDark: string;
  
  // Card and surface colors
  card: string;
  cardHover: string;
  cardBorder: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textMuted: string;
  textOnPrimary: string;
  
  // Accent colors
  accent: string;
  accentSecondary: string;
  accentTertiary: string;
  
  // Status colors
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;
  
  // Status indicators
  online: string;
  offline: string;
  away: string;
  
  // Border colors
  border: string;
  borderLight: string;
  borderDark: string;
  divider: string;
  
  // Transparent variations
  overlay: string;
  overlayLight: string;
  glassEffect: string;
  glassBorder: string;
  
  // Gradients
  gradientPurple: string[];
  gradientCyan: string[];
  gradientPink: string[];
  gradientGreen: string[];
  gradientMain: string[];
  
  // Loading/shimmer
  shimmerBase: string;
  shimmerHighlight: string;
  
  // Input specific
  inputBackground: string;
  inputBorder: string;
  inputFocusBorder: string;
  inputPlaceholder: string;
}

export interface Theme {
  colors: ThemeColors;
  name: 'light' | 'dark';
}

/**
 * Light Theme
 * Clean, bright colors optimized for daylight viewing
 */
export const lightTheme: Theme = {
  name: 'light',
  colors: {
    // Primary colors - Softer for light mode
    primary: '#6D28D9', // Purple
    primaryDark: '#5B21B6',
    primaryLight: '#A78BFA',
    primaryGradientStart: '#6D28D9',
    primaryGradientEnd: '#EC4899',
    
    // Secondary accent
    secondary: '#0891B2', // Cyan
    secondaryDark: '#0369A1',
    secondaryLight: '#22D3EE',
    
    // Background colors - Light variants
    background: '#FFFFFF',
    backgroundSecondary: '#F3F4F6',
    backgroundTertiary: '#E5E7EB',
    backgroundElevated: '#F9FAFB',
    chatBackground: '#FAFAFA',
    
    // Message colors
    messageReceived: '#F3F4F6',
    messageSent: '#6D28D9',
    messageSentDark: '#5B21B6',
    
    // Card and surface colors
    card: '#F9FAFB',
    cardHover: '#F3F4F6',
    cardBorder: 'rgba(0, 0, 0, 0.08)',
    
    // Text colors - Dark for light mode
    text: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    textMuted: '#D1D5DB',
    textOnPrimary: '#FFFFFF',
    
    // Accent colors
    accent: '#10B981',
    accentSecondary: '#F59E0B',
    accentTertiary: '#EC4899',
    
    // Status colors - Light variants
    success: '#10B981',
    successLight: '#6EE7B7',
    warning: '#F59E0B',
    warningLight: '#FBBF24',
    error: '#EF4444',
    errorLight: '#FECACA',
    info: '#3B82F6',
    infoLight: '#93C5FD',
    
    // Status indicators
    online: '#10B981',
    offline: '#9CA3AF',
    away: '#F59E0B',
    
    // Border colors - Light variants
    border: 'rgba(0, 0, 0, 0.1)',
    borderLight: 'rgba(0, 0, 0, 0.06)',
    borderDark: 'rgba(0, 0, 0, 0.12)',
    divider: 'rgba(0, 0, 0, 0.08)',
    
    // Transparent variations
    overlay: 'rgba(0, 0, 0, 0.6)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    glassEffect: 'rgba(249, 250, 251, 0.9)',
    glassBorder: 'rgba(0, 0, 0, 0.1)',
    
    // Gradients
    gradientPurple: ['#6D28D9', '#A78BFA'],
    gradientCyan: ['#0891B2', '#22D3EE'],
    gradientPink: ['#EC4899', '#F472B6'],
    gradientGreen: ['#10B981', '#34D399'],
    gradientMain: ['#6D28D9', '#0891B2'],
    
    // Shimmer and loading
    shimmerBase: '#E5E7EB',
    shimmerHighlight: '#F3F4F6',
    
    // Input specific
    inputBackground: '#F3F4F6',
    inputBorder: 'rgba(0, 0, 0, 0.1)',
    inputFocusBorder: '#6D28D9',
    inputPlaceholder: '#9CA3AF',
  },
};

/**
 * Dark Theme
 * Modern minimalist dark colors optimized for OLED screens and low-light viewing
 */
export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    // Primary colors - Vibrant for dark mode
    primary: '#7C3AED', // Purple
    primaryDark: '#6D28D9',
    primaryLight: '#A78BFA',
    primaryGradientStart: '#7C3AED',
    primaryGradientEnd: '#EC4899',
    
    // Secondary accent
    secondary: '#06B6D4', // Cyan
    secondaryDark: '#0891B2',
    secondaryLight: '#22D3EE',
    
    // Background colors - Deep dark variants
    background: '#0F0F0F', // Deeper black for OLED
    backgroundSecondary: '#1A1A1A',
    backgroundTertiary: '#252525',
    backgroundElevated: '#2A2A2A',
    chatBackground: '#0A0A0A',
    
    // Message colors
    messageReceived: '#1E293B', // Slate
    messageSent: '#7C3AED',
    messageSentDark: '#6D28D9',
    
    // Card and surface colors
    card: '#1F1F1F',
    cardHover: '#2A2A2A',
    cardBorder: 'rgba(255, 255, 255, 0.05)',
    
    // Text colors - Light for dark mode
    text: '#FFFFFF',
    textSecondary: '#A1A1AA', // Zinc-400
    textTertiary: '#71717A', // Zinc-500
    textMuted: '#52525B', // Zinc-600
    textOnPrimary: '#FFFFFF',
    
    // Accent colors
    accent: '#10B981',
    accentSecondary: '#F59E0B',
    accentTertiary: '#EC4899',
    
    // Status colors - Dark variants
    success: '#22C55E',
    successLight: '#4ADE80',
    warning: '#F59E0B',
    warningLight: '#FBBF24',
    error: '#EF4444',
    errorLight: '#F87171',
    info: '#3B82F6',
    infoLight: '#60A5FA',
    
    // Status indicators
    online: '#22C55E',
    offline: '#71717A',
    away: '#F59E0B',
    
    // Border colors - Subtle for dark mode
    border: 'rgba(255, 255, 255, 0.08)',
    borderLight: 'rgba(255, 255, 255, 0.12)',
    borderDark: 'rgba(255, 255, 255, 0.04)',
    divider: 'rgba(255, 255, 255, 0.06)',
    
    // Transparent variations
    overlay: 'rgba(0, 0, 0, 0.85)',
    overlayLight: 'rgba(0, 0, 0, 0.6)',
    glassEffect: 'rgba(31, 31, 31, 0.8)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    
    // Gradients
    gradientPurple: ['#7C3AED', '#A78BFA'],
    gradientCyan: ['#06B6D4', '#22D3EE'],
    gradientPink: ['#EC4899', '#F472B6'],
    gradientGreen: ['#10B981', '#34D399'],
    gradientMain: ['#7C3AED', '#06B6D4'],
    
    // Shimmer and loading
    shimmerBase: '#1A1A1A',
    shimmerHighlight: '#2A2A2A',
    
    // Input specific
    inputBackground: '#1A1A1A',
    inputBorder: 'rgba(255, 255, 255, 0.1)',
    inputFocusBorder: '#7C3AED',
    inputPlaceholder: '#71717A',
  },
};

/**
 * Get theme by name
 */
export const getTheme = (themeName: 'light' | 'dark' = 'dark'): Theme => {
  return themeName === 'light' ? lightTheme : darkTheme;
};

/**
 * Default theme (Dark)
 */
export const defaultTheme = darkTheme;
