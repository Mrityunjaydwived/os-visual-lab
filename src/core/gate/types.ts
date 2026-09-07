// GATE Arena & Numerical Problem Types

export type GateDifficulty = 
  | 'LEVEL_1_FOUNDATION'
  | 'LEVEL_2_INTERMEDIATE'
  | 'LEVEL_3_ADVANCED'
  | 'LEVEL_4_GATE'
  | 'LEVEL_5_GATE_HARD'
  | 'LEVEL_6_EXPERT';

export type QuestionType = 'MCQ' | 'MSQ' | 'NAT'; // Multiple Choice, Multiple Select, Numerical Answer Type

export interface GateQuestion {
  id: string;
  topicId: string;
  topicName: string;
  difficulty: GateDifficulty;
  type: QuestionType;
  question: string;
  options?: string[]; // For MCQ/MSQ
  correctAnswer: string | string[] | number; // Number for NAT, string for MCQ, array for MSQ
  tolerance?: number; // For NAT floating point tolerance
  explanation: string;
  stepByStepSolution: string[];
  conceptTested: string;
  commonMistakes: string;
  formulaUsed?: string;
  gateYear?: string; // e.g. "GATE CS 2023", "GATE CS 2018"
}

export interface GeneratedNumericalProblem {
  id: string;
  topic: string;
  title: string;
  problemStatement: string;
  parameters: Record<string, any>;
  correctAnswer: number;
  tolerance: number;
  hints: string[];
  fullSolution: string[];
  formula: string;
  commonTrap: string;
}
