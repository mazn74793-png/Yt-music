import React from 'react';
import { Home, Search, Library, PlusCircle, Heart, ListMusic } from 'lucide-react';
import { useApp } from '../store';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const { state, dispatch } = useApp();

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'library', icon: Library, label: 'Your Library' },
  ];

  const handleCreatePlaylist = () => {
    const name = prompt('Playlist name?');
    if (name) dispatch({ type: 'CREATE_PLAYLIST', name });
  };

  return (
    <div className="w-64 bg-[#030303] flex-shrink-0 flex flex-col border-r border-white/5 p-8 gap-10">
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-600/20">
          <div className="w-4 h-4 bg-white transform rotate-45"></div>
        </div>
        <span className="text-2xl font-black tracking-tighter text-white">HARMONIX</span>
      </div>

      <nav className="flex flex-col gap-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex items-center gap-4 px-2 py-1 transition-all duration-200 group text-left ${
              activeView === item.id 
                ? 'text-white' 
                : 'text-white/40 hover:text-white'
            }`}
          >
            <item.icon className={`w-5 h-5 ${activeView === item.id ? 'text-red-600' : 'text-current'}`} />
            <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between px-2">
          <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em]">Playlists</span>
          <button onClick={handleCreatePlaylist} className="text-white/20 hover:text-white transition-colors">
            <PlusCircle className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => setActiveView('library')}
            className={`flex items-center gap-4 px-2 py-1 text-white/40 hover:text-white transition-all group ${activeView === 'library' ? 'text-white' : ''}`}
          >
            <Heart className={`w-4 h-4 ${activeView === 'library' ? 'fill-red-600 text-red-600' : ''}`} />
            <span className="text-xs font-bold uppercase tracking-widest">Liked Songs</span>
          </button>

          {state.playlists.map(playlist => (
            <button 
              key={playlist.id}
              onClick={() => setActiveView(`playlist-${playlist.id}`)}
              className="px-2 py-1 text-left text-xs font-bold uppercase tracking-widest text-white/30 hover:text-red-500 truncate transition-all"
            >
              {playlist.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
