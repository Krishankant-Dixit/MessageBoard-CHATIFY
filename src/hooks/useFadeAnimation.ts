import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

/**
 * Hook for fade-in/fade-out animations
 * Useful for loading states, message additions, etc.
 */
export const useFadeAnimation = (shouldAnimate: boolean = true, initialValue: number = 0) => {
  const opacityAnim = useRef(new Animated.Value(initialValue)).current;

  useEffect(() => {
    if (shouldAnimate) {
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [shouldAnimate, opacityAnim]);

  const fadeOut = (duration: number = 300) => {
    return new Promise<void>((resolve) => {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      }).start(() => resolve());
    });
  };

  const fadeIn = (duration: number = 300) => {
    return new Promise<void>((resolve) => {
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start(() => resolve());
    });
  };

  return {
    opacityAnim,
    fadeOut,
    fadeIn,
  };
};
