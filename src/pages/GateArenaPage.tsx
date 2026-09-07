// GATE Operating Systems Preparation Hub & Question Arena
import React, { useState } from 'react';
import { GATE_QUESTION_BANK } from '../core/gate/questionBank';
import type { GateQuestion } from '../core/gate/types';
import { useAppStore } from '../core/store/useStore';
import { 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Calculator, 
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const GateArenaPage: React.FC = () => {
  const { setSection, recordGateAnswer } = useAppStore();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);

  // User input answers for current question
  const [userSelection, setUserSelection] = useState<string | number>('');
  const [userMsqSelection, setUserMsqSelection] = useState<string[]>([]);
  const [hasChecked, setHasChecked] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Filter questions
  const filteredQuestions = GATE_QUESTION_BANK.filter((q: GateQuestion) => {
    const matchesDiff = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
    const matchesType = selectedType === 'All' || q.type === selectedType;
    return matchesDiff && matchesType;
  });

  const activeQuestion: GateQuestion = 
    filteredQuestions[activeQuestionIdx] || GATE_QUESTION_BANK[0];

  const handleSelectOption = (opt: string) => {
    if (activeQuestion.type === 'MCQ') {
      setUserSelection(opt);
    } else if (activeQuestion.type === 'MSQ') {
      if (userMsqSelection.includes(opt)) {
        setUserMsqSelection(userMsqSelection.filter(o => o !== opt));
      } else {
        setUserMsqSelection([...userMsqSelection, opt]);
      }
    }
  };

  const handleCheckAnswer = () => {
    let correct = false;

    if (activeQuestion.type === 'MCQ') {
      correct = userSelection === activeQuestion.correctAnswer;
    } else if (activeQuestion.type === 'MSQ') {
      const correctArr = activeQuestion.correctAnswer as string[];
      correct = 
        userMsqSelection.length === correctArr.length &&
        userMsqSelection.every(opt => correctArr.includes(opt));
    } else if (activeQuestion.type === 'NAT') {
      const val = parseFloat(String(userSelection));
      const target = Number(activeQuestion.correctAnswer);
      const tol = activeQuestion.tolerance ?? 0;
      correct = !isNaN(val) && Math.abs(val - target) <= tol;
    }

    setIsCorrect(correct);
    setHasChecked(true);
    recordGateAnswer(activeQuestion.id, correct);

    if (correct) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const handleNextQuestion = () => {
    setActiveQuestionIdx(prev => (prev + 1) % filteredQuestions.length);
    setUserSelection('');
    setUserMsqSelection([]);
    setHasChecked(false);
    setIsCorrect(false);
    setShowExplanation(false);
  };

  return (
    <div className="space-y-6 py-4">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2.5">
              <Award className="w-6 h-6 text-purple-400" />
              GATE Operating Systems Arena
            </h1>
            <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-[10px] font-mono text-purple-300 font-bold uppercase">
              Rank Booster
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Rigorous questions (MCQ, MSQ, NAT Levels 1–6) with verified step-by-step solutions
          </p>
        </div>

        {/* Quick link to Numerical Generator */}
        <button
          onClick={() => setSection('NUMERICAL_LAB')}
          className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Calculator className="w-4 h-4" />
          <span>Launch Dynamic Numerical Generator</span>
        </button>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 font-mono text-xs">
        
        {/* Difficulty Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">Difficulty:</span>
          <select
            value={selectedDifficulty}
            onChange={e => {
              setSelectedDifficulty(e.target.value);
              setActiveQuestionIdx(0);
            }}
            className="bg-slate-950 text-slate-200 rounded-lg px-2.5 py-1 border border-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="All">All Levels (1 to 6)</option>
            <option value="LEVEL_1_FOUNDATION">Level 1: Foundation</option>
            <option value="LEVEL_2_INTERMEDIATE">Level 2: Intermediate</option>
            <option value="LEVEL_3_ADVANCED">Level 3: Advanced</option>
            <option value="LEVEL_4_GATE">Level 4: GATE Standard</option>
            <option value="LEVEL_5_GATE_HARD">Level 5: GATE Hard</option>
            <option value="LEVEL_6_EXPERT">Level 6: Expert</option>
          </select>
        </div>

        {/* Question Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">Type:</span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {['All', 'MCQ', 'MSQ', 'NAT'].map(t => (
              <button
                key={t}
                onClick={() => {
                  setSelectedType(t);
                  setActiveQuestionIdx(0);
                }}
                className={`px-2.5 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                  selectedType === t
                    ? 'bg-purple-500/20 text-purple-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <span className="text-purple-300 font-bold">
          {filteredQuestions.length} Questions in Deck
        </span>
      </div>

      {/* Main Active Question Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl space-y-6">
        
        {/* Question Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
              {activeQuestion.type}
            </span>
            <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {activeQuestion.difficulty.replace(/_/g, ' ')}
            </span>
            {activeQuestion.gateYear && (
              <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                {activeQuestion.gateYear}
              </span>
            )}
          </div>

          <span className="text-slate-500">
            Question {activeQuestionIdx + 1} of {filteredQuestions.length}
          </span>
        </div>

        {/* Question Title & Topic */}
        <div>
          <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase block mb-1">
            Topic: {activeQuestion.topicName} — {activeQuestion.conceptTested}
          </span>
          <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed whitespace-pre-line">
            {activeQuestion.question}
          </p>
        </div>

        {/* Input Interface: MCQ Options, MSQ Checkboxes, or NAT Number Input */}
        <div className="space-y-3">
          {activeQuestion.type === 'MCQ' && activeQuestion.options && (
            <div className="space-y-2">
              {activeQuestion.options.map((opt: string, idx: number) => {
                const isSelected = userSelection === opt;
                return (
                  <div
                    key={idx}
                    onClick={() => !hasChecked && handleSelectOption(opt)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-mono transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-400 text-purple-200 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] font-bold">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeQuestion.type === 'MSQ' && activeQuestion.options && (
            <div className="space-y-2">
              <span className="text-[10px] text-amber-400 font-mono block mb-1">
                Multi-Select: One or more options can be correct. Select all that apply.
              </span>
              {activeQuestion.options.map((opt: string, idx: number) => {
                const isSelected = userMsqSelection.includes(opt);
                return (
                  <div
                    key={idx}
                    onClick={() => !hasChecked && handleSelectOption(opt)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-mono transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-400 text-purple-200 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                        isSelected ? 'bg-purple-500 border-purple-400 text-black font-bold' : 'border-slate-700'
                      }`}>
                        {isSelected && '✓'}
                      </div>
                      <span>{opt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeQuestion.type === 'NAT' && (
            <div className="flex items-center gap-3 max-w-sm">
              <input
                type="number"
                step="any"
                value={userSelection}
                onChange={e => setUserSelection(e.target.value)}
                placeholder="Enter numerical answer..."
                disabled={hasChecked}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-cyan-300 focus:border-purple-400 focus:outline-none"
              />
              <span className="text-xs text-slate-500 font-mono">
                {activeQuestion.tolerance ? `(±${activeQuestion.tolerance})` : '(Exact)'}
              </span>
            </div>
          )}
        </div>

        {/* Check Answer & Navigation Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            {!hasChecked ? (
              <button
                onClick={handleCheckAnswer}
                disabled={!userSelection && userMsqSelection.length === 0}
                className="px-6 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-black font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer disabled:opacity-50"
              >
                <span>CHECK ANSWER</span>
              </button>
            ) : (
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
              >
                {showExplanation ? 'Hide Detailed Solution' : 'View Complete Step-by-Step Solution'}
              </button>
            )}
          </div>

          <button
            onClick={handleNextQuestion}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs font-mono flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>Next Question</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Verification Result Feedback */}
        {hasChecked && (
          <div className={`p-4 rounded-xl border text-xs font-mono flex items-start gap-3 animate-in fade-in duration-200 ${
            isCorrect
              ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/30 border-rose-500/50 text-rose-300'
          }`}>
            {isCorrect ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <div>
              <div className="font-bold text-sm mb-1">
                {isCorrect ? 'CORRECT ANSWER! (+50 XP)' : 'INCORRECT'}
              </div>
              <div className="leading-relaxed">
                Correct Answer: <strong className="text-white">{Array.isArray(activeQuestion.correctAnswer) ? activeQuestion.correctAnswer.join(', ') : activeQuestion.correctAnswer}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Explanation Drawer */}
        {showExplanation && (
          <div className="p-5 rounded-2xl bg-slate-950 border border-purple-500/30 font-mono text-xs space-y-3 animate-in fade-in duration-200">
            <span className="font-bold text-purple-300 uppercase block mb-1">
              Step-by-Step Mathematical Explanation:
            </span>
            {activeQuestion.stepByStepSolution.map((line: string, idx: number) => (
              <div key={idx} className="text-slate-300">
                {line}
              </div>
            ))}
            <div className="pt-2 border-t border-slate-800 text-rose-300/90">
              <strong>⚠️ Common Mistake Alert:</strong> {activeQuestion.commonMistakes}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
