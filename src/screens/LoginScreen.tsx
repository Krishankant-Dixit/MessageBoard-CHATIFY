import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Button, Input, Card, BackButton } from '../components';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import { IS_WEB } from '../utils/constants';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { loginWithEmail, loginWithWallet } = useAuth();
  const { connectWallet, account } = useWeb3();
  const [loginMethod, setLoginMethod] = useState<'email' | 'wallet' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await loginWithEmail(email, password);
      // Navigation is handled by App.tsx based on auth state
    } catch (error) {
      console.error('Email login error:', error);
      let errorMessage = 'Failed to login. Please try again.';
      if (IS_WEB) {
        errorMessage = 'In demo mode, wallet connection is available.';
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletLogin = async () => {
    setLoading(true);
    try {
      const walletAddress = await connectWallet();
      await loginWithWallet(walletAddress);
    } catch (error) {
      console.error('Wallet connection error:', error);
      
      let errorMessage = 'Failed to connect wallet. Please try again.';
      if (IS_WEB) {
        errorMessage = 'Demo wallet connected. You may proceed.';
        // Still proceed with demo wallet
        try {
          await loginWithWallet('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
        } catch (loginError) {
          console.error('Wallet login error:', loginError);
          Alert.alert('Error', 'Failed to login with wallet.');
        }
        setLoading(false);
        return;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!loginMethod) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView
          contentContainerStyle={styles.welcomeScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentWrapper}>
            <Text style={styles.title}>Company Message Board</Text>
            <Text style={styles.subtitle}>
              Secure, blockchain-powered communication for your team
            </Text>

            <View style={styles.featureContainer}>
              <View style={styles.feature}>
                <MaterialCommunityIcons name="lock-outline" size={22} color={theme.colors.primary} />
                <Text style={styles.featureText}>Encrypted</Text>
              </View>
              <View style={styles.feature}>
                <MaterialCommunityIcons name="office-building" size={22} color={theme.colors.primary} />
                <Text style={styles.featureText}>Company-Wide</Text>
              </View>
              <View style={styles.feature}>
                <MaterialCommunityIcons name="lan-connect" size={22} color={theme.colors.primary} />
                <Text style={styles.featureText}>Blockchain</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.bottomSection, { paddingBottom: insets.bottom || theme.spacing.xl }]}>
          <Text style={styles.methodTitle}>Choose Login Method</Text>

          <Button
            title="Login with Email"
            onPress={() => setLoginMethod('email')}
            size="large"
            style={styles.methodButton}
            fullWidth
          />

          <Button
            title="Connect Wallet"
            onPress={() => setLoginMethod('wallet')}
            variant="secondary"
            size="large"
            style={styles.methodButton}
            fullWidth
          />

          <Text style={styles.infoText}>
            New here? Your account will be created automatically on first login.
          </Text>
        </View>
      </View>
    );
  }

  if (loginMethod === 'email') {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.emailHeader}>
          <BackButton onPress={() => setLoginMethod(null)} />
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.formTitle}>Email Login</Text>
          <Text style={styles.formSubtitle}>
            Enter your credentials to access your account
          </Text>

          <Card style={styles.formCard}>
            <Input
              label="Email"
              placeholder="your.email@company.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              containerStyle={styles.inputContainer}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              containerStyle={styles.inputContainer}
            />

            <Button
              title="Login"
              onPress={handleEmailLogin}
              loading={loading}
              size="large"
              style={styles.loginButton}
              fullWidth
            />
          </Card>

          <Text style={styles.securityNote}>
            🔐 Your credentials are encrypted and secure
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.walletHeader}>
        <BackButton onPress={() => setLoginMethod(null)} />
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.walletScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.formTitle}>Wallet Login</Text>
        <Text style={styles.formSubtitle}>
          Connect your blockchain wallet to get started
        </Text>

        <Card style={styles.walletCard}>
          <MaterialCommunityIcons name="wallet-outline" size={64} color={theme.colors.primary} />
          <Text style={styles.walletText}>
            Click the button below to connect your Web3 wallet
          </Text>

          <Button
            title="Connect Wallet"
            onPress={handleWalletLogin}
            loading={loading}
            size="large"
            style={styles.connectButton}
            fullWidth
          />
        </Card>

        <Text style={styles.walletInfo}>
          Supported wallets: MetaMask, Trust Wallet, WalletConnect
        </Text>

        <Text style={styles.securityNote}>
          🔐 Your wallet connection is secure and encrypted
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  emailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  headerSpacer: {
    flex: 1,
  },
  welcomeScrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    justifyContent: 'center',
  },
  contentWrapper: {
    alignItems: 'center',
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  walletScrollContent: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  bottomSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.typography.fontSize.display,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
  },
  featureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: theme.spacing.xl,
  },
  feature: {
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 36,
    marginBottom: theme.spacing.sm,
  },
  featureText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.xs,
  },
  methodTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  methodButton: {
    width: '100%',
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  formTitle: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  formSubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  formCard: {
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  loginButton: {
    marginTop: theme.spacing.md,
  },
  walletCard: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  walletIcon: {
    fontSize: 72,
    marginBottom: theme.spacing.lg,
  },
  walletText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  connectButton: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  walletInfo: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  securityNote: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
});
