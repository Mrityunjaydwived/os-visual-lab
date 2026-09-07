// Interactive Numerical Workspace with Scratchpad, Formula Quick-Sheet, and Hint Ladder
import React, { useState } from 'react';
import { 
  generateRandomProblem 
} from '../../core/gate/problemGenerator';
import type { GeneratedNumericalProblem } from '../../core/gate/types';
import { useAppStore } from '../../core/store/useStore';
import { 
  Calculator, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const NumericalWorkspace: React.FC = () => {
  const { addXp } = useAppStore();
  const [problem, setProblem] = useState<GeneratedNumericalProblem>(() => generateRandomProblem());
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [scratchpad, setScratchpad] = useState<string>('');
  const [hintTier, setHintTier] = useState<number>(0);
  const [showFullSolution, setShowFullSolution] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  const handleNextProblem = (topic?: string) => {
    const nextP = generateRandomProblem(topic);
    setProblem(nextP);
    setUserAnswer('');
    setHintTier(0);
    setShowFullSolution(false);
    setFeedback(null);
  };

  const handleCheckAnswer = () => {
    const num = parseFloat(userAnswer.trim());
    if (isNaN(num)) {
      setFeedback({ isCorrect: false, message: 'Please enter a valid numeric value.' });
      return;
    }

    const diff = Math.abs(num - problem.correctAnswer);
    const isCorrect = diff <= problem.tolerance;

    if (isCorrect) {
      setFeedback({
        isCorrect: true,
        message: `Outstanding! Correct answer: ${problem.correctAnswer}.`
      });
      addXp(75, 'Solved Numerical Problem');

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
    } else {
      setFeedback({
        isCorrect: false,
        message: `Incorrect. Your answer (${num}) does not match within tolerance (±${problem.tolerance}). Review hints or try recalculating.`
      });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Topic Generators */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-cyan-400" />
            Interactive GATE Numerical Workspace
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Dynamic verified numerical problem generator with multi-tier hints, scratchpad, and complete proofs
          </p>
        </div>

        {/* Generate Topic Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'tlb', label: 'TLB & EMAT' },
            { id: 'cache', label: 'Cache AMAT' },
            { id: 'paging', label: 'Paging Address' },
            { id: 'disk', label: 'Disk Seek' },
            { id: 'semaphore', label: 'Semaphores' },
            { id: 'cpu', label: 'CPU Waiting' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => handleNextProblem(btn.id)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-medium transition-colors cursor-pointer"
            >
              + {btn.label}
            </button>
          ))}

          <button
            onClick={() => handleNextProblem()}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.25)]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Random Problem</span>
          </button>
        </div>
      </div>

      {/* Main Split: Problem & Hints vs Scratchpad & Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Problem Statement & Hints */}
        <div className="space-y-4">
          
          {/* Problem Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono">
              <span className="text-cyan-400 font-bold uppercase">{problem.topic}</span>
              <span className="text-slate-500">NAT Format</span>
            </div>

            <h3 className="text-base font-bold text-slate-100 mt-3 mb-3">
              {problem.title}
            </h3>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-xs leading-relaxed font-mono whitespace-pre-line">
              {problem.problemStatement}
            </div>

            {/* Formula Reference Tag */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-500">Key Formula:</span>
              <span className="text-purple-300 font-bold">{problem.formula}</span>
            </div>
          </div>

          {/* Progressive Hint Ladder */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-mono">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                Progressive Hint Ladder ({hintTier} / {problem.hints.length} Revealed)
              </span>

              {hintTier < problem.hints.length && (
                <button
                  onClick={() => setHintTier(prev => prev + 1)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Reveal Hint {hintTier + 1}
                </button>
              )}
            </div>

            {hintTier === 0 ? (
              <p className="text-xs text-slate-500 italic">
                Attempt to solve using the scratchpad before revealing hints.
              </p>
            ) : (
              <div className="space-y-2">
                {problem.hints.slice(0, hintTier).map((hint, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 leading-relaxed font-mono">
                    {hint}
                  </div>
                ))}
              </div>
            )}

            {/* Common Trap Warning */}
            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-rose-300/90 font-mono">
              <strong>⚠️ Common GATE Trap:</strong> {problem.commonTrap}
            </div>
          </div>

        </div>

        {/* Right Column: Scratchpad & Answer Input */}
        <div className="space-y-4">
          
          {/* Answer Submission Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block font-mono">
              Submit Numerical Answer
            </span>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCheckAnswer()}
                placeholder="Enter numeric answer..."
                className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm font-mono text-cyan-300 focus:outline-none"
              />
              <button
                onClick={handleCheckAnswer}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.3)]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>CHECK</span>
              </button>
            </div>

            {/* Feedback Alert */}
            {feedback && (
              <div className={`p-3.5 rounded-xl border text-xs font-mono flex items-start gap-2.5 animate-in fade-in duration-200 ${
                feedback.isCorrect
                  ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-500/50 text-rose-300'
              }`}>
                {feedback.isCorrect ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                <div className="flex-1 leading-relaxed">
                  {feedback.message}
                </div>
              </div>
            )}

            {/* Solution Toggle */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => setShowFullSolution(!showFullSolution)}
                className="text-xs font-mono text-purple-400 hover:text-purple-300 underline cursor-pointer"
              >
                {showFullSolution ? 'Hide Step-by-Step Solution' : 'Reveal Complete Mathematical Solution'}
              </button>
            </div>
          </div>

          {/* Full Solution Box if Revealed */}
          {showFullSolution && (
            <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/40 text-xs font-mono space-y-2 animate-in fade-in duration-200">
              <span className="font-bold text-purple-300 uppercase block mb-1">
                Step-by-Step Verified Proof:
              </span>
              {problem.fullSolution.map((line, idx) => (
                <div key={idx} className="text-slate-300">
                  {line}
                </div>
              ))}
              <div className="pt-2 text-emerald-400 font-bold border-t border-purple-800/60">
                Final Result: {problem.correctAnswer} (Tolerance: ±{problem.tolerance})
              </div>
            </div>
          )}

          {/* Digital Scratchpad */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                Digital Calculation Scratchpad
              </span>
              <button
                onClick={() => setScratchpad('')}
                className="text-[11px] font-mono text-slate-500 hover:text-rose-400 cursor-pointer"
              >
                Clear
              </button>
            </div>
            <textarea
              value={scratchpad}
              onChange={e => setScratchpad(e.target.value)}
              placeholder="Jot down intermediate formulas, memory bits, or Gantt chart milestones..."
              rows={6}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-300 focus:border-purple-400 focus:outline-none resize-none"
            />
          </div>

        </div>

      </div>

    </div>
  );
};
