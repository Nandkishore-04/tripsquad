import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, radius, spacing } from '../theme';
import { Card, SectionTitle, AvatarRow, FadeIn } from '../components/ui';
import { useStore } from '../store';
import { MONTHS, WEEKDAYS, monthMatrix, dateKey, todayKey, prettyDate } from '../utils';

// Heat colors by how many members are free that day (0 → all).
function heatStyle(count, total, isMine) {
  if (count === 0) return { backgroundColor: 'transparent' };
  const ratio = count / total;
  if (ratio >= 0.99) return { backgroundColor: 'rgba(61,232,160,0.30)', borderColor: colors.green };
  if (ratio >= 0.6) return { backgroundColor: 'rgba(168,120,255,0.30)', borderColor: colors.primary };
  if (ratio >= 0.3) return { backgroundColor: 'rgba(168,120,255,0.16)', borderColor: 'rgba(168,120,255,0.4)' };
  return { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.15)' };
}

export default function Calendar() {
  const { state, dispatch } = useStore();
  const { members, availability } = state;
  const now = new Date();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState(null);

  const cells = monthMatrix(cursor.y, cursor.m);
  const today = todayKey();
  const mine = availability[state.me.id] || [];

  const countFree = (key) =>
    members.filter((m) => (availability[m.id] || []).includes(key));

  const move = (dir) => {
    let m = cursor.m + dir;
    let y = cursor.y;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setCursor({ y, m });
    setSelected(null);
  };

  return (
    <View style={styles.container}>
      <FadeIn>
        <SectionTitle kicker="availability" title="When are you free?" />
        <Text style={styles.hint}>
          Tap days you're free. The squad heatmap lights up where everyone overlaps 🟢
        </Text>
      </FadeIn>

      <FadeIn delay={100}>
        <Card>
          <View style={styles.monthRow}>
            <Pressable onPress={() => move(-1)} style={styles.navBtn} hitSlop={8}>
              <Text style={styles.navText}>‹</Text>
            </Pressable>
            <Text style={styles.monthText}>{MONTHS[cursor.m]} {cursor.y}</Text>
            <Pressable onPress={() => move(1)} style={styles.navBtn} hitSlop={8}>
              <Text style={styles.navText}>›</Text>
            </Pressable>
          </View>

          <View style={styles.week}>
            {WEEKDAYS.map((w, i) => (
              <Text key={i} style={styles.weekday}>{w}</Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((day, i) => {
              if (day === null) return <View key={i} style={styles.cell} />;
              const key = dateKey(cursor.y, cursor.m, day);
              const free = countFree(key);
              const isMine = mine.includes(key);
              const isToday = key === today;
              const isPast = key < today;
              return (
                <Pressable
                  key={i}
                  style={styles.cell}
                  disabled={isPast}
                  onPress={() => {
                    dispatch({ type: 'TOGGLE_DAY', key });
                    setSelected(key);
                  }}
                  onLongPress={() => setSelected(key)}
                >
                  <View style={[
                    styles.day,
                    heatStyle(free.length, members.length),
                    isMine && styles.dayMine,
                    isToday && styles.dayToday,
                    isPast && { opacity: 0.25 },
                  ]}>
                    <Text style={[styles.dayText, isMine && { color: '#fff', fontWeight: '900' }]}>
                      {day}
                    </Text>
                    {free.length > 0 && (
                      <Text style={styles.dayCount}>{free.length}</Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.legend}>
            <Legend swatch={{ backgroundColor: 'rgba(255,255,255,0.06)' }} label="some free" />
            <Legend swatch={{ backgroundColor: 'rgba(168,120,255,0.3)' }} label="most free" />
            <Legend swatch={{ backgroundColor: 'rgba(61,232,160,0.3)' }} label="ALL free" />
          </View>
        </Card>
      </FadeIn>

      {selected && (
        <FadeIn>
          <Card glow>
            <Text style={styles.selTitle}>{prettyDate(selected)}</Text>
            {countFree(selected).length === 0 ? (
              <Text style={styles.hint}>Nobody's free this day yet.</Text>
            ) : (
              <View style={styles.selRow}>
                <AvatarRow members={countFree(selected)} size={34} />
                <Text style={styles.selNames}>
                  {countFree(selected).map((m) => m.name).join(', ')}
                </Text>
              </View>
            )}
          </Card>
        </FadeIn>
      )}

      <FadeIn delay={200}>
        <LinearGradient
          colors={gradients.cool}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tip}
        >
          <Text style={styles.tipText}>
            💡 You've marked {mine.length} day{mine.length === 1 ? '' : 's'}. More days = better odds the squad locks something in.
          </Text>
        </LinearGradient>
      </FadeIn>
    </View>
  );
}

function Legend({ swatch, label }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={[styles.swatch, swatch]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.lg, paddingTop: spacing.xl },
  hint: { color: colors.textDim, fontSize: 13, lineHeight: 19 },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  navBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center', justifyContent: 'center',
  },
  navText: { color: colors.text, fontSize: 22, marginTop: -2 },
  monthText: { color: colors.text, fontSize: 17, fontWeight: '800' },
  week: { flexDirection: 'row', marginBottom: spacing.xs },
  weekday: {
    flex: 1, textAlign: 'center',
    color: colors.textFaint, fontSize: 11, fontWeight: '800',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2,
  },
  day: {
    flex: 1,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayMine: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  dayToday: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.cyan,
  },
  dayText: { color: colors.textDim, fontSize: 14, fontWeight: '600' },
  dayCount: {
    position: 'absolute', top: 2, right: 4,
    color: colors.textDim, fontSize: 8, fontWeight: '800',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    flexWrap: 'wrap',
  },
  swatch: { width: 14, height: 14, borderRadius: 4 },
  legendText: { color: colors.textFaint, fontSize: 11, fontWeight: '600' },
  selTitle: { color: colors.text, fontSize: 17, fontWeight: '800', marginBottom: spacing.sm },
  selRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  selNames: { color: colors.textDim, fontSize: 13, flex: 1 },
  tip: { borderRadius: radius.lg, padding: spacing.lg },
  tipText: { color: '#fff', fontSize: 13, fontWeight: '600', lineHeight: 19 },
});
