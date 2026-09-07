// Page Replacement Laboratory with Belady's Anomaly Demonstration
import React, { useState, useMemo } from 'react';
import { 
  runPageReplacement, 
  checkBeladysAnomaly, 
  type PageReplacementAlgorithm 
} from '../../core/algorithms/pageReplacement';
import { RefreshCw, Zap, CheckCircle2, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';

const DEFAULT_REF_STRING = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1];

export const PageReplacementVisualizer: React.FC = () => {
  const [refString, setRefString] = useState<number[]>(DEFAULT_REF_STRING);
  const [frameCount, setFrameCount] = useState<number>(3);
  const [algorithm, setAlgorithm] = useState<PageReplacementAlgorithm>('LRU');
  const [selectedStepIdx, setSelectedStepIdx] = useState<number>(0);
  const [beladyResult, setBeladyResult] = useState<any | null>(null);

  const result = useMemo(() => {
    return runPageReplacement(refString, frameCount, algorithm);
  }, [refString, frameCount, algorithm]);

  const activeStep = result.steps[selectedStepIdx] || null;

  const handleRunBelady = () => {
    const anomaly = checkBeladysAnomaly();
    setBeladyResult(anomaly);
    setRefString(anomaly.stringUsed);
    setAlgorithm('FIFO');
    setFrameCount(3);
    setSelectedStepIdx(0);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls Header */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-cyan-400" />
            Page Replacement Algorithm Laboratory
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare FIFO, LRU, Optimal (OPT), and Second Chance Clock with full step-by-step frame inspection
          </p>
        </div>

        {/* Algorithm Tabs & Belady Demo Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            {(['FIFO', 'LRU', 'OPTIMAL', 'CLOCK'] as PageReplacementAlgorithm[]).map(alg => (
              <button
                key={alg}
                onClick={() => {
                  setAlgorithm(alg);
                  setSelectedStepIdx(0);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  algorithm === alg
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {alg}
              </button>
            ))}
          </div>

          <button
            onClick={handleRunBelady}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all cursor-pointer shadow-[0_0_12px_rgba(168,85,247,0.25)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Demonstrate Belady's Anomaly</span>
          </button>
        </div>
      </div>

      {/* Belady Alert Banner if triggered */}
      {beladyResult && (
        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-xs font-mono animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-2 border-b border-purple-800/60 font-bold text-purple-300">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Belady's Anomaly Verified on Reference String: [{beladyResult.stringUsed.join(', ')}]
            </span>
            <button
              onClick={() => setBeladyResult(null)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="mt-2 text-slate-300 leading-relaxed font-sans">
            {beladyResult.explanation}
          </p>
          <div className="grid grid-cols-2 gap-4 mt-3 pt-2 border-t border-purple-800/60 font-mono text-center">
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">3 Physical Frames</span>
              <span className="text-emerald-400 font-bold text-base">{beladyResult.faults3Frames} Faults</span>
            </div>
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">4 Physical Frames (More RAM)</span>
              <span className="text-rose-400 font-bold text-base">{beladyResult.faults4Frames} Faults ⚠️</span>
            </div>
          </div>
        </div>
      )}

      {/* Reference String & Frame Slider Controls */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl flex flex-wrap items-center justify-between gap-4">
        
        {/* Reference String Display */}
        <div className="flex-1 min-w-[280px]">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
            Page Reference String ({refString.length} References)
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {refString.map((page, idx) => {
              const isCurrent = idx === selectedStepIdx;
              const stepData = result.steps[idx];
              const isHit = stepData?.isHit;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedStepIdx(idx)}
                  className={`w-8 h-8 rounded-lg font-mono text-xs font-bold flex flex-col items-center justify-center shrink-0 border transition-all cursor-pointer ${
                    isCurrent
                      ? 'ring-2 ring-cyan-400 scale-110 z-10'
                      : 'hover:border-slate-500'
                  } ${
                    isHit
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                  }`}
                >
                  <span>{page}</span>
                  <span className="text-[7px] -mt-1">{isHit ? 'HIT' : 'MISS'}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Frame Capacity Slider */}
        <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs">
          <span className="text-slate-400">Frame Capacity:</span>
          <input
            type="range"
            min="2"
            max="6"
            value={frameCount}
            onChange={e => {
              setFrameCount(parseInt(e.target.value));
              setSelectedStepIdx(0);
            }}
            className="w-24 accent-cyan-400 cursor-pointer"
          />
          <span className="text-cyan-300 font-bold text-sm w-4">{frameCount}</span>
        </div>

      </div>

      {/* Frame Matrix State Grid & Active Step Rationale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Frame State Box */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#070b16] border border-cyan-500/30 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                Frame State at Step #{selectedStepIdx + 1}
              </span>
              {activeStep?.isHit ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> PAGE HIT
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> PAGE FAULT
                </span>
              )}
            </div>

            <div className="my-4 text-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Referenced Page</span>
              <div className="text-3xl font-black text-slate-100 font-mono my-1">
                Page {activeStep?.page}
              </div>
            </div>

            {/* Vertical Frame Slots */}
            <div className="space-y-2">
              {Array.from({ length: frameCount }).map((_, fIdx) => {
                const pageInFrame = activeStep?.frames[fIdx];
                const isRecentlyLoaded = pageInFrame === activeStep?.page;

                return (
                  <div
                    key={fIdx}
                    className={`p-2.5 rounded-xl border flex items-center justify-between font-mono text-xs transition-colors ${
                      isRecentlyLoaded
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="text-slate-500 text-[10px]">Frame {fIdx}</span>
                    <span className="text-sm">
                      {pageInFrame !== null && pageInFrame !== undefined ? `Page ${pageInFrame}` : '— [Empty]'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Eviction Notice */}
          <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-mono">
            {activeStep?.evictedPage !== null && activeStep?.evictedPage !== undefined ? (
              <div className="text-amber-400 flex items-center gap-1.5">
                <span>Evicted Victim: <strong>Page {activeStep.evictedPage}</strong></span>
              </div>
            ) : (
              <span className="text-slate-500 italic">No eviction required</span>
            )}
          </div>
        </div>

        {/* Step Rationale & Metrics */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* "WHY?" Explanation Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-purple-500/30 backdrop-blur-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              Eviction & Replacement Rationale ({algorithm})
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {activeStep?.whyExplanation || 'Select a step from the reference string to view the mathematical rationale.'}
            </p>
          </div>

          {/* Performance Summary Metrics Card Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Page Faults</span>
              <span className="text-xl font-bold text-rose-400">{result.pageFaults}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Page Hits</span>
              <span className="text-xl font-bold text-emerald-400">{result.pageHits}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Hit Ratio</span>
              <span className="text-xl font-bold text-cyan-300">{result.hitRatio}%</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Fault Ratio</span>
              <span className="text-xl font-bold text-amber-300">{result.faultRatio}%</span>
            </div>
          </div>

          {/* Quick Custom Reference String Editor */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
            <span className="text-xs font-bold text-slate-300 block mb-2 font-mono">
              Custom Reference String Input (Comma-separated numbers):
            </span>
            <input
              type="text"
              defaultValue={refString.join(', ')}
              onBlur={e => {
                const parsed = e.target.value
                  .split(',')
                  .map(s => parseInt(s.trim()))
                  .filter(n => !isNaN(n));
                if (parsed.length > 0) {
                  setRefString(parsed);
                  setSelectedStepIdx(0);
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-slate-200 text-xs focus:border-cyan-400 focus:outline-none"
              placeholder="e.g. 1, 2, 3, 4, 1, 2, 5..."
            />
          </div>

        </div>

      </div>

    </div>
  );
};
