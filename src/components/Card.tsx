// Card — Production-quality reusable card component
// Design by Rachana | Built for Country of Towers
import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, type ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import CardArt from "./CardArt";

export interface CardProps {
  cardId: string;
  name: string;
  cost: { ore?: number; mana?: number; troops?: number };
  description: string;
  color: "red" | "blue" | "green";
  onPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
  style?: ViewStyle;
}

// Design tokens per Rachana's spec
const CARD_WIDTH = 120;
const CARD_HEIGHT = 170;

const COLOR_TOKENS = {
  red: {
    border: "#DC2626",
    glow: "rgba(220, 38, 38, 0.35)",
    gradientStart: "#1E293B",
    gradientEnd: "#2D1B1B",
    accent: "#DC2626",
  },
  blue: {
    border: "#3B82F6",
    glow: "rgba(59, 130, 246, 0.35)",
    gradientStart: "#1E293B",
    gradientEnd: "#1B1D2D",
    accent: "#3B82F6",
  },
  green: {
    border: "#10B981",
    glow: "rgba(16, 185, 129, 0.35)",
    gradientStart: "#1E293B",
    gradientEnd: "#1B2D1D",
    accent: "#10B981",
  },
};

const COST_ICONS: Record<string, string> = {
  ore: "⚔️",
  mana: "🔮",
  troops: "🛡️",
};

export default function Card({
  cardId,
  name,
  cost,
  description,
  color,
  onPress,
  disabled = false,
  selected = false,
  style,
}: CardProps) {
  const tokens = COLOR_TOKENS[color];

  // Selection animation — spring lift
  const liftAnim = useSharedValue(0);
  useEffect(() => {
    liftAnim.value = withSpring(selected ? 1 : 0, {
      damping: 12,
      stiffness: 180,
      mass: 0.5,
    });
  }, [selected]);

  const liftStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(liftAnim.value, [0, 1], [0, -20]) }],
    shadowOpacity: interpolate(liftAnim.value, [0, 1], [0.3, 0.7]),
    shadowRadius: interpolate(liftAnim.value, [0, 1], [6, 14]),
  }));

  // Flip animation — card rotates in on mount (like being drawn)
  const flipAnim = useSharedValue(180);
  useEffect(() => {
    flipAnim.value = withTiming(0, { duration: 350 });
  }, []);

  const flipStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      { rotateY: `${flipAnim.value}deg` },
    ],
    opacity: interpolate(flipAnim.value, [90, 180], [1, 0.6]),
  }));

  // Backface hidden during flip
  const backfaceHidden = flipAnim.value > 90;

  return (
    <Animated.View style={[style, flipStyle]}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.card,
            liftStyle,
            {
              borderColor: tokens.border,
              opacity: disabled ? 0.4 : 1,
              shadowColor: selected ? tokens.border : "#000",
            },
            selected && {
              shadowColor: tokens.border,
              shadowOpacity: 0.7,
              shadowRadius: 14,
              elevation: 16,
              borderColor: tokens.border,
              borderWidth: 2.5,
            },
          ]}
        >
          {/* Top section: Cost + Name */}
          <View style={styles.topRow}>
            <View style={styles.costRow}>
              {(cost.ore ?? 0) > 0 && (
                <Text style={[styles.costIcon, { color: "#FCA5A5" }]}>
                  ⚔️{cost.ore}
                </Text>
              )}
              {(cost.mana ?? 0) > 0 && (
                <Text style={[styles.costIcon, { color: "#93C5FD" }]}>
                  🔮{cost.mana}
                </Text>
              )}
              {(cost.troops ?? 0) > 0 && (
                <Text style={[styles.costIcon, { color: "#6EE7B7" }]}>
                  🛡️{cost.troops}
                </Text>
              )}
              {!cost.ore && !cost.mana && !cost.troops && (
                <Text style={[styles.costIcon, { color: "#94A3B8" }]}>FREE</Text>
              )}
            </View>
          </View>

          {/* Art area — CardArt component */}
          <View style={styles.artArea}>
            <CardArt cardId={cardId} color={color} size="medium" />
          </View>

          {/* Card name */}
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>

          {/* Description */}
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>

          {/* Color accent bar at bottom */}
          <View
            style={[styles.bottomBar, { backgroundColor: tokens.accent }]}
          />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: "#1E293B",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#334155",
    padding: 8,
    justifyContent: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    overflow: "hidden",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 4,
    height: 14,
  },
  costRow: {
    flexDirection: "row",
    gap: 3,
    flexWrap: "wrap",
  },
  costIcon: {
    fontSize: 9,
    fontWeight: "700",
  },
  artArea: {
    height: 62,
    borderRadius: 6,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    position: "relative",
  },
  artGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,
  },
  artAccentLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  artIcon: {
    fontSize: 22,
    opacity: 0.6,
  },
  name: {
    fontSize: 11,
    fontWeight: "700",
    color: "#F8FAFC",
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  description: {
    fontSize: 8.5,
    color: "#94A3B8",
    lineHeight: 10,
    flex: 1,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.7,
  },
});
