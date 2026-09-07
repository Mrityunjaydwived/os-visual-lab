// Gamified Learning & Challenge Arena (7 Fully Interactive OS Games)
import React, { useState, useEffect } from 'react';
import { OS_GAMES, type OsGame } from '../core/games/gamesData';
import { useAppStore } from '../core/store/useStore';
import { 
  Gamepad2, 
  Trophy, 
  Play, 
  Timer, 
  Layers, 
  Zap, 
  AlertTriangle, 
  Compass, 
  Lock, 
  Server, 
  CheckCircle2, 
  XCircle, 
  Heart, 
  Check 
} from 'lucide-react';
import confetti from 'canvas-confetti';

// --------------------------------------------------------------------------
// 1. GAME 1: CPU COMMANDER (DISPATCH WAR)
// --------------------------------------------------------------------------
interface ProcessItem {
  id: string;
  name: string;
  burst: number;
  maxBurst: number;
  patience: number;
  maxPatience: number;
  color: string;
}

const CpuCommanderGame: React.FC<{ onFinish: (score: number) => void }> = ({ onFinish }) => {
  const [timeLeft, setTimeLeft] = useState(45);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [readyQueue, setReadyQueue] = useState<ProcessItem[]>([
    { id: 'p1', name: 'PID 101', burst: 3, maxBurst: 3, patience: 12, maxPatience: 12, color: '#1F74BA' },
    { id: 'p2', name: 'PID 102', burst: 2, maxBurst: 2, patience: 10, maxPatience: 10, color: '#F7E200' },
    { id: 'p3', name: 'PID 103', burst: 4, maxBurst: 4, patience: 14, maxPatience: 14, color: '#10b981' }
  ]);
  const [runningProcess, setRunningProcess] = useState<ProcessItem | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  // Timer & Queue patience tick
  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsGameOver(true);
          onFinish(score);
          return 0;
        }
        return prev - 1;
      });

      // Decrease patience of waiting processes
      setReadyQueue(prev => {
        const nextQueue: ProcessItem[] = [];
        let lostLife = false;

        prev.forEach(p => {
          const nextPatience = p.patience - 1;
          if (nextPatience <= 0) {
            // Process starved!
            lostLife = true;
          } else {
            nextQueue.push({ ...p, patience: nextPatience });
          }
        });

        if (lostLife) {
          setLives(l => {
            const nextL = l - 1;
            if (nextL <= 0) {
              setIsGameOver(true);
              onFinish(score);
            }
            return Math.max(0, nextL);
          });
          setCombo(1);
        }

        return nextQueue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameOver, score, onFinish]);

  // Periodic Process Spawner
  useEffect(() => {
    if (isGameOver) return;
    const spawner = setInterval(() => {
      setReadyQueue(prev => {
        if (prev.length >= 5) return prev;
        const colors = ['#1F74BA', '#F7E200', '#10b981', '#f59e0b', '#a855f7', '#38bdf8'];
        const randomId = Math.floor(Math.random() * 800) + 100;
        const burst = Math.floor(Math.random() * 4) + 2; // 2 to 5s
        const patience = Math.floor(Math.random() * 5) + 10; // 10 to 14s
        const color = colors[Math.floor(Math.random() * colors.length)];
        return [
          ...prev,
          {
            id: `p_${randomId}`,
            name: `PID ${randomId}`,
            burst,
            maxBurst: burst,
            patience,
            maxPatience: patience,
            color
          }
        ];
      });
    }, 3500);

    return () => clearInterval(spawner);
  }, [isGameOver]);

  // CPU Execution progress tick
  useEffect(() => {
    if (isGameOver || !runningProcess) return;

    const cpuTick = setInterval(() => {
      setRunningProcess(prev => {
        if (!prev) return null;
        const nextBurst = prev.burst - 0.25;
        if (nextBurst <= 0) {
          // Process Finished!
          const pts = 120 + Math.floor(prev.patience * 8) * combo;
          setScore(s => s + pts);
          setCompletedCount(c => c + 1);
          setCombo(cb => Math.min(5, cb + 1));

          confetti({
            particleCount: 30,
            spread: 50,
            origin: { y: 0.7 }
          });

          return null; // CPU free again
        }
        return { ...prev, burst: nextBurst };
      });
    }, 250);

    return () => clearInterval(cpuTick);
  }, [runningProcess, isGameOver, combo]);

  const dispatchProcess = (process: ProcessItem) => {
    if (runningProcess) return; // CPU busy
    setReadyQueue(prev => prev.filter(p => p.id !== process.id));
    setRunningProcess(process);
  };

  const preemptProcess = () => {
    if (!runningProcess) return;
    setReadyQueue(prev => [...prev, runningProcess]);
    setRunningProcess(null);
  };

  return (
    <div className="p-6 rounded-2xl bg-[bg-slate-950] border border-slate-800 space-y-6">
      
      {/* Live Game HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[bg-slate-900] border border-slate-800 font-mono text-xs">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-slate-400 block text-[10px]">TIME REMAINING</span>
            <span className={`text-lg font-black ${timeLeft < 10 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
              {timeLeft}s
            </span>
          </div>
          <div className="border-l border-slate-800 pl-4">
            <span className="text-slate-400 block text-[10px]">SYSTEM SCORE</span>
            <span className="text-lg font-black text-white">{score} PTS</span>
          </div>
          <div className="border-l border-slate-800 pl-4">
            <span className="text-slate-400 block text-[10px]">COMBO MULTIPLIER</span>
            <span className="text-sm font-bold text-[#f59e0b]">{combo}x</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">THROUGHPUT</span>
            <span className="text-xs font-bold text-emerald-400">{completedCount} Executed</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map(heartIdx => (
              <Heart 
                key={heartIdx} 
                className={`w-5 h-5 ${heartIdx <= lives ? 'text-rose-500 fill-rose-500' : 'text-slate-700'}`} 
              />
            ))}
          </div>
        </div>
      </div>

      {isGameOver ? (
        <div className="p-8 rounded-2xl bg-[bg-slate-900] text-center space-y-4 border border-amber-500/40 animate-in zoom-in">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
          <h3 className="text-2xl font-black text-white">Simulation Session Completed</h3>
          <p className="text-xs text-slate-300 font-mono">
            Final Benchmark Score: <span className="text-2xl font-bold text-amber-400 block mt-1">{score} PTS</span>
            Throughput: {completedCount} processes dispatched successfully.
          </p>
          <button
            onClick={() => {
              setTimeLeft(45);
              setLives(3);
              setScore(0);
              setCombo(1);
              setCompletedCount(0);
              setIsGameOver(false);
              setRunningProcess(null);
            }}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-[bg-slate-950] font-black text-xs font-mono uppercase tracking-wider hover:bg-blue-500 cursor-pointer shadow-lg"
          >
            Play Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Active CPU Core Socket (Left Col 5) */}
          <div className="md:col-span-5 p-5 rounded-2xl bg-[bg-slate-900] border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-white font-bold flex items-center gap-1.5">
                  <CpuIcon className="w-4 h-4 text-amber-400" />
                  CPU Core Socket 0
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  runningProcess ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                }`}>
                  {runningProcess ? 'BUSY (EXECUTING)' : 'IDLE'}
                </span>
              </div>

              {runningProcess ? (
                <div className="p-4 rounded-xl bg-[bg-slate-950] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-white">{runningProcess.name}</span>
                    <span className="text-amber-400 font-bold">{runningProcess.burst.toFixed(1)}s left</span>
                  </div>

                  {/* Execution Progress Bar */}
                  <div className="w-full h-3 bg-[bg-slate-900] rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-gradient-to-r from-[#1F74BA] to-[#F7E200] transition-all duration-200"
                      style={{ width: `${Math.max(5, (1 - runningProcess.burst / runningProcess.maxBurst) * 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Priority: Normal</span>
                    <span>Quantum: Preemptive</span>
                  </div>
                </div>
              ) : (
                <div className="h-32 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs font-mono text-center p-4">
                  <span>CPU is currently IDLE.</span>
                  <span className="text-[10px] text-amber-400 mt-1">Click a process in the Ready Queue to dispatch it!</span>
                </div>
              )}
            </div>

            {runningProcess && (
              <button
                onClick={preemptProcess}
                className="w-full py-2 rounded-xl bg-rose-950/60 border border-rose-500/50 hover:bg-rose-900/60 text-rose-300 font-mono text-xs font-bold transition-colors cursor-pointer"
              >
                Preempt Process (Context Switch)
              </button>
            )}
          </div>

          {/* Incoming Ready Queue (Right Col 7) */}
          <div className="md:col-span-7 p-5 rounded-2xl bg-[bg-slate-900] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-white">Ready Queue ({readyQueue.length}/5)</span>
              <span className="text-[10px] text-slate-400">Patience meters tick down!</span>
            </div>

            {readyQueue.length === 0 ? (
              <div className="h-40 border border-dashed border-slate-700 rounded-xl flex items-center justify-center text-xs font-mono text-slate-400">
                Queue empty. Next process arriving shortly...
              </div>
            ) : (
              <div className="space-y-2">
                {readyQueue.map(p => {
                  const patiencePercent = (p.patience / p.maxPatience) * 100;
                  return (
                    <div
                      key={p.id}
                      onClick={() => dispatchProcess(p)}
                      className="p-3 rounded-xl bg-[bg-slate-950] border border-slate-800 hover:border-amber-500 hover:bg-[bg-slate-800] transition-all cursor-pointer flex items-center justify-between group shadow-sm"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-white group-hover:text-amber-400">
                            {p.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[bg-slate-900] text-slate-300 border border-slate-800">
                            Burst: {p.burst}s
                          </span>
                        </div>
                        <div className="w-32 h-1.5 bg-[bg-slate-900] rounded-full overflow-hidden mt-2">
                          <div 
                            className={`h-full ${p.patience <= 4 ? 'bg-rose-500 animate-pulse' : 'bg-blue-600'}`}
                            style={{ width: `${patiencePercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold ${p.patience <= 4 ? 'text-rose-400 animate-bounce' : 'text-slate-400'}`}>
                          {p.patience}s patience
                        </span>
                        <button
                          disabled={!!runningProcess}
                          className="px-3 py-1 rounded-lg bg-blue-600 group-hover:bg-blue-600 text-white group-hover:text-[bg-slate-950] text-[10px] font-mono font-bold transition-all disabled:opacity-40"
                        >
                          Dispatch
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

// --------------------------------------------------------------------------
// 2. GAME 2: DEADLOCK BREAKER (SAFE SEQUENCE LOCK)
// --------------------------------------------------------------------------
const DeadlockBreakerGame: React.FC<{ onFinish: (score: number) => void }> = ({ onFinish }) => {
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);

  const rounds = [
    {
      process: 'P1',
      request: [1, 0, 1],
      isSafe: true,
      safeSequence: '<P1, P3, P0, P2, P4>',
      reason: 'P1\'s need is met, and remaining processes can easily finish in sequence <P1, P3, P0, P2, P4>.'
    },
    {
      process: 'P2',
      request: [3, 2, 2],
      isSafe: false,
      safeSequence: 'NO SAFE SEQUENCE EXISTS',
      reason: 'Granting [3,2,2] exhausts Available tape drives, causing a circular wait between P2 and P4!'
    },
    {
      process: 'P3',
      request: [0, 1, 1],
      isSafe: true,
      safeSequence: '<P3, P1, P4, P0, P2>',
      reason: 'Granting [0,1,1] leaves enough resources to complete P3, which then releases its entire allocation.'
    },
    {
      process: 'P4',
      request: [2, 1, 1],
      isSafe: false,
      safeSequence: 'UNSAFE STATE: DEADLOCK DETECTED',
      reason: 'Leaves available vector [1, 0, 0], leaving no remaining thread able to satisfy its maximum need.'
    },
    {
      process: 'P0',
      request: [0, 2, 0],
      isSafe: true,
      safeSequence: '<P0, P1, P3, P2, P4>',
      reason: 'Safe execution sequence is preserved with available resources.'
    }
  ];

  const currentRound = rounds[roundIndex % rounds.length];

  const handleDecision = (playerApproved: boolean) => {
    if (feedback) return; // Wait before next round

    const isCorrect = (playerApproved && currentRound.isSafe) || (!playerApproved && !currentRound.isSafe);

    if (isCorrect) {
      const added = playerApproved ? 150 : 120;
      setScore(s => s + added);
      setFeedback({
        isCorrect: true,
        text: playerApproved
          ? `Correct! Safe state preserved: ${currentRound.safeSequence}. +150 PTS`
          : `Brilliant! You held the unsafe request and prevented a circular wait deadlock! +120 PTS`
      });
      confetti({ particleCount: 35, spread: 60 });
    } else {
      setLives(l => {
        const nextL = l - 1;
        if (nextL <= 0) {
          setIsGameOver(true);
          onFinish(score);
        }
        return Math.max(0, nextL);
      });
      setFeedback({
        isCorrect: false,
        text: playerApproved
          ? `DEADLOCK! Granting this caused a circular wait! ${currentRound.reason}`
          : `Missed Throughput! This request was mathematically safe to grant.`
      });
    }
  };

  const nextRound = () => {
    setFeedback(null);
    if (roundIndex >= rounds.length - 1) {
      setIsGameOver(true);
      onFinish(score);
    } else {
      setRoundIndex(r => r + 1);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-[bg-slate-950] border border-slate-800 space-y-6">
      
      {/* HUD */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-[bg-slate-900] border border-slate-800 font-mono text-xs">
        <div>
          <span className="text-slate-400 block text-[10px]">CHALLENGE ROUND</span>
          <span className="text-sm font-bold text-white">Round {roundIndex + 1} of {rounds.length}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">SAFETY BENCHMARK SCORE</span>
          <span className="text-base font-black text-amber-400">{score} PTS</span>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3].map(heartIdx => (
            <Heart 
              key={heartIdx} 
              className={`w-5 h-5 ${heartIdx <= lives ? 'text-rose-500 fill-rose-500' : 'text-slate-700'}`} 
            />
          ))}
        </div>
      </div>

      {isGameOver ? (
        <div className="p-8 rounded-2xl bg-[bg-slate-900] text-center space-y-4 border border-amber-500/40">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
          <h3 className="text-2xl font-black text-white">CHALLENGE COMPLETE</h3>
          <p className="text-xs text-slate-300 font-mono">
            Final Safety Score: <span className="text-2xl font-bold text-amber-400 block mt-1">{score} PTS</span>
          </p>
          <button
            onClick={() => {
              setRoundIndex(0);
              setScore(0);
              setLives(3);
              setIsGameOver(false);
              setFeedback(null);
            }}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-[bg-slate-950] font-black text-xs font-mono uppercase tracking-wider hover:bg-blue-500 cursor-pointer"
          >
            Restart Challenge
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Incoming Request Inspection Box */}
          <div className="p-6 rounded-2xl bg-[bg-slate-900] border border-slate-800 space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
                Resource Allocation Request from {currentRound.process}
              </span>
              <span className="text-xs text-slate-300">Available Resources: [A:3, B:3, C:2]</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[bg-slate-950] border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Resource A (CPU)</span>
                <span className="text-lg font-bold text-amber-400">{currentRound.request[0]}</span>
              </div>
              <div className="p-3 rounded-xl bg-[bg-slate-950] border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Resource B (RAM)</span>
                <span className="text-lg font-bold text-amber-400">{currentRound.request[1]}</span>
              </div>
              <div className="p-3 rounded-xl bg-[bg-slate-950] border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Resource C (Disk)</span>
                <span className="text-lg font-bold text-amber-400">{currentRound.request[2]}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Will granting this request allow all processes to complete without circular wait, or will it create an unavoidable deadlock state?
            </p>
          </div>

          {/* Feedback Area */}
          {feedback && (
            <div className={`p-4 rounded-xl text-xs font-mono border animate-in fade-in duration-200 ${
              feedback.isCorrect ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300' : 'bg-rose-950/60 border-rose-500/60 text-rose-300'
            }`}>
              <div className="flex items-center gap-2 font-bold mb-1">
                {feedback.isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                <span>{feedback.isCorrect ? 'Decision Verified' : 'Critical System Warning'}</span>
              </div>
              <p className="text-slate-300">{feedback.text}</p>
            </div>
          )}

          {/* Decision Buttons */}
          <div className="flex items-center gap-4">
            {!feedback ? (
              <>
                <button
                  onClick={() => handleDecision(true)}
                  className="flex-1 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs sm:text-sm font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:scale-102"
                >
                  <Check className="w-4 h-4" />
                  Approve Request (Safe)
                </button>
                <button
                  onClick={() => handleDecision(false)}
                  className="flex-1 py-3.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-black font-black text-xs sm:text-sm font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:scale-102"
                >
                  <XCircle className="w-4 h-4" />
                  Put on Hold (Unsafe Deadlock)
                </button>
              </>
            ) : (
              <button
                onClick={nextRound}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-[#2b8fe0] text-white font-bold text-xs sm:text-sm font-mono uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                Continue to Next Allocation ➔
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

// --------------------------------------------------------------------------
// 3. GAME 3: MEMORY MANAGER (RAM ALLOCATOR)
// --------------------------------------------------------------------------
interface RamSlot {
  id: number;
  totalSize: number;
  occupiedSize: number;
  processName: string | null;
}

const MemoryManagerGame: React.FC<{ onFinish: (score: number) => void }> = ({ onFinish }) => {
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [ramSlots, setRamSlots] = useState<RamSlot[]>([
    { id: 1, totalSize: 100, occupiedSize: 0, processName: null },
    { id: 2, totalSize: 250, occupiedSize: 0, processName: null },
    { id: 3, totalSize: 80, occupiedSize: 0, processName: null },
    { id: 4, totalSize: 350, occupiedSize: 0, processName: null },
    { id: 5, totalSize: 160, occupiedSize: 0, processName: null },
    { id: 6, totalSize: 500, occupiedSize: 0, processName: null }
  ]);
  const [incomingProcess, setIncomingProcess] = useState({ name: 'Web Browser', size: 180 });
  const [message, setMessage] = useState<string>('Click a free partition that fits the incoming process.');
  const [isGameOver, setIsGameOver] = useState(false);

  const spawnNextProcess = () => {
    const list = [
      { name: 'Database Service', size: 220 },
      { name: 'Compiler Daemon', size: 140 },
      { name: 'Audio Pipeline', size: 60 },
      { name: 'Game Engine', size: 310 },
      { name: 'Network Stack', size: 90 },
      { name: 'Virtual Machine', size: 420 },
    ];
    setIncomingProcess(list[Math.floor(Math.random() * list.length)]);
  };

  const allocateToSlot = (slot: RamSlot) => {
    if (slot.processName) {
      setMessage(`Slot ${slot.id} is already occupied by ${slot.processName}!`);
      return;
    }

    if (slot.totalSize < incomingProcess.size) {
      setMessage(`Slot ${slot.id} (${slot.totalSize} MB) is too small for ${incomingProcess.name} (${incomingProcess.size} MB)!`);
      return;
    }

    // Allocate!
    const internalFrag = slot.totalSize - incomingProcess.size;
    const earned = Math.max(20, incomingProcess.size - internalFrag / 2);
    setScore(s => s + Math.floor(earned));

    setMessage(`Allocated ${incomingProcess.name} into Slot ${slot.id}! Internal fragmentation: ${internalFrag} MB.`);

    setRamSlots(prev => prev.map(s => {
      if (s.id === slot.id) {
        return { ...s, occupiedSize: incomingProcess.size, processName: incomingProcess.name };
      }
      return s;
    }));

    // Auto de-allocate after 7 seconds
    setTimeout(() => {
      setRamSlots(prev => prev.map(s => {
        if (s.id === slot.id) {
          return { ...s, occupiedSize: 0, processName: null };
        }
        return s;
      }));
    }, 7000);

    spawnNextProcess();
  };

  const handleOOM = () => {
    const nextStrikes = strikes + 1;
    setStrikes(nextStrikes);
    if (nextStrikes >= 3) {
      setIsGameOver(true);
      onFinish(score);
    } else {
      setMessage(`OOM Strike ${nextStrikes}/3! Discarded ${incomingProcess.name}.`);
      spawnNextProcess();
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-[bg-slate-950] border border-slate-800 space-y-6">
      
      {/* HUD */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-[bg-slate-900] border border-slate-800 font-mono text-xs">
        <div>
          <span className="text-slate-400 block text-[10px]">ALLOCATION SCORE</span>
          <span className="text-base font-black text-amber-400">{score} PTS</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">INCOMING REQUEST</span>
          <span className="text-sm font-bold text-white">{incomingProcess.name} ({incomingProcess.size} MB)</span>
        </div>
        <div className="text-right">
          <span className="text-slate-400 block text-[10px]">OOM STRIKES</span>
          <span className="text-rose-400 font-bold">{strikes} / 3 Strikes</span>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-[bg-slate-900]/60 text-xs font-mono text-slate-300 border border-slate-800">
        {message}
      </div>

      {isGameOver ? (
        <div className="p-8 rounded-2xl bg-[bg-slate-900] text-center space-y-4 border border-amber-500/40">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
          <h3 className="text-2xl font-black text-white">MEMORY EXHAUSTED (OOM)</h3>
          <p className="text-xs text-slate-300 font-mono">
            Final Memory Score: <span className="text-2xl font-bold text-amber-400 block mt-1">{score} PTS</span>
          </p>
          <button
            onClick={() => {
              setScore(0);
              setStrikes(0);
              setIsGameOver(false);
              setRamSlots([
                { id: 1, totalSize: 100, occupiedSize: 0, processName: null },
                { id: 2, totalSize: 250, occupiedSize: 0, processName: null },
                { id: 3, totalSize: 80, occupiedSize: 0, processName: null },
                { id: 4, totalSize: 350, occupiedSize: 0, processName: null },
                { id: 5, totalSize: 160, occupiedSize: 0, processName: null },
                { id: 6, totalSize: 500, occupiedSize: 0, processName: null }
              ]);
            }}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-[bg-slate-950] font-black text-xs font-mono uppercase tracking-wider hover:bg-blue-500 cursor-pointer"
          >
            Restart Session
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ramSlots.map(slot => {
              const isOccupied = !!slot.processName;
              return (
                <div
                  key={slot.id}
                  onClick={() => allocateToSlot(slot)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between font-mono ${
                    isOccupied
                      ? 'bg-[bg-slate-800] border-blue-500/40 text-slate-300'
                      : 'bg-[bg-slate-950] border-slate-800 hover:border-amber-500 hover:scale-102'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-white">Partition #{slot.id}</span>
                    <span className="text-amber-400 font-bold">{slot.totalSize} MB</span>
                  </div>

                  {isOccupied ? (
                    <div className="space-y-1 my-2">
                      <div className="text-xs text-emerald-400 font-bold">{slot.processName}</div>
                      <div className="text-[10px] text-slate-400">Occupies: {slot.occupiedSize} MB</div>
                      <div className="text-[9px] text-[#f59e0b]">Internal Frag: {slot.totalSize - slot.occupiedSize} MB</div>
                    </div>
                  ) : (
                    <div className="h-12 flex items-center justify-center text-xs text-slate-500">
                      FREE HOLE
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 text-center text-[10px] text-slate-300">
                    {isOccupied ? 'Auto-deallocating...' : 'Click to Allocate'}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleOOM}
              className="px-4 py-2 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold hover:bg-rose-900/60 transition-colors cursor-pointer"
            >
              Cannot Allocate (Declare OOM Skip)
            </button>
            <span className="text-[11px] font-mono text-slate-400">
              Allocated blocks free automatically after 7 seconds!
            </span>
          </div>
        </div>
      )}

    </div>
  );
};

// --------------------------------------------------------------------------
// 4. GAME 4: DISK CONTROLLER (ELEVATOR SWEEP)
// --------------------------------------------------------------------------
const DiskControllerGame: React.FC<{ onFinish: (score: number) => void }> = ({ onFinish }) => {
  const [headPos, setHeadPos] = useState(50);
  const [pendingRequests, setPendingRequests] = useState([25, 64, 88, 120, 155, 180]);
  const [totalMovement, setTotalMovement] = useState(0);
  const [servicedCount, setServicedCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const serviceRequest = (track: number) => {
    const move = Math.abs(headPos - track);
    setTotalMovement(prev => prev + move);
    setHeadPos(track);
    setPendingRequests(prev => prev.filter(t => t !== track));
    const nextCount = servicedCount + 1;
    setServicedCount(nextCount);

    if (pendingRequests.length <= 1) {
      setIsGameOver(true);
      const finalScore = Math.max(500, 5000 - (totalMovement + move) * 15);
      onFinish(finalScore);
      confetti({ particleCount: 50, spread: 70 });
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-[bg-slate-950] border border-slate-800 space-y-6">
      <div className="flex items-center justify-between p-4 rounded-xl bg-[bg-slate-900] border border-slate-800 font-mono text-xs">
        <div>
          <span className="text-slate-400 block text-[10px]">HEAD CYLINDER</span>
          <span className="text-base font-black text-amber-400">Track #{headPos}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">TOTAL HEAD MOVEMENT</span>
          <span className="text-sm font-bold text-white">{totalMovement} cylinders</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">SERVICED</span>
          <span className="text-emerald-400 font-bold">{servicedCount} / 6 Tracks</span>
        </div>
      </div>

      {isGameOver ? (
        <div className="p-8 rounded-2xl bg-[bg-slate-900] text-center space-y-4 border border-amber-500/40">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
          <h3 className="text-2xl font-black text-white">ALL TRACKS SERVICED</h3>
          <p className="text-xs text-slate-300 font-mono">
            Total Head Travel: {totalMovement} cylinders.
            <span className="text-2xl font-bold text-amber-400 block mt-1">
              {Math.max(500, 5000 - totalMovement * 15)} PTS
            </span>
          </p>
          <button
            onClick={() => {
              setHeadPos(50);
              setPendingRequests([25, 64, 88, 120, 155, 180]);
              setTotalMovement(0);
              setServicedCount(0);
              setIsGameOver(false);
            }}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-[bg-slate-950] font-black text-xs font-mono uppercase tracking-wider hover:bg-blue-500 cursor-pointer"
          >
            Play Again
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Cylinder Bar Visualization */}
          <div className="p-5 rounded-xl bg-[bg-slate-900] border border-slate-800 space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Track 0</span>
              <span>Track 100</span>
              <span>Track 199</span>
            </div>

            <div className="relative h-10 bg-[bg-slate-950] rounded-xl border border-slate-800 overflow-hidden flex items-center">
              {/* Head Marker */}
              <div 
                className="absolute top-0 bottom-0 w-2 bg-blue-600 shadow-[0_0_12px_#F7E200] transition-all duration-300 z-10"
                style={{ left: `${(headPos / 199) * 100}%` }}
              />

              {/* Request Markers */}
              {pendingRequests.map(t => (
                <div
                  key={t}
                  className="absolute top-2 bottom-2 w-3 h-6 bg-blue-600 border border-white rounded-sm -translate-x-1/2 cursor-pointer hover:bg-blue-600"
                  style={{ left: `${(t / 199) * 100}%` }}
                  title={`Request at Track #${t}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2 font-mono">
            <div className="text-xs text-slate-300">
              Select next track to service (pick closest to minimize head movement):
            </div>
            <div className="flex flex-wrap gap-3">
              {pendingRequests.map(t => {
                const diff = Math.abs(headPos - t);
                return (
                  <button
                    key={t}
                    onClick={() => serviceRequest(t)}
                    className="p-3 rounded-xl bg-[bg-slate-900] hover:bg-[bg-slate-800] border border-slate-800 hover:border-amber-500 text-left transition-all cursor-pointer"
                  >
                    <div className="text-sm font-bold text-white">Track #{t}</div>
                    <div className="text-[10px] text-amber-400">Seek Distance: {diff} cyl</div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

// --------------------------------------------------------------------------
// 5. GAME 5: THREAD MASTER (RACE CONDITION ZERO)
// --------------------------------------------------------------------------
const ThreadMasterGame: React.FC<{ onFinish: (score: number) => void }> = ({ onFinish }) => {
  const [slot1, setSlot1] = useState<string>('none');
  const [slot2, setSlot2] = useState<string>('none');
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'success' | 'race' | 'deadlock'; msg: string; balance: number }>({
    status: 'idle',
    msg: '',
    balance: 1000
  });

  const runConcurrencyTest = () => {
    if (slot1 === 'lock' && slot2 === 'unlock') {
      // Correct!
      setTestResult({
        status: 'success',
        balance: 0,
        msg: 'SUCCESS! Zero race conditions detected across 1,000 concurrent threads. Mutual exclusion verified!'
      });
      onFinish(500);
      confetti({ particleCount: 50, spread: 70 });
    } else if (slot1 === 'lock' && slot2 === 'lock') {
      setTestResult({
        status: 'deadlock',
        balance: 1000,
        msg: 'DEADLOCK! Thread acquired the same mutex twice without releasing it!'
      });
    } else {
      setTestResult({
        status: 'race',
        balance: 420,
        msg: 'RACE CONDITION DETECTED! Lost updates occurred during concurrent execution. Balance corrupted to $420!'
      });
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-[bg-slate-950] border border-slate-800 space-y-6 font-mono text-xs">
      <div className="p-4 rounded-xl bg-[bg-slate-900] border border-slate-800 text-slate-300">
        Objective: Configure mutex locks to protect the critical section where 10 concurrent threads withdraw $100 from an initial $1,000 account balance.
      </div>

      {/* Code Editor Mock */}
      <div className="p-5 rounded-xl bg-[bg-slate-900] border border-slate-800 space-y-3">
        <div className="text-slate-400">// Concurrent worker thread routine</div>
        <div className="text-cyan-300">void* withdraw_worker(void* arg) {'{'}</div>

        {/* Slot 1 */}
        <div className="pl-6 flex items-center gap-3">
          <span className="text-slate-400">Line 12:</span>
          <select
            value={slot1}
            onChange={e => setSlot1(e.target.value)}
            className="p-2 rounded-lg bg-[bg-slate-950] border border-slate-800 text-amber-400 font-bold text-xs outline-none cursor-pointer"
          >
            <option value="none">[ NO SYNCHRONIZATION ]</option>
            <option value="lock">pthread_mutex_lock(&amp;account_mutex);</option>
            <option value="unlock">pthread_mutex_unlock(&amp;account_mutex);</option>
          </select>
        </div>

        {/* Critical Section */}
        <div className="pl-6 py-2 border-l-2 border-amber-500/50 my-1 bg-amber-950/20 rounded-r-lg space-y-1">
          <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">CRITICAL SECTION:</div>
          <div className="text-slate-200">int local_balance = shared_balance;</div>
          <div className="text-slate-200">local_balance = local_balance - 100;</div>
          <div className="text-slate-200">shared_balance = local_balance;</div>
        </div>

        {/* Slot 2 */}
        <div className="pl-6 flex items-center gap-3">
          <span className="text-slate-400">Line 18:</span>
          <select
            value={slot2}
            onChange={e => setSlot2(e.target.value)}
            className="p-2 rounded-lg bg-[bg-slate-950] border border-slate-800 text-amber-400 font-bold text-xs outline-none cursor-pointer"
          >
            <option value="none">[ NO SYNCHRONIZATION ]</option>
            <option value="lock">pthread_mutex_lock(&amp;account_mutex);</option>
            <option value="unlock">pthread_mutex_unlock(&amp;account_mutex);</option>
          </select>
        </div>

        <div className="text-cyan-300">{'}'}</div>
      </div>

      {testResult.status !== 'idle' && (
        <div className={`p-4 rounded-xl border ${
          testResult.status === 'success' ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300' : 'bg-rose-950/60 border-rose-500/60 text-rose-300'
        }`}>
          <div className="font-bold mb-1">
            {testResult.status === 'success' ? 'TEST PASSED (+500 PTS)' : 'TEST FAILED'}
          </div>
          <p className="text-slate-300">{testResult.msg}</p>
          <div className="mt-2 text-white font-bold">
            Observed Final Balance: ${testResult.balance} (Expected: $0)
          </div>
        </div>
      )}

      <button
        onClick={runConcurrencyTest}
        className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-[bg-slate-950] font-black text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer shadow-md"
      >
        Run 1,000 Concurrent Threads Stress Test
      </button>
    </div>
  );
};

// --------------------------------------------------------------------------
// MAIN CHALLENGE ARENA PAGE
// --------------------------------------------------------------------------
export const ChallengeArenaPage: React.FC = () => {
  const { recordGameScore, progress } = useAppStore();
  const [activeGameId, setActiveGameId] = useState<string>(OS_GAMES[0].id);
  const [isPlayingLive, setIsPlayingLive] = useState<boolean>(false);
  const [lastGameScore, setLastGameScore] = useState<number | null>(null);

  const activeGame: OsGame = 
    OS_GAMES.find((g: OsGame) => g.id === activeGameId) || OS_GAMES[0];

  const highScore = progress.gameScores[activeGame.id] || 0;

  const handleGameFinished = (finalScore: number) => {
    setLastGameScore(finalScore);
    recordGameScore(activeGame.id, finalScore);
  };

  const getGameIcon = (iconName: string) => {
    switch (iconName) {
      case 'Timer': return <Timer className="w-5 h-5 text-blue-400" />;
      case 'Layers': return <Layers className="w-5 h-5 text-emerald-400" />;
      case 'Zap': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'AlertTriangle': return <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />;
      case 'Compass': return <Compass className="w-5 h-5 text-purple-400" />;
      case 'Lock': return <Lock className="w-5 h-5 text-sky-400" />;
      case 'Server': return <Server className="w-5 h-5 text-indigo-400" />;
      default: return <Gamepad2 className="w-5 h-5 text-blue-400" />;
    }
  };

  // Render specific game engine
  const renderActiveGameEngine = () => {
    switch (activeGame.id) {
      case 'game_cpu_commander':
        return <CpuCommanderGame onFinish={handleGameFinished} />;
      case 'game_deadlock_breaker':
        return <DeadlockBreakerGame onFinish={handleGameFinished} />;
      case 'game_memory_manager':
        return <MemoryManagerGame onFinish={handleGameFinished} />;
      case 'game_disk_controller':
        return <DiskControllerGame onFinish={handleGameFinished} />;
      case 'game_thread_master':
        return <ThreadMasterGame onFinish={handleGameFinished} />;
      default:
        return <CpuCommanderGame onFinish={handleGameFinished} />;
    }
  };

  return (
    <div className="space-y-6 py-4 select-none">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <Gamepad2 className="w-6 h-6 text-amber-400" />
              OS Challenge & Gamification Arena
            </h1>
            <span className="px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/40 text-[10px] font-mono text-amber-400 font-bold uppercase">
              7 Playable Games
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Turn Operating System theory and algorithms into real-time interactive challenges
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-slate-400">Total XP Earned:</span>
          <span className="px-3 py-1 rounded-full bg-[bg-slate-800] border border-slate-800 text-amber-400 font-bold">
            {progress.xp} XP
          </span>
        </div>
      </div>

      {/* Main Grid: Game Selection Sidebar vs Active Game Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Sidebar (Col 4) */}
        <div className="lg:col-span-4 space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1 font-mono">
            Choose Mission
          </span>

          {OS_GAMES.map((game: OsGame) => {
            const isSelected = game.id === activeGame.id;
            const score = progress.gameScores[game.id] || 0;

            return (
              <div
                key={game.id}
                onClick={() => {
                  setActiveGameId(game.id);
                  setIsPlayingLive(false);
                  setLastGameScore(null);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[bg-slate-800] border-amber-500 shadow-md scale-[1.01]'
                    : 'bg-[bg-slate-900] border-slate-800 hover:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-amber-400 font-bold">
                    GAME 0{game.gameNumber} • {game.codename}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[bg-slate-950] text-slate-300 border border-slate-800">
                    +{game.xpReward} XP
                  </span>
                </div>
                <h4 className={`text-xs font-bold leading-snug ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                  {game.title}
                </h4>
                <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-slate-400">
                  <span>Difficulty: {game.difficulty}</span>
                  {score > 0 && (
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> {score}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Active Game Console (Col 8) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Game Header Card */}
          <div className="p-6 rounded-2xl bg-[bg-slate-900] border border-slate-800 backdrop-blur-md shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs font-mono">
              <span className="text-amber-400 font-bold uppercase flex items-center gap-2">
                {getGameIcon(activeGame.badgeIcon)}
                {activeGame.codename}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-slate-400">Personal Best:</span>
                <span className="text-amber-400 font-bold text-sm">{highScore > 0 ? `${highScore} pts` : 'No score yet'}</span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white">
              {activeGame.title}
            </h2>

            <div className="p-4 rounded-xl bg-[bg-slate-950] border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
              <strong className="text-amber-400 block font-mono text-[10px] uppercase font-bold mb-1">
                Mission Objective:
              </strong>
              {activeGame.objective}
            </div>

            {/* Launch Game Button */}
            {!isPlayingLive ? (
              <div className="pt-2">
                <button
                  onClick={() => {
                    setIsPlayingLive(true);
                    setLastGameScore(null);
                  }}
                  className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-[bg-slate-950] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer hover:scale-101"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Launch {activeGame.title} Session</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  GAME SESSION ACTIVE
                </span>
                <button
                  onClick={() => setIsPlayingLive(false)}
                  className="px-4 py-1.5 rounded-lg bg-[bg-slate-950] hover:bg-[bg-slate-800] border border-slate-800 text-xs font-mono text-slate-300 transition-colors cursor-pointer"
                >
                  Exit Session
                </button>
              </div>
            )}

            {/* Game Result Banner */}
            {lastGameScore && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-center font-mono text-xs animate-in zoom-in duration-200">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest block mb-1">
                  Mission Completed!
                </span>
                <div className="text-3xl font-black text-emerald-300 my-1">
                  {lastGameScore} PTS
                </div>
                <p className="text-slate-300 font-sans text-xs">
                  Awarded +{activeGame.xpReward} XP! Badge Unlocked: <strong>{activeGame.badgeName}</strong>.
                </p>
              </div>
            )}
          </div>

          {/* Interactive Playable Game Arena */}
          {isPlayingLive && (
            <div className="animate-in fade-in zoom-in duration-200">
              {renderActiveGameEngine()}
            </div>
          )}

          {/* Instructions & Game Rules */}
          <div className="p-6 rounded-2xl bg-[bg-slate-900] border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Mission Instructions & Strategy Guide:
            </h3>

            <div className="space-y-2 font-mono text-xs">
              {activeGame.instructions.map((inst: string, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-[bg-slate-950] border border-slate-800 text-slate-300">
                  › {inst}
                </div>
              ))}
            </div>

            {/* Rules */}
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs font-mono space-y-1.5 text-rose-200">
              <strong className="block text-rose-400 uppercase font-bold text-[10px]">
                Failure Criteria & Rules:
              </strong>
              {activeGame.rules.map((rule: string, idx: number) => (
                <div key={idx}>• {rule}</div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

function CpuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <rect width="6" height="6" x="9" y="9" rx="1" />
      <path d="M15 2v2" />
      <path d="M15 20v2" />
      <path d="M2 15h2" />
      <path d="M2 9h2" />
      <path d="M20 15h2" />
      <path d="M20 9h2" />
      <path d="M9 2v2" />
      <path d="M9 20v2" />
    </svg>
  );
}
