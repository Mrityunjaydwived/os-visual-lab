// Reactive Global Application Store with LocalStorage Persistence
import { useSyncExternalStore } from 'react';

export type AppSection = 
  | 'HOME'
  | 'LEARN'
  | 'VISUAL_LAB'
  | 'ALGORITHM_LAB'
  | 'PRACTICAL_LAB'
  | 'NUMERICAL_LAB'
  | 'GATE_ARENA'
  | 'REAL_WORLD'
  | 'CHALLENGE_ARENA'
  | 'SYSTEM_SIMULATOR'
  | 'PROGRESS';

export type VisualLabTab = 
  | 'cpu_scheduler'
  | 'process_lifecycle'
  | 'memory_allocation'
  | 'paging_tlb'
  | 'page_replacement'
  | 'cache_hierarchy'
  | 'bankers_deadlock'
  | 'synchronization'
  | 'disk_scheduling'
  | 'file_system'
  | 'dma_interrupt'
  | 'rtos_scheduler'
  | 'ipc_protection'
  | 'virtualization_cloud';

export interface UserProgress {
  xp: number;
  level: number;
  streakDays: number;
  completedModules: string[];
  completedExperiments: string[];
  completedScenarios: string[];
  solvedGateQuestions: string[];
  gameScores: Record<string, number>;
  badges: {
    id: string;
    title: string;
    dateAwarded: string;
    icon: string;
  }[];
}

const STORAGE_KEY = 'os_visual_lab_state_v1';

const INITIAL_PROGRESS: UserProgress = {
  xp: 150,
  level: 1,
  streakDays: 3,
  completedModules: ['module_01'],
  completedExperiments: [],
  completedScenarios: [],
  solvedGateQuestions: [],
  gameScores: {},
  badges: [
    {
      id: 'badge_first_boot',
      title: 'OS Explorer Initiated',
      dateAwarded: new Date().toLocaleDateString(),
      icon: 'Cpu'
    }
  ]
};

// Simple decoupled global state hook
class StateStore {
  private listeners = new Set<() => void>();
  public currentSection: AppSection = 'HOME';
  public selectedModuleId: string = 'module_01';
  public activeVisualLabTab: VisualLabTab = 'cpu_scheduler';
  public renderMode: '3d' | '2d' = '3d';
  public isSearchOpen: boolean = false;
  public progress: UserProgress = INITIAL_PROGRESS;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.progress) this.progress = { ...INITIAL_PROGRESS, ...parsed.progress };
        if (parsed.renderMode) this.renderMode = parsed.renderMode;
      }
    } catch (e) {
      console.warn('Could not load stored OS Visual Lab progress:', e);
    }
  }

  public saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        progress: this.progress,
        renderMode: this.renderMode
      }));
    } catch (e) {
      console.warn('Could not save progress to localStorage:', e);
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public version = 0;

  public notify() {
    this.version++;
    this.saveToStorage();
    this.listeners.forEach(l => l());
  }

  public getSnapshot = () => this.version;

  public setSection(section: AppSection, visualLabTab?: VisualLabTab, moduleId?: string) {
    this.currentSection = section;
    if (visualLabTab) this.activeVisualLabTab = visualLabTab;
    if (moduleId) this.selectedModuleId = moduleId;
    this.notify();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  public setSelectedModule(moduleId: string) {
    this.selectedModuleId = moduleId;
    this.currentSection = 'LEARN';
    this.notify();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  public setVisualLabTab(tab: VisualLabTab) {
    this.activeVisualLabTab = tab;
    this.currentSection = 'VISUAL_LAB';
    this.notify();
  }

  public toggleRenderMode() {
    this.renderMode = this.renderMode === '3d' ? '2d' : '3d';
    this.notify();
  }

  public setSearchOpen(open: boolean) {
    this.isSearchOpen = open;
    this.notify();
  }

  public addXp(amount: number, _reason?: string) {
    const newXp = this.progress.xp + amount;
    const newLevel = Math.floor(newXp / 500) + 1;
    this.progress.xp = newXp;
    this.progress.level = newLevel;
    this.notify();
  }

  public markModuleComplete(moduleId: string) {
    if (!this.progress.completedModules.includes(moduleId)) {
      this.progress.completedModules.push(moduleId);
      this.addXp(100, `Completed module ${moduleId}`);
      this.checkBadges();
    }
  }

  public markExperimentComplete(expId: string) {
    if (!this.progress.completedExperiments.includes(expId)) {
      this.progress.completedExperiments.push(expId);
      this.addXp(150, `Completed experiment ${expId}`);
      this.checkBadges();
    }
  }

  public markScenarioComplete(scenarioId: string) {
    if (!this.progress.completedScenarios.includes(scenarioId)) {
      this.progress.completedScenarios.push(scenarioId);
      this.addXp(200, `Completed scenario ${scenarioId}`);
      this.checkBadges();
    }
  }

  public recordGateAnswer(questionId: string, isCorrect: boolean) {
    if (isCorrect && !this.progress.solvedGateQuestions.includes(questionId)) {
      this.progress.solvedGateQuestions.push(questionId);
      this.addXp(50, `Solved GATE Question`);
      this.checkBadges();
    }
  }

  public recordGameScore(gameId: string, score: number) {
    const existing = this.progress.gameScores[gameId] || 0;
    if (score > existing) {
      this.progress.gameScores[gameId] = score;
      this.addXp(150, `New High Score in ${gameId}`);
      this.checkBadges();
    }
  }

  public checkBadges() {
    const awardBadge = (id: string, title: string, icon: string) => {
      if (!this.progress.badges.some(b => b.id === id)) {
        this.progress.badges.push({
          id,
          title,
          dateAwarded: new Date().toLocaleDateString(),
          icon
        });
      }
    };

    if (this.progress.completedModules.length >= 5) {
      awardBadge('badge_os_scholar', 'OS Scholar (5 Modules)', 'BookOpen');
    }
    if (this.progress.completedExperiments.length >= 3) {
      awardBadge('badge_lab_expert', 'Virtual Lab Specialist', 'FlaskConical');
    }
    if (this.progress.solvedGateQuestions.length >= 5) {
      awardBadge('badge_gate_warrior', 'GATE OS Warrior', 'Award');
    }
    if (this.progress.level >= 3) {
      awardBadge('badge_sys_kernel', 'Ring 0 Master', 'Shield');
    }
  }

  public resetProgress() {
    this.progress = { ...INITIAL_PROGRESS, badges: [...INITIAL_PROGRESS.badges] };
    this.notify();
  }

  public exportProgressJson(): string {
    return JSON.stringify(this.progress, null, 2);
  }

  public importProgressJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed.xp === 'number') {
        this.progress = parsed;
        this.notify();
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON import:', e);
    }
    return false;
  }
}

export const appStore = new StateStore();

export function useAppStore() {
  useSyncExternalStore(
    cb => appStore.subscribe(cb),
    appStore.getSnapshot
  );

  return {
    section: appStore.currentSection,
    selectedModuleId: appStore.selectedModuleId,
    activeVisualLabTab: appStore.activeVisualLabTab,
    renderMode: appStore.renderMode,
    isSearchOpen: appStore.isSearchOpen,
    progress: appStore.progress,
    setSection: (sec: AppSection, labTab?: VisualLabTab, modId?: string) => appStore.setSection(sec, labTab, modId),
    setSelectedModule: (modId: string) => appStore.setSelectedModule(modId),
    setVisualLabTab: (tab: VisualLabTab) => appStore.setVisualLabTab(tab),
    toggleRenderMode: () => appStore.toggleRenderMode(),
    setSearchOpen: (open: boolean) => appStore.setSearchOpen(open),
    addXp: (amount: number, reason?: string) => appStore.addXp(amount, reason),
    markModuleComplete: (modId: string) => appStore.markModuleComplete(modId),
    markExperimentComplete: (expId: string) => appStore.markExperimentComplete(expId),
    markScenarioComplete: (scId: string) => appStore.markScenarioComplete(scId),
    recordGateAnswer: (qId: string, correct: boolean) => appStore.recordGateAnswer(qId, correct),
    recordGameScore: (gameId: string, score: number) => appStore.recordGameScore(gameId, score),
    resetProgress: () => appStore.resetProgress(),
    exportProgressJson: () => appStore.exportProgressJson(),
    importProgressJson: (json: string) => appStore.importProgressJson(json)
  };
}
