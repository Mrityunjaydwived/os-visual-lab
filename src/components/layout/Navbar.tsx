// Clean, User-Friendly Navigation Bar for OS Visual Lab
import React, { useState, useRef, useEffect } from 'react';
import { useAppStore, type AppSection } from '../../core/store/useStore';
import { 
  Cpu, 
  BookOpen, 
  Eye, 
  Sliders, 
  FlaskConical, 
  Calculator, 
  Award, 
  Globe, 
  Gamepad2, 
  Server, 
  TrendingUp, 
  Search, 
  Box, 
  Layers, 
  ChevronDown,
  Flame,
  Menu,
  X
} from 'lucide-react';

interface NavItem {
  section: AppSection;
  label: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const Navbar: React.FC = () => {
  const { 
    section, 
    setSection, 
    renderMode, 
    toggleRenderMode, 
    setSearchOpen, 
    progress 
  } = useAppStore();

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  // Primary navigation tabs
  const primaryNavItems: NavItem[] = [
    { section: 'HOME', label: 'Home', icon: Cpu },
    { section: 'LEARN', label: 'Curriculum', badge: '24', icon: BookOpen },
    { section: 'VISUAL_LAB', label: 'Visual Lab', badge: '10', icon: Eye },
    { section: 'GATE_ARENA', label: 'GATE Arena', icon: Award },
    { section: 'CHALLENGE_ARENA', label: 'OS Games', badge: '7', icon: Gamepad2 },
  ];

  // Secondary modules grouped under "More"
  const secondaryNavItems: NavItem[] = [
    { section: 'ALGORITHM_LAB', label: 'Shootout Arena', icon: Sliders },
    { section: 'PRACTICAL_LAB', label: 'Practical Lab (5 Experiments)', icon: FlaskConical },
    { section: 'NUMERICAL_LAB', label: 'Numerical Workspace', icon: Calculator },
    { section: 'REAL_WORLD', label: 'Engineering Incident Studies', icon: Globe },
    { section: 'SYSTEM_SIMULATOR', label: 'OS In Action (Full Sandbox)', icon: Server },
    { section: 'PROGRESS', label: 'Mastery & Skill Radar', icon: TrendingUp },
  ];

  const isSecondaryActive = secondaryNavItems.some(item => item.section === section);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0A0F1D]/90 backdrop-blur-xl border-b border-slate-800/80 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* LEFT: Brand Logo */}
          <div 
            onClick={() => {
              setSection('HOME');
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
              <Cpu className="w-5 h-5" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white tracking-tight">
                  OS Visual Lab
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] font-mono font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                  Interactive
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-normal leading-none hidden sm:inline">
                Concept • Simulation • GATE
              </span>
            </div>
          </div>

          {/* CENTER: Primary Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            {primaryNavItems.map(item => {
              const active = section === item.section;
              const IconComponent = item.icon;

              return (
                <button
                  key={item.section}
                  onClick={() => setSection(item.section)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <IconComponent className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      active ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* "More" Dropdown Menu */}
            <div className="relative" ref={moreDropdownRef}>
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isSecondaryActive || isMoreOpen
                    ? 'bg-slate-800 text-blue-400 border border-slate-700 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>More</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMoreOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-0.5">
                  <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                    Advanced Modules & Practice
                  </div>
                  {secondaryNavItems.map(item => {
                    const active = section === item.section;
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.section}
                        onClick={() => {
                          setSection(item.section);
                          setIsMoreOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                          active
                            ? 'bg-blue-600 text-white font-medium'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <IconComponent className={`w-4 h-4 ${active ? 'text-white' : 'text-blue-400'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* RIGHT: Quick Utility Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Quick Command Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
              title="Search OS Modules, Simulators & GATE questions (Ctrl + K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline font-normal text-slate-400">Search</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-400">
                ⌘K
              </kbd>
            </button>

            {/* 3D vs 2D Toggle Switch */}
            <button
              onClick={toggleRenderMode}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono transition-colors cursor-pointer"
              title={`Active Graphics Engine: ${renderMode === '3d' ? '3D WebGL' : '2D Canvas'}`}
            >
              {renderMode === '3d' ? (
                <>
                  <Box className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-semibold text-slate-200">3D</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold text-slate-200">2D</span>
                </>
              )}
            </button>

            {/* Learner Level & XP Status Pill */}
            <div 
              onClick={() => setSection('PROGRESS')}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-mono transition-colors cursor-pointer"
              title={`Level ${progress.level} • ${progress.xp} XP Earned. View Skill Radar`}
            >
              <span className="px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-[10px]">
                L{progress.level}
              </span>
              <span className="hidden sm:inline text-slate-300 font-semibold">
                {progress.xp} <span className="text-[10px] text-slate-500 font-normal">XP</span>
              </span>
              {progress.streakDays > 0 && (
                <span className="hidden md:flex items-center gap-0.5 text-amber-400 text-[10px]">
                  <Flame className="w-3 h-3 fill-current" />
                  {progress.streakDays}d
                </span>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-800 grid grid-cols-2 gap-1.5 animate-in slide-in-from-top-2 duration-150 font-sans">
            {[...primaryNavItems, ...secondaryNavItems].map(item => {
              const active = section === item.section;
              const IconComponent = item.icon;
              return (
                <button
                  key={item.section}
                  onClick={() => {
                    setSection(item.section);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                    active 
                      ? 'bg-blue-600 text-white font-medium' 
                      : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <IconComponent className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

      </div>
    </header>
  );
};
