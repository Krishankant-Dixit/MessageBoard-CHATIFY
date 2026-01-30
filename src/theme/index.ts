import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
export { lightTheme, darkTheme, getTheme, defaultTheme, type ThemeColors, type Theme as MaterialTheme } from './theme';

export const theme = {
  colors,
  spacing,
  typography,
  
  // Border radius
  borderRadius: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 22,
    full: 9999,
  },
  
  // Shadows
  shadow: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 10,
      elevation: 3,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 5,
    },
  },
};

export type Theme = typeof theme;
