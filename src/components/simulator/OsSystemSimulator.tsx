// OS In Action — Unified Full-System Operating System Simulator
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../core/store/useStore';
import { 
  Server, 
  Cpu, 
  Layers, 
  HardDrive, 
  Play, 
  Pause, 
  Sliders, 
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const OsSystemSimulator: React.FC = () => {
  const { addXp } = useAppStore();

  // Configurable OS Hardware & Kernel Parameters
  const [cpuCores, setCpuCores] = useState<number>(4);
  const [schedulerPolicy, setSchedulerPolicy] = useState<string>('CFS_FAIR');
  const [ramSizeGB, setRamSizeGB] = useState<number>(16);
  const [pageSizeKB, setPageSizeKB] = useState<number>(4);
  const [cacheSizeMB, setCacheSizeMB] = useState<number>(8);
  const [diskScheduler, setDiskScheduler] = useState<string>('C_LOOK');

  // Live Telemetry
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [cpuLoad, setCpuLoad] = useState<number>(48);
  const [ramUsagePercent, setRamUsagePercent] = useState<number>(62);
  const [cacheHitRate, setCacheHitRate] = useState<number>(94.5);
  const [diskQueueDepth, setDiskQueueDepth] = useState<number>(3);
  const [contextSwitchesSec, setContextSwitchesSec] = useState<number>(1850);
  const [pageFaultsSec, setPageFaultsSec] = useState<number>(14);
  const [throughputOps, setThroughputOps] = useState<number>(84200);

  const [benchmarkScore, setBenchmarkScore] = useState<number | null>(null);
  const [isBenchmarking, setIsBenchmarking] = useState<boolean>(false);

  // Live telemetry pulse
  useEffect(() => {
    if (!isRunning) return;

    const interval = window.setInterval(() => {
      setCpuLoad(prev => Math.min(99, Math.max(15, prev + (Math.random() * 8 - 4))));
      setRamUsagePercent(prev => Math.min(95, Math.max(30, prev + (Math.random() * 4 - 2))));
      setCacheHitRate(prev => Math.min(99.2, Math.max(88, prev + (Math.random() * 1 - 0.5))));
      setDiskQueueDepth(prev => Math.min(12, Math.max(1, Math.round(prev + (Math.random() * 2 - 1)))));
      setContextSwitchesSec(() => Math.round(1500 + (cpuLoad * 25) + Math.random() * 200));
      setPageFaultsSec(() => Math.max(2, Math.round(8 + (100 - cacheHitRate) * 1.5 + Math.random() * 4)));
      setThroughputOps(() => Math.round(75000 + (cpuCores * 8500) + Math.random() * 2000));
    }, 1200);

    return () => clearInterval(interval);
  }, [isRunning, cpuLoad, cacheHitRate, cpuCores]);

  const handleRunBenchmark = () => {
    setIsBenchmarking(true);
    setBenchmarkScore(null);

    setTimeout(() => {
      // Calculate realistic benchmark score based on configurations
      const coreMultiplier = cpuCores * 1200;
      const ramFactor = (ramSizeGB / 16) * 1500;
      const cacheFactor = (cacheSizeMB / 8) * 1200;
      const schedulerBonus = schedulerPolicy === 'CFS_FAIR' || schedulerPolicy === 'MLFQ' ? 800 : 400;
      const diskBonus = diskScheduler === 'C_LOOK' ? 600 : 300;

      const score = Math.min(9950, Math.round(3500 + coreMultiplier * 0.4 + ramFactor + cacheFactor + schedulerBonus + diskBonus));
      
      setBenchmarkScore(score);
      setIsBenchmarking(false);
      addXp(300, 'Completed Full OS System Benchmark');

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Simulation Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-400" />
              OS In Action — Unified System Simulator
            </h2>
            <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-[10px] font-mono text-purple-300 font-bold uppercase">
              Capstone Lab
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Interconnected CPU, RAM, Cache, Disk, and Process generation operating simultaneously under live telemetry
          </p>
        </div>

        {/* Playback & Run Benchmark Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title={isRunning ? 'Pause Telemetry' : 'Resume Telemetry'}
          >
            {isRunning ? <Pause className="w-4 h-4 text-cyan-400" /> : <Play className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            onClick={handleRunBenchmark}
            disabled={isBenchmarking}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{isBenchmarking ? 'SIMULATING WORKLOAD...' : 'RUN OS BENCHMARK'}</span>
          </button>
        </div>
      </div>

      {/* Benchmark Score Reveal if calculated */}
      {benchmarkScore && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-cyan-950/30 to-slate-900/60 border border-cyan-500/40 text-center font-mono animate-in zoom-in duration-300">
          <span className="text-xs uppercase font-bold text-cyan-400 tracking-widest block mb-1">
            System Benchmark Completed
          </span>
          <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-emerald-300 my-2">
            {benchmarkScore.toLocaleString()} / 10,000 PTS
          </div>
          <p className="text-xs text-slate-300 font-sans max-w-xl mx-auto leading-relaxed">
            Congratulations! Your customized OS configuration achieved top-tier throughput. Multicore parallelism with {schedulerPolicy} and {diskScheduler} minimized average latency to 1.8ms.
          </p>
        </div>
      )}

      {/* Live Real-Time Telemetry Dials */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 font-mono text-center">
        
        {/* CPU Load */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 uppercase">CPU Load</span>
          <div className="text-xl font-bold text-cyan-300 my-1">{cpuLoad.toFixed(0)}%</div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: `${cpuLoad}%` }} />
          </div>
        </div>

        {/* RAM Usage */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 uppercase">RAM Used</span>
          <div className="text-xl font-bold text-emerald-400 my-1">{ramUsagePercent.toFixed(0)}%</div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 transition-all duration-500" style={{ width: `${ramUsagePercent}%` }} />
          </div>
        </div>

        {/* Cache Hit Rate */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 uppercase">Cache Hit</span>
          <div className="text-xl font-bold text-amber-300 my-1">{cacheHitRate.toFixed(1)}%</div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${cacheHitRate}%` }} />
          </div>
        </div>

        {/* Disk Queue */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 uppercase">Disk Queue</span>
          <div className="text-xl font-bold text-purple-300 my-1">{diskQueueDepth} reqs</div>
          <span className="text-[9px] text-slate-500">{diskScheduler}</span>
        </div>

        {/* Context Switches */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 uppercase">CS / Sec</span>
          <div className="text-lg font-bold text-slate-200 my-1">{contextSwitchesSec.toLocaleString()}</div>
          <span className="text-[9px] text-slate-500">Ring 0 overhead</span>
        </div>

        {/* Page Faults */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 uppercase">Faults / s</span>
          <div className="text-lg font-bold text-rose-400 my-1">{pageFaultsSec} /s</div>
          <span className="text-[9px] text-slate-500">MMU trap rate</span>
        </div>

        {/* Throughput */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 uppercase">Throughput</span>
          <div className="text-lg font-bold text-sky-300 my-1">{(throughputOps / 1000).toFixed(1)}k</div>
          <span className="text-[9px] text-slate-500">Syscall ops/sec</span>
        </div>

        {/* Active Cores */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 uppercase">Cores</span>
          <div className="text-xl font-bold text-cyan-400 my-1">{cpuCores} Cores</div>
          <span className="text-[9px] text-emerald-400">Online</span>
        </div>

      </div>

      {/* Interactive Architecture Configuration Grid */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          Operating System & Hardware Architecture Configuration
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
          
          {/* CPU Cores & Scheduler */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-cyan-300 font-bold">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4" /> CPU Subsystem
              </span>
              <span>{cpuCores} Cores</span>
            </div>

            <div>
              <label className="text-slate-400 text-[11px] block mb-1">Cores Allocation:</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 4, 8].map(cores => (
                  <button
                    key={cores}
                    onClick={() => setCpuCores(cores)}
                    className={`py-1 rounded text-center transition-colors cursor-pointer ${
                      cpuCores === cores
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {cores}C
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-[11px] block mb-1">Scheduler Policy:</label>
              <select
                value={schedulerPolicy}
                onChange={e => setSchedulerPolicy(e.target.value)}
                className="w-full bg-slate-900 text-slate-200 rounded px-2 py-1 border border-slate-800 focus:outline-none"
              >
                <option value="CFS_FAIR">Completely Fair Scheduler (CFS)</option>
                <option value="ROUND_ROBIN">Round Robin (RR Q=4ms)</option>
                <option value="SRTF_PREEMPT">Preemptive SRTF</option>
                <option value="MLFQ">Multilevel Feedback Queue (MLFQ)</option>
              </select>
            </div>
          </div>

          {/* Memory & Paging */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-emerald-300 font-bold">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> Memory & Paging
              </span>
              <span>{ramSizeGB} GB RAM</span>
            </div>

            <div>
              <label className="text-slate-400 text-[11px] block mb-1">Physical RAM Capacity:</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[4, 8, 16, 32].map(ram => (
                  <button
                    key={ram}
                    onClick={() => setRamSizeGB(ram)}
                    className={`py-1 rounded text-center transition-colors cursor-pointer ${
                      ramSizeGB === ram
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-bold'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {ram}GB
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-[11px] block mb-1">Page Frame Size:</label>
              <select
                value={pageSizeKB}
                onChange={e => setPageSizeKB(parseInt(e.target.value))}
                className="w-full bg-slate-900 text-slate-200 rounded px-2 py-1 border border-slate-800 focus:outline-none"
              >
                <option value="2">2 KB (Higher page count, lower internal frag)</option>
                <option value="4">4 KB (Industry standard x86)</option>
                <option value="8">8 KB (Large pages, lower TLB miss rate)</option>
              </select>
            </div>
          </div>

          {/* Cache & Storage Disk */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-purple-300 font-bold">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-4 h-4" /> Cache & I/O Disk
              </span>
              <span>{cacheSizeMB} MB L3</span>
            </div>

            <div>
              <label className="text-slate-400 text-[11px] block mb-1">L3 Cache Size:</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[4, 8, 16, 32].map(cache => (
                  <button
                    key={cache}
                    onClick={() => setCacheSizeMB(cache)}
                    className={`py-1 rounded text-center transition-colors cursor-pointer ${
                      cacheSizeMB === cache
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 font-bold'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {cache}M
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-[11px] block mb-1">Disk I/O Scheduler:</label>
              <select
                value={diskScheduler}
                onChange={e => setDiskScheduler(e.target.value)}
                className="w-full bg-slate-900 text-slate-200 rounded px-2 py-1 border border-slate-800 focus:outline-none"
              >
                <option value="C_LOOK">Circular LOOK (C-LOOK)</option>
                <option value="SCAN">SCAN (Elevator)</option>
                <option value="SSTF">Shortest Seek Time First (SSTF)</option>
                <option value="FCFS">First-Come First-Served</option>
              </select>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
