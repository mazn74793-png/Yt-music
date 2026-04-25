/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AppProvider } from './store';
import { Sidebar } from './components/Sidebar';
import { MainView } from './components/MainView';
import { Player } from './components/Player';

export default function App() {
  const [activeView, setActiveView] = useState('home');

  const setAndStoreView = (view: string) => {
    setActiveView(view);
  };

  return (
    <AppProvider>
      <div className="flex flex-col h-screen bg-black text-white select-none overflow-hidden selection:bg-orange-500/30">
        <div className="flex flex-grow min-h-0">
          <Sidebar activeView={activeView} setActiveView={setAndStoreView} />
          <MainView activeView={activeView} setActiveView={setAndStoreView} />
        </div>
        <Player />
      </div>
    </AppProvider>
  );
}
