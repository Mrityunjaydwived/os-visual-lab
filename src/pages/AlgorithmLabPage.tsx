// Side-by-Side Algorithm Comparison Engine
import React, { useState, useMemo } from 'react';
import { runCpuScheduling, type ProcessInput, type SchedulingAlgorithm } from '../core/algorithms/cpuScheduling';
import { runPageReplacement, type PageReplacementAlgorithm } from '../core/algorithms/pageReplacement';
import { executeDiskAlgorithm, type DiskAlgorithm } from '../core/algorithms/diskScheduling';
import { Sliders, Cpu, RefreshCw, Compass, Trophy } from 'lucide-react';

const DEFAULT_COMPARE_PROCS: ProcessInput[] = [
  { id: 'p1', name: 'P1', arrivalTime: 0, burstTime: 8, priority: 3, color: '#00f0ff' },
  { id: 'p2', name: 'P2', arrivalTime: 1, burstTime: 4, priority: 1, color: '#a855f7' },
  { id: 'p3', name: 'P3', arrivalTime: 2, burstTime: 9, priority: 4, color: '#10b981' },
  { id: 'p4', name: 'P4', arrivalTime: 3, burstTime: 5, priority: 2, color: '#f59e0b' },
];

const DEFAULT_COMPARE_PAGES = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1];
const DEFAULT_COMPARE_TRACKS = [98, 183, 37, 122, 14, 124, 65, 67];

export const AlgorithmLabPage: React.FC = () => {
  const [domain, setDomain] = useState<'CPU' | 'PAGING' | 'DISK'>('CPU');

  // 1. CPU Shootout Calculations
  const cpuAlgorithms: SchedulingAlgorithm[] = ['FCFS', 'SJF_NON_PREEMPTIVE', 'SRTF_PREEMPTIVE', 'ROUND_ROBIN', 'PRIORITY_PREEMPTIVE'];
  const cpuResults = useMemo(() => {
    return cpuAlgorithms.map(alg => ({
      alg,
      result: runCpuScheduling(DEFAULT_COMPARE_PROCS, alg, 2)
    }));
  }, []);

  // 2. Page Replacement Shootout Calculations
  const pageAlgorithms: PageReplacementAlgorithm[] = ['FIFO', 'LRU', 'OPTIMAL', 'CLOCK'];
  const pageResults = useMemo(() => {
    return pageAlgorithms.map(alg => ({
      alg,
      result: runPageReplacement(DEFAULT_COMPARE_PAGES, 3, alg)
    }));
  }, []);

  // 3. Disk Shootout Calculations
  const diskAlgorithms: DiskAlgorithm[] = ['FCFS', 'SSTF', 'SCAN', 'C_SCAN', 'LOOK', 'C_LOOK'];
  const diskResults = useMemo(() => {
    return diskAlgorithms.map(alg => ({
      alg,
      result: executeDiskAlgorithm(DEFAULT_COMPARE_TRACKS, 53, 'RIGHT', 199, alg)
    }));
  }, []);

  return (
    <div className="space-y-6 py-4">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-purple-400" />
            Algorithm Shootout & Comparison Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Compare algorithmic performance metrics simultaneously on identical input workloads
          </p>
        </div>

        {/* Domain Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setDomain('CPU')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              domain === 'CPU'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>CPU Scheduling</span>
          </button>

          <button
            onClick={() => setDomain('PAGING')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              domain === 'PAGING'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Page Replacement</span>
          </button>

          <button
            onClick={() => setDomain('DISK')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              domain === 'DISK'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Disk Scheduling</span>
          </button>
        </div>
      </div>

      {domain === 'CPU' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
            <span className="text-cyan-400 font-bold block mb-1">Standard Workload:</span>
            P1(AT=0, BT=8), P2(AT=1, BT=4), P3(AT=2, BT=9), P4(AT=3, BT=5). Time Quantum = 2ms.
          </div>

          {/* Comparative Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cpuResults.map(({ alg, result }) => {
              const isBest = result.averageWaitingTime === Math.min(...cpuResults.map(r => r.result.averageWaitingTime));

              return (
                <div
                  key={alg}
                  className={`p-5 rounded-2xl border flex flex-col justify-between font-mono text-xs transition-all ${
                    isBest
                      ? 'bg-cyan-950/30 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="font-bold text-sm text-slate-200">{alg.replace('_', ' ')}</span>
                      {isBest && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-cyan-400" /> Optimal Avg WT
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 mt-4 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Avg Waiting Time:</span>
                        <span className={`font-bold ${isBest ? 'text-cyan-300 text-sm' : 'text-slate-200'}`}>
                          {result.averageWaitingTime} ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Avg Turnaround:</span>
                        <span className="text-purple-300 font-bold">{result.averageTurnaroundTime} ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Context Switches:</span>
                        <span className="text-amber-400 font-bold">{result.contextSwitches}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">CPU Utilization:</span>
                        <span className="text-emerald-400 font-bold">{result.cpuUtilization}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Gantt Mini Preview */}
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <span className="text-[10px] text-slate-500 block mb-1">Execution Blocks:</span>
                    <div className="flex h-5 rounded overflow-hidden border border-slate-800 gap-0.5">
                      {result.ganttChart.map((b, bIdx: number) => (
                        <div
                          key={bIdx}
                          style={{
                            width: `${((b.endTime - b.startTime) / result.totalTime) * 100}%`,
                            backgroundColor: b.processId === 'IDLE' ? '#1e293b' : b.color
                          }}
                          className="h-full"
                          title={`${b.processName} [${b.startTime}-${b.endTime}]`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {domain === 'PAGING' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
            <span className="text-purple-400 font-bold block mb-1">Standard Workload:</span>
            Reference String: [{DEFAULT_COMPARE_PAGES.join(', ')}]. Physical Frames: 3.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pageResults.map(({ alg, result }) => {
              const isBest = result.pageFaults === Math.min(...pageResults.map(r => r.result.pageFaults));

              return (
                <div
                  key={alg}
                  className={`p-5 rounded-2xl border font-mono text-xs flex flex-col justify-between ${
                    isBest
                      ? 'bg-purple-950/30 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="font-bold text-sm text-slate-200">{alg}</span>
                      {isBest && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-purple-400" /> Fewest Faults
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Page Faults:</span>
                        <span className={`font-bold ${isBest ? 'text-emerald-400 text-base' : 'text-rose-400'}`}>
                          {result.pageFaults}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Hit Ratio:</span>
                        <span className="text-cyan-300 font-bold">{result.hitRatio}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Fault Ratio:</span>
                        <span className="text-amber-400 font-bold">{result.faultRatio}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                    {alg === 'OPTIMAL' ? (
                      <span className="text-purple-300">Theoretical lower bound (Belady's MIN).</span>
                    ) : alg === 'LRU' ? (
                      <span className="text-slate-400">Stack algorithm, immune to Belady's anomaly.</span>
                    ) : (
                      <span className="text-slate-400">Approximation algorithm.</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {domain === 'DISK' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
            <span className="text-emerald-400 font-bold block mb-1">Standard Workload:</span>
            Queue: [{DEFAULT_COMPARE_TRACKS.join(', ')}]. Initial Head: 53. Direction: Higher / Inward.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {diskResults.map(({ alg, result }) => {
              const isBest = result.totalHeadMovement === Math.min(...diskResults.map(r => r.result.totalHeadMovement));

              return (
                <div
                  key={alg}
                  className={`p-5 rounded-2xl border font-mono text-xs flex flex-col justify-between ${
                    isBest
                      ? 'bg-emerald-950/30 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="font-bold text-sm text-slate-200">{alg.replace('_', '-')}</span>
                      {isBest && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-emerald-400" /> Minimum Seek
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Head Movement:</span>
                        <span className={`font-bold ${isBest ? 'text-emerald-300 text-base' : 'text-slate-200'}`}>
                          {result.totalHeadMovement} Cylinders
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Avg Seek Distance:</span>
                        <span className="text-cyan-300 font-bold">{result.averageSeekDistance} Cyl</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Est. Seek Latency:</span>
                        <span className="text-purple-300 font-bold">{result.seekTimeEstimateMs} ms</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 truncate">
                    Order: {result.seekSequence.join(' → ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
