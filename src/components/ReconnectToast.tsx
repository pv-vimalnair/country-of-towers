import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../styles/theme';

interface ReconnectToastProps {
  message: string;
  visible: boolean;
}

export default function ReconnectToast({ message, visible }: ReconnectToastProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    } else {
      Animated.timing(slideAnim, { toValue: -100, duration: 200, useNativeDriver: true }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toast, { transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: { position: 'absolute', top: 60, left: 24, right: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.warning, borderRadius: 12, padding: 12, zIndex: 500, alignItems: 'center' },
  text: { color: colors.warning, fontSize: 14, fontWeight: '600' },
});
