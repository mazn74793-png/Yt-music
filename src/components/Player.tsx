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
    <div className="h-24 bg-black/90 backdrop-blur-2xl border-t border-white/5 px-6 flex items-center justify-between gap-12 z-50">
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

      <div className="flex items-center gap-4 w-1/3 min-w-0">
        <motion.div 
          layoutId="player-art"
          className="w-14 h-14 rounded-xl overflow-hidden shadow-2xl bg-white/5"
        >
          <img src={currentSong.thumbnailUrl} alt={currentSong.title} className="w-full h-full object-cover" />
        </motion.div>
        <div className="flex flex-col min-w-0">
          <h3 className="text-sm font-bold text-white truncate hover:underline cursor-pointer">{currentSong.title}</h3>
          <p className="text-[11px] text-white/50 truncate">
             {currentSong.artists.map(a => a.name).join(', ')}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 flex-grow max-w-xl">
        <div className="flex items-center gap-6">
          <button className="text-white/40 hover:text-white transition-colors"><Shuffle className="w-4 h-4" /></button>
          <button className="text-white hover:scale-110 active:scale-95 transition-all"><SkipBack className="w-5 h-5 fill-current" /></button>
          <button 
            onClick={() => dispatch({ type: 'SET_PLAYING', isPlaying: !isPlaying })}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 active:scale-90 transition-all shadow-xl"
          >
            {isPlaying ? <Pause className="text-black w-5 h-5 fill-current" /> : <Play className="text-black w-5 h-5 fill-current ml-1" />}
          </button>
          <button 
            onClick={handleNext}
            className="text-white hover:scale-110 active:scale-95 transition-all"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
          <button className="text-white/40 hover:text-white transition-colors"><Repeat className="w-4 h-4" /></button>
        </div>
        
        <div className="flex items-center gap-3 w-full">
          <span className="text-[10px] font-mono p-1 tabular-nums text-white/30 text-right w-10">{formatTime(played * duration)}</span>
          <div className="relative flex-grow h-1 group cursor-pointer">
             <input
                type="range"
                min={0}
                max={0.999999}
                step="any"
                value={played}
                onChange={handleSeekChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
             />
             <div className="absolute inset-0 bg-white/10 rounded-full"></div>
             <div 
               className="absolute inset-0 bg-white rounded-full transition-all group-hover:bg-orange-500" 
               style={{ width: `${played * 100}%` }}
             ></div>
             <div 
               className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
               style={{ left: `${played * 100}%`, transform: `translate(-50%, -50%)` }}
             ></div>
          </div>
          <span className="text-[10px] font-mono tabular-nums text-white/30 w-10 text-left">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 w-1/3">
        <button className="text-white/40 hover:text-white transition-colors"><ListStart className="w-4 h-4" /></button>
        <div className="flex items-center gap-2 group max-w-[120px] w-full">
          <button onClick={() => setIsMuted(!isMuted)} className="text-white/40 hover:text-white transition-colors">
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <div className="relative flex-grow h-1 cursor-pointer">
            <input
              type="range"
              min={0}
              max={1}
              step="any"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="absolute inset-0 bg-white/10 rounded-full"></div>
            <div className="absolute inset-0 bg-white/60 rounded-full group-hover:bg-orange-500" style={{ width: `${volume * 100}%` }}></div>
          </div>
        </div>
        <button className="text-white/40 hover:text-white transition-colors"><Maximize2 className="w-4 h-4" /></button>
      </div>
    </div>
  );
};
