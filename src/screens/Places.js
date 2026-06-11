import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput,
} from 'react-native';
import { colors, gradients, radius, spacing } from '../theme';
import { Card, SectionTitle, AvatarRow, ProgressBar, GradientButton, FadeIn } from '../components/ui';
import { useStore } from '../store';

const PLACE_EMOJIS = ['🏖️', '🏔️', '🌆', '🏕️', '🛶', '🎢', '🌴', '🗻'];

export default function Places() {
  const { state, dispatch } = useStore();
  const { members, places } = state;
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🏖️');

  const sorted = [...places].sort((a, b) => b.votes.length - a.votes.length);
  const maxVotes = Math.max(1, ...places.map((p) => p.votes.length));

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    dispatch({ type: 'ADD_PLACE', name: trimmed, emoji });
    setName('');
  };

  return (
    <View style={styles.container}>
      <FadeIn>
        <SectionTitle kicker="destinations" title="Where we going?" />
        <Text style={styles.hint}>Drop a spot, vote with 🔥. Most fire wins.</Text>
      </FadeIn>

      <FadeIn delay={100}>
        <Card>
          <TextInput
            style={styles.input}
            placeholder="Pitch a destination..."
            placeholderTextColor={colors.textFaint}
            value={name}
            onChangeText={setName}
            onSubmitEditing={submit}
            maxLength={28}
            returnKeyType="done"
          />
          <View style={styles.emojiRow}>
            {PLACE_EMOJIS.map((e) => (
              <Pressable
                key={e}
                onPress={() => setEmoji(e)}
                style={[styles.emojiChip, emoji === e && styles.emojiActive]}
              >
                <Text style={{ fontSize: 20 }}>{e}</Text>
              </Pressable>
            ))}
          </View>
          <GradientButton label="Add Spot" small onPress={submit} style={{ marginTop: spacing.md }} />
        </Card>
      </FadeIn>

      <FadeIn delay={200}>
        <SectionTitle kicker="leaderboard" title="The contenders" />
        {sorted.length === 0 && (
          <Card><Text style={styles.hint}>No spots yet — be the first to pitch one 👆</Text></Card>
        )}
        {sorted.map((p, i) => {
          const voters = members.filter((m) => p.votes.includes(m.id));
          const pitchedBy = members.find((m) => m.id === p.by);
          const iVoted = p.votes.includes(state.me.id);
          return (
            <Card key={p.id} style={{ marginBottom: spacing.md }} glow={i === 0 && p.votes.length > 1}>
              <View style={styles.placeHeader}>
                <Text style={{ fontSize: 30 }}>{p.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.placeName}>
                    {i === 0 && p.votes.length > 1 ? '👑 ' : ''}{p.name}
                  </Text>
                  <Text style={styles.placeBy}>
                    pitched by {pitchedBy ? pitchedBy.name : 'someone'}
                  </Text>
                </View>
                <Pressable
                  onPress={() => dispatch({ type: 'VOTE_PLACE', id: p.id })}
                  style={[styles.fireBtn, iVoted && styles.fireActive]}
                >
                  <Text style={{ fontSize: 18 }}>🔥</Text>
                  <Text style={[styles.fireCount, iVoted && { color: '#fff' }]}>
                    {p.votes.length}
                  </Text>
                </Pressable>
              </View>
              <ProgressBar
                pct={p.votes.length / maxVotes}
                colors={i === 0 ? gradients.fire : gradients.cool}
                height={8}
              />
              {voters.length > 0 && (
                <View style={{ marginTop: spacing.sm, flexDirection: 'row' }}>
                  <AvatarRow members={voters} size={24} />
                </View>
              )}
            </Card>
          );
        })}
      </FadeIn>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.lg, paddingTop: spacing.xl },
  hint: { color: colors.textDim, fontSize: 13 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: 16,
    padding: 14,
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  emojiChip: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 2, borderColor: 'transparent',
    alignItems: 'center', justifyContent: 'center',
  },
  emojiActive: { borderColor: colors.primary },
  placeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  placeName: { color: colors.text, fontSize: 17, fontWeight: '800' },
  placeBy: { color: colors.textFaint, fontSize: 12, marginTop: 2 },
  fireBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  fireActive: {
    backgroundColor: 'rgba(255,92,168,0.25)',
    borderColor: colors.accent,
  },
  fireCount: { color: colors.textDim, fontSize: 14, fontWeight: '800' },
});
