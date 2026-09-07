// Clean, User-Friendly Home Page for OS Visual Lab
import React, { useState, useMemo } from 'react';
import { useAppStore, type VisualLabTab } from '../core/store/useStore';
import { ComputerSystem3D } from '../components/3d/ComputerSystem3D';
import { CURRICULUM_MODULES } from '../core/curriculum/modulesData';
import { GATE_QUESTION_BANK } from '../core/gate/questionBank';
import { runCpuScheduling, type SchedulingAlgorithm } from '../core/algorithms/cpuScheduling';
import { runPageReplacement, type PageReplacementAlgorithm } from '../core/algorithms/pageReplacement';
import { runBankersAlgorithm } from '../core/algorithms/bankersAlgorithm';
import { 
  Play, 
  BookOpen, 
  Award, 
  Eye, 
  Sparkles, 
  ArrowRight,
  Search,
  CheckCircle2,
  XCircle,
  Flame,
  Layers,
  Grid,
  Zap,
  Lock,
  Compass,
  Radio,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { setSection, setSelectedModule, addXp, progress } = useAppStore();

  // Curriculum Filter & Search State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [moduleSearchQuery, setModuleSearchQuery] = useState<string>('');
  const [showAllModules, setShowAllModules] = useState<boolean>(false);

  // Live Algorithm Playground State
  const [playgroundTab, setPlaygroundTab] = useState<'cpu' | 'paging' | 'banker'>('cpu');
  const [cpuAlgo, setCpuAlgo] = useState<SchedulingAlgorithm>('FCFS');
  const [pagingAlgo, setPagingAlgo] = useState<PageReplacementAlgorithm>('FIFO');

  // Daily GATE Challenge Question State
  const [currentGateIndex, setCurrentGateIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Filter MCQ questions for the interactive daily challenge widget
  const mcqQuestions = useMemo(() => {
    return GATE_QUESTION_BANK.filter(q => q.type === 'MCQ' && q.options && q.options.length > 0);
  }, []);

  const currentGateQuestion = mcqQuestions[currentGateIndex % mcqQuestions.length];

  const handleGateSubmit = () => {
    if (!selectedAnswer || !currentGateQuestion) return;
    const correct = selectedAnswer === currentGateQuestion.correctAnswer;
    setIsCorrect(correct);
    setIsAnswerSubmitted(true);
    if (correct) {
      addXp(50, 'Solved Daily GATE Challenge');
    }
  };

  const handleNextGateQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setIsCorrect(false);
    setCurrentGateIndex(prev => prev + 1);
  };

  // 1. Compute Live Mini-Lab: CPU Scheduling
  const cpuDemoResult = useMemo(() => {
    const processes = [
      { id: 'p1', name: 'P1', arrivalTime: 0, burstTime: 4, color: '#3B82F6' },
      { id: 'p2', name: 'P2', arrivalTime: 1, burstTime: 3, color: '#F59E0B' },
      { id: 'p3', name: 'P3', arrivalTime: 2, burstTime: 1, color: '#10B981' },
      { id: 'p4', name: 'P4', arrivalTime: 3, burstTime: 2, color: '#6366F1' },
    ];
    return runCpuScheduling(processes, cpuAlgo, 2);
  }, [cpuAlgo]);

  // 2. Compute Live Mini-Lab: Page Replacement
  const pagingDemoResult = useMemo(() => {
    const refString = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3];
    return runPageReplacement(refString, 3, pagingAlgo);
  }, [pagingAlgo]);

  // 3. Compute Live Mini-Lab: Banker's Deadlock Check
  const bankerDemoResult = useMemo(() => {
    const processes = [
      { id: 'p0', name: 'P0', allocation: [0, 1, 0], max: [7, 5, 3] },
      { id: 'p1', name: 'P1', allocation: [2, 0, 0], max: [3, 2, 2] },
      { id: 'p2', name: 'P2', allocation: [3, 0, 2], max: [9, 0, 2] },
      { id: 'p3', name: 'P3', allocation: [2, 1, 1], max: [2, 2, 2] },
      { id: 'p4', name: 'P4', allocation: [0, 0, 2], max: [4, 3, 3] }
    ];
    const available = [3, 3, 2];
    return runBankersAlgorithm(processes, available);
  }, []);

  // Filter Curriculum Modules
  const categories = [
    'All',
    'Core Fundamentals',
    'Processes & Concurrency',
    'Memory & Storage',
    'Hardware & I/O',
    'Advanced & Modern'
  ];

  const filteredModules = useMemo(() => {
    return CURRICULUM_MODULES.filter(m => {
      const matchCategory = selectedCategory === 'All' || m.category === selectedCategory;
      const matchSearch = !moduleSearchQuery || 
        m.title.toLowerCase().includes(moduleSearchQuery.toLowerCase()) ||
        m.topics.some(t => t.toLowerCase().includes(moduleSearchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, moduleSearchQuery]);

  const displayedModules = showAllModules ? filteredModules : filteredModules.slice(0, 8);

  // Quick launch shortcuts
  const popularTags = [
    { label: 'CPU Scheduling', tab: 'cpu_scheduler' as VisualLabTab },
    { label: 'Page Replacement', tab: 'page_replacement' as VisualLabTab },
    { label: 'Paging & TLB', tab: 'paging_tlb' as VisualLabTab },
    { label: 'Cache AMAT', tab: 'cache_hierarchy' as VisualLabTab },
    { label: "Banker's Algorithm", tab: 'bankers_deadlock' as VisualLabTab },
    { label: 'Dining Philosophers', tab: 'synchronization' as VisualLabTab },
    { label: 'Disk SCAN', tab: 'disk_scheduling' as VisualLabTab },
  ];

  // 10 Visual Simulators Directory
  const simulators: { id: VisualLabTab; title: string; desc: string; icon: React.ComponentType<{ className?: string }>; tag: string }[] = [
    { id: 'cpu_scheduler', title: 'CPU Scheduling Simulator', desc: 'Gantt chart, FCFS, SJF, SRTF, Round Robin, and Priority scheduling with execution step logs.', icon: Eye, tag: 'Scheduling' },
    { id: 'memory_allocation', title: 'Contiguous Memory Allocation', desc: 'First Fit, Best Fit, and Worst Fit algorithms with internal and external fragmentation analysis.', icon: Layers, tag: 'Memory' },
    { id: 'paging_tlb', title: 'Paging & TLB Address Translation', desc: 'Virtual-to-physical address mapping, multi-level page tables, and Effective Memory Access Time (EMAT).', icon: Grid, tag: 'Paging' },
    { id: 'page_replacement', title: 'Page Replacement Laboratory', desc: 'FIFO, LRU, Optimal, and Clock algorithms with Belady\'s Anomaly demonstration.', icon: RotateCcw, tag: 'Virtual Memory' },
    { id: 'cache_hierarchy', title: 'Cache Memory & AMAT Simulator', desc: 'L1/L2/L3 SRAM hierarchy, Tag/Index/Offset decomposition, and Average Memory Access Time calculations.', icon: Zap, tag: 'Hardware' },
    { id: 'bankers_deadlock', title: 'Deadlock & Banker\'s Algorithm', desc: 'Dijkstra\'s safety check, Need matrix calculation, and Resource Allocation Graph (RAG) cycle detection.', icon: ShieldCheck, tag: 'Deadlock' },
    { id: 'synchronization', title: 'Process Synchronization Lab', desc: 'Producer-Consumer, Readers-Writers, and Dining Philosophers with mutex locks and semaphores.', icon: Lock, tag: 'Concurrency' },
    { id: 'disk_scheduling', title: 'Disk Scheduling Simulator', desc: 'Interactive mechanical disk platter, FCFS, SSTF, SCAN, C-SCAN, LOOK, and C-LOOK head travel.', icon: Compass, tag: 'Storage' },
    { id: 'dma_interrupt', title: 'DMA & Interrupt Controller', desc: 'Cycle stealing, Interrupt Vector Table (IVT) lookups, and hardware interrupt service routines.', icon: Radio, tag: 'I/O' },
    { id: 'rtos_scheduler', title: 'Real-Time OS Scheduler', desc: 'Rate Monotonic (RMS) and Earliest Deadline First (EDF) schedulers with deadline overrun monitors.', icon: Clock, tag: 'Real-Time' },
  ];

  return (
    <div className="space-y-16 py-4 select-none">
      
      {/* 1. HERO SECTION */}
      <section className="relative">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-8">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive 3D Operating Systems Simulation &amp; GATE Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            See the OS. Understand the OS. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">Control the OS.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
            Stop memorizing dry formulas. Explore CPU scheduling, memory mapping, cache lines, deadlocks, and disk architecture through interactive 3D simulations and mathematical step-by-step proofs.
          </p>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setSection('VISUAL_LAB', 'cpu_scheduler')}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer hover:scale-102"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Visual Lab</span>
            </button>

            <button
              onClick={() => setSection('LEARN')}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 hover:border-slate-700 font-medium text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>24 Curriculum Modules</span>
            </button>

            <button
              onClick={() => setSection('GATE_ARENA')}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-amber-400 border border-slate-800 hover:border-slate-700 font-medium text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>GATE Arena (36+ PYQs)</span>
            </button>
          </div>

          {/* Quick Concept Jump Tags */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-slate-500 mr-1 font-mono">Popular Topics:</span>
            {popularTags.map(tag => (
              <button
                key={tag.label}
                onClick={() => setSection('VISUAL_LAB', tag.tab)}
                className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
              >
                {tag.label}
              </button>
            ))}
          </div>

        </div>

        {/* 3D Hardware Architecture Visualization */}
        <div className="max-w-5xl mx-auto">
          <ComputerSystem3D />
        </div>
      </section>

      {/* 2. LIVE INTERACTIVE ALGORITHM PLAYGROUND */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono text-xs font-semibold border border-blue-500/20">
                  Live Simulation
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Interactive Algorithm Playground
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Execute and compare core operating system algorithms tick-by-tick directly from the homepage.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                onClick={() => setPlaygroundTab('cpu')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  playgroundTab === 'cpu'
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                CPU Scheduling
              </button>
              <button
                onClick={() => setPlaygroundTab('paging')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  playgroundTab === 'paging'
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Page Replacement
              </button>
              <button
                onClick={() => setPlaygroundTab('banker')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  playgroundTab === 'banker'
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Banker's Safety Check
              </button>
            </div>
          </div>

          {/* Playground Body */}
          <div>
            {/* A. CPU SCHEDULER PLAYGROUND */}
            {playgroundTab === 'cpu' && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">Algorithm:</span>
                    {(['FCFS', 'SJF_NON_PREEMPTIVE', 'ROUND_ROBIN'] as SchedulingAlgorithm[]).map(algo => (
                      <button
                        key={algo}
                        onClick={() => setCpuAlgo(algo)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                          cpuAlgo === algo
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {algo === 'SJF_NON_PREEMPTIVE' ? 'SJF' : algo === 'ROUND_ROBIN' ? 'Round Robin (Q=2)' : 'FCFS'}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setSection('VISUAL_LAB', 'cpu_scheduler')}
                    className="text-xs font-medium text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Full Multi-Core Simulator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Live Gantt Chart */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                    <span>Generated Gantt Execution Timeline:</span>
                    <span className="text-slate-300">Total Duration: {cpuDemoResult.totalTime} units</span>
                  </div>

                  <div className="flex items-center h-11 rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
                    {cpuDemoResult.ganttChart.map((block, idx) => (
                      <div
                        key={idx}
                        style={{ width: `${Math.max(12, ((block.endTime - block.startTime) / cpuDemoResult.totalTime) * 100)}%` }}
                        className="h-full border-r border-slate-950 flex flex-col items-center justify-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
                      >
                        <span className="text-[11px] font-mono">{block.processName}</span>
                        <span className="text-[9px] text-blue-200 font-mono font-normal">[{block.startTime}-{block.endTime}]</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Avg Turnaround:</span>
                    <span className="text-sm font-bold text-white">{cpuDemoResult.averageTurnaroundTime.toFixed(2)} ms</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Avg Waiting:</span>
                    <span className="text-sm font-bold text-blue-400">{cpuDemoResult.averageWaitingTime.toFixed(2)} ms</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">CPU Utilization:</span>
                    <span className="text-sm font-bold text-emerald-400">{cpuDemoResult.cpuUtilization.toFixed(1)}%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Context Switches:</span>
                    <span className="text-sm font-bold text-slate-300">{cpuDemoResult.contextSwitches}</span>
                  </div>
                </div>
              </div>
            )}

            {/* B. PAGE REPLACEMENT PLAYGROUND */}
            {playgroundTab === 'paging' && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">Algorithm:</span>
                    {(['FIFO', 'LRU'] as PageReplacementAlgorithm[]).map(algo => (
                      <button
                        key={algo}
                        onClick={() => setPagingAlgo(algo)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                          pagingAlgo === algo
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {algo} (3 Frames)
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setSection('VISUAL_LAB', 'page_replacement')}
                    className="text-xs font-medium text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Inspect Belady's Anomaly Lab</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Reference String & Frame Stepping */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                    <span>Reference String Access Sequence:</span>
                    <span className="text-slate-300">Hits: {pagingDemoResult.pageHits} • Faults: {pagingDemoResult.pageFaults}</span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {pagingDemoResult.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className={`px-3 py-2 rounded-lg text-center font-mono border ${
                          step.isHit
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold">P{step.page}</div>
                        <div className={`text-[9px] mt-0.5 ${step.isHit ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                          {step.isHit ? 'HIT' : 'FAULT'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Hit Ratio:</span>
                    <span className="text-sm font-bold text-emerald-400">{pagingDemoResult.hitRatio.toFixed(1)}%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Fault Ratio:</span>
                    <span className="text-sm font-bold text-slate-300">{pagingDemoResult.faultRatio.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* C. BANKER'S DEADLOCK PLAYGROUND */}
            {playgroundTab === 'banker' && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="text-xs font-mono text-slate-400">
                    System Configuration: 5 Processes (P0 - P4), Available Resources: [A:3, B:3, C:2]
                  </span>

                  <button
                    onClick={() => setSection('VISUAL_LAB', 'bankers_deadlock')}
                    className="text-xs font-medium text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Deadlock RAG Visualizer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">
                      System is in a Verified Safe State
                    </span>
                  </div>

                  <div className="text-xs text-slate-400">
                    Safe Execution Sequence Verified by Dijkstra's Safety Algorithm:
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {bankerDemoResult.safeSequence.map((p, idx) => (
                      <div key={p} className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-blue-400 font-bold text-xs">
                          {p}
                        </span>
                        {idx < bankerDemoResult.safeSequence.length - 1 && (
                          <span className="text-slate-600">→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 3. CORE SIMULATORS DIRECTORY */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Eye className="w-5 h-5 text-blue-400" />
              The 10 Core Visual Simulators
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Step through processes, page faults, cache tags, deadlock graphs, and disk seeks with complete parameter controls.
            </p>
          </div>

          <button
            onClick={() => setSection('VISUAL_LAB')}
            className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:underline cursor-pointer"
          >
            <span>View All Labs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {simulators.map(sim => {
            const IconComp = sim.icon;
            return (
              <div
                key={sim.id}
                onClick={() => setSection('VISUAL_LAB', sim.id)}
                className="group p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {sim.tag}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {sim.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2 font-normal">
                    {sim.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-500 group-hover:text-blue-400 transition-colors">
                  <span>Open Simulator</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. CURRICULUM EXPLORER */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-blue-400" />
              24-Module Operating Systems Curriculum
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Progressive disclosure from hardware fundamentals to distributed systems and virtualization.
            </p>
          </div>

          {/* In-Page Module Search Bar */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={moduleSearchQuery}
              onChange={e => setModuleSearchQuery(e.target.value)}
              placeholder="Filter 24 modules..."
              className="bg-transparent border-none outline-none text-white text-xs placeholder-slate-500 w-full"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800'
              }`}
            >
              {cat} {cat === 'All' ? `(${CURRICULUM_MODULES.length})` : ''}
            </button>
          ))}
        </div>

        {/* Module Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          {displayedModules.map(module => (
            <div
              key={module.id}
              onClick={() => setSelectedModule(module.id)}
              className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-950 text-blue-400 font-semibold border border-slate-800">
                    Module {module.number < 10 ? `0${module.number}` : module.number}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {module.topics.length} topics
                  </span>
                </div>

                <h5 className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors leading-snug">
                  {module.title}
                </h5>

                <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed font-normal">
                  {module.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/70 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span className="truncate max-w-[120px]">{module.category}</span>
                <span className="text-blue-400 flex items-center gap-1 font-medium">
                  Study <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Expand / Collapse All Modules Button */}
        {filteredModules.length > 8 && (
          <div className="text-center mt-6">
            <button
              onClick={() => setShowAllModules(!showAllModules)}
              className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              {showAllModules ? 'Show Top 8 Modules ▲' : `View All ${filteredModules.length} Modules ▼`}
            </button>
          </div>
        )}
      </section>

      {/* 5. INTERACTIVE DAILY GATE CHALLENGE */}
      {currentGateQuestion && (
        <section className="max-w-4xl mx-auto px-4">
          <div className="p-6 sm:p-7 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-xs font-mono font-semibold border border-amber-500/20">
                  Daily GATE Challenge
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {currentGateQuestion.topicName} • {currentGateQuestion.gateYear}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 font-semibold">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>+50 XP Reward</span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-normal text-slate-200 leading-relaxed">
                {currentGateQuestion.question}
              </p>

              {/* Options */}
              <div className="space-y-2 pt-1">
                {currentGateQuestion.options?.map(opt => {
                  const isSelected = selectedAnswer === opt;
                  return (
                    <button
                      key={opt}
                      disabled={isAnswerSubmitted}
                      onClick={() => setSelectedAnswer(opt)}
                      className={`w-full p-3 rounded-lg border text-left text-xs font-mono transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-950/60 border-blue-500 text-blue-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <span className="text-[10px] font-bold text-blue-400">SELECTED</span>}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Alert */}
              {isAnswerSubmitted && (
                <div className={`p-4 rounded-xl text-xs font-mono border ${
                  isCorrect
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}>
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    {isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                    <span>{isCorrect ? 'Correct Solution (+50 XP)' : 'Incorrect Solution'}</span>
                  </div>
                  <p className="text-slate-300 mt-1 leading-relaxed font-sans">
                    {currentGateQuestion.explanation}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                {!isAnswerSubmitted ? (
                  <button
                    disabled={!selectedAnswer}
                    onClick={handleGateSubmit}
                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-medium text-xs transition-all cursor-pointer shadow-sm"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextGateQuestion}
                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-all cursor-pointer shadow-sm"
                  >
                    Try Another Problem ➔
                  </button>
                )}

                <button
                  onClick={() => setSection('GATE_ARENA')}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-mono"
                >
                  <span>Open Full Question Bank</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. ENGINEERING INCIDENT CASE STUDIES */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Real-World Engineering Incident Studies
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Analyze historical production outages caused by kernel deadlocks, page faults, and synchronization bugs.
            </p>
          </div>

          <button
            onClick={() => setSection('REAL_WORLD')}
            className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:underline cursor-pointer"
          >
            <span>View All Incidents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => setSection('REAL_WORLD')}
            className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer group"
          >
            <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-rose-950/60 text-rose-300 border border-rose-500/30">
              Kernel Panic
            </span>
            <h4 className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors mt-2">
              CrowdStrike Global Outage (2024)
            </h4>
            <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 font-normal">
              Kernel-mode memory read exception causing 8.5 million Windows machine BSOD loops.
            </p>
          </div>

          <div 
            onClick={() => setSection('REAL_WORLD')}
            className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer group"
          >
            <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30">
              Priority Inversion
            </span>
            <h4 className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors mt-2">
              Mars Pathfinder Reset (1997)
            </h4>
            <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 font-normal">
              VxWorks RTOS watchdog reset caused by priority inversion on an information bus mutex.
            </p>
          </div>

          <div 
            onClick={() => setSection('REAL_WORLD')}
            className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer group"
          >
            <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-500/30">
              Race Condition
            </span>
            <h4 className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors mt-2">
              Therac-25 Radiation Catastrophe
            </h4>
            <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 font-normal">
              Real-time software race condition in assembly routines delivering lethal doses.
            </p>
          </div>

          <div 
            onClick={() => setSection('REAL_WORLD')}
            className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer group"
          >
            <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-blue-950/60 text-blue-300 border border-blue-500/30">
              Memory Exhaustion
            </span>
            <h4 className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors mt-2">
              Linux Kernel OOM-Killer
            </h4>
            <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 font-normal">
              Heuristic badness score evaluation to terminate rogue processes under memory pressure.
            </p>
          </div>
        </div>
      </section>

      {/* 7. STUDENT TELEMETRY & STATS */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 font-bold text-xs">
              L{progress.level}
            </div>
            <div>
              <div className="text-white font-semibold flex items-center gap-2">
                <span>Learner Profile</span>
                {progress.streakDays > 0 && (
                  <span className="text-amber-400 font-normal flex items-center gap-0.5 text-[11px]">
                    <Flame className="w-3 h-3 fill-current" /> {progress.streakDays} Day Streak
                  </span>
                )}
              </div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                {progress.xp} XP Earned • {progress.completedModules.length}/24 Modules Completed
              </div>
            </div>
          </div>

          <button
            onClick={() => setSection('PROGRESS')}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-medium transition-colors cursor-pointer"
          >
            View Skill Radar &amp; Badges →
          </button>
        </div>
      </section>

      {/* 8. CALL TO ACTION BANNER */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center relative overflow-hidden shadow-xl space-y-3">
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Ready to master Operating Systems?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Join thousands of computer science students and GATE aspirants who learn by seeing and interacting with real systems.
          </p>

          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              onClick={() => setSection('VISUAL_LAB', 'cpu_scheduler')}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer hover:scale-102"
            >
              Enter Virtual Lab
            </button>
            <button
              onClick={() => setSection('GATE_ARENA')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-xs sm:text-sm transition-all cursor-pointer"
            >
              Start GATE Prep
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
