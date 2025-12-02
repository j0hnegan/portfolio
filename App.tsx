import React, { useState } from 'react';
import { ProjectProvider } from './context/ProjectContext';
import { InfiniteCanvas } from './components/InfiniteCanvas';
import { ContactCanvas } from './components/ContactCanvas';
import { CMS } from './components/CMS';

function AppContent() {
  const [view, setView] = useState<'work' | 'contact' | 'cms'>('work');

  return (
    <div className="w-screen h-screen overflow-hidden bg-zinc-950 text-zinc-50">
      {view === 'work' && (
        <InfiniteCanvas onNavigate={setView} />
      )}
      {view === 'contact' && (
        <ContactCanvas onNavigate={setView} />
      )}
      {view === 'cms' && (
        <CMS onExit={() => setView('work')} />
      )}
    </div>
  );
}

function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}

export default App;