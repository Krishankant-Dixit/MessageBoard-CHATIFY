// Modern typography system - Clean, minimalist design
// Inspired by modern chat apps with soft, readable hierarchy
const fontSize = {
  xs: 11,      // Captions
  sm: 13,      // Small text, secondary info
  base: 15,    // Body text, standard reading
  md: 16,      // Alternative body
  lg: 18,      // Larger body, emphasized
  xl: 22,      // Subheadings
  xxl: 28,     // Headings
  xxxl: 34,    // Large headings
  display: 42, // Display/hero text
};

// Modern system font family stack
const fontFamily = {
  // Primary font family - native system fonts
  sans: 'System' as const,
  
  // System fonts provide best native feel and performance
  system: {
    ios: 'SF Pro Display',
    android: 'Roboto',
    default: 'System',
  },
  
  // Monospace for code/addresses
  mono: {
    ios: 'Menlo',
    android: 'Roboto Mono',
    default: 'monospace',
  },
};

export const typography = {
  // Font family
  fontFamily,
  
  // Font sizes
  fontSize,
  sizes: fontSize,
  
  // Font weights - Modern hierarchy
  fontWeight: {
    light: '300' as const,       // Subtle, secondary text
    regular: '400' as const,     // Body text
    medium: '500' as const,      // Emphasized body
    semibold: '600' as const,    // Section headers
    bold: '700' as const,        // Main headings
    extrabold: '800' as const,   // Display text
  },
  
  // Line heights - Optimized for readability with soft feel
  lineHeight: {
    tight: 1.2,      // Headings
    snug: 1.375,     // Subheadings
    normal: 1.5,     // Body text (default)
    relaxed: 1.625,  // Long-form content
    loose: 1.75,     // Accessibility mode
  },
  
  // Letter spacing - Subtle adjustments for modern look
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
  },
  
  // Text styles presets - Minimalist & clean
  presets: {
    displayLarge: {
      fontSize: 42,
      fontWeight: '800' as const,
      lineHeight: 1.2,
      letterSpacing: -0.5,
    },
    displayMedium: {
      fontSize: 34,
      fontWeight: '700' as const,
      lineHeight: 1.2,
      letterSpacing: -0.25,
    },
    headlineLarge: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 1.3,
    },
    headlineMedium: {
      fontSize: 22,
      fontWeight: '600' as const,
      lineHeight: 1.3,
    },
    titleLarge: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 1.4,
    },
    titleMedium: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 1.4,
    },
    // Body text - Clean and readable
    bodyLarge: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },
    bodyMedium: {
      fontSize: 15,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },
    bodySmall: {
      fontSize: 13,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },
    // Labels - Soft emphasis
    labelLarge: {
      fontSize: 15,
      fontWeight: '500' as const,
      lineHeight: 1.4,
    },
    labelMedium: {
      fontSize: 13,
      fontWeight: '500' as const,
      lineHeight: 1.4,
    },
    labelSmall: {
      fontSize: 11,
      fontWeight: '500' as const,
      lineHeight: 1.4,
    },
  },
  
  // Spacing helpers for text elements
  spacing: {
    paragraph: 16,
    section: 24,
    headingTop: 24,
    headingBottom: 12,
    listItem: 8,
  },
  
  // Text utilities
  utils: {
    truncate: {
      numberOfLines: 1,
      ellipsizeMode: 'tail' as const,
    },
    
    truncateMultiline: (lines: number) => ({
      numberOfLines: lines,
      ellipsizeMode: 'tail' as const,
    }),
  },
};

// Helper function to get font style
export const getFontStyle = (
  size: keyof typeof fontSize,
  weight?: keyof typeof typography.fontWeight,
  lineHeight?: keyof typeof typography.lineHeight
) => ({
  fontSize: fontSize[size],
  ...(weight && { fontWeight: typography.fontWeight[weight] }),
  ...(lineHeight && { lineHeight: typography.lineHeight[lineHeight] }),
});

// Helper for responsive text scaling
export const scaleFont = (size: number, scaleFactor: number = 1) => {
  return Math.round(size * scaleFactor);
};
