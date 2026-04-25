import React from 'react';
import { Play, MoreVertical, Plus, Heart, Music2, Clock } from 'lucide-react';
import { Song } from '../types';
import { useApp } from '../store';
import { motion } from 'motion/react';

interface SongCardProps {
  song: Song;
  index?: number;
  showIndex?: boolean;
}

export const SongCard: React.FC<SongCardProps> = ({ song, index, showIndex }) => {
  const { state, dispatch } = useApp();
  const isCurrent = state.currentSong?.youtubeId === song.youtubeId;
  const isInLibrary = state.library.some(s => s.youtubeId === song.youtubeId);

  const handlePlay = () => {
    dispatch({ type: 'SET_CURRENT_SONG', song });
  };

  const toggleLibrary = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_LIBRARY', song });
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={handlePlay}
      className={`group flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all border ${
        isCurrent ? 'bg-red-600/5 border-red-600/50' : 'hover:bg-white/5 border-transparent'
      }`}
    >
      <div className="relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-white/5 shadow-lg">
        {song.thumbnailUrl ? (
          <img src={song.thumbnailUrl} alt={song.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
             <Music2 className="text-white/20" />
          </div>
        )}
        <div className={`absolute inset-0 bg-black/40 items-center justify-center group-hover:flex hidden ${isCurrent && state.isPlaying ? 'flex' : ''}`}>
           <Play className={`w-5 h-5 text-red-600 fill-red-600 ${isCurrent && state.isPlaying ? 'animate-pulse' : ''}`} />
        </div>
      </div>

      <div className="flex-grow min-w-0">
        <h4 className={`text-sm font-bold uppercase tracking-tight truncate ${isCurrent ? 'text-red-500' : 'text-white'}`}>{song.title}</h4>
        <p className="text-[10px] uppercase font-black tracking-widest text-white/30 truncate">
          {song.artists.map(a => a.name).join(', ')} {song.album ? `• ${song.album}` : ''}
        </p>
      </div>

      <div className="flex items-center gap-3 text-white/20">
        <button 
          onClick={toggleLibrary}
          className={`transition-colors flex items-center justify-center ${isInLibrary ? 'text-red-500' : 'hover:text-white'}`}
        >
          <Heart className={`w-4 h-4 ${isInLibrary ? 'fill-red-500' : ''}`} />
        </button>
        <span className="text-[10px] font-mono tabular-nums w-10 text-right opacity-40">
          {song.duration?.label || '0:00'}
        </span>
        <button className="hover:text-white transition-colors opacity-0 group-hover:opacity-100">
          <Plus className="w-4 h-4" onClick={(e) => {
             e.stopPropagation();
             dispatch({ type: 'ADD_TO_QUEUE', song });
          }} />
        </button>
      </div>
    </motion.div>
  );
};
