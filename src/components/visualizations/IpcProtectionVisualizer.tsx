// Interactive IPC & OS Protection/Security Visualizer
// Covers Module 06 (Inter-Process Communication) and Module 20 (Protection & Security)
import React, { useState } from 'react';
import { 
  Share2, 
  ShieldAlert, 
  ShieldCheck, 
  RotateCcw, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Database, 
  Terminal, 
  Layers, 
  ArrowRight
} from 'lucide-react';

export type IpcMode = 'PIPE' | 'SHARED_MEMORY' | 'ACCESS_MATRIX' | 'STACK_CANARY';

export const IpcProtectionVisualizer: React.FC = () => {
  const [activeMode, setActiveMode] = useState<IpcMode>('PIPE');

  // ---------------------------------------------------------------------------
  // 1. PIPE SIMULATION STATE
  // ---------------------------------------------------------------------------
  const PIPE_CAPACITY = 16; // 16 blocks (e.g. 16 KB)
  const [pipeBuffer, setPipeBuffer] = useState<string[]>(['data', 'init', 'hdr']);
  const [isReaderClosed, setIsReaderClosed] = useState(false);
  const [pipeLog, setPipeLog] = useState<string[]>([
    'pipe(fd) initialized: read_fd=3, write_fd=4, capacity=16 KB',
    'Writer queued initial payload.'
  ]);
  const [sigpipeTriggered, setSigpipeTriggered] = useState(false);

  const handleWriteToPipe = () => {
    if (isReaderClosed) {
      setSigpipeTriggered(true);
      setPipeLog(prev => [
        '⚠️ CRITICAL: write() called on broken pipe (all readers closed)!',
        'Kernel raised SIGPIPE (signal 13) -> EPIPE error returned to writer process.',
        ...prev.slice(0, 5)
      ]);
      return;
    }
    if (pipeBuffer.length >= PIPE_CAPACITY) {
      setPipeLog(prev => [
        'Pipe is FULL (16/16 KB). write() blocked until reader frees space.',
        ...prev.slice(0, 5)
      ]);
      return;
    }
    const token = `pkt_${Math.floor(Math.random() * 900 + 100)}`;
    setPipeBuffer(prev => [...prev, token]);
    setPipeLog(prev => [`Writer wrote 1 KB block [${token}]. Buffer: ${pipeBuffer.length + 1}/${PIPE_CAPACITY} KB`, ...prev.slice(0, 5)]);
  };

  const handleReadFromPipe = () => {
    if (pipeBuffer.length === 0) {
      setPipeLog(prev => [
        'Pipe is EMPTY (0 KB). read() blocked waiting for writer.',
        ...prev.slice(0, 5)
      ]);
      return;
    }
    const readItem = pipeBuffer[0];
    setPipeBuffer(prev => prev.slice(1));
    setPipeLog(prev => [`Reader consumed block [${readItem}]. Buffer: ${pipeBuffer.length - 1}/${PIPE_CAPACITY} KB`, ...prev.slice(0, 5)]);
  };

  // ---------------------------------------------------------------------------
  // 2. SHARED MEMORY STATE
  // ---------------------------------------------------------------------------
  const [shmValue, setShmValue] = useState<number>(42);
  const [isMutexLocked, setIsMutexLocked] = useState<boolean>(true);
  const [shmRaceDetected, setShmRaceDetected] = useState<boolean>(false);
  const [shmLog, setShmLog] = useState<string[]>([
    'shmget(0x1234, 4096, IPC_CREAT | 0666) -> ShmID 9481',
    'shmat() mapped physical Frame 0x8A00 into Process A and Process B virtual address space.'
  ]);

  const handleShmConcurrentWrite = () => {
    if (!isMutexLocked) {
      setShmRaceDetected(true);
      setShmValue(prev => prev + 1);
      setShmLog(prev => [
        '⚠️ RACE CONDITION! Both Process A and Process B wrote to shared DRAM frame simultaneously without a mutex lock!',
        'Data corruption hazard detected: lost update anomaly occurred.',
        ...prev.slice(0, 5)
      ]);
    } else {
      setShmRaceDetected(false);
      setShmValue(prev => prev + 1);
      setShmLog(prev => [
        'Mutex Lock Acquired. Process A safely updated shared memory at DRAM bus speed (0 syscalls). Mutex released.',
        ...prev.slice(0, 5)
      ]);
    }
  };

  // ---------------------------------------------------------------------------
  // 3. ACCESS MATRIX STATE
  // ---------------------------------------------------------------------------
  type Permission = 'R' | 'W' | 'X';
  const [accessMatrix, setAccessMatrix] = useState<Record<string, Record<string, string[]>>>({
    'Domain 0 (Root)': {
      '/etc/shadow': ['R', 'W'],
      '/var/log/syslog': ['R', 'W', 'X'],
      '/home/alice/doc.pdf': ['R', 'W'],
      '/dev/tty0': ['R', 'W']
    },
    'Domain 1 (Alice)': {
      '/etc/shadow': [],
      '/var/log/syslog': ['R'],
      '/home/alice/doc.pdf': ['R', 'W'],
      '/dev/tty0': ['R', 'W']
    },
    'Domain 2 (Bob)': {
      '/etc/shadow': [],
      '/var/log/syslog': ['R'],
      '/home/alice/doc.pdf': ['R'],
      '/dev/tty0': ['R', 'W']
    },
    'Domain 3 (Guest)': {
      '/etc/shadow': [],
      '/var/log/syslog': [],
      '/home/alice/doc.pdf': [],
      '/dev/tty0': ['R']
    }
  });

  const domains = ['Domain 0 (Root)', 'Domain 1 (Alice)', 'Domain 2 (Bob)', 'Domain 3 (Guest)'];
  const objects = ['/etc/shadow', '/var/log/syslog', '/home/alice/doc.pdf', '/dev/tty0'];

  const toggleRight = (domain: string, object: string, right: Permission) => {
    setAccessMatrix(prev => {
      const current = prev[domain]?.[object] || [];
      const updated = current.includes(right) ? current.filter(r => r !== right) : [...current, right];
      return {
        ...prev,
        [domain]: {
          ...prev[domain],
          [object]: updated
        }
      };
    });
  };

  // ---------------------------------------------------------------------------
  // 4. STACK CANARY BUFFER OVERFLOW STATE
  // ---------------------------------------------------------------------------
  const BUFFER_LIMIT = 16; // 16 characters
  const [bufferInput, setBufferInput] = useState<string>('Hello, World!');
  const inputLen = bufferInput.length;
  const isCanarySmashed = inputLen > BUFFER_LIMIT;
  const isRipOverwritten = inputLen > BUFFER_LIMIT + 8;

  return (
    <div className="space-y-6 font-sans select-none">
      
      {/* Sub-Mode Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-blue-400" />
          <span className="font-bold text-white text-sm font-mono">IPC & Protection Lab:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'PIPE', label: '1. Pipe (FIFO Stream & SIGPIPE)', icon: <Terminal className="w-3.5 h-3.5" /> },
            { id: 'SHARED_MEMORY', label: '2. Shared Memory & Mutex', icon: <Database className="w-3.5 h-3.5" /> },
            { id: 'ACCESS_MATRIX', label: '3. Access Matrix & ACLs', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'STACK_CANARY', label: '4. Stack Canary & Buffer Overflow', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id as IpcMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                activeMode === m.id
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {m.icon}
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 1. PIPE SIMULATOR                                                    */}
      {/* -------------------------------------------------------------------- */}
      {activeMode === 'PIPE' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-blue-400" />
                  UNIX Anonymous Pipe Circular Buffer Simulator
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Unidirectional byte stream with write-blocking when full, read-blocking when empty, and SIGPIPE on broken pipe.
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <button
                  onClick={() => {
                    setIsReaderClosed(!isReaderClosed);
                    setSigpipeTriggered(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                    isReaderClosed
                      ? 'bg-rose-950/40 text-rose-300 border-rose-500/40'
                      : 'bg-slate-800 text-slate-200 border-slate-700 hover:text-white'
                  }`}
                >
                  {isReaderClosed ? 'Reader Closed (Broken Pipe)' : 'Close Reader Process [close(fd[0])]'}
                </button>

                <button
                  onClick={() => {
                    setPipeBuffer(['data', 'init']);
                    setIsReaderClosed(false);
                    setSigpipeTriggered(false);
                    setPipeLog(['Pipe reset to clean state.']);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                  title="Reset Pipe"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Visual Pipe Tube */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Process A (Writer - fd[1])</span>
                <span className="text-blue-400 font-bold">
                  Kernel Pipe Ring Buffer ({pipeBuffer.length} / {PIPE_CAPACITY} KB)
                </span>
                <span>Process B (Reader - fd[0])</span>
              </div>

              <div className="grid grid-cols-12 gap-3 items-center">
                {/* Writer Node */}
                <div className="col-span-3 p-4 rounded-xl bg-slate-950 border border-blue-500/40 text-center space-y-2">
                  <div className="text-xs font-bold text-white font-mono">Process A (Writer)</div>
                  <button
                    onClick={handleWriteToPipe}
                    className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>write(fd[1], buf, 1KB)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Pipe Storage Cells */}
                <div className="col-span-6 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="grid grid-cols-8 gap-1.5">
                    {Array.from({ length: PIPE_CAPACITY }).map((_, idx) => {
                      const item = pipeBuffer[idx];
                      return (
                        <div
                          key={idx}
                          className={`h-10 rounded flex items-center justify-center font-mono text-[10px] font-bold border transition-all ${
                            item
                              ? 'bg-blue-600/30 border-blue-500 text-blue-300 shadow-sm'
                              : 'bg-slate-900/60 border-slate-800 text-slate-600'
                          }`}
                        >
                          {item ? item : 'empty'}
                        </div>
                      );
                    })}
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        pipeBuffer.length >= PIPE_CAPACITY ? 'bg-rose-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${(pipeBuffer.length / PIPE_CAPACITY) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Reader Node */}
                <div className="col-span-3 p-4 rounded-xl bg-slate-950 border border-emerald-500/40 text-center space-y-2">
                  <div className="text-xs font-bold text-white font-mono">
                    {isReaderClosed ? (
                      <span className="text-rose-400">Process B [CLOSED]</span>
                    ) : (
                      'Process B (Reader)'
                    )}
                  </div>
                  <button
                    disabled={isReaderClosed}
                    onClick={handleReadFromPipe}
                    className={`w-full py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                      isReaderClosed
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                    }`}
                  >
                    <span>read(fd[0], buf, 1KB)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SIGPIPE Alert */}
            {sigpipeTriggered && (
              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/50 text-rose-300 text-xs flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-sm text-rose-400 mb-1">
                    SIGPIPE Signal (Signal 13 / Broken Pipe) Raised!
                  </strong>
                  The writer process attempted to write to a pipe where all reader descriptors have been closed.
                  In POSIX systems, the kernel immediately raises SIGPIPE, terminating the process unless handled, and returns error code EPIPE (-1).
                </div>
              </div>
            )}

            {/* Kernel Event Log */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Kernel Pipe Event Log:</span>
              {pipeLog.map((log, idx) => (
                <div key={idx} className="text-slate-300 text-[11px]">
                  › {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 2. SHARED MEMORY SIMULATOR                                           */}
      {/* -------------------------------------------------------------------- */}
      {activeMode === 'SHARED_MEMORY' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                Zero-Copy Shared Memory &amp; Race Condition Simulator
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Physical DRAM page mapped into multiple processes. Fastest IPC (0 syscalls during read/write), but requires mutex synchronization.
              </p>
            </div>

            <button
              onClick={() => setIsMutexLocked(!isMutexLocked)}
              className={`px-3.5 py-1.5 rounded-lg border font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isMutexLocked
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-950/40 text-rose-300 border-rose-500/40 animate-pulse'
              }`}
            >
              {isMutexLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{isMutexLocked ? 'POSIX Semaphore Enabled (Protected)' : 'No Mutex (Race Condition Hazard!)'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Process A */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <div className="text-xs font-bold text-white font-mono">Process A (PID 4012)</div>
              <div className="text-[11px] text-slate-400 font-mono">Virtual Addr: 0x7fff4000</div>
              <button
                onClick={handleShmConcurrentWrite}
                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer"
              >
                Direct Store: *ptr = val + 1
              </button>
            </div>

            {/* Shared Physical Frame */}
            <div className={`p-5 rounded-2xl border text-center space-y-2 transition-all ${
              shmRaceDetected
                ? 'bg-rose-950/30 border-rose-500/60 shadow-lg shadow-rose-900/20'
                : 'bg-slate-950 border-emerald-500/40'
            }`}>
              <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">
                Shared Physical DRAM Frame (0x8A00)
              </span>
              <div className={`text-3xl font-bold font-mono ${shmRaceDetected ? 'text-rose-400' : 'text-emerald-400'}`}>
                {shmValue}
              </div>
              <span className="text-[10px] text-slate-500 font-mono block">
                Latency: ~80 ns (DRAM bus speed)
              </span>
            </div>

            {/* Process B */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <div className="text-xs font-bold text-white font-mono">Process B (PID 4013)</div>
              <div className="text-[11px] text-slate-400 font-mono">Virtual Addr: 0x60002000</div>
              <button
                onClick={handleShmConcurrentWrite}
                className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer"
              >
                Direct Store: *ptr = val + 1
              </button>
            </div>
          </div>

          {shmRaceDetected && (
            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                Race Condition Alert! Both processes modified the counter without holding a semaphore lock. In production, this causes unpredictable lost updates.
              </span>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Shared Memory Event Log:</span>
            {shmLog.map((log, idx) => (
              <div key={idx} className="text-slate-300 text-[11px]">
                › {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 3. ACCESS MATRIX SIMULATOR                                           */}
      {/* -------------------------------------------------------------------- */}
      {activeMode === 'ACCESS_MATRIX' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Protection Domains &amp; Access Matrix Model
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive Access Matrix: Rows = Protection Domains (Users), Columns = Objects (Files/Devices). Click any cell to toggle Read (R), Write (W), or Execute (X) permissions.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">Domain \ Object</th>
                  {objects.map(obj => (
                    <th key={obj} className="py-2.5 px-3 font-semibold text-blue-300">
                      {obj}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {domains.map(dom => (
                  <tr key={dom} className="hover:bg-slate-950/40">
                    <td className="py-3 px-3 font-bold text-white">{dom}</td>
                    {objects.map(obj => {
                      const perms = accessMatrix[dom]?.[obj] || [];
                      return (
                        <td key={obj} className="py-2 px-3">
                          <div className="flex items-center gap-1">
                            {(['R', 'W', 'X'] as Permission[]).map(r => {
                              const active = perms.includes(r);
                              return (
                                <button
                                  key={r}
                                  onClick={() => toggleRight(dom, obj, r)}
                                  className={`w-6 h-6 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                    active
                                      ? r === 'R'
                                        ? 'bg-blue-600 text-white'
                                        : r === 'W'
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-emerald-600 text-white'
                                      : 'bg-slate-950 text-slate-600 border border-slate-800 hover:text-white'
                                  }`}
                                  title={`Toggle ${r}`}
                                >
                                  {r}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-blue-400 font-bold block text-xs">
                Access Control List (ACL) View — Column Slice:
              </span>
              <span className="text-slate-400 text-[11px] block">
                Stored on the File/Object. When /home/alice/doc.pdf is opened, kernel inspects:
              </span>
              <div className="p-2 rounded bg-slate-900 text-slate-300 text-[11px] space-y-0.5">
                <div>Alice: [{accessMatrix['Domain 1 (Alice)']['/home/alice/doc.pdf'].join(', ') || 'None'}]</div>
                <div>Bob: [{accessMatrix['Domain 2 (Bob)']['/home/alice/doc.pdf'].join(', ') || 'None'}]</div>
                <div>Guest: [{accessMatrix['Domain 3 (Guest)']['/home/alice/doc.pdf'].join(', ') || 'None'}]</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-purple-400 font-bold block text-xs">
                Capability List View — Row Slice:
              </span>
              <span className="text-slate-400 text-[11px] block">
                Stored on the Process/Domain token. Alice possesses tickets:
              </span>
              <div className="p-2 rounded bg-slate-900 text-slate-300 text-[11px] space-y-0.5">
                {objects.map(obj => (
                  <div key={obj}>
                    {obj}: [{accessMatrix['Domain 1 (Alice)'][obj].join(', ') || 'None'}]
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 4. STACK CANARY & BUFFER OVERFLOW SIMULATOR                          */}
      {/* -------------------------------------------------------------------- */}
      {activeMode === 'STACK_CANARY' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Stack Buffer Overflow &amp; Stack Canary Defense Inspector
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate an unsafe strcpy() call. Type input into the 16-byte local buffer. If input overflows past 16 bytes, observe the Stack Canary corruption and kernel abort.
            </p>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Input String to Buffer:</span>
              <span className={inputLen > BUFFER_LIMIT ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                Length: {inputLen} / 16 bytes
              </span>
            </div>

            <input
              type="text"
              value={bufferInput}
              onChange={e => setBufferInput(e.target.value)}
              placeholder="Type characters to fill buffer..."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-bold focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Stack Frame Memory Diagram */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
            <span className="text-slate-400 font-bold block text-xs">
              Function Activation Stack Frame (High Memory ➔ Low Memory):
            </span>

            <div className="space-y-2">
              {/* Saved Return Address (RIP) */}
              <div className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
                isRipOverwritten
                  ? 'bg-rose-950/40 border-rose-500 text-rose-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}>
                <div>
                  <span className="font-bold block">Saved Return Address (RIP): 0x00007fff4004</span>
                  <span className="text-[10px] text-slate-500">Target execution address when function returns</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  isRipOverwritten ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isRipOverwritten ? 'MALICIOUSLY OVERWRITTEN!' : 'INTACT'}
                </span>
              </div>

              {/* Stack Canary (Guard Value) */}
              <div className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
                isCanarySmashed
                  ? 'bg-rose-950/60 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              }`}>
                <div>
                  <span className="font-bold block flex items-center gap-1.5">
                    {isCanarySmashed ? <ShieldAlert className="w-4 h-4 text-rose-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                    Stack Canary Guard: {isCanarySmashed ? '0x4141414141414141 (CORRUPTED!)' : '0xDEADBEEFCAFEBABE (CLEAN)'}
                  </span>
                  <span className="text-[10px] text-slate-400">Random 64-bit secret placed by GCC -fstack-protector</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  isCanarySmashed ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {isCanarySmashed ? 'CANARY SMASHED!' : 'GUARD ACTIVE'}
                </span>
              </div>

              {/* Local Buffer (16 Bytes) */}
              <div className="p-3 rounded-lg bg-slate-900 border border-blue-500/40 text-blue-300">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold">char buffer[16] (Local Variable)</span>
                  <span className="text-[10px] text-slate-400">Allocated on stack</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800 text-white break-all text-[11px]">
                  {bufferInput || '(empty buffer)'}
                </div>
              </div>
            </div>

            {/* Verdict Box */}
            {isCanarySmashed ? (
              <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500 text-rose-300 text-xs">
                <strong>*** stack smashing detected ***: terminated via __stack_chk_fail()</strong><br />
                The kernel detected that the canary value was altered before function return. The CPU immediately terminated the process with SIGABRT, stopping the attacker from hijacking the CPU instruction pointer!
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs">
                ✓ Stack frame is healthy. Buffer input safely contained within bounds. Function will return normally.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
