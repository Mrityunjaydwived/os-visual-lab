// Clean, User-Friendly Footer Component for OS Visual Lab
import React from 'react';
import { useAppStore } from '../../core/store/useStore';
import { Cpu, Terminal, Shield, Award, BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setSection } = useAppStore();

  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 py-12 mt-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">
                OS Visual Lab
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              An interactive 3D and 2D virtual laboratory engineered to build deep intuition for Operating Systems, practical experimentation, and rigorous GATE CS preparation.
            </p>
            <div className="text-[11px] text-slate-500 font-normal">
              Concept • Simulation • Practical • GATE
            </div>
          </div>

          {/* Quick Curriculum */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              Core Curriculum
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => setSection('VISUAL_LAB', 'cpu_scheduler')} className="hover:text-white transition-colors cursor-pointer text-slate-400">
                  CPU Scheduling Lab
                </button>
              </li>
              <li>
                <button onClick={() => setSection('VISUAL_LAB', 'synchronization')} className="hover:text-white transition-colors cursor-pointer text-slate-400">
                  Process Synchronization &amp; Semaphores
                </button>
              </li>
              <li>
                <button onClick={() => setSection('VISUAL_LAB', 'bankers_deadlock')} className="hover:text-white transition-colors cursor-pointer text-slate-400">
                  Deadlock RAG &amp; Banker's Algorithm
                </button>
              </li>
              <li>
                <button onClick={() => setSection('VISUAL_LAB', 'paging_tlb')} className="hover:text-white transition-colors cursor-pointer text-slate-400">
                  Paging &amp; TLB Address Translation
                </button>
              </li>
              <li>
                <button onClick={() => setSection('VISUAL_LAB', 'cache_hierarchy')} className="hover:text-white transition-colors cursor-pointer text-slate-400">
                  Cache Hierarchy &amp; AMAT
                </button>
              </li>
              <li>
                <button onClick={() => setSection('VISUAL_LAB', 'disk_scheduling')} className="hover:text-white transition-colors cursor-pointer text-slate-400">
                  Disk Scheduling (SCAN, C-LOOK)
                </button>
              </li>
            </ul>
          </div>

          {/* Practical & GATE */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Exams &amp; Practice
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => setSection('GATE_ARENA')} className="hover:text-white transition-colors cursor-pointer text-slate-400">
                  GATE Question Bank (Levels 1 - 6)
                </button>
              </li>
              <li>
                <button onClick={() => setSection('NUMERICAL_LAB')} className="hover:text-white transition-colors cursor-pointer text-slate-400">
                  Dynamic Numerical Workspace
                </button>
              </li>
              <li>
                <button onClick={() => setSection('PRACTICAL_LAB')} className="hover:text-white transition-colors cursor-pointer text-slate-400">
                  Virtual OS Experiments Lab
                </button>
              </li>
              <li>
                <button onClick={() => setSection('SYSTEM_SIMULATOR')} className="hover:text-white transition-colors cursor-pointer text-slate-400">
                  OS In Action Full System Sandbox
                </button>
              </li>
              <li>
                <button onClick={() => setSection('CHALLENGE_ARENA')} className="hover:text-white transition-colors cursor-pointer text-slate-400">
                  7 Interactive OS Games
                </button>
              </li>
            </ul>
          </div>

          {/* Product Philosophy & Specs */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              Engine Specifications
            </h4>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-[11px] font-mono space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Execution:</span>
                <span className="text-emerald-400 font-medium">Deterministic</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Visual Engine:</span>
                <span className="text-blue-400 font-medium">Three.js + Canvas2D</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Curriculum:</span>
                <span className="text-slate-300 font-medium">24 Modules</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Platform:</span>
                <span className="text-amber-400 font-medium">Client-Side Zero Tracking</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2.5 flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-slate-400" />
              100% Client-Side Local Storage. Zero Telemetry.
            </p>
          </div>

        </div>

        {/* Copyright & Accreditations */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} OS Visual Lab. Designed for Computer Science Education &amp; GATE OS Aspirants.</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Concept → Simulation → Numerical → GATE</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
