import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { theme } from '../theme';
import { BackButton } from '../components';

type AboutScreenNavigationProp = NativeStackNavigationProp<any, 'About'>;

interface AboutScreenProps {
  navigation: AboutScreenNavigationProp;
}

interface FeaturePoint {
  icon: string;
  title: string;
  description: string;
}

/**
 * AboutScreen Component
 * Explains core features: on-chain immutability, AI moderation, and roadmap
 */
export const AboutScreen: React.FC<AboutScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const immutabilityPoints: FeaturePoint[] = [
    {
      icon: '⛓️',
      title: 'Permanent Record',
      description: 'Every message is written to the blockchain and cannot be deleted or altered after posting.',
    },
    {
      icon: '🔐',
      title: 'Cryptographic Proof',
      description: 'Each message includes a unique hash that proves its authenticity and creation time.',
    },
    {
      icon: '👀',
      title: 'Full Transparency',
      description: 'Anyone can verify the message history and trace the complete conversation thread.',
    },
    {
      icon: '⏱️',
      title: 'Timestamped',
      description: 'All messages are permanently timestamped, creating an immutable audit trail.',
    },
  ];

  const aiModerationPoints: FeaturePoint[] = [
    {
      icon: '🤖',
      title: 'Smart Content Filtering',
      description: 'AI analyzes messages for harmful content and flags them automatically.',
    },
    {
      icon: '💭',
      title: 'Sentiment Analysis',
      description: 'Messages are analyzed for positive, neutral, or negative tone to understand context.',
    },
    {
      icon: '⚠️',
      title: 'Safety Recommendations',
      description: 'Get real-time suggestions if a message might need revision before posting.',
    },
    {
      icon: '📊',
      title: 'Conversation Insights',
      description: 'AI summarizes discussions and extracts key topics from conversations.',
    },
  ];

  const roadmapPoints: FeaturePoint[] = [
    {
      icon: '🌍',
      title: 'Multi-Chain Support',
      description: 'Expand beyond Ethereum to Polygon, Arbitrum, and other major blockchains.',
    },
    {
      icon: '🔄',
      title: 'Cross-Chain Messaging',
      description: 'Send messages that work seamlessly across different blockchain networks.',
    },
    {
      icon: '🎁',
      title: 'NFT Profiles & Badges',
      description: 'Earn and display achievement badges as unique NFTs on your profile.',
    },
    {
      icon: '💰',
      title: 'Tokenomics & Rewards',
      description: 'Participate in governance and earn tokens for community contributions.',
    },
    {
      icon: '🏢',
      title: 'Enterprise Suite',
      description: 'Private networks and compliance tools for organizations and teams.',
    },
    {
      icon: '🌐',
      title: 'Web & Desktop Apps',
      description: 'Access Chatify from any device with web, Windows, and Mac apps.',
    },
  ];

  const renderFeatureSection = (
    title: string,
    emoji: string,
    points: FeaturePoint[]
  ) => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionEmoji}>{emoji}</Text>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      </View>
      
      <View style={styles.pointsContainer}>
        {points.map((point, index) => (
          <View key={index} style={styles.pointItem}>
            <View style={styles.pointIconContainer}>
              <Text style={styles.pointIcon}>{point.icon}</Text>
            </View>
            <View style={styles.pointContent}>
              <Text style={[styles.pointTitle, { color: colors.text }]}>
                {point.title}
              </Text>
              <Text
                style={[styles.pointDescription, { color: colors.textSecondary }]}
              >
                {point.description}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top || theme.spacing.md }]}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>About Chatify</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + theme.spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.heroIcon, { backgroundColor: colors.backgroundTertiary }]}>
            <Text style={styles.heroEmoji}>💬</Text>
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Chatify</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            Decentralized messaging powered by blockchain & AI
          </Text>
          <Text style={[styles.heroDescription, { color: colors.textSecondary }]}>
            A next-generation chat platform where every conversation is permanent, transparent, and secure.
          </Text>
        </View>

        {/* On-Chain Immutability */}
        {renderFeatureSection(
          'On-Chain Immutability',
          '⛓️',
          immutabilityPoints
        )}

        {/* AI Moderation */}
        {renderFeatureSection(
          'AI Moderation & Safety',
          '🤖',
          aiModerationPoints
        )}

        {/* Future Roadmap */}
        {renderFeatureSection(
          'Future Roadmap',
          '🗺️',
          roadmapPoints
        )}

        {/* Vision Section */}
        <View style={styles.visionSection}>
          <Text style={[styles.visionTitle, { color: colors.text }]}>
            Our Vision
          </Text>
          <Text style={[styles.visionText, { color: colors.textSecondary }]}>
            We believe communication should be free, transparent, and owned by the users. Chatify leverages blockchain technology to create a messaging platform where conversations are permanent, immutable, and verifiable—while AI ensures safety and quality in every interaction.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Made with ❤️ for Web3
          </Text>
          <Text style={[styles.footerVersion, { color: colors.textSecondary }]}>
            v1.0.0 • © 2026 Chatify
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },

  // Content
  content: {
    paddingHorizontal: theme.spacing.lg,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.backgroundTertiary,
  },
  heroEmoji: {
    fontSize: 40,
  },
  heroTitle: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  heroSubtitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.md,
    color: theme.colors.textSecondary,
  },
  heroDescription: {
    fontSize: theme.typography.fontSize.base,
    textAlign: 'center',
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },

  // Feature Sections
  sectionContainer: {
    marginBottom: theme.spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionEmoji: {
    fontSize: 28,
    marginRight: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    flex: 1,
  },

  // Points Container
  pointsContainer: {
    gap: theme.spacing.md,
  },
  pointItem: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  pointIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  pointIcon: {
    fontSize: 20,
  },
  pointContent: {
    flex: 1,
  },
  pointTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
  },
  pointDescription: {
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 18,
    color: theme.colors.textSecondary,
  },

  // Vision Section
  visionSection: {
    marginVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.secondary,
  },
  visionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  visionText: {
    fontSize: theme.typography.fontSize.base,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  footerText: {
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing.xs,
    color: theme.colors.textSecondary,
  },
  footerVersion: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
  },
});
