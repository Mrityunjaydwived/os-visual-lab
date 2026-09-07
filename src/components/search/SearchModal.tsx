// Global Instant Search Modal
import React, { useState, useEffect, useRef } from 'react';
import { useAppStore, type VisualLabTab } from '../../core/store/useStore';
import { CURRICULUM_MODULES } from '../../core/curriculum/modulesData';
import { GATE_QUESTION_BANK } from '../../core/gate/questionBank';
import { REAL_WORLD_SCENARIOS } from '../../core/scenarios/realWorldData';
import { OS_GAMES } from '../../core/games/gamesData';
import { Search, X, BookOpen, Eye, Award, Globe, Gamepad2, ArrowRight } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'MODULE' | 'VISUALIZER' | 'GATE' | 'SCENARIO' | 'GAME';
  title: string;
  subtitle: string;
  badge: string;
  action: () => void;
}

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setSearchOpen, setSection, setSelectedModule, setVisualLabTab } = useAppStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(!isSearchOpen);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  // Search indexing
  const q = query.trim().toLowerCase();
  const results: SearchResult[] = [];

  // 1. Modules
  CURRICULUM_MODULES.forEach(m => {
    const match = 
      m.title.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.topics.some(t => t.toLowerCase().includes(q));

    if (!q || match) {
      results.push({
        id: m.id,
        type: 'MODULE',
        title: `Module ${m.number}: ${m.title}`,
        subtitle: m.description.slice(0, 80) + '...',
        badge: m.category,
        action: () => {
          setSelectedModule(m.id);
          setSearchOpen(false);
        }
      });
    }
  });

  // 2. Visualizers
  const visualizers: { id: VisualLabTab; title: string; desc: string }[] = [
    { id: 'cpu_scheduler', title: 'CPU Scheduling Simulator', desc: 'Gantt chart, FCFS, SJF, SRTF, RR, Priority, MLFQ' },
    { id: 'paging_tlb', title: 'Paging & TLB Address Translation', desc: 'Virtual address breakdown, page table lookup, EMAT' },
    { id: 'page_replacement', title: 'Page Replacement Laboratory', desc: 'FIFO, LRU, Optimal, Clock, Beladys Anomaly' },
    { id: 'cache_hierarchy', title: 'Cache Memory & AMAT Simulator', desc: 'Direct, set-associative, Tag/Index/Offset, AMAT' },
    { id: 'bankers_deadlock', title: 'Deadlock RAG & Bankers Algorithm', desc: 'Cycle detection, safe sequences, Coffman conditions' },
    { id: 'synchronization', title: 'Process Synchronization Lab', desc: 'Producer-Consumer, Readers-Writers, Dining Philosophers' },
    { id: 'disk_scheduling', title: 'Disk Scheduling Simulator', desc: '3D Platter, FCFS, SSTF, SCAN, C-LOOK, Seek time' },
    { id: 'memory_allocation', title: 'Contiguous Memory Allocation', desc: 'First Fit, Best Fit, Worst Fit, Fragmentation' },
    { id: 'dma_interrupt', title: 'DMA & Interrupt Controller', desc: 'Hardware interrupts, IVT, ISR, cycle stealing' },
    { id: 'rtos_scheduler', title: 'Real-Time OS Scheduler (RMS / EDF)', desc: 'Liu-Layland bound, deadline monitoring, task periods' },
  ];

  visualizers.forEach(v => {
    if (!q || v.title.toLowerCase().includes(q) || v.desc.toLowerCase().includes(q)) {
      results.push({
        id: v.id,
        type: 'VISUALIZER',
        title: v.title,
        subtitle: v.desc,
        badge: 'Interactive Lab',
        action: () => {
          setVisualLabTab(v.id);
          setSearchOpen(false);
        }
      });
    }
  });

  // 3. GATE Questions
  GATE_QUESTION_BANK.forEach(g => {
    if (q && (g.question.toLowerCase().includes(q) || g.topicName.toLowerCase().includes(q) || g.conceptTested.toLowerCase().includes(q))) {
      results.push({
        id: g.id,
        type: 'GATE',
        title: `GATE: ${g.topicName} — ${g.conceptTested}`,
        subtitle: g.question.slice(0, 90) + '...',
        badge: g.difficulty.replace('_', ' '),
        action: () => {
          setSection('GATE_ARENA');
          setSearchOpen(false);
        }
      });
    }
  });

  // 4. Real-World Scenarios
  REAL_WORLD_SCENARIOS.forEach(s => {
    if (!q || s.title.toLowerCase().includes(q) || s.industry.toLowerCase().includes(q)) {
      results.push({
        id: s.id,
        type: 'SCENARIO',
        title: s.title,
        subtitle: s.context.slice(0, 80) + '...',
        badge: s.badge,
        action: () => {
          setSection('REAL_WORLD');
          setSearchOpen(false);
        }
      });
    }
  });

  // 5. Games
  OS_GAMES.forEach(game => {
    if (!q || game.title.toLowerCase().includes(q) || game.codename.toLowerCase().includes(q)) {
      results.push({
        id: game.id,
        type: 'GAME',
        title: `Game: ${game.title} [${game.codename}]`,
        subtitle: game.objective,
        badge: `${game.xpReward} XP`,
        action: () => {
          setSection('CHALLENGE_ARENA');
          setSearchOpen(false);
        }
      });
    }
  });

  const displayResults = results.slice(0, 12);

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'MODULE': return <BookOpen className="w-4 h-4 text-blue-400" />;
      case 'VISUALIZER': return <Eye className="w-4 h-4 text-blue-400" />;
      case 'GATE': return <Award className="w-4 h-4 text-amber-400" />;
      case 'SCENARIO': return <Globe className="w-4 h-4 text-emerald-400" />;
      case 'GAME': return <Gamepad2 className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/70">
          <Search className="w-5 h-5 text-blue-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search concepts, algorithms, LRU, Banker's, TLB, GATE questions..."
            className="w-full bg-transparent border-none outline-none text-white placeholder-slate-500 text-sm font-normal"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={() => setSearchOpen(false)}
            className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-1.5 flex-1">
          {displayResults.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
              <p className="text-sm">No matching OS concepts or questions found.</p>
              <p className="text-xs text-slate-500 mt-1">Try searching for "LRU", "Gantt", "Deadlock", "Banker", or "Cache".</p>
            </div>
          ) : (
            displayResults.map(item => (
              <div
                key={`${item.type}_${item.id}`}
                onClick={item.action}
                className="group flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 rounded-lg bg-slate-800 group-hover:bg-slate-700 border border-slate-700/60 transition-colors">
                    {getTypeIcon(item.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0 ml-3" />
              </div>
            ))
          )}
        </div>

        {/* Modal Footer Keybind Info */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Tip: Use <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">↑</kbd> <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">↓</kbd> to navigate, <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">Enter</kbd> to select</span>
          <span className="text-blue-400 font-medium">{displayResults.length} matches indexed</span>
        </div>
      </div>
    </div>
  );
};
