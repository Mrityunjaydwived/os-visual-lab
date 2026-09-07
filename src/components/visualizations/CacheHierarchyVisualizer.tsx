// Cache Memory Hierarchy & AMAT Simulator
import React, { useState, useMemo } from 'react';
import { 
  runCacheSimulation, 
  calculateAmat, 
  type CacheMapping 
} from '../../core/algorithms/cacheSimulation';
import { Zap, HelpCircle, CheckCircle2, AlertCircle, Cpu } from 'lucide-react';

const DEFAULT_ACCESS_SEQUENCE = [0, 4, 8, 12, 16, 20, 0, 4, 32, 36, 0, 4, 64, 68];

export const CacheHierarchyVisualizer: React.FC = () => {
  const [mapping, setMapping] = useState<CacheMapping>('SET_ASSOCIATIVE_2');
  const [cacheSize] = useState<number>(64); // 64 Bytes
  const [blockSize] = useState<number>(8);   // 8 Bytes
  const [accessSequence] = useState<number[]>(DEFAULT_ACCESS_SEQUENCE);
  const [selectedStepIdx, setSelectedStepIdx] = useState<number>(0);

  // AMAT interactive parameters
  const [l1HitTime, setL1HitTime] = useState<number>(1);
  const [l1MissRate, setL1MissRate] = useState<number>(10); // 10%
  const [l2HitTime, setL2HitTime] = useState<number>(8);
  const [l2MissRate, setL2MissRate] = useState<number>(25); // 25%
  const [ramTime] = useState<number>(100);

  const result = useMemo(() => {
    return runCacheSimulation(accessSequence, cacheSize, blockSize, mapping, 16);
  }, [accessSequence, cacheSize, blockSize, mapping]);

  const activeStep = result.steps[selectedStepIdx] || null;

  const amatResult = calculateAmat(
    l1HitTime,
    l1MissRate / 100,
    l2HitTime,
    l2MissRate / 100,
    ramTime
  );

  return (
    <div className="space-y-6">
      
      {/* Top Header & Mapping Selector */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            CPU Cache Memory & AMAT Simulation
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tag/Index/Offset bit decomposition, set-associative line placement, and two-level AMAT calculations
          </p>
        </div>

        {/* Associativity Mapping Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          {[
            { id: 'DIRECT_MAPPED', label: 'Direct Mapped' },
            { id: 'SET_ASSOCIATIVE_2', label: '2-Way Set' },
            { id: 'SET_ASSOCIATIVE_4', label: '4-Way Set' },
            { id: 'FULLY_ASSOCIATIVE', label: 'Fully Associative' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setMapping(item.id as CacheMapping);
                setSelectedStepIdx(0);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mapping === item.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bit Decomposition & Architecture Specs Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Address Bit Decomposition (16-Bit Memory Address Bus)
          </span>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span>Sets: <strong className="text-cyan-300">{result.numSets}</strong></span>
            <span>Ways: <strong className="text-purple-300">{result.associativityWays}</strong></span>
            <span>Block Size: <strong className="text-emerald-300">{blockSize} B</strong></span>
          </div>
        </div>

        {/* Visual 16-Bit Decomposition Bar */}
        <div className="grid grid-cols-3 gap-2 text-center font-mono">
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/40">
            <span className="text-[10px] text-purple-400 uppercase tracking-widest block">Tag Field</span>
            <div className="text-xl font-black text-purple-300 my-0.5">{result.tagBits} Bits</div>
            <span className="text-[10px] text-slate-400">Identifies unique memory block</span>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/40">
            <span className="text-[10px] text-cyan-400 uppercase tracking-widest block">Index Field</span>
            <div className="text-xl font-black text-cyan-300 my-0.5">{result.indexBits} Bits</div>
            <span className="text-[10px] text-slate-400">Selects cache set (0 to {result.numSets - 1})</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
            <span className="text-[10px] text-emerald-400 uppercase tracking-widest block">Offset Field</span>
            <div className="text-xl font-black text-emerald-300 my-0.5">{result.offsetBits} Bits</div>
            <span className="text-[10px] text-slate-400">log2({blockSize} Bytes)</span>
          </div>
        </div>
      </div>

      {/* Memory Access Sequence & Active Step Rationale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Step-by-Step Access Sequence Runner */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#070b16] border border-cyan-500/30 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Memory Accesses
              </span>
              {activeStep?.isHit ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> CACHE HIT
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> CACHE MISS
                </span>
              )}
            </div>

            <div className="my-4 text-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Current Access</span>
              <div className="text-2xl font-black text-slate-100 font-mono my-0.5">
                Address {activeStep?.address}
              </div>
              <div className="text-xs font-mono text-cyan-300">
                0x{activeStep?.address.toString(16).toUpperCase()} • Set #{activeStep?.setIndex}
              </div>
            </div>

            {/* Access sequence badges */}
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto py-1">
              {accessSequence.map((addr, idx) => {
                const isCurrent = idx === selectedStepIdx;
                const isHit = result.steps[idx]?.isHit;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedStepIdx(idx)}
                    className={`px-2 py-1 rounded text-xs font-mono border transition-all cursor-pointer ${
                      isCurrent
                        ? 'ring-2 ring-cyan-400 font-bold scale-105 z-10'
                        : ''
                    } ${
                      isHit
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    {addr}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Overall Hit Ratio: </span>
            <strong className="text-emerald-400">{result.hitRatio}%</strong>
            <span className="text-slate-500 text-[10px] ml-1">({result.hits} Hits / {result.misses} Misses)</span>
          </div>
        </div>

        {/* Step Rationale & Cache State Table */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* "WHY?" Explanation Card */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30 backdrop-blur-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-1.5 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              Cache Decision Rationale
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {activeStep?.whyExplanation || 'Select a memory address to inspect Tag lookup and set placement.'}
            </p>
          </div>

          {/* Current Cache Sets Inspector */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
            <div className="flex items-center justify-between mb-2 text-slate-300 font-bold">
              <span>Cache Sets Internal State</span>
              <span className="text-slate-500 text-[10px]">{result.numSets} Sets Total</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {result.finalState.map((set, setIdx) => {
                const isCurrentSet = activeStep?.setIndex === setIdx;

                return (
                  <div
                    key={setIdx}
                    className={`p-2 rounded-xl border flex items-center justify-between gap-2 ${
                      isCurrentSet
                        ? 'bg-amber-500/10 border-amber-500/40'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <span className="text-slate-400 font-bold w-12">Set {setIdx}:</span>
                    <div className="flex items-center gap-2 flex-1 overflow-x-auto">
                      {set.lines.map((line, wIdx) => (
                        <div
                          key={wIdx}
                          className={`px-2 py-1 rounded text-[11px] border ${
                            line.valid
                              ? 'bg-slate-900 border-slate-700 text-slate-200'
                              : 'bg-slate-950 border-slate-900 text-slate-600'
                          }`}
                        >
                          {line.valid ? (
                            <span>Tag: <strong>{line.tag}</strong> (Blk {line.dataBlock})</span>
                          ) : (
                            <span className="italic">Empty</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Two-Level AMAT Numerical Calculator Card */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          Two-Level Cache AMAT (Average Memory Access Time) Calculator
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-center text-xs font-mono">
          <div>
            <label className="text-slate-400 block mb-1">L1 Hit Time:</label>
            <input
              type="number"
              min="1"
              value={l1HitTime}
              onChange={e => setL1HitTime(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">L1 Miss Rate (%):</label>
            <input
              type="number"
              min="1"
              max="100"
              value={l1MissRate}
              onChange={e => setL1MissRate(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">L2 Hit Time:</label>
            <input
              type="number"
              min="1"
              value={l2HitTime}
              onChange={e => setL2HitTime(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">L2 Miss Rate (%):</label>
            <input
              type="number"
              min="1"
              max="100"
              value={l2MissRate}
              onChange={e => setL2MissRate(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 text-center">
            <span className="text-[10px] text-slate-500 uppercase block">AMAT Result</span>
            <span className="text-xl font-black text-emerald-400">{amatResult.multiLevelAmat} ns</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <span>{amatResult.amatFormula}</span>
          <span className="text-cyan-400">Single-level AMAT: {amatResult.singleLevelAmat} ns</span>
        </div>
      </div>

    </div>
  );
};
