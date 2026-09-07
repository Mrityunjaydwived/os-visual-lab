// Disk Scheduling Visualizer with 3D Platter & Cylinder Timeline Trajectory
import React, { useState, useMemo } from 'react';
import { 
  executeDiskAlgorithm, 
  type DiskAlgorithm, 
  type DiskDirection 
} from '../../core/algorithms/diskScheduling';
import { DiskPlatter3D } from '../3d/DiskPlatter3D';
import { Compass, SkipForward, SkipBack, RotateCcw, HelpCircle } from 'lucide-react';

const DEFAULT_REQUESTS = [98, 183, 37, 122, 14, 124, 65, 67];

export const DiskSchedulingVisualizer: React.FC = () => {
  const [requests, setRequests] = useState<number[]>(DEFAULT_REQUESTS);
  const [initialHead, setInitialHead] = useState<number>(53);
  const [direction, setDirection] = useState<DiskDirection>('RIGHT');
  const [algorithm, setAlgorithm] = useState<DiskAlgorithm>('SCAN');
  const [maxCylinder] = useState<number>(199);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  const result = useMemo(() => {
    return executeDiskAlgorithm(requests, initialHead, direction, maxCylinder, algorithm);
  }, [requests, initialHead, direction, maxCylinder, algorithm]);

  const activeStep = result.steps[currentStepIdx] || null;
  const currentTrack = result.seekSequence[currentStepIdx] ?? initialHead;

  return (
    <div className="space-y-6">
      
      {/* Top Header & Algorithm Selector Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-purple-400" />
            Disk Scheduling & Head Movement Laboratory
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare mechanical seek trajectories: FCFS, SSTF, SCAN (Elevator), C-SCAN, LOOK, and C-LOOK
          </p>
        </div>

        {/* Algorithm Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          {(['FCFS', 'SSTF', 'SCAN', 'C_SCAN', 'LOOK', 'C_LOOK'] as DiskAlgorithm[]).map(alg => (
            <button
              key={alg}
              onClick={() => {
                setAlgorithm(alg);
                setCurrentStepIdx(0);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                algorithm === alg
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {alg.replace('_', '-')}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Platter View & Configuration Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3D Platter Canvas */}
        <div className="lg:col-span-1 space-y-3">
          <DiskPlatter3D currentTrack={currentTrack} maxTrack={maxCylinder} />
          
          {/* Controls Bar */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentStepIdx(0)}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                title="Reset"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentStepIdx(prev => Math.max(0, prev - 1))}
                disabled={currentStepIdx <= 0}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 cursor-pointer"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentStepIdx(prev => Math.min(result.steps.length - 1, prev + 1))}
                disabled={currentStepIdx >= result.steps.length - 1}
                className="p-1.5 rounded bg-purple-500 text-black font-bold disabled:opacity-40 cursor-pointer"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-slate-400">
              Step: <strong className="text-cyan-300">{currentStepIdx + 1}</strong> / {result.steps.length || 1}
            </span>
          </div>
        </div>

        {/* Cylinder Timeline & Seek Graph */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Seek Trajectory Across Cylinders [0 → {maxCylinder}]
              </span>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">Direction:</span>
                <select
                  value={direction}
                  onChange={e => setDirection(e.target.value as DiskDirection)}
                  className="bg-slate-950 text-cyan-300 font-mono rounded px-2 py-0.5 border border-slate-800"
                >
                  <option value="RIGHT">Right / Higher (&gt;)</option>
                  <option value="LEFT">Left / Lower (&lt;)</option>
                </select>
              </div>
            </div>

            {/* Cylinder Seek Timeline Chart */}
            <div className="relative w-full h-44 bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between overflow-x-auto">
              
              {/* Cylinder numbers 0, 50, 100, 150, 199 */}
              <div className="flex justify-between text-[10px] font-mono text-slate-500 border-b border-slate-800/80 pb-1">
                <span>Cylinder 0</span>
                <span>Track 50</span>
                <span>Track 100</span>
                <span>Track 150</span>
                <span>Cylinder {maxCylinder}</span>
              </div>

              {/* Connected Seek Track Points */}
              <div className="relative w-full flex-1 my-2">
                {result.seekSequence.map((track, idx) => {
                  const xPercent = (track / maxCylinder) * 96;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div
                      key={idx}
                      style={{ left: `${xPercent}%` }}
                      onClick={() => setCurrentStepIdx(idx)}
                      className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer transition-all ${
                        isCurrent ? 'scale-125 z-20' : 'hover:scale-110'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center font-mono text-[8px] font-bold ${
                        isCurrent
                          ? 'bg-cyan-400 border-white text-black ring-4 ring-cyan-500/30'
                          : idx === 0
                          ? 'bg-emerald-500 border-emerald-300 text-black'
                          : 'bg-purple-600 border-purple-400 text-white'
                      }`}>
                        {idx}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 mt-1 whitespace-nowrap">
                        {track}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Seek Order Sequence */}
              <div className="text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[10px] text-slate-500 uppercase font-bold shrink-0">Order:</span>
                <span className="text-cyan-300 font-bold whitespace-nowrap">
                  {result.seekSequence.join(' → ')}
                </span>
              </div>
            </div>

            {/* "WHY?" Explanation Box */}
            <div className="mt-4 p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs leading-relaxed text-slate-300">
              <span className="font-bold text-purple-300 flex items-center gap-1 mb-1 font-mono text-[11px]">
                <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                Seek Decision:
              </span>
              {activeStep?.whyExplanation || 'Step through to see why each track was visited.'}
            </div>

          </div>

          {/* Metrics Summary */}
          <div className="grid grid-cols-3 gap-3 font-mono text-center text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Total Head Movement</span>
              <span className="text-lg font-bold text-purple-300">{result.totalHeadMovement} Cylinders</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Average Seek Distance</span>
              <span className="text-lg font-bold text-cyan-300">{result.averageSeekDistance} Cyl</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Est. Seek Time</span>
              <span className="text-lg font-bold text-emerald-300">{result.seekTimeEstimateMs} ms</span>
            </div>
          </div>

        </div>

      </div>

      {/* Inputs Configuration */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs font-mono flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Initial Head Position:</span>
          <input
            type="number"
            min="0"
            max={maxCylinder}
            value={initialHead}
            onChange={e => setInitialHead(Math.min(maxCylinder, Math.max(0, parseInt(e.target.value) || 0)))}
            className="w-16 bg-slate-950 text-cyan-300 text-center font-bold px-2 py-1 rounded border border-slate-700"
          />
        </div>

        <div className="flex-1 min-w-[260px] flex items-center gap-2">
          <span className="text-slate-400">Track Queue:</span>
          <input
            type="text"
            defaultValue={requests.join(', ')}
            onBlur={e => {
              const parsed = e.target.value
                .split(',')
                .map(s => parseInt(s.trim()))
                .filter(n => !isNaN(n) && n >= 0 && n <= maxCylinder);
              if (parsed.length > 0) {
                setRequests(parsed);
                setCurrentStepIdx(0);
              }
            }}
            className="w-full bg-slate-950 text-slate-200 px-3 py-1 rounded border border-slate-700 focus:outline-none"
          />
        </div>
      </div>

    </div>
  );
};
