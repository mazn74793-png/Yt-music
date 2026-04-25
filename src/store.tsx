import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, Song, Playlist } from './types';

type Action =
  | { type: 'SET_CURRENT_SONG'; song: Song | null }
  | { type: 'SET_PLAYING'; isPlaying: boolean }
  | { type: 'ADD_TO_QUEUE'; song: Song }
  | { type: 'REMOVE_FROM_QUEUE'; index: number }
  | { type: 'CLEAR_QUEUE' }
  | { type: 'TOGGLE_LIBRARY'; song: Song }
  | { type: 'CREATE_PLAYLIST'; name: string }
  | { type: 'ADD_TO_PLAYLIST'; playlistId: string; song: Song }
  | { type: 'SET_QUEUE'; queue: Song[] };

const initialState: AppState = {
  currentSong: null,
  isPlaying: false,
  queue: [],
  history: [],
  playlists: [],
  library: [],
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_CURRENT_SONG':
      return { 
        ...state, 
        currentSong: action.song, 
        isPlaying: !!action.song,
        history: action.song ? [action.song, ...state.history.filter(s => s.youtubeId !== action.song?.youtubeId)].slice(0, 50) : state.history
      };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.isPlaying };
    case 'ADD_TO_QUEUE':
       if (state.queue.some(s => s.youtubeId === action.song.youtubeId)) return state;
      return { ...state, queue: [...state.queue, action.song] };
    case 'REMOVE_FROM_QUEUE':
      return { ...state, queue: state.queue.filter((_, i) => i !== action.index) };
    case 'CLEAR_QUEUE':
      return { ...state, queue: [] };
    case 'SET_QUEUE':
      return { ...state, queue: action.queue };
    case 'TOGGLE_LIBRARY':
      const isInLibrary = state.library.some(s => s.youtubeId === action.song.youtubeId);
      return {
        ...state,
        library: isInLibrary 
          ? state.library.filter(s => s.youtubeId !== action.song.youtubeId)
          : [action.song, ...state.library]
      };
    case 'CREATE_PLAYLIST':
      const newPlaylist: Playlist = {
        id: Math.random().toString(36).substr(2, 9),
        name: action.name,
        songs: [],
        createdAt: Date.now(),
      };
      return { ...state, playlists: [...state.playlists, newPlaylist] };
    case 'ADD_TO_PLAYLIST':
      return {
        ...state,
        playlists: state.playlists.map(p => 
          p.id === action.playlistId 
            ? { ...p, songs: [...p.songs.filter(s => s.youtubeId !== action.song.youtubeId), action.song] }
            : p
        )
      };
    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState, (initial) => {
    const saved = localStorage.getItem('harmonix-state');
    return saved ? JSON.parse(saved) : initial;
  });

  useEffect(() => {
    localStorage.setItem('harmonix-state', JSON.stringify({
      ...state,
      currentSong: null, // Don't persist current playing song for fresh start
      isPlaying: false
    }));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
