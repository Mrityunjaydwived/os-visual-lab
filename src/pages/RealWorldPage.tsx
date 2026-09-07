// Real-World OS Engineering Case Studies
import React, { useState } from 'react';
import { REAL_WORLD_SCENARIOS, type RealWorldScenario } from '../core/scenarios/realWorldData';
import { useAppStore } from '../core/store/useStore';
import { 
  Globe, 
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RealWorldPage: React.FC = () => {
  const { markScenarioComplete, progress } = useAppStore();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(REAL_WORLD_SCENARIOS[0].id);
  const [chosenOptionId, setChosenOptionId] = useState<string | null>(null);
  const [hasEvaluated, setHasEvaluated] = useState<boolean>(false);

  const activeScenario: RealWorldScenario = 
    REAL_WORLD_SCENARIOS.find((s: RealWorldScenario) => s.id === selectedScenarioId) || REAL_WORLD_SCENARIOS[0];

  const handleSelectOption = (optId: string) => {
    setChosenOptionId(optId);
    setHasEvaluated(true);

    const chosen = activeScenario.options.find((o: any) => o.id === optId);
    if (chosen && chosen.isCorrect) {
      markScenarioComplete(activeScenario.id);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleSwitchScenario = (id: string) => {
    setSelectedScenarioId(id);
    setChosenOptionId(null);
    setHasEvaluated(false);
  };

  return (
    <div className="space-y-6 py-4">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2.5">
            <Globe className="w-6 h-6 text-emerald-400" />
            Real-World OS Engineering Scenarios
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Solve production incidents in hyperscale web servers, banking transactions, and mobile OS memory collapses
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-slate-400">Scenarios Resolved:</span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
            {progress.completedScenarios.length} / {REAL_WORLD_SCENARIOS.length}
          </span>
        </div>
      </div>

      {/* Main Grid: Case Studies Sidebar vs Interactive Scenario */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Sidebar (Col 4) */}
        <div className="lg:col-span-4 space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1 font-mono">
            Incident Scenarios
          </span>

          {REAL_WORLD_SCENARIOS.map((sc: RealWorldScenario) => {
            const isSelected = sc.id === activeScenario.id;
            const completed = progress.completedScenarios.includes(sc.id);

            return (
              <div
                key={sc.id}
                onClick={() => handleSwitchScenario(sc.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] scale-[1.01]'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-bold">
                    {sc.badge}
                  </span>
                  {completed && (
                    <span className="text-[10px] font-mono text-emerald-300 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3 h-3" /> Resolved
                    </span>
                  )}
                </div>
                <h4 className={`text-xs font-bold leading-snug ${isSelected ? 'text-emerald-200' : 'text-slate-200'}`}>
                  {sc.title}
                </h4>
                <div className="mt-2 text-[10px] font-mono text-slate-500">
                  {sc.industry}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Active Case Study (Col 8) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Incident Brief Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs font-mono">
              <span className="text-emerald-400 font-bold uppercase">{activeScenario.industry}</span>
              <span className="text-slate-500">Badge: {activeScenario.badge}</span>
            </div>

            <h2 className="text-xl font-black text-slate-100">
              {activeScenario.title}
            </h2>

            {/* Context Incident Description */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
              <strong className="text-rose-400 block font-mono text-[10px] uppercase font-bold mb-1">
                Incident Context:
              </strong>
              {activeScenario.context}
            </div>

            {/* Problem Statement */}
            <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-cyan-200 leading-relaxed font-sans">
              <strong className="text-cyan-400 block font-mono text-[10px] uppercase font-bold mb-1">
                Engineering Challenge:
              </strong>
              {activeScenario.problemStatement}
            </div>
          </div>

          {/* Architectural Decision Options */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Select Architectural Fix:
            </h3>

            <div className="space-y-3">
              {activeScenario.options.map((opt: any) => {
                const isSelected = chosenOptionId === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? opt.isCorrect
                          ? 'bg-emerald-950/40 border-emerald-400 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                          : 'bg-rose-950/40 border-rose-400 text-rose-200'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 font-mono text-xs">
                      <span className="font-bold">{opt.label}</span>
                      {isSelected && (
                        <span className={`text-[10px] font-bold uppercase ${opt.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {opt.isCorrect ? '✓ Recommended Solution' : '✗ Failed Strategy'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      {opt.description}
                    </p>

                    {/* Consequence Reveal */}
                    {isSelected && (
                      <div className={`mt-3 pt-2 border-t text-[11px] font-mono leading-relaxed ${
                        opt.isCorrect ? 'border-emerald-800/60 text-emerald-300' : 'border-rose-800/60 text-rose-300'
                      }`}>
                        <strong>Consequence: </strong> {opt.consequence}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deep Explanation & Production Metrics */}
          {hasEvaluated && (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-500/30 font-mono text-xs space-y-4 animate-in fade-in duration-300">
              <div>
                <h4 className="font-bold text-emerald-300 uppercase block mb-1">
                  Production Engineering Takeaway:
                </h4>
                <p className="text-slate-300 leading-relaxed font-sans text-xs">
                  {activeScenario.deepExplanation}
                </p>
              </div>

              {/* Production Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-center">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase block">Latency</span>
                  <span className="text-cyan-300 font-bold text-xs">{activeScenario.productionMetrics.latency}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase block">Throughput</span>
                  <span className="text-purple-300 font-bold text-xs">{activeScenario.productionMetrics.throughput}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase block">CPU Overhead</span>
                  <span className="text-emerald-300 font-bold text-xs">{activeScenario.productionMetrics.cpuOverhead}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase block">Efficiency</span>
                  <span className="text-amber-300 font-bold text-xs">{activeScenario.productionMetrics.memoryEfficiency}</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
