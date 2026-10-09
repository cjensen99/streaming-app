import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { useReduceMotion } from './useReduceMotion';

const MIN_OPACITY = 0.45;
const HALF_CYCLE_MS = 800;

/**
 * An opacity that pulses between 1 and a lower value, for loading placeholders. Runs on the
 * native driver (no JS work per frame) and stays still when the user has asked to reduce motion.
 */
export function usePulseAnimation(): Animated.Value {
  const [opacity] = useState(() => new Animated.Value(1));
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const timing = (toValue: number) =>
      Animated.timing(opacity, {
        toValue,
        duration: HALF_CYCLE_MS,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      });
    const pulse = Animated.loop(Animated.sequence([timing(MIN_OPACITY), timing(1)]));
    pulse.start();
    return () => {
      pulse.stop();
      opacity.setValue(1);
    };
  }, [opacity, reduceMotion]);

  return opacity;
}
