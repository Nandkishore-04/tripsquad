# TripSquad 🚀

Plan the trip. Skip the group-chat chaos.

A dark, glassy, gradient-heavy React Native (Expo) app for planning a group trip with the boys — shared availability calendar, trip poll, and destination voting. Runs on **Android, iOS, and the web** from one codebase, fully mobile responsive.

## Features

- **😎 Onboarding** — pick your name, emoji, and gradient color; you join the squad.
- **🏠 Home** — trip pulse: best date so far (with countdown), yes-vote count, leading destination, top overlap dates, and the full squad roster with everyone's status.
- **📅 Dates** — tap the days you're free. The calendar is a *heatmap*: cells glow brighter as more people overlap, green when **everyone** is free. Tap a day to see exactly who's available.
- **🗳️ Poll** — "Are we doing this trip?" I'm IN 🔥 / Maybe 🤔 / Can't 💀, with an animated hype meter and a receipts list of who said what.
- **📍 Places** — pitch a destination with an emoji, vote with 🔥, live leaderboard with the leader crowned 👑.

## Run it

```bash
npm install
npm start          # scan the QR with Expo Go on your phone
npm run web        # or run it in the browser
```

## How it's built

- **Expo SDK 56 / React Native 0.85** + `react-native-web` for the browser.
- No navigation library — a custom floating glass tab bar keeps it light.
- Custom-built calendar, animated progress bars, and entrance animations (`Animated` API).
- Theme tokens in [src/theme.js](src/theme.js); all screens cap content at 560px and center on desktop.

## State & making it truly shared

All trip data lives in one store ([src/store.js](src/store.js)) persisted with AsyncStorage.

Right now persistence is **local to each device**. To make it live for the whole squad, swap the load/save in `StoreProvider` for a realtime backend (Firebase Realtime DB or Supabase) — the reducer, actions, and every screen stay exactly the same. The state shape is one JSON document:

```js
{ me, members[], availability{memberId: [dates]}, poll{question, votes}, places[] }
```

## Ideas on the roadmap

- 💸 Budget splitter — who owes what
- 🧳 Shared packing checklist
- 📸 Trip memories wall after the trip
- 🔔 Push notification when everyone has voted yes
