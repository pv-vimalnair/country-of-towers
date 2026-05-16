import React from 'react';
import { View, StyleSheet } from 'react-native';

// Priority cards that get enhanced placeholder art (first 20)
export const PRIORITY_CARD_ARTS = [
  'catapult', 'dragon_eye', 'goblin_army', 'lucky_coin', 'pegasus_rider', 
  'quartz', 'crusher', 'emerald', 'bastion', 'werewolf',
  'lightning', 'shift', 'vampire', 'stone_giant', 'meditation',
  'full_moon', 'concussion', 'devil', 'magic_mountain', 'foundation'
];

interface CardArtProps {
  cardId: string;
  color: 'red' | 'blue' | 'green';
  size?: 'small' | 'medium' | 'large';
}

// Pattern backgrounds for each color -- enhanced visual placeholders
const COLOR_PATTERNS = {
  red: {
    gradient: ['#2D1B1B', '#1E293B'],
    accent: '#DC2626',
    pattern: 'radial',
  },
  blue: {
    gradient: ['#1B1D2D', '#1E293B'],
    accent: '#3B82F6',
    pattern: 'diagonal',
  },
  green: {
    gradient: ['#1B2D1B', '#1E293B'],
    accent: '#10B981',
    pattern: 'dots',
  },
};

// Size dimensions
const SIZE_DIMENSIONS = {
  small: { shape: 24, innerShape: 16, badge: 4 },
  medium: { shape: 40, innerShape: 24, badge: 6 },
  large: { shape: 60, innerShape: 36, badge: 8 },
};

export default function CardArt({ cardId, color, size = 'medium' }: CardArtProps) {
  const hasArt = PRIORITY_CARD_ARTS.includes(cardId);
  const pattern = COLOR_PATTERNS[color];
  const dims = SIZE_DIMENSIONS[size];
  
  return (
    <View style={[styles.container, { backgroundColor: pattern.gradient[0] }]}>
      {/* Base gradient layer */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: pattern.gradient[1], opacity: 0.5 }]} />
      {/* Pattern overlay */}
      <View style={[styles.patternOverlay, { borderColor: pattern.accent }]}>
        {/* Simple geometric shapes as placeholder art */}
        <View style={[styles.shape, { 
          backgroundColor: pattern.accent, 
          opacity: 0.15,
          width: dims.shape,
          height: dims.shape,
          borderRadius: dims.shape / 2,
        }]} />
        <View style={[styles.innerShape, { 
          borderColor: pattern.accent, 
          opacity: 0.3,
          width: dims.innerShape,
          height: dims.innerShape,
        }]} />
      </View>
      {/* Priority cards get enhanced visual treatment */}
      {hasArt && (
        <View style={[styles.enhancedBadge, { 
          backgroundColor: pattern.accent,
          width: dims.badge,
          height: dims.badge,
          borderRadius: dims.badge / 2,
        }]} />
      )}
      {/* Bottom accent line */}
      <View style={[styles.accentLine, { backgroundColor: pattern.accent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: 6,
    opacity: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shape: {
    position: 'absolute',
  },
  innerShape: {
    borderRadius: 4,
    borderWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
  enhancedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    opacity: 0.8,
  },
  accentLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.7,
  },
});
