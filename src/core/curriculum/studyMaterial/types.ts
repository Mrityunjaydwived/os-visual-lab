// Comprehensive Study Material, Detailed Concepts, Comparison Tables, Worked Numericals & Conceptual Questions
// Aligned with GeeksforGeeks, Silberschatz (Galvin & Gagne), and GATE CS Examination Standards

export interface WorkedNumerical {
  title: string;
  problemStatement: string;
  givenData: Record<string, string | number>;
  formulasUsed: string[];
  stepByStepSolution: string[];
  finalAnswer: string;
  gateYear?: string;
}

export interface ComparisonTable {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface ConceptualQuestion {
  question: string;
  category: 'GATE CS' | 'Technical Interview' | 'Core Concept' | 'Edge Case';
  explanation: string;
  commonTrap?: string;
  keyTakeaway: string;
}

export interface ModuleConceptGuide {
  moduleNumber: number;
  inDepthTheory: {
    sectionTitle: string;
    content: string;
    bulletPoints?: string[];
  }[];
  comparisons?: ComparisonTable[];
  conceptToSimulationGuide: {
    simulationElement: string;
    osKernelEquivalent: string;
    whyItMatters: string;
  }[];
  workedNumericals: WorkedNumerical[];
  conceptualQuestions: ConceptualQuestion[];
}
