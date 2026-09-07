// Interactive Process State Lifecycle & PCB Visualizer
import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Clock, 
  Cpu, 
  FileText, 
  BookOpen, 
  AlertTriangle 
} from 'lucide-react';

export type ProcessState = 'NEW' | 'READY' | 'RUNNING' | 'WAITING' | 'TERMINATED' | 'SUSPENDED_READY' | 'SUSPENDED_WAITING';

export interface ProcessItem {
  pid: number;
  name: string;
  state: ProcessState;
  priority: number;
  burstRemaining: number;
  totalBurst: number;
  ioWaitRemaining: number;
  pc: string;
  sp: string;
  memoryLimitMb: number;
  openFiles: string[];
}

export const ProcessLifecycleVisualizer: React.FC = () => {
  const [mode, setMode] = useState<'VISUAL' | 'CONCEPT'>('VISUAL');
  const [isRunning, setIsRunning] = useState(false);
  const isRunningRef = useRef(isRunning);
  isRunningRef.current = isRunning;

  const [processes, setProcesses] = useState<ProcessItem[]>([
    {
      pid: 101,
      name: 'init/systemd',
      state: 'READY',
      priority: 1,
      burstRemaining: 8,
      totalBurst: 8,
      ioWaitRemaining: 0,
      pc: '0x00401020',
      sp: '0x7FFFB000',
      memoryLimitMb: 128,
      openFiles: ['/dev/null', '/var/log/syslog']
    },
    {
      pid: 102,
      name: 'web-browser',
      state: 'RUNNING',
      priority: 5,
      burstRemaining: 4,
      totalBurst: 6,
      ioWaitRemaining: 0,
      pc: '0x0040A500',
      sp: '0x7FFFC000',
      memoryLimitMb: 512,
      openFiles: ['stdin', 'stdout', 'socket:8080']
    },
    {
      pid: 103,
      name: 'db-worker',
      state: 'WAITING',
      priority: 3,
      burstRemaining: 5,
      totalBurst: 7,
      ioWaitRemaining: 3,
      pc: '0x0040F800',
      sp: '0x7FFFD000',
      memoryLimitMb: 256,
      openFiles: ['/var/data/users.db']
    }
  ]);

  const [selectedPid, setSelectedPid] = useState<number>(102);
  const [actionLog, setActionLog] = useState<string[]>([
    'Kernel initialized. PID 101 admitted to READY queue.',
    'CPU dispatched PID 102 to RUNNING state.',
    'PID 103 issued disk I/O request -> transitioned to WAITING.'
  ]);

  const selectedProcess = processes.find(p => p.pid === selectedPid) || processes[0];

  // Auto-run simulation tick
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setProcesses(prev => {
        return prev.map(p => {
          if (p.state === 'RUNNING') {
            const nextBurst = p.burstRemaining - 1;
            if (nextBurst <= 0) {
              addLog(`PID ${p.pid} (${p.name}) finished execution -> TERMINATED.`);
              return { ...p, burstRemaining: 0, state: 'TERMINATED' };
            }
            return { ...p, burstRemaining: nextBurst };
          }

          if (p.state === 'WAITING') {
            const nextWait = p.ioWaitRemaining - 1;
            if (nextWait <= 0) {
              addLog(`PID ${p.pid} (${p.name}) completed I/O -> moved to READY.`);
              return { ...p, ioWaitRemaining: 0, state: 'READY' };
            }
            return { ...p, ioWaitRemaining: nextWait };
          }

          return p;
        });
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [isRunning]);

  const addLog = (msg: string) => {
    setActionLog(prev => [msg, ...prev.slice(0, 7)]);
  };

  // State Transition Triggers
  const handleFork = () => {
    const nextPid = Math.max(...processes.map(p => p.pid), 100) + 1;
    const newProc: ProcessItem = {
      pid: nextPid,
      name: `worker-${nextPid}`,
      state: 'NEW',
      priority: Math.floor(Math.random() * 8) + 1,
      burstRemaining: Math.floor(Math.random() * 5) + 3,
      totalBurst: 6,
      ioWaitRemaining: 0,
      pc: `0x0040${Math.floor(Math.random() * 9000 + 1000)}`,
      sp: '0x7FFFF000',
      memoryLimitMb: 128,
      openFiles: ['stdin', 'stdout']
    };
    setProcesses(prev => [...prev, newProc]);
    setSelectedPid(nextPid);
    addLog(`sys_fork() created new child PID ${nextPid} (State: NEW).`);
  };

  const handleAdmit = (pid: number) => {
    setProcesses(prev => prev.map(p => p.pid === pid ? { ...p, state: 'READY' } : p));
    addLog(`Admitted PID ${pid} into READY queue.`);
  };

  const handleDispatch = (pid: number) => {
    // Put currently running to READY
    setProcesses(prev => prev.map(p => {
      if (p.state === 'RUNNING') {
        return { ...p, state: 'READY' };
      }
      if (p.pid === pid) {
        return { ...p, state: 'RUNNING' };
      }
      return p;
    }));
    addLog(`Scheduler context switch: Dispatched PID ${pid} to CPU (RUNNING).`);
  };

  const handleTimerInterrupt = () => {
    const running = processes.find(p => p.state === 'RUNNING');
    if (!running) {
      addLog('No process currently running to preempt.');
      return;
    }
    setProcesses(prev => prev.map(p => p.state === 'RUNNING' ? { ...p, state: 'READY' } : p));
    addLog(`Timer interrupt fired! Preempted PID ${running.pid} back to READY queue.`);
  };

  const handleIoRequest = () => {
    const running = processes.find(p => p.state === 'RUNNING');
    if (!running) {
      addLog('No process running to issue I/O syscall.');
      return;
    }
    setProcesses(prev => prev.map(p => p.pid === running.pid ? { ...p, state: 'WAITING', ioWaitRemaining: 4 } : p));
    addLog(`PID ${running.pid} executed read() system call -> blocked in WAITING state.`);
  };

  const handleIoComplete = (pid: number) => {
    setProcesses(prev => prev.map(p => p.pid === pid ? { ...p, state: 'READY', ioWaitRemaining: 0 } : p));
    addLog(`I/O controller signaled interrupt: PID ${pid} data ready -> READY.`);
  };

  const handleTerminate = (pid: number) => {
    setProcesses(prev => prev.map(p => p.pid === pid ? { ...p, state: 'TERMINATED', burstRemaining: 0 } : p));
    addLog(`Process PID ${pid} called exit(0) -> TERMINATED.`);
  };

  const stateColors: Record<ProcessState, { bg: string; border: string; text: string }> = {
    NEW: { bg: 'bg-indigo-950/40', border: 'border-indigo-500/40', text: 'text-indigo-300' },
    READY: { bg: 'bg-blue-950/40', border: 'border-blue-500/40', text: 'text-blue-300' },
    RUNNING: { bg: 'bg-emerald-950/50', border: 'border-emerald-500', text: 'text-emerald-300' },
    WAITING: { bg: 'bg-amber-950/40', border: 'border-amber-500/40', text: 'text-amber-300' },
    TERMINATED: { bg: 'bg-slate-900', border: 'border-slate-800', text: 'text-slate-500' },
    SUSPENDED_READY: { bg: 'bg-purple-950/30', border: 'border-purple-500/30', text: 'text-purple-300' },
    SUSPENDED_WAITING: { bg: 'bg-rose-950/30', border: 'border-rose-500/30', text: 'text-rose-300' }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 select-none">
      
      {/* Top Header & Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Process Lifecycle &amp; PCB Visualizer
            </h3>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-xs font-mono font-medium border border-blue-500/20">
              5 &amp; 7-State Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate process transitions, fork() clones, CPU dispatch, timer interrupts, and inspect live Process Control Blocks (PCB).
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => setMode('VISUAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              mode === 'VISUAL' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Visual Simulation
          </button>
          <button
            onClick={() => setMode('CONCEPT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              mode === 'CONCEPT' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Conceptual Deep-Dive &amp; GATE
          </button>
        </div>
      </div>

      {mode === 'VISUAL' ? (
        <div className="space-y-6">
          
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isRunning ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
              >
                {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isRunning ? 'Pause Auto-Tick' : 'Start Auto-Tick'}</span>
              </button>

              <button
                onClick={handleFork}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                <span>fork() New Process</span>
              </button>

              <button
                onClick={handleTimerInterrupt}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Timer Interrupt</span>
              </button>

              <button
                onClick={handleIoRequest}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Trigger I/O Wait</span>
              </button>
            </div>

            <button
              onClick={() => {
                setProcesses([
                  { pid: 101, name: 'init', state: 'READY', priority: 1, burstRemaining: 8, totalBurst: 8, ioWaitRemaining: 0, pc: '0x00401020', sp: '0x7FFFB000', memoryLimitMb: 128, openFiles: ['/dev/null'] },
                  { pid: 102, name: 'web-browser', state: 'RUNNING', priority: 5, burstRemaining: 4, totalBurst: 6, ioWaitRemaining: 0, pc: '0x0040A500', sp: '0x7FFFC000', memoryLimitMb: 512, openFiles: ['stdin', 'stdout'] }
                ]);
                setActionLog(['Simulation reset.']);
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Reset Processes"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive State Diagram Layout */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            
            {/* 1. NEW STATE */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-400 uppercase">1. New</span>
                <span className="text-[10px] font-mono text-slate-500">
                  {processes.filter(p => p.state === 'NEW').length} procs
                </span>
              </div>
              <div className="space-y-1.5 min-h-[90px]">
                {processes.filter(p => p.state === 'NEW').map(p => (
                  <div
                    key={p.pid}
                    onClick={() => setSelectedPid(p.pid)}
                    className={`p-2 rounded-lg border text-xs font-mono cursor-pointer transition-all ${
                      selectedPid === p.pid ? 'border-indigo-400 bg-indigo-950/40 text-white' : 'border-slate-800 bg-slate-900 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">PID {p.pid}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAdmit(p.pid); }}
                        className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-600 text-white"
                      >
                        Admit ➔
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400">{p.name}</span>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Process created; awaiting admission.</div>
            </div>

            {/* 2. READY STATE */}
            <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/30 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-400 uppercase">2. Ready</span>
                <span className="text-[10px] font-mono text-blue-400">
                  {processes.filter(p => p.state === 'READY').length} in Queue
                </span>
              </div>
              <div className="space-y-1.5 min-h-[90px]">
                {processes.filter(p => p.state === 'READY').map(p => (
                  <div
                    key={p.pid}
                    onClick={() => setSelectedPid(p.pid)}
                    className={`p-2 rounded-lg border text-xs font-mono cursor-pointer transition-all ${
                      selectedPid === p.pid ? 'border-blue-400 bg-blue-950/50 text-white' : 'border-slate-800 bg-slate-900 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">PID {p.pid}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDispatch(p.pid); }}
                        className="text-[9px] px-1.5 py-0.2 rounded bg-blue-600 hover:bg-blue-500 text-white"
                      >
                        Dispatch ➔
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400">{p.name} • Rem: {p.burstRemaining}s</span>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">In RAM; waiting for CPU core.</div>
            </div>

            {/* 3. RUNNING STATE */}
            <div className="p-4 rounded-xl bg-slate-950 border-2 border-emerald-500/60 shadow-md shadow-emerald-500/10 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" /> 3. Running (CPU)
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="space-y-1.5 min-h-[90px]">
                {processes.filter(p => p.state === 'RUNNING').map(p => (
                  <div
                    key={p.pid}
                    onClick={() => setSelectedPid(p.pid)}
                    className="p-2.5 rounded-lg border border-emerald-500 bg-emerald-950/40 text-xs font-mono cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">PID {p.pid}</span>
                      <span className="text-[10px] text-emerald-400 font-bold">{p.burstRemaining}s left</span>
                    </div>
                    <span className="text-[10px] text-slate-300">{p.name}</span>
                    <div className="mt-2 flex gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleTerminate(p.pid); }}
                        className="w-full text-[9px] py-1 rounded bg-rose-950 border border-rose-500/40 text-rose-300 hover:bg-rose-900"
                      >
                        Terminate
                      </button>
                    </div>
                  </div>
                ))}
                {processes.filter(p => p.state === 'RUNNING').length === 0 && (
                  <div className="h-16 border border-dashed border-slate-800 rounded-lg flex items-center justify-center text-slate-500 text-[10px] font-mono">
                    CPU Idle
                  </div>
                )}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Instructions executing on ALU.</div>
            </div>

            {/* 4. WAITING STATE */}
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase">4. Waiting (I/O)</span>
                <span className="text-[10px] font-mono text-amber-400">
                  {processes.filter(p => p.state === 'WAITING').length} blocked
                </span>
              </div>
              <div className="space-y-1.5 min-h-[90px]">
                {processes.filter(p => p.state === 'WAITING').map(p => (
                  <div
                    key={p.pid}
                    onClick={() => setSelectedPid(p.pid)}
                    className={`p-2 rounded-lg border text-xs font-mono cursor-pointer transition-all ${
                      selectedPid === p.pid ? 'border-amber-400 bg-amber-950/40 text-white' : 'border-slate-800 bg-slate-900 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">PID {p.pid}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleIoComplete(p.pid); }}
                        className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-bold"
                      >
                        I/O Done
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400">{p.name} • {p.ioWaitRemaining}s I/O</span>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Blocked on I/O or semaphore.</div>
            </div>

            {/* 5. TERMINATED STATE */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">5. Terminated</span>
                <span className="text-[10px] font-mono text-slate-500">
                  {processes.filter(p => p.state === 'TERMINATED').length} exited
                </span>
              </div>
              <div className="space-y-1.5 min-h-[90px]">
                {processes.filter(p => p.state === 'TERMINATED').map(p => (
                  <div
                    key={p.pid}
                    onClick={() => setSelectedPid(p.pid)}
                    className="p-2 rounded-lg border border-slate-800 bg-slate-900/50 text-xs font-mono text-slate-500 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="line-through">PID {p.pid}</span>
                      <span className="text-[9px]">Exit code: 0</span>
                    </div>
                    <span className="text-[10px]">{p.name}</span>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Reaped by parent or init.</div>
            </div>

          </div>

          {/* Bottom Grid: Live PCB Inspector & Kernel Action Log */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* PCB Inspector (Col 7) */}
            <div className="md:col-span-7 p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-white font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  Process Control Block (PCB) — PID {selectedProcess.pid}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${stateColors[selectedProcess.state].bg} ${stateColors[selectedProcess.state].border} ${stateColors[selectedProcess.state].text}`}>
                  {selectedProcess.state}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Process Name:</span>
                  <span className="text-white font-semibold">{selectedProcess.name}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Priority (Nice):</span>
                  <span className="text-amber-400 font-semibold">{selectedProcess.priority} (Normal)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Memory Limit:</span>
                  <span className="text-blue-400 font-semibold">{selectedProcess.memoryLimitMb} MB</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Program Counter (PC):</span>
                  <span className="text-emerald-400 font-semibold">{selectedProcess.pc}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Stack Pointer (SP):</span>
                  <span className="text-purple-400 font-semibold">{selectedProcess.sp}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">CPU Execution Left:</span>
                  <span className="text-slate-200 font-semibold">{selectedProcess.burstRemaining}s / {selectedProcess.totalBurst}s</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-slate-500 block text-[10px] mb-1">Open File Descriptors:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProcess.openFiles.map((fd, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                      fd[{idx}]: {fd}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Kernel Event Log (Col 5) */}
            <div className="md:col-span-5 p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 font-mono text-xs">
              <span className="text-slate-400 font-bold block pb-1 border-b border-slate-800">
                Kernel Ring 0 Event Log
              </span>
              <div className="space-y-1.5 overflow-y-auto max-h-[190px]">
                {actionLog.map((log, idx) => (
                  <div key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                    <span className="text-blue-400 shrink-0">›</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* CONCEPTUAL DEEP-DIVE & GATE THEORY */
        <div className="space-y-6 text-slate-300 leading-relaxed text-sm">
          
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              Process State Transition Model &amp; Core Invariants
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              An operating system isolates each program in its own address space. The lifecycle describes all possible states a thread or process can enter from creation to resource reclamation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-blue-400 font-bold block mb-1">5-State Model:</span>
                <span>New ➔ Ready ➔ Running ➔ Waiting ➔ Terminated</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-purple-400 font-bold block mb-1">7-State (Swapping) Model:</span>
                <span>Includes Suspended-Ready and Suspended-Blocked in secondary storage swap space.</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Context Switching */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                Context Switch Mechanics &amp; Overheads
              </h5>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                A context switch saves the current CPU registers into PCB1 and restores the saved state from PCB2.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-400 list-disc list-inside">
                <li><strong className="text-slate-200">Direct Overhead:</strong> Saving program counters, general-purpose registers, stack pointers, and switching page table registers (CR3 in x86).</li>
                <li><strong className="text-slate-200">Indirect Overhead:</strong> TLB flush causes subsequent translation misses; CPU L1/L2 caches become cold.</li>
              </ul>
            </div>

            {/* GATE CS Solved Traps */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-rose-400 font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                GATE CS Trap: fork() Tree Arithmetic
              </h5>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Each call to <code className="text-blue-300">fork()</code> doubles the number of concurrent processes:
              </p>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-blue-300">
                Number of total processes created by n consecutive forks = 2^n<br/>
                Number of CHILD processes created = 2^n - 1
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                If <code className="text-slate-200">fork()</code> is inside a loop of length 3, total processes = 8, and 7 new child processes were spawned.
              </p>
            </div>

          </div>

          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 text-xs flex items-center justify-between">
            <span className="text-blue-300 font-sans">
              Want to see these processes scheduled on physical CPU sockets?
            </span>
            <button
              onClick={() => setMode('VISUAL')}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
            >
              Return to Visual Simulator
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
