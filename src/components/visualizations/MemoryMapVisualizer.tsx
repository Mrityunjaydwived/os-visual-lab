// Contiguous Memory Allocation Visualizer (First Fit, Best Fit, Worst Fit, Next Fit)
import React, { useState } from 'react';
import { 
  runMemoryAllocation, 
  type AllocationAlgorithm, 
  type MemoryProcessRequest 
} from '../../core/algorithms/memoryAllocation';
import { Layers, CheckCircle2, AlertCircle, Plus, Trash2, Sliders } from 'lucide-react';

const DEFAULT_BLOCKS = [100, 500, 200, 300, 600]; // in KB
const DEFAULT_PROCESSES: MemoryProcessRequest[] = [
  { id: 'proc_1', name: 'P1', size: 212, color: '#00f0ff' },
  { id: 'proc_2', name: 'P2', size: 417, color: '#a855f7' },
  { id: 'proc_3', name: 'P3', size: 112, color: '#10b981' },
  { id: 'proc_4', name: 'P4', size: 426, color: '#f59e0b' }
];

export const MemoryMapVisualizer: React.FC = () => {
  const [blockSizes, setBlockSizes] = useState<number[]>(DEFAULT_BLOCKS);
  const [processes, setProcesses] = useState<MemoryProcessRequest[]>(DEFAULT_PROCESSES);
  const [algorithm, setAlgorithm] = useState<AllocationAlgorithm>('FIRST_FIT');
  const [selectedStepIdx, setSelectedStepIdx] = useState<number>(0);

  const result = runMemoryAllocation(blockSizes, processes, algorithm);

  const handleAddBlock = () => {
    setBlockSizes([...blockSizes, 250]);
  };

  const handleRemoveBlock = (idx: number) => {
    if (blockSizes.length <= 1) return;
    setBlockSizes(blockSizes.filter((_, i) => i !== idx));
  };

  const handleUpdateBlock = (idx: number, size: number) => {
    const copy = [...blockSizes];
    copy[idx] = Math.max(10, size);
    setBlockSizes(copy);
  };

  const handleAddProcess = () => {
    const nextNum = processes.length + 1;
    const colors = ['#00f0ff', '#a855f7', '#10b981', '#f59e0b', '#f43f5e'];
    setProcesses([
      ...processes,
      {
        id: `proc_${Date.now()}`,
        name: `P${nextNum}`,
        size: Math.floor(Math.random() * 300) + 50,
        color: colors[(nextNum - 1) % colors.length]
      }
    ]);
  };

  const handleRemoveProcess = (id: string) => {
    if (processes.length <= 1) return;
    setProcesses(processes.filter(p => p.id !== id));
  };

  const handleUpdateProcessSize = (id: string, size: number) => {
    setProcesses(processes.map(p => p.id === id ? { ...p, size: Math.max(1, size) } : p));
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Strategy Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            Contiguous Memory Allocation & Fragmentation
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize First Fit, Best Fit, Worst Fit, and Next Fit with internal & external fragmentation metrics
          </p>
        </div>

        {/* Algorithm Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          {(['FIRST_FIT', 'BEST_FIT', 'WORST_FIT', 'NEXT_FIT'] as AllocationAlgorithm[]).map(alg => (
            <button
              key={alg}
              onClick={() => {
                setAlgorithm(alg);
                setSelectedStepIdx(0);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                algorithm === alg
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {alg.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Physical RAM Memory Bar Map */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            Physical RAM Partitions ({result.totalMemory} KB Total)
          </span>
          <span className="text-xs font-mono text-emerald-400">
            Memory Utilization: {result.utilizationPercentage}%
          </span>
        </div>

        {/* Visual Memory Blocks Bar */}
        <div className="w-full flex h-24 rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-950 p-1 gap-1">
          {result.finalBlocks.map((block) => {
            const blockWidthPercent = (block.size / result.totalMemory) * 100;
            const isAllocated = block.allocatedProcessId !== null;
            const proc = processes.find(p => p.id === block.allocatedProcessId);

            return (
              <div
                key={block.id}
                style={{ width: `${Math.max(8, blockWidthPercent)}%` }}
                className={`h-full rounded-lg border flex flex-col justify-between p-1.5 relative overflow-hidden transition-all group ${
                  isAllocated
                    ? 'border-emerald-500/50 bg-emerald-950/20'
                    : 'border-slate-800 bg-slate-900/30'
                }`}
              >
                {/* Block Header */}
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400 font-bold">B{block.id}</span>
                  <span className="text-slate-400">{block.size}K</span>
                </div>

                {/* Allocated Process Inside Block */}
                {isAllocated && proc ? (
                  <div className="my-auto text-center">
                    <div className="text-xs font-black text-emerald-300 font-mono">
                      {block.allocatedProcessName}
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono">
                      {block.allocatedSize} KB
                    </div>
                  </div>
                ) : (
                  <div className="my-auto text-center text-[10px] text-slate-500 font-mono italic">
                    Free Hole
                  </div>
                )}

                {/* Internal Fragmentation Bar inside Block */}
                {isAllocated && block.internalFragmentation > 0 && (
                  <div className="text-[9px] font-mono text-amber-400/90 text-right truncate">
                    Frag: {block.internalFragmentation}K
                  </div>
                )}

                {/* Tooltip on hover */}
                <div className="absolute inset-0 bg-slate-900/95 p-2 hidden group-hover:flex flex-col justify-center text-[10px] font-mono z-10">
                  <span className="text-cyan-300 font-bold">Block {block.id}</span>
                  <span>Size: {block.size} KB</span>
                  {isAllocated ? (
                    <>
                      <span className="text-emerald-400">Process: {block.allocatedProcessName} ({block.allocatedSize} KB)</span>
                      <span className="text-amber-400">Internal Frag: {block.internalFragmentation} KB</span>
                    </>
                  ) : (
                    <span className="text-slate-400">Status: Unallocated Free Hole</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500" />
              Allocated Memory
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-900 border border-slate-700" />
              Free Space
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500" />
              Internal Fragmentation
            </span>
          </div>
          <span>Total Memory: {result.totalMemory} KB</span>
        </div>
      </div>

      {/* Metrics & Step Rationale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Step Explanation & "WHY?" Rationale */}
        <div className="lg:col-span-2 space-y-3">
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Step-by-Step Allocation Sequence
            </h3>

            <div className="space-y-2">
              {result.steps.map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedStepIdx(idx)}
                  className={`p-3 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                    selectedStepIdx === idx
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-slate-200 shadow-md'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-200">
                      Step {idx + 1}: Allocate {step.process.name} ({step.process.size} KB)
                    </span>
                    {step.success ? (
                      <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Allocated in B{step.allocatedBlockId}
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1 text-[11px]">
                        <AlertCircle className="w-3.5 h-3.5" /> Allocation Failed
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    {step.whyExplanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Numerical Fragmentation Summary Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-3 font-mono text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 pb-2 border-b border-slate-800">
              Fragmentation Analysis
            </h3>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Total Allocated:</span>
              <span className="text-emerald-300 font-bold">{result.totalAllocated} KB</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Internal Frag:</span>
              <span className="text-amber-400 font-bold">{result.totalInternalFragmentation} KB</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">External Frag:</span>
              <span className="text-rose-400 font-bold">{result.totalExternalFragmentation} KB</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Unallocated Procs:</span>
              <span className="text-purple-300 font-bold">{result.unallocatedProcesses.length}</span>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-sans leading-relaxed">
              {result.unallocatedProcesses.length > 0 ? (
                <span className="text-rose-400 font-semibold">
                  ⚠️ External Fragmentation Warning: {result.totalExternalFragmentation} KB total free space exists across holes, but cannot fulfill non-contiguous requests!
                </span>
              ) : (
                <span className="text-emerald-400 font-semibold">
                  ✓ All process requests were successfully satisfied.
                </span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Editable Block & Process Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Memory Partition Blocks Editor */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-slate-200 uppercase font-mono">Memory Blocks (KB)</span>
            <button
              onClick={handleAddBlock}
              className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Block
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {blockSizes.map((size, idx) => (
              <div key={idx} className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-lg border border-slate-800 font-mono">
                <span className="text-slate-500 text-[10px]">B{idx}:</span>
                <input
                  type="number"
                  value={size}
                  onChange={e => handleUpdateBlock(idx, parseInt(e.target.value) || 0)}
                  className="w-14 bg-transparent text-slate-200 text-xs text-center focus:outline-none"
                />
                <button
                  onClick={() => handleRemoveBlock(idx)}
                  className="text-slate-600 hover:text-rose-400 p-0.5 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Process Memory Requests Editor */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-slate-200 uppercase font-mono">Process Requests (KB)</span>
            <button
              onClick={handleAddProcess}
              className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Request
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {processes.map((p) => (
              <div key={p.id} className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-lg border border-slate-800 font-mono">
                <span className="text-emerald-400 font-bold">{p.name}:</span>
                <input
                  type="number"
                  value={p.size}
                  onChange={e => handleUpdateProcessSize(p.id, parseInt(e.target.value) || 0)}
                  className="w-14 bg-transparent text-slate-200 text-xs text-center focus:outline-none"
                />
                <button
                  onClick={() => handleRemoveProcess(p.id)}
                  className="text-slate-600 hover:text-rose-400 p-0.5 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
