import { useRef, useState } from 'react';
import { Animated } from 'react-native';

/**
 * Hook for animated button press
 * Provides scale and opacity animations on press
 */
export const useAnimatedButton = (onPressCallback?: () => void) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    handlePressOut();
    if (onPressCallback) {
      onPressCallback();
    }
  };

  return {
    scaleAnim,
    opacityAnim,
    handlePressIn,
    handlePressOut,
    handlePress,
  };
};
