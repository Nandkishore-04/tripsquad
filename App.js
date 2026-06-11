import React, { useRef, useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from './src/store';
import { Shell, WIDE_BREAKPOINT } from './src/components/ui';
import TabBar, { TABS } from './src/components/TabBar';
import Onboarding from './src/screens/Onboarding';
import Home from './src/screens/Home';
import Calendar from './src/screens/Calendar';
import Poll from './src/screens/Poll';
import Places from './src/screens/Places';
import { gradients } from './src/theme';

const SECTIONS = [
  { id: 'home', Component: Home },
  { id: 'calendar', Component: Calendar },
  { id: 'poll', Component: Poll },
  { id: 'places', Component: Places },
];

// Phone / narrow window: one stacked page, floating nav scrolls to sections.
function StackedLayout() {
  const [active, setActive] = useState('home');
  const scrollRef = useRef(null);
  const offsets = useRef({});

  const jumpTo = (id) => {
    setActive(id);
    scrollRef.current?.scrollTo({ y: offsets.current[id] ?? 0, animated: true });
  };

  // Highlight the section currently under the top third of the viewport.
  const onScroll = (e) => {
    const y = e.nativeEvent.contentOffset.y + 200;
    let current = TABS[0].id;
    for (const t of TABS) {
      if ((offsets.current[t.id] ?? 0) <= y) current = t.id;
    }
    if (current !== active) setActive(current);
  };

  return (
    <>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={onScroll}
        scrollEventThrottle={32}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {SECTIONS.map(({ id, Component }) => (
          <View
            key={id}
            onLayout={(e) => { offsets.current[id] = e.nativeEvent.layout.y; }}
          >
            <Component />
          </View>
        ))}
      </ScrollView>
      <TabBar active={active} onChange={jumpTo} />
    </>
  );
}

// Desktop / wide window: everything visible at once in two balanced columns.
function DashboardLayout() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <Home />
          <Calendar />
        </View>
        <View style={{ flex: 1 }}>
          <Poll />
          <Places />
        </View>
      </View>
    </ScrollView>
  );
}

function Main() {
  const { state } = useStore();
  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_BREAKPOINT;

  if (!state.me) {
    return (
      <Shell>
        <Onboarding />
      </Shell>
    );
  }

  return (
    <Shell wide={isWide}>
      {isWide ? <DashboardLayout /> : <StackedLayout />}
    </Shell>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <SafeAreaProvider>
        <LinearGradient colors={gradients.dusk} style={{ flex: 1 }}>
          <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            <Main />
          </SafeAreaView>
        </LinearGradient>
        <StatusBar style="light" />
      </SafeAreaProvider>
    </StoreProvider>
  );
}
