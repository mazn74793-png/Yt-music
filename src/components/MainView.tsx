import React, { useState, useEffect } from 'react';
import { Search, User, LogIn, ChevronLeft, ChevronRight, Music, Clock, Heart, ListMusic } from 'lucide-react';
import { useApp } from '../store';
import { searchSongs, getAuthUrl } from '../services/api';
import { SongCard } from './SongCard';
import { Song } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import _ from 'lodash';

interface MainViewProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const MainView: React.FC<MainViewProps> = ({ activeView, setActiveView }) => {
  const { state, dispatch } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearch = _.debounce(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const results = await searchSongs(query);
    setSearchResults(results);
    setIsSearching(false);
  }, 500);

  useEffect(() => {
    if (activeView === 'search') {
      debouncedSearch(searchQuery);
    }
  }, [searchQuery, activeView]);

  const handleLogin = async () => {
    const url = await getAuthUrl();
    const popup = window.open(url, 'youtube_auth', 'width=600,height=600');
    if (!popup) alert('Please allow popups');
  };

  const renderContent = () => {
    if (activeView === 'search') {
      return (
        <div className="flex flex-col gap-10 w-full max-w-5xl mx-auto">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-red-500 transition-colors" />
            <input
              autoFocus
              type="text"
              placeholder="SEARCH EVERYTHING..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-6 pl-16 pr-6 text-xl font-black uppercase tracking-tighter text-white focus:outline-none focus:border-red-600/50 focus:bg-white/10 transition-all placeholder:text-white/10"
            />
          </div>

          <div className="flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
              {isSearching ? (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex py-24 justify-center">
                    <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                 </motion.div>
              ) : searchResults.length > 0 ? (
                searchResults.map((song) => (
                  <SongCard key={song.youtubeId} song={song} />
                ))
              ) : searchQuery && !isSearching ? (
                 <div className="py-32 text-center">
                    <Search className="w-16 h-16 mx-auto mb-6 opacity-5 text-red-600" />
                    <p className="text-2xl font-black uppercase tracking-tighter text-white/20">Nothing found for "{searchQuery}"</p>
                 </div>
              ) : (
                <div className="py-32 text-center">
                  <Music className="w-16 h-16 mx-auto mb-6 opacity-5 text-red-600" />
                  <p className="text-2xl font-black uppercase tracking-tighter text-white/20">Discovery starts with a search</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      );
    }

    if (activeView === 'library') {
      return (
        <div className="flex flex-col gap-10 w-full max-w-5xl mx-auto">
          <div className="flex items-end gap-10 mb-8">
             <div className="w-64 h-64 bg-gradient-to-br from-red-600 to-black rounded-2xl shadow-2xl flex items-center justify-center p-1 border border-white/10">
                <div className="w-full h-full bg-black/40 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Heart className="w-24 h-24 text-white fill-white shadow-xl" />
                </div>
             </div>
             <div className="flex flex-col gap-4">
                <span className="text-xs font-black uppercase tracking-[0.4em] text-red-600">Library</span>
                <h1 className="text-9xl font-black tracking-tighter text-white leading-none">LIKED<br/>SONGS</h1>
                <p className="text-xs text-white/30 font-black uppercase tracking-[0.2em]">{state.library.length} tracks preserved in your vault</p>
             </div>
          </div>
          
          <div className="flex flex-col gap-2 mt-8">
            {state.library.map((song, i) => (
              <SongCard key={song.youtubeId} song={song} index={i + 1} />
            ))}
            {state.library.length === 0 && (
              <div className="py-32 text-center dashed border border-white/5 rounded-3xl">
                <Heart className="w-16 h-16 mx-auto mb-6 opacity-5 text-red-600" />
                <p className="text-xl font-black uppercase tracking-tighter text-white/10">Your vault is empty</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeView.startsWith('playlist-')) {
      const playlistId = activeView.replace('playlist-', '');
      const playlist = state.playlists.find(p => p.id === playlistId);
      if (!playlist) return <div>Playlist not found</div>;

      return (
        <div className="flex flex-col gap-10 w-full max-w-5xl mx-auto">
          <div className="flex items-end gap-10 mb-8">
             <div className="w-64 h-64 bg-white/5 rounded-2xl shadow-2xl flex items-center justify-center border border-white/5 group overflow-hidden relative">
                {playlist.songs[0]?.thumbnailUrl ? (
                   <img src={playlist.songs[0].thumbnailUrl} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" alt={playlist.name} />
                ) : (
                  <ListMusic className="w-20 h-20 text-white/10" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
             </div>
             <div className="flex flex-col gap-4 z-10">
                <span className="text-xs font-black uppercase tracking-[0.4em] text-red-600">Collection</span>
                <h1 className="text-8xl font-black tracking-tighter text-white leading-none uppercase">{playlist.name}</h1>
                <p className="text-xs text-white/30 font-black uppercase tracking-[0.2em]">{playlist.songs.length} tracks • curated on {new Date(playlist.createdAt).toLocaleDateString()}</p>
             </div>
          </div>

          <div className="flex flex-col gap-2 mt-8">
            {playlist.songs.map((song, i) => (
              <SongCard key={song.youtubeId} song={song} index={i + 1} />
            ))}
            {playlist.songs.length === 0 && (
               <div className="py-32 text-center dashed border border-white/5 rounded-3xl">
                 <p className="text-xl font-black uppercase tracking-tighter text-white/10">This collection is silent</p>
               </div>
            )}
          </div>
        </div>
      );
    }

    // Default Home
    return (
      <div className="flex flex-col gap-20 w-full max-w-5xl mx-auto">
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.5em] text-red-600 mb-8">Recently Played</h2>
          {state.history.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {state.history.slice(0, 5).map(song => (
                <SongCard key={song.youtubeId} song={song} />
              ))}
            </div>
          ) : (
            <div className="p-24 bg-white/5 rounded-2xl text-center border border-white/5">
               <Music className="w-12 h-12 mx-auto mb-6 opacity-5 text-red-600" />
               <p className="text-sm font-black uppercase tracking-widest text-white/20">The silence is waiting to be broken</p>
            </div>
          )}
        </div>

        <div>
           <h2 className="text-xs font-black uppercase tracking-[0.5em] text-red-600 mb-8">Essential Collections</h2>
           <div className="grid grid-cols-2 gap-8">
              <div className="group relative p-12 rounded-2xl bg-gradient-to-br from-red-600 to-black overflow-hidden h-72 cursor-pointer shadow-2xl" onClick={() => setActiveView('library')}>
                 <div className="absolute top-0 left-0 w-full h-full bg-black/40 group-hover:bg-transparent transition-all duration-500"></div>
                 <div className="relative z-10 flex flex-col justify-between h-full">
                    <Heart className="w-16 h-16 text-white fill-white shadow-2xl" />
                    <h3 className="text-6xl font-black tracking-tighter text-white">THE<br/>VAULT</h3>
                 </div>
              </div>
              <div className="group relative p-12 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/5 overflow-hidden h-72 cursor-pointer hover:bg-white/10 transition-all shadow-2xl" onClick={() => setSearchQuery('Top 100')}>
                 <div className="relative z-10 flex flex-col justify-between h-full">
                    <Search className="w-16 h-16 text-red-600" />
                    <h3 className="text-6xl font-black tracking-tighter text-white">TOP<br/>PEAKS</h3>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-grow overflow-y-auto bg-[#030303] px-16 py-12">
      <div className="flex items-center justify-between mb-16">
        <div className="flex items-center gap-4">
          <button onClick={() => window.history.back()} className="p-3 bg-white/5 rounded-full text-white/20 hover:text-white hover:bg-white/10 border border-white/5 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => window.history.forward()} className="p-3 bg-white/5 rounded-full text-white/20 hover:text-white hover:bg-white/10 border border-white/5 transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Premium Access</div>
          <button 
            onClick={handleLogin}
            className="flex items-center gap-3 px-8 py-3 bg-white text-black rounded font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-2xl active:scale-95"
          >
            <LogIn className="w-4 h-4" />
            Connect
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={activeView}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
