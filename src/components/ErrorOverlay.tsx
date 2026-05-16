import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../styles/theme';

interface ErrorOverlayProps {
  type: 'reconnecting' | 'server_down' | 'timeout' | 'error';
  message?: string;
  onRetry?: () => void;
  visible: boolean;
}

export default function ErrorOverlay({ type, message, onRetry, visible }: ErrorOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    } else {
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [visible]);

  if (!visible) return null;

  const titles: Record<string, string> = {
    reconnecting: 'Reconnecting...',
    server_down: 'Server Unavailable',
    timeout: 'Queue Timeout',
    error: 'Connection Error',
  };

  const icons: Record<string, string> = {
    reconnecting: '🔄',
    server_down: '🚫',
    timeout: '⏱️',
    error: '⚠️',
  };

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <Text style={styles.icon}>{icons[type]}</Text>
        <Text style={styles.title}>{titles[type]}</Text>
        {message && <Text style={styles.message}>{message}</Text>}
        {type === 'reconnecting' && <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} />}
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.95)', zIndex: 1000, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center', padding: 32 },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: 8 },
  message: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8 },
  retryButton: { marginTop: 20, backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 32, borderRadius: 24 },
  retryText: { color: colors.text, fontSize: 16, fontWeight: '600' },
});
