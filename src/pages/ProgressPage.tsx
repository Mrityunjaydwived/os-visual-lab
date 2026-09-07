// Progress Dashboard & Skill Mastery Radar Page
import React, { useState } from 'react';
import { useAppStore } from '../core/store/useStore';
import { 
  TrendingUp, 
  Award, 
  Shield, 
  Download, 
  Upload, 
  BookOpen, 
  FlaskConical, 
  Gamepad2
} from 'lucide-react';

export const ProgressPage: React.FC = () => {
  const { 
    progress, 
    exportProgressJson, 
    importProgressJson 
  } = useAppStore();

  const [importText, setImportText] = useState<string>('');
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Next level threshold
  const xpForNextLevel = progress.level * 500;
  const currentLevelBase = (progress.level - 1) * 500;
  const levelProgressPercent = Math.min(100, Math.round(((progress.xp - currentLevelBase) / 500) * 100));

  // Domain skills estimates
  const domainSkills = [
    { name: 'CPU Scheduling & Processes', mastery: Math.min(100, 45 + progress.completedModules.length * 4) },
    { name: 'Synchronization & Concurrency', mastery: Math.min(100, 35 + progress.completedExperiments.length * 15) },
    { name: 'Memory Management & Paging', mastery: Math.min(100, 50 + progress.solvedGateQuestions.length * 6) },
    { name: 'Cache Hierarchy & AMAT', mastery: Math.min(100, 60 + (progress.gameScores['game_cache_master'] ? 30 : 0)) },
    { name: 'Disk Scheduling & Storage', mastery: Math.min(100, 55 + progress.completedScenarios.length * 10) },
    { name: 'Security, Virtualization & RTOS', mastery: Math.min(100, 40 + progress.level * 12) },
  ];

  const handleExport = () => {
    const json = exportProgressJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `os_visual_lab_progress_level_${progress.level}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const ok = importProgressJson(importText);
    if (ok) {
      setImportStatus('Progress imported successfully!');
      setTimeout(() => {
        setShowImportModal(false);
        setImportStatus(null);
      }, 1200);
    } else {
      setImportStatus('Invalid JSON format. Please check and try again.');
    }
  };

  return (
    <div className="space-y-6 py-4">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            Skill Mastery & Progress Telemetry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track your Operating Systems mastery level, earned badges, and exam readiness
          </p>
        </div>

        {/* Data Backup Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Backup</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            <span>Import Backup</span>
          </button>
        </div>
      </div>

      {/* Main Profile & Level Overview Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-slate-900/80 border border-cyan-500/30 backdrop-blur-md shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-2xl font-black text-cyan-300 shadow-[0_0_25px_rgba(0,240,255,0.4)]">
              L{progress.level}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-100">OS Systems Engineer</span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 font-bold uppercase">
                  Ring 0 Privileged
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Current Experience: <strong className="text-cyan-300">{progress.xp} XP</strong> • Level {progress.level}
              </p>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="text-xs text-slate-400 block">Streak Activity</span>
            <span className="text-xl font-bold text-emerald-400">{progress.streakDays} Days Consecutive 🔥</span>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="space-y-1.5 font-mono text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Level {progress.level} ({currentLevelBase} XP)</span>
            <span className="text-cyan-300 font-bold">{progress.xp} / {xpForNextLevel} XP to Level {progress.level + 1}</span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-purple-500 transition-all duration-500 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
              style={{ width: `${levelProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Skills Radar & Mastery Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Domain Skills Bars */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            Curriculum Domain Mastery
          </h3>

          <div className="space-y-3.5 font-mono text-xs">
            {domainSkills.map((skill, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>{skill.name}</span>
                  <span className="text-cyan-300 font-bold">{skill.mastery}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${skill.mastery}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone Statistics Cards */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 font-mono text-center">
              <BookOpen className="w-5 h-5 mx-auto text-cyan-400 mb-2" />
              <span className="text-[10px] text-slate-500 uppercase block">Modules Completed</span>
              <span className="text-2xl font-bold text-cyan-300 my-1">{progress.completedModules.length}</span>
              <span className="text-[10px] text-slate-400 block">out of 24 modules</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 font-mono text-center">
              <FlaskConical className="w-5 h-5 mx-auto text-emerald-400 mb-2" />
              <span className="text-[10px] text-slate-500 uppercase block">Labs Certified</span>
              <span className="text-2xl font-bold text-emerald-300 my-1">{progress.completedExperiments.length}</span>
              <span className="text-[10px] text-slate-400 block">formal experiments</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 font-mono text-center">
              <Award className="w-5 h-5 mx-auto text-purple-400 mb-2" />
              <span className="text-[10px] text-slate-500 uppercase block">GATE Solved</span>
              <span className="text-2xl font-bold text-purple-300 my-1">{progress.solvedGateQuestions.length}</span>
              <span className="text-[10px] text-slate-400 block">verified questions</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 font-mono text-center">
              <Gamepad2 className="w-5 h-5 mx-auto text-rose-400 mb-2" />
              <span className="text-[10px] text-slate-500 uppercase block">Games Played</span>
              <span className="text-2xl font-bold text-rose-300 my-1">{Object.keys(progress.gameScores).length}</span>
              <span className="text-[10px] text-slate-400 block">high scores logged</span>
            </div>

          </div>
        </div>

      </div>

      {/* Earned Badges Showcase */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          Earned Badges & Academic Honors
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {progress.badges.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 text-center font-mono space-y-2 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto text-amber-300">
                <Award className="w-6 h-6" />
              </div>
              <div className="font-bold text-xs text-slate-100">{b.title}</div>
              <span className="text-[10px] text-slate-500 block">Awarded: {b.dateAwarded}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#090e1b] border border-purple-500/40 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100 font-mono">
              Import Progress Backup JSON
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Paste previously exported OS Visual Lab JSON data below:
            </p>
            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              rows={6}
              placeholder="Paste JSON here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-purple-400"
            />
            {importStatus && (
              <div className="text-xs font-mono text-cyan-300">{importStatus}</div>
            )}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-black font-bold text-xs cursor-pointer"
              >
                Apply Import
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
