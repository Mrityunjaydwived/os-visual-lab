// CPU Scheduling Interactive Simulator with Step-by-Step "WHY?" Debugger
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  runCpuScheduling, 
  type ProcessInput, 
  type SchedulingAlgorithm, 
  type SchedulingResult 
} from '../../core/algorithms/cpuScheduling';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RotateCcw, 
  Plus, 
  Trash2, 
  HelpCircle, 
  Sliders, 
  Activity,
  Award
} from 'lucide-react';

const INITIAL_PROCESSES: ProcessInput[] = [
  { id: 'p1', name: 'P1', arrivalTime: 0, burstTime: 5, priority: 2, color: '#00f0ff' },
  { id: 'p2', name: 'P2', arrivalTime: 1, burstTime: 3, priority: 1, color: '#a855f7' },
  { id: 'p3', name: 'P3', arrivalTime: 2, burstTime: 8, priority: 3, color: '#10b981' },
  { id: 'p4', name: 'P4', arrivalTime: 3, burstTime: 6, priority: 2, color: '#f59e0b' }
];

export const CpuSchedulerVisualizer: React.FC = () => {
  const [processes, setProcesses] = useState<ProcessInput[]>(INITIAL_PROCESSES);
  const [algorithm, setAlgorithm] = useState<SchedulingAlgorithm>('SRTF_PREEMPTIVE');
  const [quantum, setQuantum] = useState<number>(2);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // ms per tick

  const timerRef = useRef<number | null>(null);

  // Compute simulation results deterministically
  const result: SchedulingResult = useMemo(() => {
    return runCpuScheduling(processes, algorithm, quantum);
  }, [processes, algorithm, quantum]);

  // Keep step index bounded
  const maxStep = Math.max(0, result.steps.length - 1);
  const activeStep = result.steps[currentStepIndex] || null;

  // Auto playback
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= maxStep) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, maxStep, playbackSpeed]);

  // Reset steps when algorithm or processes change
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [algorithm, processes, quantum]);

  const handleAddProcess = () => {
    const nextIdx = processes.length + 1;
    const colors = ['#00f0ff', '#a855f7', '#10b981', '#f59e0b', '#f43f5e', '#ec4899', '#3b82f6'];
    const newProc: ProcessInput = {
      id: `p${Date.now()}`,
      name: `P${nextIdx}`,
      arrivalTime: Math.floor(Math.random() * 5),
      burstTime: Math.floor(Math.random() * 6) + 2,
      priority: Math.floor(Math.random() * 4) + 1,
      color: colors[(nextIdx - 1) % colors.length]
    };
    setProcesses([...processes, newProc]);
  };

  const handleRemoveProcess = (id: string) => {
    if (processes.length <= 1) return;
    setProcesses(processes.filter(p => p.id !== id));
  };

  const handleUpdateProcess = (id: string, field: keyof ProcessInput, val: number | string) => {
    setProcesses(processes.map(p => {
      if (p.id === id) {
        return { ...p, [field]: typeof val === 'number' ? Math.max(0, val) : val };
      }
      return p;
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Algorithm Selector Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            CPU Scheduling Laboratory
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic timeline simulation with step-by-step dispatch rationale
          </p>
        </div>

        {/* Algorithm Dropdown & Quantum */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400 font-medium">Algorithm:</span>
            <select
              value={algorithm}
              onChange={e => setAlgorithm(e.target.value as SchedulingAlgorithm)}
              className="bg-transparent text-cyan-300 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="FCFS" className="bg-slate-900">FCFS (First-Come First-Served)</option>
              <option value="SJF_NON_PREEMPTIVE" className="bg-slate-900">SJF (Shortest Job First - Non-Preemptive)</option>
              <option value="SRTF_PREEMPTIVE" className="bg-slate-900">SRTF (Shortest Remaining Time First)</option>
              <option value="PRIORITY_NON_PREEMPTIVE" className="bg-slate-900">Priority (Non-Preemptive)</option>
              <option value="PRIORITY_PREEMPTIVE" className="bg-slate-900">Priority (Preemptive)</option>
              <option value="ROUND_ROBIN" className="bg-slate-900">Round Robin (RR)</option>
              <option value="MLFQ" className="bg-slate-900">MLFQ (Multilevel Feedback Queue)</option>
            </select>
          </div>

          {(algorithm === 'ROUND_ROBIN' || algorithm === 'MLFQ') && (
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
              <span className="text-slate-400">Quantum:</span>
              <input
                type="number"
                min="1"
                max="20"
                value={quantum}
                onChange={e => setQuantum(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-12 bg-slate-900 text-cyan-300 font-mono text-center rounded px-1 py-0.5 border border-slate-700"
              />
              <span className="text-slate-500 font-mono">ms</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Execution Grid: CPU Box + Ready Queue + Gantt Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Active CPU Core & Step Rationale */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Active CPU Core Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#070b16] border border-cyan-500/30 shadow-[0_0_30px_rgba(0,240,255,0.1)] text-center relative overflow-hidden">
            <div className="text-[10px] uppercase tracking-widest font-mono text-cyan-400/80 mb-1">
              Active Processor Core 0
            </div>
            
            <div className="my-4 h-24 flex items-center justify-center">
              {activeStep && activeStep.runningProcessName && activeStep.runningProcessName !== 'IDLE' ? (
                <div className="flex flex-col items-center animate-in zoom-in duration-200">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-xl font-black text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                    {activeStep.runningProcessName}
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 mt-2 flex items-center gap-1">
                    <Activity className="w-3 h-3 animate-pulse" />
                    EXECUTING
                  </span>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-slate-800/50 border border-slate-700 flex flex-col items-center justify-center text-slate-500 text-xs font-mono">
                  <span>CPU</span>
                  <span>IDLE</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800 font-mono text-[11px]">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Timeline Tick:</span>
                <span className="text-cyan-300 font-bold text-sm">t = {activeStep?.time ?? 0} ms</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Context Switches:</span>
                <span className="text-purple-300 font-bold text-sm">{result.contextSwitches}</span>
              </div>
            </div>
          </div>

          {/* "WHY DID THE SCHEDULER SELECT THIS PROCESS?" Box */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.1)]">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-purple-300 font-bold text-xs uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              Why Did The Scheduler Select This Process?
            </div>
            <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
              {activeStep?.whyExplanation || 'Step through the timeline using the playback controls below to inspect the scheduler\'s decision logic.'}
            </p>
          </div>

          {/* Ready Queue State */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs font-semibold text-slate-300 mb-2.5 flex items-center justify-between">
              <span>Ready Queue (FIFO):</span>
              <span className="text-[10px] font-mono text-cyan-400">
                {activeStep?.readyQueue.length || 0} waiting
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto py-1 min-h-[44px]">
              {activeStep && activeStep.readyQueue.length > 0 ? (
                activeStep.readyQueue.map((item, idx) => (
                  <div
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono shrink-0 shadow-sm"
                  >
                    {item}
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic font-mono">Queue is empty</span>
              )}
            </div>
          </div>

        </div>

        {/* Right 2 Columns: Dynamic Gantt Chart & Controls */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Gantt Chart Panel */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Gantt Chart Execution Timeline
              </h3>
              <span className="text-xs font-mono text-cyan-400">
                Total Time: {result.totalTime} ms
              </span>
            </div>

            {/* Visual Gantt Blocks */}
            <div className="relative w-full overflow-x-auto py-3">
              <div className="flex items-center min-w-[500px] h-12 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 p-1 gap-0.5">
                {result.ganttChart.map((block, idx) => {
                  const duration = block.endTime - block.startTime;
                  const total = Math.max(1, result.totalTime);
                  const widthPercent = (duration / total) * 100;
                  const isCurrent = activeStep && activeStep.time >= block.startTime && activeStep.time < block.endTime;

                  return (
                    <div
                      key={idx}
                      style={{ 
                        width: `${Math.max(6, widthPercent)}%`,
                        backgroundColor: block.processId === 'IDLE' ? '#1e293b' : `${block.color}25`,
                        borderColor: block.processId === 'IDLE' ? '#334155' : block.color
                      }}
                      className={`h-full flex items-center justify-center border rounded font-mono text-xs font-bold transition-all relative group cursor-pointer ${
                        isCurrent ? 'ring-2 ring-white scale-105 z-10' : 'hover:brightness-125'
                      }`}
                      onClick={() => {
                        const targetStepIdx = result.steps.findIndex(s => s.time === block.startTime);
                        if (targetStepIdx !== -1) setCurrentStepIndex(targetStepIdx);
                      }}
                    >
                      <span style={{ color: block.processId === 'IDLE' ? '#94a3b8' : block.color }}>
                        {block.processName}
                      </span>

                      {/* Tooltip on hover */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black/90 px-2 py-0.5 rounded text-[10px] text-white whitespace-nowrap z-20 font-mono">
                        [{block.startTime} → {block.endTime} ms]
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Time tick labels under Gantt Chart */}
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mt-1.5 px-1 min-w-[500px]">
                <span>0 ms</span>
                {result.ganttChart.map((b, idx) => (
                  <span key={idx} className="text-slate-400">
                    {b.endTime}
                  </span>
                ))}
              </div>
            </div>

            {/* Step Playback Controls */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentStepIndex(0)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  title="Restart to Start"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentStepIndex <= 0}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors cursor-pointer"
                  title="Previous Step"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                </button>
                <button
                  onClick={() => setCurrentStepIndex(prev => Math.min(maxStep, prev + 1))}
                  disabled={currentStepIndex >= maxStep}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors cursor-pointer"
                  title="Next Step"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Step Counter & Speed Slider */}
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-slate-400">
                  Step: <strong className="text-cyan-300">{currentStepIndex + 1}</strong> / {result.steps.length || 1}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 text-[10px]">Speed:</span>
                  <select
                    value={playbackSpeed}
                    onChange={e => setPlaybackSpeed(parseInt(e.target.value))}
                    className="bg-slate-800 text-slate-300 text-[11px] rounded px-1.5 py-0.5 border border-slate-700 focus:outline-none"
                  >
                    <option value="1500">0.5x</option>
                    <option value="1000">1x</option>
                    <option value="500">2x</option>
                    <option value="250">4x</option>
                  </select>
                </div>
              </div>

            </div>
          </div>

          {/* Metrics Summary Card Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Avg Waiting</span>
              <span className="text-base font-bold text-cyan-300 font-mono">{result.averageWaitingTime} ms</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Avg Turnaround</span>
              <span className="text-base font-bold text-purple-300 font-mono">{result.averageTurnaroundTime} ms</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Avg Response</span>
              <span className="text-base font-bold text-emerald-300 font-mono">{result.averageResponseTime} ms</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 block uppercase font-mono">CPU Utilization</span>
              <span className="text-base font-bold text-amber-300 font-mono">{result.cpuUtilization}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Throughput</span>
              <span className="text-base font-bold text-sky-300 font-mono">{result.throughput} p/ms</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Context Switches</span>
              <span className="text-base font-bold text-rose-300 font-mono">{result.contextSwitches}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Process Configuration & Detailed Metrics Table */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            Process Table & Performance Breakdown
          </h3>
          <button
            onClick={handleAddProcess}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Process</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                <th className="py-2.5 px-3">Process</th>
                <th className="py-2.5 px-3">Arrival (AT)</th>
                <th className="py-2.5 px-3">Burst (BT)</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3 text-cyan-400">Completion (CT)</th>
                <th className="py-2.5 px-3 text-purple-400">Turnaround (TAT)</th>
                <th className="py-2.5 px-3 text-emerald-400">Waiting (WT)</th>
                <th className="py-2.5 px-3 text-amber-400">Response (RT)</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {result.processMetrics.map(p => (
                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 font-bold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <input
                      type="text"
                      value={p.name}
                      onChange={e => handleUpdateProcess(p.id, 'name', e.target.value)}
                      className="w-12 bg-transparent text-slate-200 font-bold focus:outline-none"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      min="0"
                      value={p.arrivalTime}
                      onChange={e => handleUpdateProcess(p.id, 'arrivalTime', parseInt(e.target.value) || 0)}
                      className="w-14 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      min="1"
                      value={p.burstTime}
                      onChange={e => handleUpdateProcess(p.id, 'burstTime', parseInt(e.target.value) || 1)}
                      className="w-14 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      min="0"
                      value={p.priority ?? 0}
                      onChange={e => handleUpdateProcess(p.id, 'priority', parseInt(e.target.value) || 0)}
                      className="w-14 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200"
                    />
                  </td>
                  <td className="py-2 px-3 text-cyan-300 font-bold">{p.completionTime} ms</td>
                  <td className="py-2 px-3 text-purple-300 font-bold">{p.turnaroundTime} ms</td>
                  <td className="py-2 px-3 text-emerald-300 font-bold">{p.waitingTime} ms</td>
                  <td className="py-2 px-3 text-amber-300 font-bold">{p.responseTime} ms</td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => handleRemoveProcess(p.id)}
                      disabled={processes.length <= 1}
                      className="text-slate-600 hover:text-rose-400 disabled:opacity-30 transition-colors p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
