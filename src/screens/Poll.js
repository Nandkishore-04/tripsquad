import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, gradients, radius, spacing } from '../theme';
import { Card, SectionTitle, Avatar, ProgressBar, FadeIn } from '../components/ui';
import { useStore } from '../store';

const CHOICES = [
  { id: 'yes', label: "I'm IN", emoji: '🔥', grad: gradients.mint, color: colors.green },
  { id: 'maybe', label: 'Maybe', emoji: '🤔', grad: gradients.fire, color: colors.yellow },
  { id: 'no', label: "Can't", emoji: '💀', grad: [colors.red, colors.accent], color: colors.red },
];

export default function Poll() {
  const { state, dispatch } = useStore();
  const { members, poll } = state;
  const myVote = poll.votes[state.me.id];

  const tally = (choice) =>
    Object.values(poll.votes).filter((v) => v === choice).length;
  const totalVotes = Object.keys(poll.votes).length;
  const yesPct = members.length ? tally('yes') / members.length : 0;

  return (
    <View style={styles.container}>
      <FadeIn>
        <SectionTitle kicker="the big question" title={poll.question} />
        <Text style={styles.hint}>
          {totalVotes}/{members.length} have voted · tap again to clear your vote
        </Text>
      </FadeIn>

      <FadeIn delay={100}>
        <View style={styles.choiceRow}>
          {CHOICES.map((c) => {
            const active = myVote === c.id;
            return (
              <Pressable
                key={c.id}
                style={[styles.choice, active && { borderColor: c.color, backgroundColor: 'rgba(255,255,255,0.08)' }]}
                onPress={() => dispatch({ type: 'VOTE', choice: c.id })}
              >
                <Text style={{ fontSize: 34 }}>{c.emoji}</Text>
                <Text style={[styles.choiceLabel, active && { color: c.color }]}>{c.label}</Text>
                <Text style={styles.choiceCount}>{tally(c.id)}</Text>
              </Pressable>
            );
          })}
        </View>
      </FadeIn>

      <FadeIn delay={200}>
        <Card glow={yesPct >= 0.5}>
          <Text style={styles.meterTitle}>
            {yesPct >= 0.75 ? '🚀 IT\'S HAPPENING' : yesPct >= 0.5 ? '👀 Looking good...' : '😴 Wake the squad up'}
          </Text>
          <ProgressBar pct={yesPct} colors={gradients.brand} height={14} />
          <Text style={styles.meterSub}>
            {Math.round(yesPct * 100)}% of the squad is locked in
          </Text>
        </Card>
      </FadeIn>

      <FadeIn delay={300}>
        <SectionTitle kicker="receipts" title="Who said what" />
        <Card>
          {members.map((m, i) => {
            const v = poll.votes[m.id];
            const choice = CHOICES.find((c) => c.id === v);
            return (
              <View key={m.id} style={[styles.voteRow, i > 0 && styles.divider]}>
                <Avatar member={m} size={36} />
                <Text style={styles.voteName}>
                  {m.name}{m.id === state.me.id ? ' (you)' : ''}
                </Text>
                {choice ? (
                  <Text style={[styles.voteBadge, { color: choice.color }]}>
                    {choice.emoji} {choice.label}
                  </Text>
                ) : (
                  <Text style={styles.votePending}>⏳ no vote</Text>
                )}
              </View>
            );
          })}
        </Card>
      </FadeIn>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.lg, paddingTop: spacing.xl },
  hint: { color: colors.textDim, fontSize: 13 },
  choiceRow: { flexDirection: 'row', gap: spacing.md },
  choice: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: 6,
  },
  choiceLabel: { color: colors.text, fontSize: 14, fontWeight: '800' },
  choiceCount: { color: colors.textFaint, fontSize: 12, fontWeight: '700' },
  meterTitle: { color: colors.text, fontSize: 17, fontWeight: '800', marginBottom: spacing.md },
  meterSub: { color: colors.textDim, fontSize: 13, marginTop: spacing.sm, fontWeight: '600' },
  voteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  divider: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  voteName: { color: colors.text, fontSize: 15, fontWeight: '700', flex: 1 },
  voteBadge: { fontSize: 13, fontWeight: '800' },
  votePending: { color: colors.textFaint, fontSize: 13 },
});
