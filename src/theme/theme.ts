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
    primary: '#2AABEE',
    primaryDark: '#229ED9',
    primaryLight: '#6EC6FF',
    primaryGradientStart: '#2AABEE',
    primaryGradientEnd: '#25D366',
    
    // Secondary accent
    secondary: '#25D366',
    secondaryDark: '#1DA851',
    secondaryLight: '#62E891',
    
    // Background colors - Light variants
    background: '#F5F7F9',
    backgroundSecondary: '#EEF2F5',
    backgroundTertiary: '#E2E8ED',
    backgroundElevated: '#FFFFFF',
    chatBackground: '#F7F9FB',
    
    // Message colors
    messageReceived: '#EEF2F5',
    messageSent: '#2AABEE',
    messageSentDark: '#229ED9',
    
    // Card and surface colors
    card: '#FFFFFF',
    cardHover: '#F2F6F9',
    cardBorder: 'rgba(0, 0, 0, 0.06)',
    
    // Text colors - Dark for light mode
    text: '#0B141A',
    textSecondary: '#4B5A65',
    textTertiary: '#6B7A86',
    textMuted: '#9AA6AF',
    textOnPrimary: '#FFFFFF',
    
    // Accent colors
    accent: '#25D366',
    accentSecondary: '#2AABEE',
    accentTertiary: '#F59E0B',
    
    // Status colors - Light variants
    success: '#10B981',
    successLight: '#6EE7B7',
    warning: '#F59E0B',
    warningLight: '#FBBF24',
    error: '#EF4444',
    errorLight: '#FECACA',
    info: '#2AABEE',
    infoLight: '#6EC6FF',
    
    // Status indicators
    online: '#10B981',
    offline: '#9CA3AF',
    away: '#F59E0B',
    
    // Border colors - Light variants
    border: 'rgba(0, 0, 0, 0.08)',
    borderLight: 'rgba(0, 0, 0, 0.05)',
    borderDark: 'rgba(0, 0, 0, 0.12)',
    divider: 'rgba(0, 0, 0, 0.06)',
    
    // Transparent variations
    overlay: 'rgba(0, 0, 0, 0.55)',
    overlayLight: 'rgba(0, 0, 0, 0.25)',
    glassEffect: 'rgba(255, 255, 255, 0.9)',
    glassBorder: 'rgba(0, 0, 0, 0.08)',
    
    // Gradients
    gradientPurple: ['#2AABEE', '#6EC6FF'],
    gradientCyan: ['#2AABEE', '#6EC6FF'],
    gradientPink: ['#F59E0B', '#FBBF24'],
    gradientGreen: ['#25D366', '#62E891'],
    gradientMain: ['#2AABEE', '#25D366'],
    
    // Shimmer and loading
    shimmerBase: '#E6EDF2',
    shimmerHighlight: '#F2F6F9',
    
    // Input specific
    inputBackground: '#EEF2F5',
    inputBorder: 'rgba(0, 0, 0, 0.08)',
    inputFocusBorder: '#2AABEE',
    inputPlaceholder: '#7E8A94',
  },
};

/**
 * Dark Theme
 * Modern minimalist dark colors optimized for OLED screens and low-light viewing
 * Refined for better contrast and consistency with modern chat apps
 */
export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    // Primary colors - Vibrant for dark mode
    primary: '#2AABEE',
    primaryDark: '#229ED9',
    primaryLight: '#6EC6FF',
    primaryGradientStart: '#2AABEE',
    primaryGradientEnd: '#25D366',
    
    // Secondary accent
    secondary: '#25D366',
    secondaryDark: '#1DA851',
    secondaryLight: '#62E891',
    
    // Background colors - Deep dark variants optimized for OLED
    background: '#0B141A',
    backgroundSecondary: '#1A232B',
    backgroundTertiary: '#242F38',
    backgroundElevated: '#2C3A43',
    chatBackground: '#0B141A',
    
    // Message colors - Improved contrast
    messageReceived: '#1A232B',
    messageSent: '#2B5A95',
    messageSentDark: '#1F3F6B',
    
    // Card and surface colors
    card: '#1A232B',
    cardHover: '#242F38',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    
    // Text colors - Enhanced contrast for dark mode
    text: '#FFFFFF',
    textSecondary: '#B0B8C1',
    textTertiary: '#8A9299',
    textMuted: '#6A7278',
    textOnPrimary: '#FFFFFF',
    
    // Accent colors
    accent: '#25D366',
    accentSecondary: '#2AABEE',
    accentTertiary: '#FFB740',
    
    // Status colors - Refined for dark mode
    success: '#31A24C',
    successLight: '#52D273',
    warning: '#FFB740',
    warningLight: '#FFC966',
    error: '#FF4444',
    errorLight: '#FF6B6B',
    info: '#2AABEE',
    infoLight: '#6EC6FF',
    
    // Status indicators
    online: '#31A24C',
    offline: '#8A9299',
    away: '#FFB740',
    
    // Border colors - Subtle for dark mode
    border: 'rgba(255, 255, 255, 0.1)',
    borderLight: 'rgba(255, 255, 255, 0.15)',
    borderDark: 'rgba(255, 255, 255, 0.06)',
    divider: 'rgba(255, 255, 255, 0.08)',
    
    // Transparent variations
    overlay: 'rgba(0, 0, 0, 0.85)',
    overlayLight: 'rgba(0, 0, 0, 0.6)',
    glassEffect: 'rgba(26, 35, 43, 0.85)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    
    // Gradients
    gradientPurple: ['#2AABEE', '#6EC6FF'],
    gradientCyan: ['#2AABEE', '#6EC6FF'],
    gradientPink: ['#FFB740', '#FFC966'],
    gradientGreen: ['#25D366', '#52D273'],
    gradientMain: ['#2AABEE', '#25D366'],
    
    // Shimmer and loading
    shimmerBase: '#1A232B',
    shimmerHighlight: '#242F38',
    
    // Input specific - Improved contrast
    inputBackground: '#1A232B',
    inputBorder: 'rgba(255, 255, 255, 0.15)',
    inputFocusBorder: '#2AABEE',
    inputPlaceholder: '#8A9299',
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
