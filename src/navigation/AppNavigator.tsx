import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  HomeScreen,
  PostMessageScreen, 
  LoginScreen, 
  ChatRoomScreen, 
  ProfileScreen,
  SettingsScreen,
  AboutScreen,
} from '../screens';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Tab navigation types
export type TabParamList = {
  Chats: undefined;
  NewMessage: undefined;
  Profile: undefined;
  Settings: undefined;
};

// Stack navigation types
export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  ChatRoom: { roomId: string; roomName: string };
  About: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Bottom Tabs Navigator
const MainTabs: React.FC = () => {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: Math.max(insets.bottom, 6),
          paddingTop: 6,
          height: 56 + insets.bottom,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Chats"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Chats',
          tabBarIcon: ({ color, size, focused }) => (
            <Text style={{ fontSize: focused ? 26 : 24 }}>💬</Text>
          ),
        }}
      />
      <Tab.Screen
        name="NewMessage"
        component={PostMessageScreen}
        options={{
          tabBarLabel: 'New Message',
          tabBarIcon: ({ color, size, focused }) => (
            <Text style={{ fontSize: focused ? 26 : 24 }}>✏️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Text style={{ fontSize: focused ? 26 : 24 }}>👤</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <Text style={{ fontSize: focused ? 26 : 24 }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors, isDarkMode } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: isDarkMode,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.card,
          text: colors.text,
          border: colors.border,
          notification: colors.error,
        },
        fonts: {
          regular: {
            fontFamily: 'System',
            fontWeight: '400',
          },
          medium: {
            fontFamily: 'System',
            fontWeight: '500',
          },
          bold: {
            fontFamily: 'System',
            fontWeight: '700',
          },
          heavy: {
            fontFamily: 'System',
            fontWeight: '900',
          },
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
