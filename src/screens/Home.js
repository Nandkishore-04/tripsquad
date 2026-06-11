import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, radius, spacing } from '../theme';
import { Card, SectionTitle, Avatar, AvatarRow, FadeIn } from '../components/ui';
import { useStore } from '../store';
import { bestDates, prettyDate, daysUntil } from '../utils';

export default function Home() {
  const { state } = useStore();
  const { members, availability, poll, places } = state;

  const memberIds = members.map((m) => m.id);
  const top = bestDates(availability, memberIds, 3);
  const yesCount = Object.values(poll.votes).filter((v) => v === 'yes').length;
  const topPlace = [...places].sort((a, b) => b.votes.length - a.votes.length)[0];
  const countdown = top[0] ? daysUntil(top[0].key) : null;

  return (
    <View style={styles.container}>
      <FadeIn>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.hello}>What's good, {state.me.name} 👋</Text>
            <Text style={styles.sub}>Here's where the trip stands</Text>
          </View>
          <Avatar member={state.me} size={48} />
        </View>
      </FadeIn>

      {countdown !== null && (
        <FadeIn delay={100}>
          <LinearGradient
            colors={gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Text style={styles.heroKicker}>BEST DATE SO FAR</Text>
            <Text style={styles.heroBig}>{prettyDate(top[0].key)}</Text>
            <Text style={styles.heroSub}>
              {top[0].count}/{members.length} free · {countdown <= 0 ? 'today!' : `${countdown} days away`}
            </Text>
          </LinearGradient>
        </FadeIn>
      )}

      <FadeIn delay={200}>
        <View style={styles.statsRow}>
          <Card style={styles.stat}>
            <Text style={styles.statNum}>{yesCount}/{members.length}</Text>
            <Text style={styles.statLabel}>voted YES 🔥</Text>
          </Card>
          <Card style={styles.stat}>
            <Text style={styles.statNum}>{topPlace ? topPlace.emoji : '—'}</Text>
            <Text style={styles.statLabel}>
              {topPlace ? `${topPlace.name} leads` : 'no places yet'}
            </Text>
          </Card>
        </View>
      </FadeIn>

      <FadeIn delay={300}>
        <SectionTitle kicker="overlap" title="Top dates" />
        {top.length === 0 ? (
          <Card>
            <Text style={styles.empty}>No one has marked dates yet. Hit the Dates tab 📅</Text>
          </Card>
        ) : (
          top.map(({ key, count }, i) => {
            const free = members.filter((m) => (availability[m.id] || []).includes(key));
            return (
              <Card key={key} style={styles.dateRow} glow={i === 0}>
                <View>
                  <Text style={styles.dateText}>{prettyDate(key)}</Text>
                  <Text style={styles.dateSub}>{count} of {members.length} free</Text>
                </View>
                <AvatarRow members={free} />
              </Card>
            );
          })
        )}
      </FadeIn>

      <FadeIn delay={400}>
        <SectionTitle kicker="the crew" title="Squad" />
        <Card>
          {members.map((m, i) => (
            <View key={m.id} style={[styles.memberRow, i > 0 && styles.memberDivider]}>
              <Avatar member={m} size={36} />
              <Text style={styles.memberName}>
                {m.name}{m.id === state.me.id ? ' (you)' : ''}
              </Text>
              <Text style={styles.memberMeta}>
                {(availability[m.id] || []).length} days free
              </Text>
              <Text style={{ fontSize: 16 }}>
                {poll.votes[m.id] === 'yes' ? '✅' : poll.votes[m.id] === 'no' ? '❌' : poll.votes[m.id] === 'maybe' ? '🤔' : '⏳'}
              </Text>
            </View>
          ))}
        </Card>
      </FadeIn>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.lg },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  hello: { color: colors.text, fontSize: 24, fontWeight: '800' },
  sub: { color: colors.textDim, fontSize: 14, marginTop: 2 },
  hero: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  heroKicker: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11, fontWeight: '800', letterSpacing: 2,
  },
  heroBig: { color: '#fff', fontSize: 34, fontWeight: '900', marginVertical: 6 },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  stat: { flex: 1, alignItems: 'center', paddingVertical: spacing.lg },
  statNum: { color: colors.text, fontSize: 26, fontWeight: '900' },
  statLabel: { color: colors.textDim, fontSize: 12, marginTop: 4, fontWeight: '600' },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dateText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  dateSub: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  empty: { color: colors.textDim, fontSize: 14 },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  memberDivider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  memberName: { color: colors.text, fontSize: 15, fontWeight: '700', flex: 1 },
  memberMeta: { color: colors.textFaint, fontSize: 12 },
});
