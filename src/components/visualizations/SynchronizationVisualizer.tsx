// Process Synchronization Visualizer (Producer-Consumer, Readers-Writers, Dining Philosophers)
import React, { useState } from 'react';
import { 
  createProducerConsumer, 
  produceItem, 
  consumeItem, 
  createDiningSimulation, 
  triggerDiningDeadlock, 
  stepDiningPhilosopher, 
  createReadersWritersState, 
  startRead, 
  finishRead, 
  startWrite, 
  finishWrite 
} from '../../core/algorithms/synchronization';
import { Lock, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';

export const SynchronizationVisualizer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PROD_CONS' | 'DINING' | 'READ_WRITE'>('PROD_CONS');

  // Producer-Consumer State
  const [pcState, setPcState] = useState(createProducerConsumer(5));

  // Dining Philosophers State
  const [diningState, setDiningState] = useState(createDiningSimulation('ASYMMETRIC_ODD_EVEN'));

  // Readers-Writers State
  const [rwState, setRwState] = useState(createReadersWritersState());

  return (
    <div className="space-y-6">
      
      {/* Top Header & Lab Switcher */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Lock className="w-5 h-5 text-cyan-400" />
            Process Synchronization & Concurrency Laboratory
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive bounded buffer, readers-writers locks, and dining philosophers deadlock experiments
          </p>
        </div>

        {/* Lab Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('PROD_CONS')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'PROD_CONS'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Producer-Consumer
          </button>
          <button
            onClick={() => setActiveTab('DINING')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'DINING'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dining Philosophers
          </button>
          <button
            onClick={() => setActiveTab('READ_WRITE')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'READ_WRITE'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Readers-Writers
          </button>
        </div>
      </div>

      {activeTab === 'PROD_CONS' ? (
        /* PRODUCER-CONSUMER (BOUNDED BUFFER) */
        <div className="space-y-6">
          
          {/* Main Visual Buffer Pipeline */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Bounded Buffer (Capacity: {pcState.bufferCapacity} Slots)
              </span>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-cyan-400">mutex = <strong>{pcState.mutex}</strong></span>
                <span className="text-emerald-400">empty = <strong>{pcState.emptySlots}</strong></span>
                <span className="text-purple-400">full = <strong>{pcState.fullSlots}</strong></span>
              </div>
            </div>

            {/* Visual Slots Container */}
            <div className="grid grid-cols-5 gap-3 my-6">
              {Array.from({ length: pcState.bufferCapacity }).map((_, idx) => {
                const item = pcState.buffer[idx];
                const isOccupied = Boolean(item);

                return (
                  <div
                    key={idx}
                    className={`h-24 rounded-2xl border-2 flex flex-col items-center justify-center p-2 font-mono transition-all ${
                      isOccupied
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                        : 'bg-slate-950 border-slate-800 text-slate-600'
                    }`}
                  >
                    <span className="text-[10px] text-slate-500 mb-1">Slot {idx}</span>
                    <span className="text-xs font-bold text-center truncate w-full">
                      {isOccupied ? item : '[Empty]'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Producer / Consumer Control Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-800">
              <button
                onClick={() => setPcState(produceItem(pcState))}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]"
              >
                <span>PRODUCE ITEM (wait(empty), wait(mutex))</span>
              </button>

              <button
                onClick={() => setPcState(consumeItem(pcState).state)}
                className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              >
                <span>CONSUME ITEM (wait(full), wait(mutex))</span>
              </button>

              <button
                onClick={() => setPcState(createProducerConsumer(5))}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="Reset Buffer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Event Log */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 font-mono text-xs">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
              Last Semaphore & Buffer Event:
            </span>
            <p className="text-cyan-300 font-semibold leading-relaxed">
              {pcState.lastEvent}
            </p>
          </div>

        </div>
      ) : activeTab === 'DINING' ? (
        /* DINING PHILOSOPHERS LAB */
        <div className="space-y-6">
          
          {/* Status & Strategy Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="text-slate-400">Strategy:</span>
              <span className="text-purple-300 font-bold">
                {diningState.strategy === 'ASYMMETRIC_ODD_EVEN' ? "Dijkstra's Asymmetric Odd/Even Pickup" : 'Naive Circular Wait'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setDiningState(triggerDiningDeadlock())}
                className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_0_12px_rgba(244,63,94,0.25)]"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Force Deadlock Condition</span>
              </button>

              <button
                onClick={() => setDiningState(createDiningSimulation('ASYMMETRIC_ODD_EVEN'))}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_0_12px_rgba(16,185,129,0.25)]"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Resolve Deadlock (Asymmetric)</span>
              </button>
            </div>
          </div>

          {/* Dining Table Round Simulation */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden">
            {diningState.deadlockState && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-300 font-mono text-xs flex items-center justify-between">
                <span>⚠️ DEADLOCK FORMED! All 5 philosophers hold their left fork and wait infinitely for right fork.</span>
                <span className="text-[10px] uppercase bg-rose-500 text-black px-2 py-0.5 rounded font-bold">LOCKED</span>
              </div>
            )}

            {/* Circular Dining Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 my-4">
              {diningState.philosophers.map((phil) => {
                const isEating = phil.status === 'EATING';
                const isHungry = phil.status === 'HUNGRY';

                return (
                  <div
                    key={phil.id}
                    onClick={() => setDiningState(stepDiningPhilosopher(diningState, phil.id))}
                    className={`p-3.5 rounded-xl border flex flex-col items-center justify-between text-center transition-all cursor-pointer ${
                      isEating
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                        : isHungry
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-xs font-bold mb-1">{phil.name}</div>
                    <div className="text-xl my-2">
                      {isEating ? '🍝' : isHungry ? '😋' : '🤔'}
                    </div>
                    <span className="text-[10px] font-mono uppercase font-bold">
                      {phil.status}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono mt-1">
                      Meals: {phil.mealsEaten}
                    </span>
                    <span className="text-[8px] text-slate-500 mt-2">Click to Step</span>
                  </div>
                );
              })}
            </div>

            {/* Forks Status */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 mt-4 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Forks on Table:</span>
              <div className="flex items-center gap-3">
                {diningState.forks.map((inUse, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      inUse ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Fork {idx}: {inUse ? 'HELD' : 'FREE'}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* History Log */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 font-mono text-xs max-h-36 overflow-y-auto space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Dining Log:</span>
            {diningState.historyLog.map((log, idx) => (
              <div key={idx} className="text-slate-300">
                › {log}
              </div>
            ))}
          </div>

        </div>
      ) : (
        /* READERS-WRITERS PROBLEM */
        <div className="space-y-6">
          
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Shared Database Resource
              </span>
              <div className="text-xs font-mono text-emerald-400">
                Current Record Value: <strong className="text-base text-cyan-300">{rwState.resourceValue}</strong>
              </div>
            </div>

            {/* Central Shared Resource Box */}
            <div className="my-6 p-8 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-700 text-center relative">
              <div className="text-3xl font-black font-mono my-2 text-slate-100">
                DATA_VALUE = {rwState.resourceValue}
              </div>

              {rwState.activeWriter ? (
                <div className="inline-block px-4 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold animate-pulse">
                  EXCLUSIVE WRITE LOCK HELD
                </div>
              ) : rwState.activeReaders > 0 ? (
                <div className="inline-block px-4 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold">
                  SHARED READ ACCESS ({rwState.activeReaders} Readers Reading Concurrently)
                </div>
              ) : (
                <div className="text-slate-500 font-mono text-xs">
                  Resource Idle (No active readers or writers)
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono font-bold">
              <button
                onClick={() => setRwState(startRead(rwState))}
                className="p-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 transition-colors cursor-pointer"
              >
                + Start Read
              </button>
              <button
                onClick={() => setRwState(finishRead(rwState))}
                disabled={rwState.activeReaders <= 0}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors cursor-pointer"
              >
                - Finish Read
              </button>
              <button
                onClick={() => setRwState(startWrite(rwState))}
                disabled={rwState.activeWriter || rwState.activeReaders > 0}
                className="p-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 disabled:opacity-40 transition-colors cursor-pointer"
              >
                Acquire Write Lock
              </button>
              <button
                onClick={() => setRwState(finishWrite(rwState, 5))}
                disabled={!rwState.activeWriter}
                className="p-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 disabled:opacity-40 transition-colors cursor-pointer"
              >
                Commit Write (+5)
              </button>
            </div>
          </div>

          {/* Log */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 font-mono text-xs max-h-36 overflow-y-auto space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Transaction Log:</span>
            {rwState.historyLog.map((log, idx) => (
              <div key={idx} className="text-slate-300">
                › {log}
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
