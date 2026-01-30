import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

/**
 * Hook for scale animations
 * Useful for message send, loading indicators, etc.
 */
export const useScaleAnimation = (trigger: boolean = true, duration: number = 400) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [trigger, scaleAnim]);

  return scaleAnim;
};

/**
 * Hook for slide-up animations
 * Useful for modals, messages entering from bottom
 */
export const useSlideUpAnimation = (trigger: boolean = true) => {
  const translateY = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (trigger) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      translateY.setValue(100);
    }
  }, [trigger, translateY]);

  return translateY;
};

/**
 * Hook for pulse animations (opacity)
 * Useful for loading states, attention indicators
 */
export const usePulseAnimation = (shouldAnimate: boolean = true) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    
    if (shouldAnimate) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.6,
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
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [shouldAnimate, pulseAnim]);

  return pulseAnim;
};

/**
 * Hook for shake animations
 * Useful for error states, attention indicators
 */
export const useShakeAnimation = (shouldAnimate: boolean = false) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;

    if (shouldAnimate) {
      animation = Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]);
      animation.start();
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [shouldAnimate, shakeAnim]);

  return shakeAnim;
};
