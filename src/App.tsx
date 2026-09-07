// Main Application Entry Component for OS Visual Lab
import React from 'react';
import { useAppStore } from './core/store/useStore';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { SearchModal } from './components/search/SearchModal';
import { HomePage } from './pages/HomePage';
import { LearnPage } from './pages/LearnPage';
import { VisualLabPage } from './pages/VisualLabPage';
import { AlgorithmLabPage } from './pages/AlgorithmLabPage';
import { PracticalLabPage } from './pages/PracticalLabPage';
import { GateArenaPage } from './pages/GateArenaPage';
import { RealWorldPage } from './pages/RealWorldPage';
import { ChallengeArenaPage } from './pages/ChallengeArenaPage';
import { SystemSimulatorPage } from './pages/SystemSimulatorPage';
import { ProgressPage } from './pages/ProgressPage';
import { NumericalWorkspace } from './components/numerical/NumericalWorkspace';

export const App: React.FC = () => {
  const { section } = useAppStore();

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-slate-100 flex flex-col antialiased">
      
      {/* Global Navbar */}
      <Navbar />

      {/* Global Quick Search Modal (Ctrl + K) */}
      <SearchModal />

      {/* Subtle Ambient Lighting */}
      <div className="fixed top-0 left-1/3 w-[600px] h-[300px] bg-blue-600/[0.04] rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Routed Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        {section === 'HOME' && <HomePage />}
        {section === 'LEARN' && <LearnPage />}
        {section === 'VISUAL_LAB' && <VisualLabPage />}
        {section === 'ALGORITHM_LAB' && <AlgorithmLabPage />}
        {section === 'PRACTICAL_LAB' && <PracticalLabPage />}
        {section === 'NUMERICAL_LAB' && <NumericalWorkspace />}
        {section === 'GATE_ARENA' && <GateArenaPage />}
        {section === 'REAL_WORLD' && <RealWorldPage />}
        {section === 'CHALLENGE_ARENA' && <ChallengeArenaPage />}
        {section === 'SYSTEM_SIMULATOR' && <SystemSimulatorPage />}
        {section === 'PROGRESS' && <ProgressPage />}
      </main>

      {/* Global Footer */}
      <Footer />

    </div>
  );
};

export default App;
