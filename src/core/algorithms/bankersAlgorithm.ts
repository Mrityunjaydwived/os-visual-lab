// Banker's Algorithm Engine (Deadlock Avoidance & Safety Check)

export interface BankersProcess {
  id: string;
  name: string;
  allocation: number[];
  max: number[];
  need?: number[];
}

export interface SafetyStep {
  stepIndex: number;
  processName: string;
  processId: string;
  need: number[];
  availableBefore: number[];
  conditionMet: boolean; // need <= available
  availableAfter: number[];
  whyExplanation: string;
}

export interface BankersResult {
  isSafe: boolean;
  safeSequence: string[]; // Process names
  steps: SafetyStep[];
  needMatrix: { processId: string; need: number[] }[];
  finalAvailable: number[];
  unsafeReason?: string;
}

export function calculateNeedMatrix(processes: BankersProcess[]): number[][] {
  return processes.map(p => {
    return p.max.map((maxVal, rIdx) => Math.max(0, maxVal - (p.allocation[rIdx] || 0)));
  });
}

export function runBankersAlgorithm(
  processes: BankersProcess[],
  available: number[],
  _resourceNames: string[] = ['A', 'B', 'C']
): BankersResult {
  const n = processes.length;
  const m = available.length;

  // Calculate Need Matrix: Need[i][j] = Max[i][j] - Allocation[i][j]
  const needMatrix: number[][] = processes.map(p => {
    return p.max.map((maxVal, j) => maxVal - p.allocation[j]);
  });

  const work = [...available];
  const finish = Array(n).fill(false);
  const safeSequence: string[] = [];
  const steps: SafetyStep[] = [];

  let count = 0;
  let deadlockIterationStall = false;

  while (count < n && !deadlockIterationStall) {
    let found = false;

    for (let i = 0; i < n; i++) {
      if (!finish[i]) {
        // Check if Need[i] <= Work
        let canAllocate = true;
        for (let j = 0; j < m; j++) {
          if (needMatrix[i][j] > work[j]) {
            canAllocate = false;
            break;
          }
        }

        const availBefore = [...work];

        if (canAllocate) {
          // Process can complete: Work = Work + Allocation[i]
          for (let j = 0; j < m; j++) {
            work[j] += processes[i].allocation[j];
          }

          finish[i] = true;
          safeSequence.push(processes[i].name);
          count++;
          found = true;

          steps.push({
            stepIndex: steps.length,
            processId: processes[i].id,
            processName: processes[i].name,
            need: [...needMatrix[i]],
            availableBefore: availBefore,
            conditionMet: true,
            availableAfter: [...work],
            whyExplanation: `Need [${needMatrix[i].join(', ')}] <= Available [${availBefore.join(', ')}]. ${processes[i].name} executes, completes, and releases allocated resources [${processes[i].allocation.join(', ')}]. New Available: [${work.join(', ')}].`
          });
          break; // restart scan to give priority to safe order
        }
      }
    }

    if (!found) {
      deadlockIterationStall = true;
    }
  }

  const isSafe = count === n;
  const formattedNeed = processes.map((p, idx) => ({
    processId: p.id,
    need: needMatrix[idx]
  }));

  const unfinished = processes.filter((_, idx) => !finish[idx]).map(p => p.name);

  return {
    isSafe,
    safeSequence,
    steps,
    needMatrix: formattedNeed,
    finalAvailable: work,
    unsafeReason: isSafe
      ? undefined
      : `UNSAFE STATE DETECTED! Deadlock risk exists. Remaining available resources [${work.join(', ')}] are insufficient to satisfy minimum needs of processes: ${unfinished.join(', ')}. No safe sequence exists.`
  };
}

// Resource-Request Algorithm: Can process Pi's request be granted immediately?
export function testResourceRequest(
  processes: BankersProcess[],
  available: number[],
  processIndex: number,
  request: number[]
): {
  canGrant: boolean;
  reason: string;
  simulatedResult?: BankersResult;
} {
  const p = processes[processIndex];
  const need = p.max.map((maxVal, j) => maxVal - p.allocation[j]);
  const m = available.length;

  // 1. Request <= Need
  for (let j = 0; j < m; j++) {
    if (request[j] > need[j]) {
      return {
        canGrant: false,
        reason: `Error: Process ${p.name} requested [${request.join(', ')}], which exceeds its declared maximum need [${need.join(', ')}].`
      };
    }
  }

  // 2. Request <= Available
  for (let j = 0; j < m; j++) {
    if (request[j] > available[j]) {
      return {
        canGrant: false,
        reason: `Wait: Requested resources [${request.join(', ')}] exceed currently available system resources [${available.join(', ')}]. Process ${p.name} must wait.`
      };
    }
  }

  // 3. Pretend to allocate and run safety check
  const simAvailable = available.map((a, j) => a - request[j]);
  const simProcesses = processes.map((proc, idx) => {
    if (idx === processIndex) {
      return {
        ...proc,
        allocation: proc.allocation.map((alloc, j) => alloc + request[j])
      };
    }
    return { ...proc };
  });

  const safetyResult = runBankersAlgorithm(simProcesses, simAvailable);

  if (safetyResult.isSafe) {
    return {
      canGrant: true,
      reason: `Safe to grant! Allocation leaves system in a safe state with safe sequence: <${safetyResult.safeSequence.join(', ')}>.`,
      simulatedResult: safetyResult
    };
  } else {
    return {
      canGrant: false,
      reason: `Cannot grant immediately! Granting this request leads to an UNSAFE state with risk of deadlock. Process ${p.name} must wait.`,
      simulatedResult: safetyResult
    };
  }
}
