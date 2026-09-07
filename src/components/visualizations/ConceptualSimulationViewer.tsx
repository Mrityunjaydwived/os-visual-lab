// Reusable Conceptual Simulation & Mathematical Deep-Dive Component
import React, { useState } from 'react';
import { CONCEPTUAL_SIMULATIONS } from '../../core/curriculum/conceptualSimulations';
import { useAppStore } from '../../core/store/useStore';
import { 
  BookOpen, 
  Lightbulb, 
  Calculator, 
  Cpu, 
  Award, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface Props {
  tabKey: string;
  relatedModuleNumber?: number;
}

export const ConceptualSimulationViewer: React.FC<Props> = ({ tabKey, relatedModuleNumber }) => {
  const { setSection, setSelectedModule } = useAppStore();
  const simData = CONCEPTUAL_SIMULATIONS[tabKey] || CONCEPTUAL_SIMULATIONS['cpu_scheduler'];

  const [activeStep, setActiveStep] = useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Header Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono text-xs font-semibold border border-blue-500/20">
            Conceptual Simulation &amp; Theory
          </span>
          {relatedModuleNumber && (
            <button
              onClick={() => {
                setSelectedModule(`module_${relatedModuleNumber < 10 ? `0${relatedModuleNumber}` : relatedModuleNumber}`);
                setSection('LEARN');
              }}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Curriculum Module {relatedModuleNumber}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {simData.title}
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed font-normal">
          {simData.tagline}
        </p>
      </div>

      {/* 2. Core Mathematical Formulations */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
          <Calculator className="w-4 h-4 text-blue-400" />
          Deterministic Mathematical Formulations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {simData.coreFormulas.map((formula, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-200 block font-mono">
                {formula.label}
              </span>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-blue-400 font-bold">
                {formula.formula}
              </div>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                {formula.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Interactive Step-by-Step Execution Walkthrough */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            Step-by-Step Kernel Mechanics
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Phase {activeStep + 1} of {simData.steps.length}
          </span>
        </div>

        {/* Step Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {simData.steps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeStep === idx
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Step {step.step}: {step.title}
            </button>
          ))}
        </div>

        {/* Active Step Content Card */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>{simData.steps[activeStep].title}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            {simData.steps[activeStep].explanation}
          </p>
        </div>
      </div>

      {/* 4. Kernel Architecture Deep Dive */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            Production Kernel Implementation: {simData.kernelDeepDive.osName}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {simData.kernelDeepDive.subsystem}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {simData.kernelDeepDive.architecture}
        </p>

        {simData.kernelDeepDive.sourceSnippet && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
            <code>{simData.kernelDeepDive.sourceSnippet}</code>
          </div>
        )}
      </div>

      {/* 5. GATE CS Problem Solving Shortcuts */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          GATE CS Exam Strategy &amp; Problem Solving Tricks
        </h3>

        <div className="space-y-2">
          {simData.gateShortcuts.map((tip, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300 font-sans leading-relaxed">
              <span className="text-amber-400 font-mono font-bold shrink-0">#{idx + 1}</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Interactive Concept Verification Demonstrator */}
      {simData.interactiveDemonstrator && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Conceptual Checkpoint Challenge
            </h3>
          </div>

          <p className="text-sm font-medium text-slate-200 font-sans">
            {simData.interactiveDemonstrator.question}
          </p>

          <div className="space-y-2">
            {simData.interactiveDemonstrator.options.map((opt, idx) => {
              const isSelected = selectedQuizAnswer === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedQuizAnswer(idx)}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-mono transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? opt.correct
                        ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-rose-950/50 border-rose-500 text-rose-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span>{opt.text}</span>
                  {isSelected && (
                    <span>
                      {opt.correct ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {selectedQuizAnswer !== null && (
            <div className={`p-4 rounded-xl text-xs font-sans leading-relaxed border ${
              simData.interactiveDemonstrator.options[selectedQuizAnswer].correct
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}>
              {simData.interactiveDemonstrator.options[selectedQuizAnswer].feedback}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
