// Interactive Practice Mode & Custom User Sandbox
import React, { useState } from 'react';
import { runCpuScheduling, type SchedulingAlgorithm, type ProcessInput as Process } from '../../core/algorithms/cpuScheduling';
import { runPageReplacement, type PageReplacementAlgorithm } from '../../core/algorithms/pageReplacement';
import { runDiskScheduling, type DiskAlgorithm, type DiskDirection } from '../../core/algorithms/diskScheduling';
import { runMemoryAllocation, type AllocationAlgorithm } from '../../core/algorithms/memoryAllocation';
import { 
  Plus, 
  Trash2, 
  Cpu, 
  RefreshCw, 
  Compass, 
  Layers, 
  Calculator, 
  Sparkles
} from 'lucide-react';

export type PracticeTopic = 'CPU_SCHEDULING' | 'PAGE_REPLACEMENT' | 'DISK_SCHEDULING' | 'MEMORY_ALLOCATION' | 'PAGING_MATH';

interface Props {
  initialTopic?: PracticeTopic;
}

export const PracticeSandbox: React.FC<Props> = ({ initialTopic = 'CPU_SCHEDULING' }) => {
  const [activeTopic, setActiveTopic] = useState<PracticeTopic>(initialTopic);

  // ---------------------------------------------------------------------------
  // 1. CPU SCHEDULING PRACTICE STATE
  // ---------------------------------------------------------------------------
  const [cpuProcesses, setCpuProcesses] = useState<Process[]>([
    { id: 'p1', name: 'P1', arrivalTime: 0, burstTime: 5, priority: 2, color: '#3B82F6' },
    { id: 'p2', name: 'P2', arrivalTime: 1, burstTime: 3, priority: 1, color: '#F59E0B' },
    { id: 'p3', name: 'P3', arrivalTime: 2, burstTime: 8, priority: 4, color: '#10B981' },
    { id: 'p4', name: 'P4', arrivalTime: 3, burstTime: 2, priority: 3, color: '#6366F1' },
  ]);
  const [cpuAlgo, setCpuAlgo] = useState<SchedulingAlgorithm>('ROUND_ROBIN');
  const [cpuQuantum, setCpuQuantum] = useState<number>(2);

  const cpuResult = React.useMemo(() => {
    return runCpuScheduling(cpuProcesses, cpuAlgo, cpuQuantum);
  }, [cpuProcesses, cpuAlgo, cpuQuantum]);

  const handleAddProcess = () => {
    const nextIdx = cpuProcesses.length + 1;
    const colors = ['#3B82F6', '#F59E0B', '#10B981', '#6366F1', '#EC4899', '#06B6D4'];
    setCpuProcesses(prev => [
      ...prev,
      {
        id: `p${nextIdx}`,
        name: `P${nextIdx}`,
        arrivalTime: prev.length > 0 ? prev[prev.length - 1].arrivalTime + 1 : 0,
        burstTime: Math.floor(Math.random() * 6) + 2,
        priority: Math.floor(Math.random() * 4) + 1,
        color: colors[prev.length % colors.length]
      }
    ]);
  };

  const handleRemoveProcess = (id: string) => {
    if (cpuProcesses.length <= 1) return;
    setCpuProcesses(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdateProcess = (id: string, field: keyof Process, val: number) => {
    setCpuProcesses(prev => prev.map(p => p.id === id ? { ...p, [field]: Math.max(0, val) } : p));
  };

  // ---------------------------------------------------------------------------
  // 2. PAGE REPLACEMENT PRACTICE STATE
  // ---------------------------------------------------------------------------
  const [pageStringInput, setPageStringInput] = useState<string>('7, 0, 1, 2, 0, 3, 0, 4, 2, 3');
  const [frameCount, setFrameCount] = useState<number>(3);
  const [pageAlgo, setPageAlgo] = useState<PageReplacementAlgorithm>('LRU');

  const pageResult = React.useMemo(() => {
    const parsed = pageStringInput
      .split(',')
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n));
    return runPageReplacement(parsed.length > 0 ? parsed : [1, 2, 3], frameCount, pageAlgo);
  }, [pageStringInput, frameCount, pageAlgo]);

  // ---------------------------------------------------------------------------
  // 3. DISK SCHEDULING PRACTICE STATE
  // ---------------------------------------------------------------------------
  const [diskQueueInput, setDiskQueueInput] = useState<string>('98, 183, 37, 122, 14, 124, 65, 67');
  const [initialHead, setInitialHead] = useState<number>(53);
  const [totalCylinders, setTotalCylinders] = useState<number>(200);
  const [diskDirection, setDiskDirection] = useState<DiskDirection>('RIGHT');
  const [diskAlgo, setDiskAlgo] = useState<DiskAlgorithm>('SSTF');

  const diskResult = React.useMemo(() => {
    const parsed = diskQueueInput
      .split(',')
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n));
    return runDiskScheduling(parsed.length > 0 ? parsed : [50, 100], initialHead, diskDirection, totalCylinders, diskAlgo);
  }, [diskQueueInput, initialHead, diskDirection, totalCylinders, diskAlgo]);

  // ---------------------------------------------------------------------------
  // 4. MEMORY ALLOCATION PRACTICE STATE
  // ---------------------------------------------------------------------------
  const [blockInput, setBlockInput] = useState<string>('100, 500, 200, 300, 600');
  const [processInput, setProcessInput] = useState<string>('212, 417, 112, 426');
  const [memAlgo, setMemAlgo] = useState<AllocationAlgorithm>('FIRST_FIT');

  const memResult = React.useMemo(() => {
    const blocks = blockInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const requests = processInput.split(',').map((s, idx) => ({
      id: `p${idx + 1}`,
      name: `P${idx + 1}`,
      size: parseInt(s.trim()) || 0
    })).filter(p => p.size > 0);

    return runMemoryAllocation(blocks.length > 0 ? blocks : [200], requests.length > 0 ? requests : [{ id: 'p1', name: 'P1', size: 100 }], memAlgo);
  }, [blockInput, processInput, memAlgo]);

  // ---------------------------------------------------------------------------
  // 5. PAGING & TLB MATH CALCULATOR
  // ---------------------------------------------------------------------------
  const [vaBits, setVaBits] = useState<number>(32);
  const [pageSizeKb, setPageSizeKb] = useState<number>(4);
  const [pteSizeBytes, setPteSizeBytes] = useState<number>(4);
  const [tlbHitRatePct, setTlbHitRatePct] = useState<number>(90);
  const [memAccessTimeNs, setMemAccessTimeNs] = useState<number>(100);
  const [tlbAccessTimeNs, setTlbAccessTimeNs] = useState<number>(10);

  const pagingCalculations = React.useMemo(() => {
    const pageSizeBytes = pageSizeKb * 1024;
    const offsetBits = Math.log2(pageSizeBytes);
    const pageNumberBits = vaBits - offsetBits;
    const numPages = Math.pow(2, pageNumberBits);
    const pageTableSizeBytes = numPages * pteSizeBytes;
    const pageTableSizeMb = pageTableSizeBytes / (1024 * 1024);

    const h = tlbHitRatePct / 100;
    // Single-level EMAT: h*(t_tlb + t_mem) + (1-h)*(t_tlb + 2*t_mem)
    const ematSingleLevel = h * (tlbAccessTimeNs + memAccessTimeNs) + (1 - h) * (tlbAccessTimeNs + 2 * memAccessTimeNs);
    // Two-level EMAT: h*(t_tlb + t_mem) + (1-h)*(t_tlb + 3*t_mem)
    const ematTwoLevel = h * (tlbAccessTimeNs + memAccessTimeNs) + (1 - h) * (tlbAccessTimeNs + 3 * memAccessTimeNs);

    return {
      offsetBits,
      pageNumberBits,
      numPages,
      pageTableSizeMb,
      ematSingleLevel,
      ematTwoLevel
    };
  }, [vaBits, pageSizeKb, pteSizeBytes, tlbHitRatePct, memAccessTimeNs, tlbAccessTimeNs]);

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 select-none animate-in fade-in duration-150">
      
      {/* Sandbox Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Interactive Custom Practice Sandbox
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Input your own custom data, test hypothetical edge cases, and inspect deterministic step-by-step execution.
          </p>
        </div>

        {/* Practice Topic Pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto text-xs font-medium">
          {[
            { id: 'CPU_SCHEDULING', label: 'CPU Scheduling', icon: <Cpu className="w-3.5 h-3.5" /> },
            { id: 'PAGE_REPLACEMENT', label: 'Page Replacement', icon: <RefreshCw className="w-3.5 h-3.5" /> },
            { id: 'DISK_SCHEDULING', label: 'Disk Seeking', icon: <Compass className="w-3.5 h-3.5" /> },
            { id: 'MEMORY_ALLOCATION', label: 'Memory Partitioning', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'PAGING_MATH', label: 'Paging & EMAT Math', icon: <Calculator className="w-3.5 h-3.5" /> },
          ].map(topic => (
            <button
              key={topic.id}
              onClick={() => setActiveTopic(topic.id as PracticeTopic)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTopic === topic.id
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {topic.icon}
              <span>{topic.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 1. CPU SCHEDULING SANDBOX                                            */}
      {/* -------------------------------------------------------------------- */}
      {activeTopic === 'CPU_SCHEDULING' && (
        <div className="space-y-5">
          
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono">Algorithm:</span>
              {(['FCFS', 'SJF_NON_PREEMPTIVE', 'ROUND_ROBIN', 'PRIORITY_NON_PREEMPTIVE'] as SchedulingAlgorithm[]).map(algo => (
                <button
                  key={algo}
                  onClick={() => setCpuAlgo(algo)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-medium transition-all cursor-pointer ${
                    cpuAlgo === algo
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {algo === 'SJF_NON_PREEMPTIVE' ? 'SJF' : algo === 'ROUND_ROBIN' ? 'Round Robin' : algo === 'PRIORITY_NON_PREEMPTIVE' ? 'Priority' : 'FCFS'}
                </button>
              ))}
            </div>

            {cpuAlgo === 'ROUND_ROBIN' && (
              <div className="flex items-center gap-2 font-mono">
                <span className="text-slate-400">Time Quantum (q):</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={cpuQuantum}
                  onChange={e => setCpuQuantum(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-white text-center font-bold"
                />
              </div>
            )}

            <button
              onClick={handleAddProcess}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Process</span>
            </button>
          </div>

          {/* User Process Input Table */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
            <span className="text-white font-bold block">
              Editable Process Parameters (Click values to modify):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {cpuProcesses.map(p => (
                <div key={p.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                      {p.name}
                    </span>
                    {cpuProcesses.length > 1 && (
                      <button 
                        onClick={() => handleRemoveProcess(p.id)}
                        className="text-slate-500 hover:text-rose-400 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Arrival:</span>
                      <input
                        type="number"
                        min={0}
                        value={p.arrivalTime}
                        onChange={e => handleUpdateProcess(p.id, 'arrivalTime', parseInt(e.target.value) || 0)}
                        className="w-full px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-200"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Burst:</span>
                      <input
                        type="number"
                        min={1}
                        value={p.burstTime}
                        onChange={e => handleUpdateProcess(p.id, 'burstTime', parseInt(e.target.value) || 1)}
                        className="w-full px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-blue-400 font-bold"
                      />
                    </div>
                  </div>

                  {cpuAlgo === 'PRIORITY_NON_PREEMPTIVE' && (
                    <div className="pt-1">
                      <span className="text-slate-500 block text-[10px]">Priority (Lower = Higher):</span>
                      <input
                        type="number"
                        min={1}
                        value={p.priority || 1}
                        onChange={e => handleUpdateProcess(p.id, 'priority', parseInt(e.target.value) || 1)}
                        className="w-full px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-400 font-bold"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Generated Live Gantt Chart */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Live Generated Execution Gantt Timeline:</span>
              <span className="text-white font-bold">Total Duration: {cpuResult.totalTime} units</span>
            </div>

            <div className="flex items-center h-12 rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
              {cpuResult.ganttChart.map((block, idx) => (
                <div
                  key={idx}
                  style={{ width: `${Math.max(10, ((block.endTime - block.startTime) / cpuResult.totalTime) * 100)}%` }}
                  className="h-full border-r border-slate-950 flex flex-col items-center justify-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
                >
                  <span className="text-[11px]">{block.processName}</span>
                  <span className="text-[9px] text-blue-200 font-normal">[{block.startTime}-{block.endTime}]</span>
                </div>
              ))}
            </div>
          </div>

          {/* Numerical Calculation Verification Table */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
            <span className="text-white font-bold block">
              Step-by-Step Numerical Verification Table:
            </span>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2 px-3">Process</th>
                    <th className="py-2 px-3">Arrival (AT)</th>
                    <th className="py-2 px-3">Burst (BT)</th>
                    <th className="py-2 px-3">Completion (CT)</th>
                    <th className="py-2 px-3">Turnaround (TAT = CT - AT)</th>
                    <th className="py-2 px-3">Waiting (WT = TAT - BT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {cpuProcesses.map(p => {
                    const metric = cpuResult.processMetrics?.find(m => m.id === p.id);
                    const ct = metric ? metric.completionTime : 0;
                    const tat = metric ? metric.turnaroundTime : 0;
                    const wt = metric ? metric.waitingTime : 0;
                    return (
                      <tr key={p.id} className="hover:bg-slate-900/50">
                        <td className="py-2 px-3 font-bold text-white">{p.name}</td>
                        <td className="py-2 px-3">{p.arrivalTime}</td>
                        <td className="py-2 px-3 text-blue-400">{p.burstTime}</td>
                        <td className="py-2 px-3 font-bold text-emerald-400">{ct}</td>
                        <td className="py-2 px-3 font-bold text-amber-400">{tat}</td>
                        <td className="py-2 px-3 font-bold text-purple-400">{wt}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 font-mono text-xs">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Average Turnaround Time:</span>
                <span className="text-sm font-bold text-amber-400">{cpuResult.averageTurnaroundTime.toFixed(2)} units</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Average Waiting Time:</span>
                <span className="text-sm font-bold text-purple-400">{cpuResult.averageWaitingTime.toFixed(2)} units</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">CPU Utilization:</span>
                <span className="text-sm font-bold text-emerald-400">{cpuResult.cpuUtilization.toFixed(1)}%</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Context Switches:</span>
                <span className="text-sm font-bold text-white">{cpuResult.contextSwitches}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 2. PAGE REPLACEMENT SANDBOX                                          */}
      {/* -------------------------------------------------------------------- */}
      {activeTopic === 'PAGE_REPLACEMENT' && (
        <div className="space-y-5">
          
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Algorithm:</span>
                {(['FIFO', 'LRU', 'OPTIMAL'] as PageReplacementAlgorithm[]).map(algo => (
                  <button
                    key={algo}
                    onClick={() => setPageAlgo(algo)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                      pageAlgo === algo
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {algo}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">Physical Frames:</span>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={frameCount}
                  onChange={e => setFrameCount(Math.max(1, Math.min(8, parseInt(e.target.value) || 3)))}
                  className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-white text-center font-bold"
                />
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Custom Reference String (comma-separated page requests):</span>
              <input
                type="text"
                value={pageStringInput}
                onChange={e => setPageStringInput(e.target.value)}
                placeholder="e.g. 7, 0, 1, 2, 0, 3, 0, 4, 2, 3"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-bold focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Tip: Test Belady's Anomaly with string: <code className="text-amber-400">1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5</code> and compare 3 frames vs 4 frames under FIFO!
              </span>
            </div>
          </div>

          {/* Stepping Output Frames */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold">Execution Steps ({pageResult.steps.length} Accesses):</span>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-bold">Hits: {pageResult.pageHits}</span>
                <span className="text-rose-400 font-bold">Faults: {pageResult.pageFaults}</span>
                <span className="text-blue-400 font-bold">Hit Ratio: {pageResult.hitRatio.toFixed(1)}%</span>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {pageResult.steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border text-center shrink-0 min-w-[64px] ${
                    step.isHit
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  }`}
                >
                  <div className="font-bold text-xs">Page {step.page}</div>
                  <div className="text-[10px] font-bold mt-0.5">
                    {step.isHit ? 'HIT' : 'FAULT'}
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-slate-800/80 space-y-1">
                    {step.frames.map((f, fIdx) => (
                      <div key={fIdx} className="text-[10px] bg-slate-900 rounded py-0.5 text-slate-300">
                        {f !== null ? f : '-'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 3. DISK SCHEDULING SANDBOX                                           */}
      {/* -------------------------------------------------------------------- */}
      {activeTopic === 'DISK_SCHEDULING' && (
        <div className="space-y-5">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Algorithm:</span>
                {(['FCFS', 'SSTF', 'SCAN', 'C_SCAN', 'LOOK', 'C_LOOK'] as DiskAlgorithm[]).map(algo => (
                  <button
                    key={algo}
                    onClick={() => setDiskAlgo(algo)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                      diskAlgo === algo
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {algo}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Total Cylinders:</span>
                  <input
                    type="number"
                    min={10}
                    max={10000}
                    value={totalCylinders}
                    onChange={e => setTotalCylinders(Math.max(10, parseInt(e.target.value) || 200))}
                    className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-white text-center font-bold"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Head:</span>
                  <input
                    type="number"
                    min={0}
                    max={totalCylinders - 1}
                    value={initialHead}
                    onChange={e => setInitialHead(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-white text-center font-bold"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Direction:</span>
                  <button
                    onClick={() => setDiskDirection(diskDirection === 'RIGHT' ? 'LEFT' : 'RIGHT')}
                    className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-blue-400 font-bold cursor-pointer"
                  >
                    {diskDirection === 'RIGHT' ? 'Right (➔)' : 'Left (⬅)'}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Cylinder Seek Requests (comma-separated):</span>
              <input
                type="text"
                value={diskQueueInput}
                onChange={e => setDiskQueueInput(e.target.value)}
                placeholder="e.g. 98, 183, 37, 122, 14, 124, 65, 67"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-bold focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Results Display */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold">Seek Execution Path:</span>
              <span className="text-blue-400 font-bold text-sm">
                Total Head Movement: {diskResult.totalHeadMovement} Cylinders
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2 flex-wrap text-slate-300">
              <span className="text-slate-500">Path:</span>
              {diskResult.seekSequence.map((cyl, idx) => (
                <span key={idx} className="flex items-center gap-1">
                  <span className={`font-bold ${idx === 0 ? 'text-amber-400' : 'text-blue-400'}`}>
                    #{cyl}
                  </span>
                  {idx < diskResult.seekSequence.length - 1 && <span className="text-slate-600">➔</span>}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-[11px]">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Average Seek Distance:</span>
                <span className="text-white font-bold">{diskResult.averageSeekDistance.toFixed(2)} tracks/request</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Estimated Seek Time (@ 0.1ms/track):</span>
                <span className="text-emerald-400 font-bold">{diskResult.seekTimeEstimateMs.toFixed(2)} ms</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 4. MEMORY ALLOCATION SANDBOX                                         */}
      {/* -------------------------------------------------------------------- */}
      {activeTopic === 'MEMORY_ALLOCATION' && (
        <div className="space-y-5">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Strategy:</span>
              {(['FIRST_FIT', 'BEST_FIT', 'WORST_FIT', 'NEXT_FIT'] as AllocationAlgorithm[]).map(algo => (
                <button
                  key={algo}
                  onClick={() => setMemAlgo(algo)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    memAlgo === algo
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {algo.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block mb-1">Partition Sizes (MB, comma-separated):</span>
                <input
                  type="text"
                  value={blockInput}
                  onChange={e => setBlockInput(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-bold"
                />
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Process Requests (MB, comma-separated):</span>
                <input
                  type="text"
                  value={processInput}
                  onChange={e => setProcessInput(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-blue-400 font-bold"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold">Partition Allocation State:</span>
              <div className="flex items-center gap-3">
                <span className="text-blue-400 font-bold">Total Allocated: {memResult.totalAllocated} MB</span>
                <span className="text-amber-400 font-bold">Internal Fragmentation: {memResult.totalInternalFragmentation} MB</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 pt-1">
              {memResult.finalBlocks.map(block => (
                <div key={block.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Block #{block.id}</span>
                    <span className="font-bold text-white">{block.size} MB</span>
                  </div>
                  <div className={`p-1.5 rounded text-center font-bold ${
                    block.allocatedProcessName
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-950 text-slate-500 border border-dashed border-slate-800'
                  }`}>
                    {block.allocatedProcessName ? `${block.allocatedProcessName} (${block.allocatedSize} MB)` : 'Free Hole'}
                  </div>
                  {block.internalFragmentation > 0 && (
                    <div className="text-[10px] text-amber-400 text-center">
                      +{block.internalFragmentation} MB wasted
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 5. PAGING & EMAT MATH CALCULATOR                                     */}
      {/* -------------------------------------------------------------------- */}
      {activeTopic === 'PAGING_MATH' && (
        <div className="space-y-5">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div>
              <span className="text-slate-400 block mb-1">Virtual Address Bits:</span>
              <input
                type="number"
                value={vaBits}
                onChange={e => setVaBits(parseInt(e.target.value) || 32)}
                className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-white font-bold"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Page Size (KB):</span>
              <input
                type="number"
                value={pageSizeKb}
                onChange={e => setPageSizeKb(parseInt(e.target.value) || 4)}
                className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-blue-400 font-bold"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-1">PTE Size (Bytes):</span>
              <input
                type="number"
                value={pteSizeBytes}
                onChange={e => setPteSizeBytes(parseInt(e.target.value) || 4)}
                className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-white font-bold"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-1">TLB Hit Rate (%):</span>
              <input
                type="number"
                min={0}
                max={100}
                value={tlbHitRatePct}
                onChange={e => setTlbHitRatePct(parseInt(e.target.value) || 90)}
                className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-bold"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Memory Latency (ns):</span>
              <input
                type="number"
                value={memAccessTimeNs}
                onChange={e => setMemAccessTimeNs(parseInt(e.target.value) || 100)}
                className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-white font-bold"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-1">TLB Latency (ns):</span>
              <input
                type="number"
                value={tlbAccessTimeNs}
                onChange={e => setTlbAccessTimeNs(parseInt(e.target.value) || 10)}
                className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-white font-bold"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
            <span className="text-white font-bold block">
              Deterministic Mathematical Output:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Offset Bits:</span>
                <span className="text-sm font-bold text-white">{pagingCalculations.offsetBits} bits</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Page Number Bits:</span>
                <span className="text-sm font-bold text-blue-400">{pagingCalculations.pageNumberBits} bits</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Single-Level Page Table Size:</span>
                <span className="text-sm font-bold text-amber-400">{pagingCalculations.pageTableSizeMb.toFixed(2)} MB</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">EMAT (1-Level Paging):</span>
                <span className="text-sm font-bold text-emerald-400">{pagingCalculations.ematSingleLevel.toFixed(2)} ns</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">EMAT (2-Level Paging):</span>
                <span className="text-sm font-bold text-purple-400">{pagingCalculations.ematTwoLevel.toFixed(2)} ns</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Total Virtual Pages:</span>
                <span className="text-sm font-bold text-slate-300">{pagingCalculations.numPages.toLocaleString()} pages</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
