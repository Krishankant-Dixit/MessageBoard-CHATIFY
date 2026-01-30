// Consistent spacing system - 4px base unit (Tailwind-inspired)
export const spacing = {
  xs: 4,      // 4px - minimal gaps
  sm: 8,      // 8px - small gaps
  md: 16,     // 16px - standard padding
  lg: 24,     // 24px - large spacing
  xl: 32,     // 32px - extra large
  xxl: 48,    // 48px - double XL
};

// Border radius system - modern rounded corners
export const borderRadius = {
  none: 0,
  xs: 4,      // Subtle rounding
  sm: 8,      // Small rounded corners
  md: 12,     // Medium - cards and inputs
  lg: 16,     // Large - message bubbles
  xl: 20,     // Extra large - avatars
  full: 9999, // Fully rounded - pills and circles
};

// Shadow system - subtle, layered depth
export const shadows = {
  // Minimal shadows for clean minimalist look
  none: { shadowColor: 'transparent', shadowOpacity: 0, elevation: 0 },
  
  // Subtle elevation shadows
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  
  // Soft focused shadow for floating elements
  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
};
