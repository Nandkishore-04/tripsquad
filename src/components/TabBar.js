import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, radius, spacing, shadowGlow } from '../theme';

export const TABS = [
  { id: 'home', label: 'Home', emoji: '🏠' },
  { id: 'calendar', label: 'Dates', emoji: '📅' },
  { id: 'poll', label: 'Poll', emoji: '🗳️' },
  { id: 'places', label: 'Places', emoji: '📍' },
];

export default function TabBar({ active, onChange }) {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={[styles.bar, shadowGlow('#000', 0.5)]}>
        {TABS.map((t) => {
          const isActive = active === t.id;
          return (
            <Pressable key={t.id} style={styles.tab} onPress={() => onChange(t.id)}>
              {isActive ? (
                <LinearGradient
                  colors={gradients.brand}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.activePill}
                >
                  <Text style={styles.emoji}>{t.emoji}</Text>
                  <Text style={styles.activeLabel}>{t.label}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactive}>
                  <Text style={[styles.emoji, { opacity: 0.6 }]}>{t.emoji}</Text>
                  <Text style={styles.label}>{t.label}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16,15,26,0.92)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.pill,
    padding: 6,
    gap: 4,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(16px)' } : {}),
  },
  tab: { borderRadius: radius.pill },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
  },
  inactive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  emoji: { fontSize: 16 },
  label: { color: colors.textFaint, fontSize: 13, fontWeight: '700' },
  activeLabel: { color: '#fff', fontSize: 13, fontWeight: '800' },
});
