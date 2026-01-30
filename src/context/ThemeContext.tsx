import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, type ThemeColors } from '../theme/theme';
import { theme } from '../theme';

/**
 * Theme Context for managing light/dark theme
 * Persists theme preference using AsyncStorage
 * Provides consistent colors and design system across the app
 */

interface ThemeContextType {
  colors: ThemeColors;
  isDarkMode: boolean;
  toggleTheme: () => Promise<void>;
  setTheme: (themeName: 'light' | 'dark') => Promise<void>;
  isLoading: boolean;
  typography: typeof theme.typography;
  spacing: typeof theme.spacing;
  borderRadius: typeof theme.borderRadius;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: 'light' | 'dark';
}

const THEME_STORAGE_KEY = '@theme_preference';

/**
 * Theme Provider Component
 * Manages theme state and persistence
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  initialTheme = 'dark' 
}) => {
  const [colors, setColors] = useState<ThemeColors>(
    initialTheme === 'light' ? lightTheme.colors : darkTheme.colors
  );
  const [isDarkMode, setIsDarkMode] = useState(initialTheme === 'dark');
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load saved theme preference from AsyncStorage
   */
  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        const themeName = savedTheme as 'light' | 'dark';
        setColors(themeName === 'light' ? lightTheme.colors : darkTheme.colors);
        setIsDarkMode(themeName === 'dark');
        console.log(`✓ Theme loaded: ${themeName}`);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
      // Use default dark theme on error
      setColors(darkTheme.colors);
      setIsDarkMode(true);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Toggle between light and dark theme
   */
  const toggleTheme = async () => {
    try {
      const newThemeName: 'light' | 'dark' = isDarkMode ? 'light' : 'dark';
      const newColors = newThemeName === 'light' ? lightTheme.colors : darkTheme.colors;
      
      setColors(newColors);
      setIsDarkMode(newThemeName === 'dark');
      
      // Persist preference
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newThemeName);
      console.log(`✓ Theme toggled to: ${newThemeName}`);
    } catch (error) {
      console.error('Error toggling theme:', error);
    }
  };

  /**
   * Set theme to a specific value
   */
  const setTheme = async (themeName: 'light' | 'dark') => {
    try {
      const newColors = themeName === 'light' ? lightTheme.colors : darkTheme.colors;
      
      setColors(newColors);
      setIsDarkMode(themeName === 'dark');
      
      // Persist preference
      await AsyncStorage.setItem(THEME_STORAGE_KEY, themeName);
      console.log(`✓ Theme set to: ${themeName}`);
    } catch (error) {
      console.error('Error setting theme:', error);
    }
  };

  const value: ThemeContextType = {
    colors,
    isDarkMode,
    toggleTheme,
    setTheme,
    isLoading,
    typography: theme.typography,
    spacing: theme.spacing,
    borderRadius: theme.borderRadius,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
