import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Maximize2, ListStart } from 'lucide-react';
import { useApp } from '../store';
import { motion } from 'motion/react';

export const Player: React.FC = () => {
  const { state, dispatch } = useApp();
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const playerRef = useRef<any>(null);

  const { currentSong, isPlaying } = state;

  useEffect(() => {
     if (currentSong) {
        document.title = `${currentSong.title} - Harmonix`;
     } else {
        document.title = 'Harmonix';
     }
  }, [currentSong]);

  if (!currentSong) return null;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setPlayed(val);
    playerRef.current?.seekTo(val);
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleNext = () => {
    if (state.queue.length > 0) {
      const nextSong = state.queue[0];
      dispatch({ type: 'SET_CURRENT_SONG', song: nextSong });
      dispatch({ type: 'REMOVE_FROM_QUEUE', index: 0 });
    }
  };

  return (
    <div className="h-28 bg-[#030303] border-t border-white/10 px-10 flex items-center justify-between gap-16 z-50 shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.5)]">
      {/* Hidden Player */}
      <div className="hidden">
        <ReactPlayer
          ref={playerRef}
          url={`https://www.youtube.com/watch?v=${currentSong.youtubeId}`}
          playing={isPlaying}
          volume={volume}
          muted={isMuted}
          onProgress={(p: any) => setPlayed(p.played)}
          onDuration={(d: any) => setDuration(d)}
          onEnded={handleNext}
          config={{
            youtube: {
              playerVars: { autoplay: 1 }
            }
          }}
        />
      </div>

      <div className="flex items-center gap-6 w-1/4 min-w-0">
        <motion.div 
          layoutId="player-art"
          className="w-16 h-16 rounded shadow-2xl bg-white/5 border border-white/10 overflow-hidden"
        >
          <img src={currentSong.thumbnailUrl} alt={currentSong.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        </motion.div>
        <div className="flex flex-col min-w-0">
          <h3 className="text-sm font-black uppercase tracking-tight text-white truncate hover:text-red-500 cursor-pointer transition-colors">{currentSong.title}</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 truncate">
             {currentSong.artists.map(a => a.name).join(', ')}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 flex-grow max-w-2xl px-12">
        <div className="flex items-center gap-10">
          <button className="text-white/20 hover:text-white transition-colors"><Shuffle className="w-4 h-4" /></button>
          <button className="text-white hover:text-red-500 hover:scale-110 active:scale-95 transition-all"><SkipBack className="w-6 h-6 fill-current" /></button>
          <button 
            onClick={() => dispatch({ type: 'SET_PLAYING', isPlaying: !isPlaying })}
            className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-2xl active:scale-90"
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
          </button>
          <button 
            onClick={handleNext}
            className="text-white hover:text-red-500 hover:scale-110 active:scale-95 transition-all"
          >
            <SkipForward className="w-6 h-6 fill-current" />
          </button>
          <button className="text-white/20 hover:text-white transition-colors"><Repeat className="w-4 h-4" /></button>
        </div>
        
        <div className="flex items-center gap-4 w-full">
          <span className="text-[10px] font-black uppercase tracking-widest tabular-nums text-white/20 text-right w-12">{formatTime(played * duration)}</span>
          <div className="relative flex-grow h-[3px] group cursor-pointer">
             <input
                type="range"
                min={0}
                max={0.999999}
                step="any"
                value={played}
                onChange={handleSeekChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
             />
             <div className="absolute inset-0 bg-white/5 rounded-full"></div>
             <div 
               className="absolute inset-0 bg-red-600 rounded-full transition-all" 
               style={{ width: `${played * 100}%` }}
             ></div>
             <div 
               className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity"
               style={{ left: `${played * 100}%`, transform: `translate(-50%, -50%)` }}
             ></div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest tabular-nums text-white/20 w-12 text-left">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-6 w-1/4">
        <button className="text-white/20 hover:text-white transition-colors"><ListStart className="w-5 h-5" /></button>
        <div className="flex items-center gap-3 group max-w-[120px] w-full">
          <button onClick={() => setIsMuted(!isMuted)} className="text-white/20 hover:text-white transition-colors">
            {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <div className="relative flex-grow h-[3px] cursor-pointer">
            <input
              type="range"
              min={0}
              max={1}
              step="any"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="absolute inset-0 bg-white/5 rounded-full"></div>
            <div className="absolute inset-0 bg-white/40 rounded-full group-hover:bg-red-600" style={{ width: `${volume * 100}%` }}></div>
          </div>
        </div>
        <button className="text-white/20 hover:text-white transition-colors"><Maximize2 className="w-5 h-5" /></button>
      </div>
    </div>
  );
};
