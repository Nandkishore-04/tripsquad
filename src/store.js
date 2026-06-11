import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchShared, pushShared } from './sync';

// Single source of truth for trip data. The shared document lives on a
// server (see sync.js); every device polls it and merges. Each device
// is only ever authoritative for its OWN slice — its profile, its
// availability, its poll vote, its fire-votes — so concurrent edits
// from different friends never clobber each other.

const STORAGE_KEY = 'tripsquad:v3';
const POLL_MS = 4000;
const StoreContext = createContext(null);

export function initialState() {
  return {
    me: null, // { id, name, emoji, palette }
    members: [],
    availability: {}, // memberId -> [date keys]
    poll: {
      question: 'Are we doing this trip?',
      votes: {}, // memberId -> yes|no|maybe
    },
    places: [], // { id, name, emoji, by, votes: [memberId] }
  };
}

// What goes to the server: everything except the local identity.
function toShared(state) {
  const { me, ...shared } = state;
  return shared;
}

// The slice of shared state this device owns. Used both to overlay our
// data onto the server doc and to detect when the server is missing it.
function ownSlice(state, myId) {
  const profile = (state.members || []).find((m) => m.id === myId) || null;
  return {
    profile,
    days: (state.availability || {})[myId] || [],
    vote: ((state.poll || {}).votes || {})[myId] || null,
    fires: (state.places || [])
      .filter((p) => (p.votes || []).includes(myId))
      .map((p) => p.id)
      .sort(),
    pitched: (state.places || []).filter((p) => p.by === myId).map((p) => p.id).sort(),
  };
}

// Merge the server doc into local state: others' data comes from the
// server, our own data comes from local.
function mergeRemote(state, remote) {
  if (!remote || typeof remote !== 'object') return state;
  const myId = state.me?.id;

  let members = Array.isArray(remote.members) ? remote.members : [];
  if (myId) members = [...members.filter((m) => m.id !== myId), state.me];

  const availability = { ...(remote.availability || {}) };
  if (myId) availability[myId] = state.availability[myId] || [];

  const votes = { ...(remote.poll?.votes || {}) };
  if (myId) {
    if (state.poll.votes[myId]) votes[myId] = state.poll.votes[myId];
    else delete votes[myId];
  }

  const remotePlaces = Array.isArray(remote.places) ? remote.places : [];
  const localById = Object.fromEntries(state.places.map((p) => [p.id, p]));
  const remoteIds = new Set(remotePlaces.map((p) => p.id));
  const places = remotePlaces.map((p) => {
    let pv = Array.isArray(p.votes) ? p.votes : [];
    if (myId && localById[p.id]) {
      pv = pv.filter((v) => v !== myId);
      if (localById[p.id].votes.includes(myId)) pv = [...pv, myId];
    }
    return { ...p, votes: pv };
  });
  // places added locally that the server hasn't seen yet
  for (const p of state.places) if (!remoteIds.has(p.id)) places.push(p);

  return {
    ...state,
    members,
    availability,
    poll: { question: remote.poll?.question || state.poll.question, votes },
    places,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;
    case 'REMOTE':
      return mergeRemote(state, action.remote);
    case 'JOIN': {
      const me = {
        id: `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
        name: action.name,
        emoji: action.emoji,
        palette: action.palette,
      };
      return { ...state, me, members: [...state.members, me] };
    }
    case 'TOGGLE_DAY': {
      const mine = state.availability[state.me.id] || [];
      const next = mine.includes(action.key)
        ? mine.filter((k) => k !== action.key)
        : [...mine, action.key];
      return {
        ...state,
        availability: { ...state.availability, [state.me.id]: next },
      };
    }
    case 'VOTE': {
      const votes = { ...state.poll.votes };
      if (votes[state.me.id] === action.choice) delete votes[state.me.id];
      else votes[state.me.id] = action.choice;
      return { ...state, poll: { ...state.poll, votes } };
    }
    case 'ADD_PLACE': {
      const place = {
        id: `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
        name: action.name,
        emoji: action.emoji,
        by: state.me.id,
        votes: [state.me.id],
      };
      return { ...state, places: [place, ...state.places] };
    }
    case 'VOTE_PLACE': {
      const places = state.places.map((p) => {
        if (p.id !== action.id) return p;
        const has = p.votes.includes(state.me.id);
        return {
          ...p,
          votes: has
            ? p.votes.filter((v) => v !== state.me.id)
            : [...p.votes, state.me.id],
        };
      });
      return { ...state, places };
    }
    case 'RESET':
      return initialState();
    default:
      return state;
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const hydrated = useRef(false);
  const lastRemote = useRef(null);
  const pushTimer = useRef(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) dispatch({ type: 'HYDRATE', state: { ...initialState(), ...JSON.parse(raw) } });
      })
      .finally(() => {
        hydrated.current = true;
      });
  }, []);

  // Push our merged view of the world. Always merge onto the latest
  // server doc first so we never wipe out friends' data.
  const push = async () => {
    const local = stateRef.current;
    if (!local.me) return;
    const merged = mergeRemote(local, lastRemote.current);
    const doc = toShared(merged);
    if (await pushShared(doc)) lastRemote.current = doc;
  };

  // Poll the shared doc; re-push if the server is missing our slice
  // (first join, or our last write lost a race).
  useEffect(() => {
    if (!state.me) return;
    let alive = true;
    const tick = async () => {
      const remote = await fetchShared();
      if (!alive || !remote) return;
      lastRemote.current = remote;
      dispatch({ type: 'REMOTE', remote });
      const myId = stateRef.current.me?.id;
      if (
        myId &&
        JSON.stringify(ownSlice(remote, myId)) !==
          JSON.stringify(ownSlice(stateRef.current, myId))
      ) {
        push();
      }
    };
    tick();
    const id = setInterval(tick, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [state.me?.id]);

  // Persist locally and debounce a push on every change.
  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
    if (!state.me) return;
    clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(push, 600);
    return () => clearTimeout(pushTimer.current);
  }, [state]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
