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
    <div className="w-64 bg-black flex-shrink-0 flex flex-col border-r border-white/10 p-6 gap-8">
      <div className="flex items-center gap-3 px-2">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
          <ListMusic className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">Harmonix</span>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeView === item.id 
                ? 'bg-orange-500/10 text-orange-500' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-4">
          <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Your Collection</span>
          <button onClick={handleCreatePlaylist} className="text-white/30 hover:text-white transition-colors">
            <PlusCircle className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex flex-col gap-1">
          <button 
            onClick={() => setActiveView('library')}
            className={`flex items-center gap-4 px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all group ${activeView === 'library' ? 'text-white' : ''}`}
          >
            <Heart className={`w-4 h-4 ${activeView === 'library' ? 'fill-orange-500 text-orange-500' : 'group-hover:text-orange-500'}`} />
            <span className="text-sm font-medium">Liked Songs</span>
          </button>

          {state.playlists.map(playlist => (
            <button 
              key={playlist.id}
              onClick={() => setActiveView(`playlist-${playlist.id}`)}
              className="px-4 py-2 text-left text-sm text-white/50 hover:text-white truncate transition-all"
            >
              {playlist.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
