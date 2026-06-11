import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, Animated, useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, avatarPalette, radius, spacing, shadowGlow } from '../theme';

// Breakpoint above which sections lay out side by side as a dashboard.
export const WIDE_BREAKPOINT = 1100;

// Centers content and caps width so the app looks right on desktop web too.
export function Shell({ children, wide }) {
  const { width } = useWindowDimensions();
  const maxWidth = Math.min(width, wide ? 1320 : 560);
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center' }}>
      <View style={{ flex: 1, width: maxWidth }}>{children}</View>
    </View>
  );
}

export function Card({ children, style, glow }) {
  return (
    <View style={[styles.card, glow && shadowGlow(), style]}>{children}</View>
  );
}

export function SectionTitle({ kicker, title }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      {kicker ? <Text style={styles.kicker}>{kicker.toUpperCase()}</Text> : null}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

export function GradientButton({ label, onPress, colors: g = gradients.brand, style, small }) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = (to) =>
    Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 40 }).start();
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => press(0.96)}
      onPressOut={() => press(1)}
    >
      <Animated.View style={[{ transform: [{ scale }] }, shadowGlow(g[0], 0.45), style]}>
        <LinearGradient
          colors={g}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.btn, small && styles.btnSmall]}
        >
          <Text style={[styles.btnText, small && { fontSize: 14 }]}>{label}</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

export function Avatar({ member, size = 40 }) {
  const palette = avatarPalette[member.palette % avatarPalette.length];
  return (
    <LinearGradient
      colors={palette}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size, height: size, borderRadius: size / 2,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.18)',
      }}
    >
      <Text style={{ fontSize: size * 0.45 }}>{member.emoji}</Text>
    </LinearGradient>
  );
}

export function AvatarRow({ members, size = 30 }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {members.map((m, i) => (
        <View key={m.id} style={{ marginLeft: i === 0 ? 0 : -size * 0.3 }}>
          <Avatar member={m} size={size} />
        </View>
      ))}
    </View>
  );
}

// Animated horizontal bar that fills to `pct` (0..1).
export function ProgressBar({ pct, colors: g = gradients.brand, height = 10 }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: pct, duration: 600, useNativeDriver: false }).start();
  }, [pct]);
  return (
    <View style={{
      height, borderRadius: height / 2, overflow: 'hidden',
      backgroundColor: 'rgba(255,255,255,0.07)',
    }}>
      <Animated.View style={{
        height: '100%',
        width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
      }}>
        <LinearGradient
          colors={g}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1, borderRadius: height / 2 }}
        />
      </Animated.View>
    </View>
  );
}

// Fade+slide-in wrapper for screen content.
export function FadeIn({ children, delay = 0, style }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1, duration: 450, delay, useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View style={[{
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
    }, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  kicker: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  btn: {
    paddingVertical: 15,
    paddingHorizontal: 26,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  btnSmall: { paddingVertical: 9, paddingHorizontal: 16 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.3 },
});
