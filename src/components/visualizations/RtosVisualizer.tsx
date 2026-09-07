// Real-Time Operating Systems (RTOS) Scheduling Visualizer (RMS vs EDF)
import React, { useState, useMemo } from 'react';
import { 
  runRtosScheduling, 
  type RealTimeTask, 
  calculateLiuLaylandBound 
} from '../../core/algorithms/rtosScheduling';
import { Clock, ShieldCheck, AlertTriangle } from 'lucide-react';

const DEFAULT_RT_TASKS: RealTimeTask[] = [
  { id: 't1', name: 'T1 (Flight Sensor)', period: 4, executionTime: 1, deadline: 4, color: '#00f0ff' },
  { id: 't2', name: 'T2 (Attitude Control)', period: 6, executionTime: 2, deadline: 6, color: '#a855f7' },
  { id: 't3', name: 'T3 (Telemetry Log)', period: 8, executionTime: 2, deadline: 8, color: '#10b981' },
];

export const RtosVisualizer: React.FC = () => {
  const [tasks] = useState<RealTimeTask[]>(DEFAULT_RT_TASKS);
  const [algorithm, setAlgorithm] = useState<'RMS' | 'EDF'>('RMS');

  const result = useMemo(() => {
    return runRtosScheduling(tasks, algorithm, 24);
  }, [tasks, algorithm]);

  const rmsBound = calculateLiuLaylandBound(tasks.length);

  return (
    <div className="space-y-6">
      
      {/* Top Header & Algorithm Toggle */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Real-Time Operating Systems (RTOS) Scheduling
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare static priority Rate Monotonic Scheduling (RMS) with dynamic Earliest Deadline First (EDF)
          </p>
        </div>

        {/* RMS vs EDF */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setAlgorithm('RMS')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              algorithm === 'RMS'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Rate Monotonic (RMS)
          </button>
          <button
            onClick={() => setAlgorithm('EDF')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              algorithm === 'EDF'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Earliest Deadline First (EDF)
          </button>
        </div>
      </div>

      {/* Schedulability Status Banner */}
      <div className={`p-4 rounded-2xl border text-xs font-mono backdrop-blur-md ${
        result.isSchedulableByBound
          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
          : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
      }`}>
        <div className="flex items-center justify-between font-bold text-sm">
          <span className="flex items-center gap-2">
            {result.isSchedulableByBound ? (
              <>
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                TASK SET IS GUARANTEED SCHEDULABLE UNDER {algorithm}!
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                UTILIZATION EXCEEDS SUFFICIENT BOUND ({algorithm})
              </>
            )}
          </span>
          <span>Utilization U = {(result.utilization * 100).toFixed(1)}%</span>
        </div>
        <p className="mt-2 text-slate-300 font-sans text-xs leading-relaxed">
          {algorithm === 'RMS'
            ? `Total Utilization U = ${(result.utilization * 100).toFixed(1)}% vs Liu & Layland Bound = ${(rmsBound * 100).toFixed(1)}% [n = ${tasks.length} tasks: n(2^(1/n) - 1)]. Since U <= Bound, all deadlines are strictly guaranteed.`
            : `EDF is optimal with a 100% utilization bound. Since U = ${(result.utilization * 100).toFixed(1)}% <= 100%, tasks are completely schedulable.`}
        </p>
      </div>

      {/* Timeline Schedule Execution */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Real-Time Execution Timeline (Hyperperiod = {result.totalTime} ms)
          </span>
          <span className="text-xs font-mono text-cyan-400">
            Deadline Misses: <strong className={result.deadlineMisses > 0 ? 'text-rose-400' : 'text-emerald-400'}>{result.deadlineMisses}</strong>
          </span>
        </div>

        {/* Visual Timeline Slices */}
        <div className="overflow-x-auto py-2">
          <div className="flex items-center gap-0.5 min-w-[600px] h-14 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {result.timeline.map((slice, idx) => {
              const task = tasks.find(t => t.id === slice.runningTaskId);
              const isIdle = slice.runningTaskId === null;

              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: isIdle ? '#1e293b' : `${task?.color}30`,
                    borderColor: isIdle ? '#334155' : task?.color
                  }}
                  className="flex-1 h-full rounded border flex flex-col items-center justify-center font-mono text-xs font-bold transition-all relative group"
                >
                  <span style={{ color: isIdle ? '#64748b' : task?.color }} className="text-[10px]">
                    {isIdle ? 'IDLE' : task?.name.split(' ')[0]}
                  </span>
                  <span className="text-[8px] text-slate-500 mt-0.5">t={slice.time}</span>

                  {/* Tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black/90 px-2 py-0.5 rounded text-[9px] text-white whitespace-nowrap z-20 font-mono">
                    {slice.whyExplanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Periodic Tasks Table */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
        <h3 className="font-bold text-slate-200 uppercase mb-3">Periodic Task Parameters</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="py-2">Task</th>
              <th className="py-2">Period (T)</th>
              <th className="py-2">Execution (C)</th>
              <th className="py-2">Utilization (C/T)</th>
              <th className="py-2">RMS Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {tasks.map((t, idx) => (
              <tr key={t.id}>
                <td className="py-2 font-bold flex items-center gap-2" style={{ color: t.color }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                  {t.name}
                </td>
                <td className="py-2">{t.period} ms</td>
                <td className="py-2">{t.executionTime} ms</td>
                <td className="py-2 text-cyan-300 font-bold">
                  {((t.executionTime / t.period) * 100).toFixed(1)}%
                </td>
                <td className="py-2 text-purple-300 font-bold">
                  Rank #{idx + 1} (T = {t.period})
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
