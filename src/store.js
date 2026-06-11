import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Single source of truth for trip data. Persisted locally for now —
// to make it live for the whole squad, replace load/save with a
// Firebase/Supabase listener; the rest of the app won't change.

const STORAGE_KEY = 'tripsquad:v2';
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
    places: [],
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;
    case 'JOIN': {
      const me = {
        id: 'me',
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
        id: `p${Date.now()}`,
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
  const hydrated = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) dispatch({ type: 'HYDRATE', state: JSON.parse(raw) });
      })
      .finally(() => {
        hydrated.current = true;
      });
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
