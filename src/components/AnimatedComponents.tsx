import React from 'react';
import { Animated, View, StyleSheet } from 'react-native';

interface LoadingSkeletonProps {
  count?: number;
  width?: number | string;
  height?: number;
  animated?: boolean;
}

/**
 * Animated Loading Skeleton
 * Shows shimmer effect while content is loading
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 3,
  width = '100%',
  height = 60,
  animated = true,
}) => {
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;

    if (animated) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [animated, shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const skeletonWidth = typeof width === 'number' ? width : (typeof width === 'string' ? parseInt(width) : 100);

  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.skeleton,
            {
              width: skeletonWidth,
              height,
              opacity,
            },
          ]}
        />
      ))}
    </View>
  );
};

/**
 * Animated Pulse Badge
 * Shows pulsing indicator for live/active states
 */
export const PulseBadge: React.FC<{ color?: string }> = ({ color = '#22C55E' }) => {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulseAnim]);

  const scale = pulseAnim;
  const opacity = pulseAnim.interpolate({
    inputRange: [1, 1.5],
    outputRange: [1, 0],
  });

  return (
    <View style={styles.pulseContainer}>
      <Animated.View
        style={[
          styles.pulseDot,
          {
            backgroundColor: color,
            transform: [{ scale }],
            opacity,
          },
        ]}
      />
      <View style={[styles.pulseDot, { backgroundColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 12,
  },
  pulseContainer: {
    position: 'relative',
    width: 12,
    height: 12,
  },
  pulseDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
