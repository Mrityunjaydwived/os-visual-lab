// Deadlock Detection (RAG) & Banker's Algorithm Laboratory
import React, { useState, useMemo } from 'react';
import { 
  runBankersAlgorithm, 
  type BankersProcess 
} from '../../core/algorithms/bankersAlgorithm';
import { 
  detectRagDeadlock, 
  type RagNode, 
  type RagEdge 
} from '../../core/algorithms/deadlockDetection';
import { 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle
} from 'lucide-react';

const INITIAL_BANKERS_PROCESSES: BankersProcess[] = [
  { id: 'p0', name: 'P0', allocation: [0, 1, 0], max: [7, 5, 3] },
  { id: 'p1', name: 'P1', allocation: [2, 0, 0], max: [3, 2, 2] },
  { id: 'p2', name: 'P2', allocation: [3, 0, 2], max: [9, 0, 2] },
  { id: 'p3', name: 'P3', allocation: [2, 1, 1], max: [2, 2, 2] },
  { id: 'p4', name: 'P4', allocation: [0, 0, 2], max: [4, 3, 3] },
];

const INITIAL_RAG_NODES: RagNode[] = [
  { id: 'P1', name: 'P1', type: 'PROCESS' },
  { id: 'P2', name: 'P2', type: 'PROCESS' },
  { id: 'R1', name: 'R1', type: 'RESOURCE', instances: 1 },
  { id: 'R2', name: 'R2', type: 'RESOURCE', instances: 1 },
];

const INITIAL_RAG_EDGES: RagEdge[] = [
  { id: 'e1', from: 'P1', to: 'R1', type: 'REQUEST' },
  { id: 'e2', from: 'R1', to: 'P2', type: 'ASSIGNMENT' },
  { id: 'e3', from: 'P2', to: 'R2', type: 'REQUEST' },
  { id: 'e4', from: 'R2', to: 'P1', type: 'ASSIGNMENT' }, // forms circular wait!
];

export const BankersDeadlockVisualizer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'BANKERS' | 'RAG'>('BANKERS');

  // Banker's State
  const [bankersProcesses] = useState<BankersProcess[]>(INITIAL_BANKERS_PROCESSES);
  const [available] = useState<number[]>([3, 3, 2]);
  const [selectedSafetyStep, setSelectedSafetyStep] = useState<number>(0);

  // RAG State
  const [ragNodes] = useState<RagNode[]>(INITIAL_RAG_NODES);
  const [ragEdges, setRagEdges] = useState<RagEdge[]>(INITIAL_RAG_EDGES);

  // Banker's Computation
  const bankersResult = useMemo(() => {
    return runBankersAlgorithm(bankersProcesses, available);
  }, [bankersProcesses, available]);

  const activeSafetyStep = bankersResult.steps[selectedSafetyStep] || null;

  // RAG Computation
  const ragResult = useMemo(() => {
    return detectRagDeadlock(ragNodes, ragEdges);
  }, [ragNodes, ragEdges]);

  return (
    <div className="space-y-6">
      
      {/* Top Header & Mode Toggle */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            Deadlock Laboratory: Banker's Algorithm & Resource Graphs
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Deadlock avoidance via Banker's algorithm matrices and Resource Allocation Graph (RAG) cycle detection
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('BANKERS')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'BANKERS'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Banker's Algorithm
          </button>
          <button
            onClick={() => setActiveTab('RAG')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'RAG'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Resource Allocation Graph (RAG)
          </button>
        </div>
      </div>

      {activeTab === 'BANKERS' ? (
        /* BANKER'S ALGORITHM TAB */
        <div className="space-y-6">
          
          {/* Safe State Banner */}
          <div className={`p-4 rounded-2xl border text-xs font-mono backdrop-blur-md ${
            bankersResult.isSafe 
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
              : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
          }`}>
            <div className="flex items-center justify-between font-bold text-sm">
              <span className="flex items-center gap-2">
                {bankersResult.isSafe ? (
                  <>
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    SYSTEM IS IN A SAFE STATE!
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    UNSAFE STATE DETECTED!
                  </>
                )}
              </span>
              <span>Available: [{available.join(', ')}]</span>
            </div>
            {bankersResult.isSafe ? (
              <p className="mt-2 text-slate-300 font-sans text-xs leading-relaxed">
                Safe execution sequence discovered: <strong className="text-emerald-400 font-mono text-sm">&lt;{bankersResult.safeSequence.join(', ')}&gt;</strong>. Every process can finish without risk of circular deadlock.
              </p>
            ) : (
              <p className="mt-2 text-rose-300 font-sans text-xs leading-relaxed">
                {bankersResult.unsafeReason}
              </p>
            )}
          </div>

          {/* Matrices Table: Allocation, Max, Need, Available */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Resource Matrices (A, B, C)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-center font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                    <th className="py-2 px-3 text-left">Process</th>
                    <th className="py-2 px-3 text-cyan-400">Allocation (A B C)</th>
                    <th className="py-2 px-3 text-purple-400">Max (A B C)</th>
                    <th className="py-2 px-3 text-amber-400">Need = Max - Alloc</th>
                    <th className="py-2 px-3 text-emerald-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {bankersProcesses.map((p, idx) => {
                    const need = bankersResult.needMatrix[idx]?.need || [];
                    const isStepActive = activeSafetyStep?.processId === p.id;

                    return (
                      <tr key={p.id} className={`hover:bg-slate-800/30 transition-colors ${
                        isStepActive ? 'bg-cyan-500/10' : ''
                      }`}>
                        <td className="py-2 px-3 text-left font-bold text-cyan-300">{p.name}</td>
                        <td className="py-2 px-3">
                          {p.allocation.join('  ')}
                        </td>
                        <td className="py-2 px-3">
                          {p.max.join('  ')}
                        </td>
                        <td className="py-2 px-3 font-bold text-amber-300">
                          {need.join('  ')}
                        </td>
                        <td className="py-2 px-3">
                          {bankersResult.safeSequence.includes(p.name) ? (
                            <span className="text-emerald-400 flex items-center justify-center gap-1 text-[11px]">
                              <CheckCircle2 className="w-3 h-3" /> In Safe Sequence
                            </span>
                          ) : (
                            <span className="text-rose-400 text-[11px]">Unsatisfied</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Safety Algorithm Stepper & Rationale */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Step Selection List */}
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2 font-mono">
                Safety Algorithm Execution Steps
              </span>

              <div className="space-y-2">
                {bankersResult.steps.map((step, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedSafetyStep(idx)}
                    className={`p-3 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                      selectedSafetyStep === idx
                        ? 'bg-cyan-950/40 border-cyan-400 text-slate-100 shadow-md'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-cyan-300">
                        Step {idx + 1}: Check {step.processName}
                      </span>
                      <span className="text-emerald-400 font-bold">
                        Need [{step.need.join(', ')}] &lt;= Available [{step.availableBefore.join(', ')}]
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans">
                      {step.processName} completes and releases resources. New Available: [{step.availableAfter.join(', ')}]
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rationale & "WHY?" Details */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-purple-500/30 backdrop-blur-md flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-2 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                  Banker's Safety Step Rationale
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans mt-2">
                  {activeSafetyStep?.whyExplanation || 'Click any safety step on the left to inspect the mathematical matrix proof.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-mono text-slate-400">
                <span className="text-cyan-400 block text-[10px] uppercase font-bold">Banker's Invariant</span>
                For safety, at least one remaining process must satisfy Need_i &lt;= Work.
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* RESOURCE ALLOCATION GRAPH (RAG) TAB */
        <div className="space-y-6">
          
          {/* Deadlock Detection Banner */}
          <div className={`p-4 rounded-2xl border text-xs font-mono backdrop-blur-md ${
            ragResult.isDeadlocked
              ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
              : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
          }`}>
            <div className="flex items-center justify-between font-bold text-sm">
              <span className="flex items-center gap-2">
                {ragResult.isDeadlocked ? (
                  <>
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    DEADLOCK DETECTED IN RESOURCE ALLOCATION GRAPH!
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    NO DEADLOCK (Cycle-Free or Multi-Instance Safe)
                  </>
                )}
              </span>
              <span>{ragEdges.length} Graph Edges</span>
            </div>
            <p className="mt-2 text-slate-300 font-sans text-xs leading-relaxed">
              {ragResult.explanation}
            </p>
          </div>

          {/* Interactive Graph Canvas / Node Representation */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Resource Allocation Graph Nodes & Edges
              </h3>
              <button
                onClick={() => {
                  // Toggle breaking cycle
                  if (ragEdges.some(e => e.id === 'e4')) {
                    setRagEdges(ragEdges.filter(e => e.id !== 'e4')); // Break circular wait
                  } else {
                    setRagEdges([...ragEdges, { id: 'e4', from: 'R2', to: 'P1', type: 'ASSIGNMENT' }]);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                {ragEdges.some(e => e.id === 'e4') ? 'Break Circular Wait Edge' : 'Restore Circular Wait Edge'}
              </button>
            </div>

            {/* Visual Node Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
              {ragNodes.map(node => {
                const inCycle = ragResult.cycleNodes.includes(node.id);

                return (
                  <div
                    key={node.id}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center font-mono text-center transition-all ${
                      inCycle
                        ? 'bg-rose-950/30 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className={`w-12 h-12 flex items-center justify-center font-black text-lg ${
                      node.type === 'PROCESS'
                        ? 'rounded-full bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300'
                        : 'rounded-xl bg-purple-500/20 border-2 border-purple-400 text-purple-300'
                    }`}>
                      {node.name}
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase mt-2 font-bold">
                      {node.type}
                    </span>
                    {node.type === 'RESOURCE' && (
                      <span className="text-[9px] text-slate-500 mt-0.5">
                        {node.instances || 1} instance
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Edge list */}
            <div className="space-y-1.5 font-mono text-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Active Edges:</span>
              {ragEdges.map(edge => (
                <div key={edge.id} className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-slate-300">
                  <span>
                    {edge.from} → {edge.to} ({edge.type === 'REQUEST' ? 'Process requests Resource' : 'Resource allocated to Process'})
                  </span>
                  <span className={`text-[10px] font-bold ${edge.type === 'REQUEST' ? 'text-cyan-400' : 'text-purple-400'}`}>
                    {edge.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Coffman's 4 Necessary Conditions Checklist */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Coffman's 4 Necessary Conditions Evaluation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">1. Mutual Exclusion</span>
                <span className="text-emerald-400 font-bold">MET (Single-use)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">2. Hold and Wait</span>
                <span className="text-emerald-400 font-bold">MET (Holding & Requesting)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">3. No Preemption</span>
                <span className="text-emerald-400 font-bold">MET (Voluntary release only)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">4. Circular Wait</span>
                <span className={ragResult.hasCycle ? 'text-rose-400 font-bold' : 'text-slate-500'}>
                  {ragResult.hasCycle ? 'CYCLE DETECTED ⚠️' : 'NONE'}
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
