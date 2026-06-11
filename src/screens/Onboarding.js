import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, avatarPalette, radius, spacing } from '../theme';
import { GradientButton, FadeIn } from '../components/ui';
import { useStore } from '../store';

const EMOJIS = ['😎', '🔥', '🐉', '👑', '⚡', '🚀', '🤙', '🌊'];

export default function Onboarding() {
  const { dispatch } = useStore();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('😎');
  const [palette, setPalette] = useState(0);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <FadeIn>
          <Text style={styles.logo}>TRIPSQUAD</Text>
          <Text style={styles.tagline}>Plan the trip. Skip the group-chat chaos.</Text>
        </FadeIn>

        <FadeIn delay={150}>
          <LinearGradient
            colors={avatarPalette[palette]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bigAvatar}
          >
            <Text style={{ fontSize: 52 }}>{emoji}</Text>
          </LinearGradient>
        </FadeIn>

        <FadeIn delay={250} style={{ width: '100%' }}>
          <TextInput
            style={styles.input}
            placeholder="What do the boys call you?"
            placeholderTextColor={colors.textFaint}
            value={name}
            onChangeText={setName}
            maxLength={16}
          />

          <Text style={styles.label}>PICK YOUR VIBE</Text>
          <View style={styles.row}>
            {EMOJIS.map((e) => (
              <Pressable
                key={e}
                onPress={() => setEmoji(e)}
                style={[styles.emojiChip, emoji === e && styles.chipActive]}
              >
                <Text style={{ fontSize: 22 }}>{e}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>PICK YOUR COLOR</Text>
          <View style={styles.row}>
            {avatarPalette.map((g, i) => (
              <Pressable key={i} onPress={() => setPalette(i)}>
                <LinearGradient
                  colors={g}
                  style={[styles.swatch, palette === i && styles.chipActive]}
                />
              </Pressable>
            ))}
          </View>

          <GradientButton
            label="Let's Go 🚀"
            colors={gradients.brand}
            style={{ marginTop: spacing.xl }}
            onPress={() => {
              if (name.trim()) dispatch({ type: 'JOIN', name: name.trim(), emoji, palette });
            }}
          />
        </FadeIn>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  logo: {
    color: colors.text,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 6,
    textAlign: 'center',
  },
  tagline: {
    color: colors.textDim,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 6,
  },
  bigAvatar: {
    width: 110, height: 110, borderRadius: 55,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: 17,
    padding: 16,
    textAlign: 'center',
  },
  label: {
    color: colors.textFaint,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  emojiChip: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: colors.card,
    borderWidth: 2, borderColor: 'transparent',
    alignItems: 'center', justifyContent: 'center',
  },
  swatch: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 2, borderColor: 'transparent',
  },
  chipActive: { borderColor: colors.text },
});
