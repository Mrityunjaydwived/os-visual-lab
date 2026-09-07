// Virtual OS Lab — Practical Experiments
import React, { useState } from 'react';
import { useAppStore, type VisualLabTab } from '../core/store/useStore';
import { PRACTICAL_EXPERIMENTS, type PracticalExperiment } from '../core/experiments/practicalData';
import { 
  FlaskConical, 
  CheckCircle2, 
  Play, 
  HelpCircle, 
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PracticalLabPage: React.FC = () => {
  const { setSection, markExperimentComplete, progress } = useAppStore();
  const [selectedExpId, setSelectedExpId] = useState<string>(PRACTICAL_EXPERIMENTS[0].id);

  const activeExp: PracticalExperiment = 
    PRACTICAL_EXPERIMENTS.find(e => e.id === selectedExpId) || PRACTICAL_EXPERIMENTS[0];

  const isCompleted = progress.completedExperiments.includes(activeExp.id);

  const handleCompleteLab = () => {
    markExperimentComplete(activeExp.id);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-6 py-4">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2.5">
            <FlaskConical className="w-6 h-6 text-emerald-400" />
            Virtual OS Practical Laboratory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Conduct formal scientific experiments with hypotheses, observation records, and post-lab analysis
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-slate-400">Experiments Completed:</span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
            {progress.completedExperiments.length} / {PRACTICAL_EXPERIMENTS.length}
          </span>
        </div>
      </div>

      {/* Main Grid: Experiments Sidebar vs Experiment Protocol */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Experiments List (Col 4) */}
        <div className="lg:col-span-4 space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1 font-mono">
            Scientific Protocols
          </span>

          {PRACTICAL_EXPERIMENTS.map(exp => {
            const isSelected = exp.id === activeExp.id;
            const completed = progress.completedExperiments.includes(exp.id);

            return (
              <div
                key={exp.id}
                onClick={() => setSelectedExpId(exp.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] scale-[1.01]'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    Experiment 0{exp.number}
                  </span>
                  {completed && (
                    <span className="text-[10px] font-mono text-emerald-300 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                  )}
                </div>
                <h4 className={`text-xs font-bold leading-snug ${isSelected ? 'text-emerald-200' : 'text-slate-200'}`}>
                  {exp.title}
                </h4>
                <div className="mt-2 text-[10px] font-mono text-slate-500">
                  {exp.category}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Protocol View (Col 8) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Experiment Header Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                Experiment 0{activeExp.number}: {activeExp.category}
              </span>

              <button
                onClick={handleCompleteLab}
                className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isCompleted
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isCompleted ? 'Lab Certified (+150 XP)' : 'Certify Lab Completion (+150 XP)'}</span>
              </button>
            </div>

            <h2 className="text-xl font-black text-slate-100 mt-2 mb-2">
              {activeExp.title}
            </h2>

            {/* Objective */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
              <strong className="text-emerald-400 block font-mono text-[10px] uppercase font-bold mb-0.5">
                Scientific Objective:
              </strong>
              {activeExp.objective}
            </div>

            {/* Theory */}
            <div className="mt-4 text-xs text-slate-300 leading-relaxed font-sans">
              <strong className="text-slate-200 block font-mono text-[10px] uppercase font-bold mb-1">
                Background Theory:
              </strong>
              {activeExp.theory}
            </div>

            {/* Direct Simulator Link CTA */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                Launch interactive workbench to test inputs:
              </span>
              <button
                onClick={() => setSection('VISUAL_LAB', activeExp.linkedVisualizer as VisualLabTab)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.3)]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Open in Visual Lab</span>
              </button>
            </div>
          </div>

          {/* Expected Observations */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Verified Empirical Observations
            </h3>
            <div className="space-y-2">
              {activeExp.expectedObservations.map((obs, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed">
                  › {obs}
                </div>
              ))}
            </div>
          </div>

          {/* Post-Lab Analysis Questions */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              Post-Lab Analytical Questions
            </h3>
            <div className="space-y-3">
              {activeExp.postLabQuestions.map((q, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs font-mono">
                  <div className="font-bold text-purple-300">
                    Q{idx + 1}: {q.question}
                  </div>
                  <div className="text-emerald-300 font-semibold">
                    Answer: {q.answer}
                  </div>
                  <div className="text-slate-400 text-[11px] font-sans">
                    Explanation: {q.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scientific Challenge */}
          <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-xs font-mono">
            <span className="text-purple-300 font-bold block mb-1">
              🎯 Post-Lab Open Challenge:
            </span>
            <p className="text-slate-300 leading-relaxed font-sans">
              {activeExp.challenge}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
