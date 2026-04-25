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
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-orange-500 transition-colors" />
            <input
              autoFocus
              type="text"
              placeholder="Search for songs, artists, or albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-lg text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
              {isSearching ? (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex py-12 justify-center">
                    <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                 </motion.div>
              ) : searchResults.length > 0 ? (
                searchResults.map((song) => (
                  <SongCard key={song.youtubeId} song={song} />
                ))
              ) : searchQuery && !isSearching ? (
                 <div className="py-20 text-center text-white/30">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No results found for "{searchQuery}"</p>
                 </div>
              ) : (
                <div className="py-20 text-center text-white/30">
                  <Music className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Start searching for your favorite music</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      );
    }

    if (activeView === 'library') {
      return (
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
          <div className="flex items-end gap-6 mb-4">
             <div className="w-48 h-48 bg-gradient-to-br from-orange-500 to-rose-600 rounded-3xl shadow-2xl flex items-center justify-center">
                <Heart className="w-20 h-20 text-white fill-white shadow-inner" />
             </div>
             <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Playlist</span>
                <h1 className="text-6xl font-black tracking-tighter text-white">Liked Songs</h1>
                <p className="text-sm text-white/60 font-medium">{state.library.length} songs • Saved to your library</p>
             </div>
          </div>
          
          <div className="flex flex-col gap-1 mt-8">
            {state.library.map((song, i) => (
              <SongCard key={song.youtubeId} song={song} index={i + 1} />
            ))}
            {state.library.length === 0 && (
              <div className="py-20 text-center text-white/30 dashed border-2 border-white/5 rounded-3xl">
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Your library is empty. Like some songs to see them here.</p>
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
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
          <div className="flex items-end gap-6 mb-4">
             <div className="w-48 h-48 bg-white/5 rounded-3xl shadow-2xl flex items-center justify-center border border-white/10 group overflow-hidden relative">
                {playlist.songs[0]?.thumbnailUrl ? (
                   <img src={playlist.songs[0].thumbnailUrl} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <ListMusic className="w-20 h-20 text-white/20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
             </div>
             <div className="flex flex-col gap-2 z-10">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Playlist</span>
                <h1 className="text-6xl font-black tracking-tighter text-white">{playlist.name}</h1>
                <p className="text-sm text-white/60 font-medium">{playlist.songs.length} songs • {new Date(playlist.createdAt).toLocaleDateString()}</p>
             </div>
          </div>

          <div className="flex flex-col gap-1 mt-8">
            {playlist.songs.map((song, i) => (
              <SongCard key={song.youtubeId} song={song} index={i + 1} />
            ))}
            {playlist.songs.length === 0 && (
               <div className="py-20 text-center text-white/30 dashed border-2 border-white/5 rounded-3xl">
                 <p>This playlist is empty. Add some songs from search results.</p>
               </div>
            )}
          </div>
        </div>
      );
    }

    // Default Home
    return (
      <div className="flex flex-col gap-12 w-full max-w-4xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Recently Played</h2>
          {state.history.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {state.history.slice(0, 5).map(song => (
                <SongCard key={song.youtubeId} song={song} />
              ))}
            </div>
          ) : (
            <div className="p-12 bg-white/5 rounded-3xl text-center border border-white/10">
               <Music className="w-10 h-10 mx-auto mb-4 opacity-20 text-orange-500" />
               <p className="text-white/40 font-medium">Your history will appear here</p>
            </div>
          )}
        </div>

        <div>
           <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Quick Picks</h2>
           <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-800 flex flex-col justify-between h-48 cursor-pointer hover:scale-[1.02] transition-all" onClick={() => setActiveView('library')}>
                 <Heart className="w-10 h-10 text-white fill-white" />
                 <h3 className="text-2xl font-bold text-white">Liked Songs</h3>
              </div>
              <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-500 to-rose-600 flex flex-col justify-between h-48 cursor-pointer hover:scale-[1.02] transition-all" onClick={() => setSearchQuery('Latest Hits')}>
                 <Search className="w-10 h-10 text-white" />
                 <h3 className="text-2xl font-bold text-white">Top Hits</h3>
              </div>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-grow overflow-y-auto bg-gradient-to-b from-[#1a1a1a] to-black overscroll-none px-12 py-8">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-2">
          <button onClick={() => window.history.back()} className="p-2 bg-black/40 rounded-full text-white/50 hover:text-white hover:bg-black/60 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => window.history.forward()} className="p-2 bg-black/40 rounded-full text-white/50 hover:text-white hover:bg-black/60 transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleLogin}
            className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded-full text-sm font-bold hover:scale-105 transition-all shadow-lg active:scale-95"
          >
            <LogIn className="w-4 h-4" />
            Connect YouTube
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
