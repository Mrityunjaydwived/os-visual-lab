// CPU Scheduling Algorithm Engine (Deterministic & Mathematically Rigorous)

export type SchedulingAlgorithm = 
  | 'FCFS' 
  | 'SJF_NON_PREEMPTIVE' 
  | 'SRTF_PREEMPTIVE' 
  | 'PRIORITY_NON_PREEMPTIVE' 
  | 'PRIORITY_PREEMPTIVE' 
  | 'ROUND_ROBIN'
  | 'MLFQ';

export interface ProcessInput {
  id: string;
  name: string;
  arrivalTime: number;
  burstTime: number;
  priority?: number; // Lower value = higher priority (standard convention)
  color?: string;
}

export interface ProcessMetrics {
  id: string;
  name: string;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
  completionTime: number;
  turnaroundTime: number;
  waitingTime: number;
  responseTime: number;
  color: string;
}

export interface GanttBlock {
  processId: string;
  processName: string;
  startTime: number;
  endTime: number;
  color: string;
}

export interface SchedulingStep {
  time: number;
  runningProcessId: string | null;
  runningProcessName: string | null;
  readyQueue: string[]; // Process names
  remainingBurstMap: Record<string, number>;
  eventDescription: string;
  whyExplanation: string;
}

export interface SchedulingResult {
  algorithm: SchedulingAlgorithm;
  ganttChart: GanttBlock[];
  processMetrics: ProcessMetrics[];
  steps: SchedulingStep[];
  averageWaitingTime: number;
  averageTurnaroundTime: number;
  averageResponseTime: number;
  throughput: number;
  cpuUtilization: number;
  totalTime: number;
  contextSwitches: number;
}

const DEFAULT_COLORS = [
  '#00f0ff', // Neon Cyan
  '#a855f7', // Purple
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#3b82f6', // Blue
  '#ec4899', // Pink
  '#84cc16', // Lime
];

export function runCpuScheduling(
  processes: ProcessInput[],
  algorithm: SchedulingAlgorithm,
  quantum: number = 2
): SchedulingResult {
  if (!processes || processes.length === 0) {
    return {
      algorithm,
      ganttChart: [],
      processMetrics: [],
      steps: [],
      averageWaitingTime: 0,
      averageTurnaroundTime: 0,
      averageResponseTime: 0,
      throughput: 0,
      cpuUtilization: 0,
      totalTime: 0,
      contextSwitches: 0
    };
  }

  // Assign colors if not present
  const procsWithColors = processes.map((p, idx) => ({
    ...p,
    color: p.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]
  }));

  switch (algorithm) {
    case 'FCFS':
      return runFCFS(procsWithColors);
    case 'SJF_NON_PREEMPTIVE':
      return runSJFNonPreemptive(procsWithColors);
    case 'SRTF_PREEMPTIVE':
      return runSRTFPreemptive(procsWithColors);
    case 'PRIORITY_NON_PREEMPTIVE':
      return runPriorityNonPreemptive(procsWithColors);
    case 'PRIORITY_PREEMPTIVE':
      return runPriorityPreemptive(procsWithColors);
    case 'ROUND_ROBIN':
      return runRoundRobin(procsWithColors, quantum);
    case 'MLFQ':
      return runMLFQ(procsWithColors, quantum);
    default:
      return runFCFS(procsWithColors);
  }
}

// 1. First-Come First-Served (FCFS)
function runFCFS(processes: (ProcessInput & { color: string })[]): SchedulingResult {
  const sorted = [...processes].sort((a, b) => {
    if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
    return a.id.localeCompare(b.id);
  });

  const ganttChart: GanttBlock[] = [];
  const steps: SchedulingStep[] = [];
  const firstResponseTime: Record<string, number> = {};
  const completionTime: Record<string, number> = {};
  const remainingBurst: Record<string, number> = {};
  processes.forEach(p => remainingBurst[p.id] = p.burstTime);

  let currentTime = 0;
  let contextSwitches = 0;
  let busyCpuTime = 0;
  let lastRanId: string | null = null;

  for (const p of sorted) {
    if (currentTime < p.arrivalTime) {
      // Idle period
      ganttChart.push({
        processId: 'IDLE',
        processName: 'CPU Idle',
        startTime: currentTime,
        endTime: p.arrivalTime,
        color: '#334155'
      });
      steps.push({
        time: currentTime,
        runningProcessId: null,
        runningProcessName: 'IDLE',
        readyQueue: [],
        remainingBurstMap: { ...remainingBurst },
        eventDescription: `CPU is idle waiting for processes to arrive. Next arrival is ${p.name} at t=${p.arrivalTime}.`,
        whyExplanation: `No process has arrived at time t=${currentTime}. The CPU must remain idle until t=${p.arrivalTime}.`
      });
      currentTime = p.arrivalTime;
    }

    if (lastRanId !== null && lastRanId !== p.id) {
      contextSwitches++;
    }
    lastRanId = p.id;

    if (firstResponseTime[p.id] === undefined) {
      firstResponseTime[p.id] = currentTime;
    }

    const start = currentTime;
    const end = currentTime + p.burstTime;
    busyCpuTime += p.burstTime;

    steps.push({
      time: start,
      runningProcessId: p.id,
      runningProcessName: p.name,
      readyQueue: sorted.filter(x => x.arrivalTime <= start && x.id !== p.id && completionTime[x.id] === undefined).map(x => x.name),
      remainingBurstMap: { ...remainingBurst },
      eventDescription: `${p.name} allocated CPU from t=${start} to t=${end}.`,
      whyExplanation: `FCFS policy selects ${p.name} because it arrived earliest among pending processes (Arrival Time = ${p.arrivalTime}).`
    });

    currentTime = end;
    completionTime[p.id] = end;
    remainingBurst[p.id] = 0;

    ganttChart.push({
      processId: p.id,
      processName: p.name,
      startTime: start,
      endTime: end,
      color: p.color
    });
  }

  return computeFinalMetrics(processes, ganttChart, steps, completionTime, firstResponseTime, currentTime, busyCpuTime, contextSwitches, 'FCFS');
}

// 2. Shortest Job First (Non-Preemptive)
function runSJFNonPreemptive(processes: (ProcessInput & { color: string })[]): SchedulingResult {
  const remainingBurst: Record<string, number> = {};
  processes.forEach(p => remainingBurst[p.id] = p.burstTime);

  const completed: Record<string, boolean> = {};
  const completionTime: Record<string, number> = {};
  const firstResponseTime: Record<string, number> = {};
  const ganttChart: GanttBlock[] = [];
  const steps: SchedulingStep[] = [];

  let currentTime = 0;
  let completedCount = 0;
  let busyCpuTime = 0;
  let contextSwitches = 0;
  let lastRanId: string | null = null;
  const n = processes.length;

  while (completedCount < n) {
    const readyProcs = processes.filter(p => !completed[p.id] && p.arrivalTime <= currentTime);

    if (readyProcs.length === 0) {
      // Find next arriving process
      const unarrived = processes.filter(p => !completed[p.id]);
      const nextArr = Math.min(...unarrived.map(p => p.arrivalTime));
      ganttChart.push({
        processId: 'IDLE',
        processName: 'CPU Idle',
        startTime: currentTime,
        endTime: nextArr,
        color: '#334155'
      });
      steps.push({
        time: currentTime,
        runningProcessId: null,
        runningProcessName: 'IDLE',
        readyQueue: [],
        remainingBurstMap: { ...remainingBurst },
        eventDescription: `CPU is idle until next process arrives at t=${nextArr}.`,
        whyExplanation: `No process is in the ready queue at t=${currentTime}. Next process arrives at t=${nextArr}.`
      });
      currentTime = nextArr;
      continue;
    }

    // Pick shortest burst time (tie-break by arrival time, then ID)
    readyProcs.sort((a, b) => {
      if (a.burstTime !== b.burstTime) return a.burstTime - b.burstTime;
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.id.localeCompare(b.id);
    });

    const selected = readyProcs[0];

    if (lastRanId !== null && lastRanId !== selected.id) {
      contextSwitches++;
    }
    lastRanId = selected.id;

    if (firstResponseTime[selected.id] === undefined) {
      firstResponseTime[selected.id] = currentTime;
    }

    const start = currentTime;
    const end = currentTime + selected.burstTime;
    busyCpuTime += selected.burstTime;

    steps.push({
      time: start,
      runningProcessId: selected.id,
      runningProcessName: selected.name,
      readyQueue: readyProcs.slice(1).map(p => p.name),
      remainingBurstMap: { ...remainingBurst },
      eventDescription: `${selected.name} dispatched to CPU (Burst Time: ${selected.burstTime}).`,
      whyExplanation: `SJF selects ${selected.name} because it has the minimum CPU burst time (${selected.burstTime}ms) among all arrived processes in the ready queue.`
    });

    currentTime = end;
    completionTime[selected.id] = end;
    remainingBurst[selected.id] = 0;
    completed[selected.id] = true;
    completedCount++;

    ganttChart.push({
      processId: selected.id,
      processName: selected.name,
      startTime: start,
      endTime: end,
      color: selected.color
    });
  }

  return computeFinalMetrics(processes, ganttChart, steps, completionTime, firstResponseTime, currentTime, busyCpuTime, contextSwitches, 'SJF_NON_PREEMPTIVE');
}

// 3. Shortest Remaining Time First (SRTF - Preemptive SJF)
function runSRTFPreemptive(processes: (ProcessInput & { color: string })[]): SchedulingResult {
  const remainingBurst: Record<string, number> = {};
  processes.forEach(p => remainingBurst[p.id] = p.burstTime);

  const completed: Record<string, boolean> = {};
  const completionTime: Record<string, number> = {};
  const firstResponseTime: Record<string, number> = {};
  const ganttChart: GanttBlock[] = [];
  const steps: SchedulingStep[] = [];

  let currentTime = 0;
  let completedCount = 0;
  let busyCpuTime = 0;
  let contextSwitches = 0;
  let currentRunningId: string | null = null;
  const n = processes.length;

  while (completedCount < n) {
    const readyProcs = processes.filter(p => !completed[p.id] && p.arrivalTime <= currentTime);

    if (readyProcs.length === 0) {
      const unarrived = processes.filter(p => !completed[p.id]);
      const nextArr = Math.min(...unarrived.map(p => p.arrivalTime));
      
      if (ganttChart.length > 0 && ganttChart[ganttChart.length - 1].processId === 'IDLE') {
        ganttChart[ganttChart.length - 1].endTime = nextArr;
      } else {
        ganttChart.push({
          processId: 'IDLE',
          processName: 'CPU Idle',
          startTime: currentTime,
          endTime: nextArr,
          color: '#334155'
        });
      }
      currentTime = nextArr;
      currentRunningId = null;
      continue;
    }

    readyProcs.sort((a, b) => {
      const remA = remainingBurst[a.id];
      const remB = remainingBurst[b.id];
      if (remA !== remB) return remA - remB;
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.id.localeCompare(b.id);
    });

    const selected = readyProcs[0];

    if (currentRunningId !== null && currentRunningId !== selected.id) {
      contextSwitches++;
    }

    if (firstResponseTime[selected.id] === undefined) {
      firstResponseTime[selected.id] = currentTime;
    }

    // Determine time slice until next arrival or completion
    const unarrived = processes.filter(p => !completed[p.id] && p.arrivalTime > currentTime);
    let nextEventTime = currentTime + remainingBurst[selected.id];
    if (unarrived.length > 0) {
      const nextArrival = Math.min(...unarrived.map(p => p.arrivalTime));
      if (nextArrival < nextEventTime) {
        nextEventTime = nextArrival;
      }
    }

    const duration = Math.max(1, nextEventTime - currentTime);
    const execDuration = Math.min(duration, remainingBurst[selected.id]);

    const start = currentTime;
    const end = currentTime + execDuration;
    busyCpuTime += execDuration;
    remainingBurst[selected.id] -= execDuration;

    steps.push({
      time: start,
      runningProcessId: selected.id,
      runningProcessName: selected.name,
      readyQueue: readyProcs.filter(p => p.id !== selected.id).map(p => `${p.name} (rem: ${remainingBurst[p.id]})`),
      remainingBurstMap: { ...remainingBurst },
      eventDescription: `${selected.name} executed from t=${start} to t=${end}. Remaining: ${remainingBurst[selected.id]}ms.`,
      whyExplanation: currentRunningId && currentRunningId !== selected.id
        ? `Preemption! ${selected.name} preempted the previous process because its remaining burst (${remainingBurst[selected.id] + execDuration}ms) is lower.`
        : `${selected.name} was selected because its remaining burst time (${remainingBurst[selected.id] + execDuration}ms) is the lowest among ready processes.`
    });

    if (ganttChart.length > 0 && ganttChart[ganttChart.length - 1].processId === selected.id) {
      ganttChart[ganttChart.length - 1].endTime = end;
    } else {
      ganttChart.push({
        processId: selected.id,
        processName: selected.name,
        startTime: start,
        endTime: end,
        color: selected.color
      });
    }

    currentTime = end;
    currentRunningId = selected.id;

    if (remainingBurst[selected.id] === 0) {
      completed[selected.id] = true;
      completionTime[selected.id] = end;
      completedCount++;
      currentRunningId = null;
    }
  }

  return computeFinalMetrics(processes, ganttChart, steps, completionTime, firstResponseTime, currentTime, busyCpuTime, contextSwitches, 'SRTF_PREEMPTIVE');
}

// 4. Priority Scheduling (Non-Preemptive)
function runPriorityNonPreemptive(processes: (ProcessInput & { color: string })[]): SchedulingResult {
  const remainingBurst: Record<string, number> = {};
  processes.forEach(p => remainingBurst[p.id] = p.burstTime);

  const completed: Record<string, boolean> = {};
  const completionTime: Record<string, number> = {};
  const firstResponseTime: Record<string, number> = {};
  const ganttChart: GanttBlock[] = [];
  const steps: SchedulingStep[] = [];

  let currentTime = 0;
  let completedCount = 0;
  let busyCpuTime = 0;
  let contextSwitches = 0;
  let lastRanId: string | null = null;
  const n = processes.length;

  while (completedCount < n) {
    const readyProcs = processes.filter(p => !completed[p.id] && p.arrivalTime <= currentTime);

    if (readyProcs.length === 0) {
      const unarrived = processes.filter(p => !completed[p.id]);
      const nextArr = Math.min(...unarrived.map(p => p.arrivalTime));
      ganttChart.push({
        processId: 'IDLE',
        processName: 'CPU Idle',
        startTime: currentTime,
        endTime: nextArr,
        color: '#334155'
      });
      currentTime = nextArr;
      continue;
    }

    // Lower number = higher priority
    readyProcs.sort((a, b) => {
      const prioA = a.priority ?? 999;
      const prioB = b.priority ?? 999;
      if (prioA !== prioB) return prioA - prioB;
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.id.localeCompare(b.id);
    });

    const selected = readyProcs[0];

    if (lastRanId !== null && lastRanId !== selected.id) {
      contextSwitches++;
    }
    lastRanId = selected.id;

    if (firstResponseTime[selected.id] === undefined) {
      firstResponseTime[selected.id] = currentTime;
    }

    const start = currentTime;
    const end = currentTime + selected.burstTime;
    busyCpuTime += selected.burstTime;

    steps.push({
      time: start,
      runningProcessId: selected.id,
      runningProcessName: selected.name,
      readyQueue: readyProcs.slice(1).map(p => `${p.name} (prio: ${p.priority ?? 0})`),
      remainingBurstMap: { ...remainingBurst },
      eventDescription: `${selected.name} (Priority ${selected.priority ?? 0}) executed to completion.`,
      whyExplanation: `Selected ${selected.name} with highest priority (numerical rank ${selected.priority ?? 0}). In Non-Preemptive Priority, the chosen process retains the CPU until its burst finishes.`
    });

    currentTime = end;
    completionTime[selected.id] = end;
    remainingBurst[selected.id] = 0;
    completed[selected.id] = true;
    completedCount++;

    ganttChart.push({
      processId: selected.id,
      processName: selected.name,
      startTime: start,
      endTime: end,
      color: selected.color
    });
  }

  return computeFinalMetrics(processes, ganttChart, steps, completionTime, firstResponseTime, currentTime, busyCpuTime, contextSwitches, 'PRIORITY_NON_PREEMPTIVE');
}

// 5. Priority Scheduling (Preemptive)
function runPriorityPreemptive(processes: (ProcessInput & { color: string })[]): SchedulingResult {
  const remainingBurst: Record<string, number> = {};
  processes.forEach(p => remainingBurst[p.id] = p.burstTime);

  const completed: Record<string, boolean> = {};
  const completionTime: Record<string, number> = {};
  const firstResponseTime: Record<string, number> = {};
  const ganttChart: GanttBlock[] = [];
  const steps: SchedulingStep[] = [];

  let currentTime = 0;
  let completedCount = 0;
  let busyCpuTime = 0;
  let contextSwitches = 0;
  let currentRunningId: string | null = null;
  const n = processes.length;

  while (completedCount < n) {
    const readyProcs = processes.filter(p => !completed[p.id] && p.arrivalTime <= currentTime);

    if (readyProcs.length === 0) {
      const unarrived = processes.filter(p => !completed[p.id]);
      const nextArr = Math.min(...unarrived.map(p => p.arrivalTime));
      ganttChart.push({
        processId: 'IDLE',
        processName: 'CPU Idle',
        startTime: currentTime,
        endTime: nextArr,
        color: '#334155'
      });
      currentTime = nextArr;
      currentRunningId = null;
      continue;
    }

    readyProcs.sort((a, b) => {
      const prioA = a.priority ?? 999;
      const prioB = b.priority ?? 999;
      if (prioA !== prioB) return prioA - prioB;
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.id.localeCompare(b.id);
    });

    const selected = readyProcs[0];

    if (currentRunningId !== null && currentRunningId !== selected.id) {
      contextSwitches++;
    }

    if (firstResponseTime[selected.id] === undefined) {
      firstResponseTime[selected.id] = currentTime;
    }

    // Step by 1 time unit to check preemptions on each arrival
    const start = currentTime;
    const end = currentTime + 1;
    busyCpuTime += 1;
    remainingBurst[selected.id] -= 1;

    steps.push({
      time: start,
      runningProcessId: selected.id,
      runningProcessName: selected.name,
      readyQueue: readyProcs.filter(p => p.id !== selected.id).map(p => `${p.name} (prio: ${p.priority ?? 0})`),
      remainingBurstMap: { ...remainingBurst },
      eventDescription: `${selected.name} executed 1ms. Remaining: ${remainingBurst[selected.id]}ms.`,
      whyExplanation: `${selected.name} has the highest priority (${selected.priority ?? 0}) at t=${start}.`
    });

    if (ganttChart.length > 0 && ganttChart[ganttChart.length - 1].processId === selected.id) {
      ganttChart[ganttChart.length - 1].endTime = end;
    } else {
      ganttChart.push({
        processId: selected.id,
        processName: selected.name,
        startTime: start,
        endTime: end,
        color: selected.color
      });
    }

    currentTime = end;
    currentRunningId = selected.id;

    if (remainingBurst[selected.id] === 0) {
      completed[selected.id] = true;
      completionTime[selected.id] = end;
      completedCount++;
      currentRunningId = null;
    }
  }

  return computeFinalMetrics(processes, ganttChart, steps, completionTime, firstResponseTime, currentTime, busyCpuTime, contextSwitches, 'PRIORITY_PREEMPTIVE');
}

// 6. Round Robin (RR)
function runRoundRobin(processes: (ProcessInput & { color: string })[], quantum: number): SchedulingResult {
  const remainingBurst: Record<string, number> = {};
  processes.forEach(p => remainingBurst[p.id] = p.burstTime);

  const completed: Record<string, boolean> = {};
  const completionTime: Record<string, number> = {};
  const firstResponseTime: Record<string, number> = {};
  const ganttChart: GanttBlock[] = [];
  const steps: SchedulingStep[] = [];

  let currentTime = 0;
  let completedCount = 0;
  let busyCpuTime = 0;
  let contextSwitches = 0;
  let lastRanId: string | null = null;
  const n = processes.length;

  // Queue of process IDs
  const queue: string[] = [];
  const inQueue: Record<string, boolean> = {};

  // Sort initially by arrival time
  const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);

  // Add all processes that arrived at t=0
  sorted.filter(p => p.arrivalTime <= currentTime).forEach(p => {
    queue.push(p.id);
    inQueue[p.id] = true;
  });

  while (completedCount < n) {
    if (queue.length === 0) {
      // Find next arriving
      const unarrived = sorted.filter(p => !completed[p.id] && !inQueue[p.id]);
      if (unarrived.length > 0) {
        const nextArr = unarrived[0].arrivalTime;
        ganttChart.push({
          processId: 'IDLE',
          processName: 'CPU Idle',
          startTime: currentTime,
          endTime: nextArr,
          color: '#334155'
        });
        currentTime = nextArr;
        // Enqueue arriving at this new currentTime
        sorted.filter(p => !completed[p.id] && !inQueue[p.id] && p.arrivalTime <= currentTime).forEach(p => {
          queue.push(p.id);
          inQueue[p.id] = true;
        });
        continue;
      }
      break;
    }

    const currentProcId = queue.shift()!;
    inQueue[currentProcId] = false;
    const currentProc = processes.find(p => p.id === currentProcId)!;

    if (lastRanId !== null && lastRanId !== currentProcId) {
      contextSwitches++;
    }
    lastRanId = currentProcId;

    if (firstResponseTime[currentProcId] === undefined) {
      firstResponseTime[currentProcId] = currentTime;
    }

    const execTime = Math.min(quantum, remainingBurst[currentProcId]);
    const start = currentTime;
    const end = currentTime + execTime;
    busyCpuTime += execTime;
    remainingBurst[currentProcId] -= execTime;

    steps.push({
      time: start,
      runningProcessId: currentProcId,
      runningProcessName: currentProc.name,
      readyQueue: queue.map(id => processes.find(p => p.id === id)!.name),
      remainingBurstMap: { ...remainingBurst },
      eventDescription: `${currentProc.name} dispatched for time quantum ${execTime}ms. Remaining: ${remainingBurst[currentProcId]}ms.`,
      whyExplanation: `Round Robin head of FIFO queue was ${currentProc.name}. Allocated up to quantum=${quantum}ms.`
    });

    ganttChart.push({
      processId: currentProc.id,
      processName: currentProc.name,
      startTime: start,
      endTime: end,
      color: currentProc.color
    });

    currentTime = end;

    // Check newly arrived processes during this quantum slice
    sorted.filter(p => !completed[p.id] && !inQueue[p.id] && p.id !== currentProcId && p.arrivalTime <= currentTime).forEach(p => {
      queue.push(p.id);
      inQueue[p.id] = true;
    });

    if (remainingBurst[currentProcId] > 0) {
      // Re-enqueue current process at the tail of ready queue
      queue.push(currentProcId);
      inQueue[currentProcId] = true;
    } else {
      completed[currentProcId] = true;
      completionTime[currentProcId] = end;
      completedCount++;
    }
  }

  return computeFinalMetrics(processes, ganttChart, steps, completionTime, firstResponseTime, currentTime, busyCpuTime, contextSwitches, 'ROUND_ROBIN');
}

// 7. Multilevel Feedback Queue (MLFQ)
// Queue 0: RR (Quantum = 2) -> Queue 1: RR (Quantum = 4) -> Queue 2: FCFS
function runMLFQ(processes: (ProcessInput & { color: string })[], baseQuantum: number = 2): SchedulingResult {
  const q1Quantum = baseQuantum;
  const q2Quantum = baseQuantum * 2;

  const remainingBurst: Record<string, number> = {};
  processes.forEach(p => remainingBurst[p.id] = p.burstTime);

  const completed: Record<string, boolean> = {};
  const completionTime: Record<string, number> = {};
  const firstResponseTime: Record<string, number> = {};
  const ganttChart: GanttBlock[] = [];
  const steps: SchedulingStep[] = [];

  let currentTime = 0;
  let completedCount = 0;
  let busyCpuTime = 0;
  let contextSwitches = 0;
  let lastRanId: string | null = null;
  const n = processes.length;

  const q0: string[] = [];
  const q1: string[] = [];
  const q2: string[] = [];

  const enqueued: Record<string, boolean> = {};
  const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);

  const checkArrivals = () => {
    sorted.filter(p => !completed[p.id] && !enqueued[p.id] && p.arrivalTime <= currentTime).forEach(p => {
      q0.push(p.id); // All new processes enter highest priority Queue 0
      enqueued[p.id] = true;
    });
  };

  checkArrivals();

  while (completedCount < n) {
    if (q0.length === 0 && q1.length === 0 && q2.length === 0) {
      const unarrived = sorted.filter(p => !completed[p.id] && !enqueued[p.id]);
      if (unarrived.length > 0) {
        const nextArr = unarrived[0].arrivalTime;
        ganttChart.push({
          processId: 'IDLE',
          processName: 'CPU Idle',
          startTime: currentTime,
          endTime: nextArr,
          color: '#334155'
        });
        currentTime = nextArr;
        checkArrivals();
        continue;
      }
      break;
    }

    let activeQueueLevel = 0;
    let procId: string;
    let slice = q1Quantum;

    if (q0.length > 0) {
      procId = q0.shift()!;
      activeQueueLevel = 0;
      slice = q1Quantum;
    } else if (q1.length > 0) {
      procId = q1.shift()!;
      activeQueueLevel = 1;
      slice = q2Quantum;
    } else {
      procId = q2.shift()!;
      activeQueueLevel = 2;
      slice = remainingBurst[procId]; // FCFS in lowest queue
    }

    const currentProc = processes.find(p => p.id === procId)!;

    if (lastRanId !== null && lastRanId !== procId) {
      contextSwitches++;
    }
    lastRanId = procId;

    if (firstResponseTime[procId] === undefined) {
      firstResponseTime[procId] = currentTime;
    }

    const execTime = Math.min(slice, remainingBurst[procId]);
    const start = currentTime;
    const end = currentTime + execTime;
    busyCpuTime += execTime;
    remainingBurst[procId] -= execTime;

    steps.push({
      time: start,
      runningProcessId: procId,
      runningProcessName: currentProc.name,
      readyQueue: [
        ...q0.map(id => `Q0:${processes.find(p => p.id === id)!.name}`),
        ...q1.map(id => `Q1:${processes.find(p => p.id === id)!.name}`),
        ...q2.map(id => `Q2:${processes.find(p => p.id === id)!.name}`)
      ],
      remainingBurstMap: { ...remainingBurst },
      eventDescription: `${currentProc.name} ran in Queue ${activeQueueLevel} for ${execTime}ms. Remaining: ${remainingBurst[procId]}ms.`,
      whyExplanation: `MLFQ served Queue ${activeQueueLevel} (highest non-empty queue priority). ${
        remainingBurst[procId] > 0 && activeQueueLevel < 2 ? `Demoted to Queue ${activeQueueLevel + 1} for consuming entire time quantum.` : ''
      }`
    });

    ganttChart.push({
      processId: currentProc.id,
      processName: currentProc.name,
      startTime: start,
      endTime: end,
      color: currentProc.color
    });

    currentTime = end;
    checkArrivals();

    if (remainingBurst[procId] > 0) {
      // Demote to next queue
      if (activeQueueLevel === 0) {
        q1.push(procId);
      } else {
        q2.push(procId);
      }
    } else {
      completed[procId] = true;
      completionTime[procId] = end;
      completedCount++;
    }
  }

  return computeFinalMetrics(processes, ganttChart, steps, completionTime, firstResponseTime, currentTime, busyCpuTime, contextSwitches, 'MLFQ');
}

// Utility to calculate averages and metrics
function computeFinalMetrics(
  processes: (ProcessInput & { color: string })[],
  ganttChart: GanttBlock[],
  steps: SchedulingStep[],
  completionTime: Record<string, number>,
  firstResponseTime: Record<string, number>,
  totalTime: number,
  busyCpuTime: number,
  contextSwitches: number,
  algorithm: SchedulingAlgorithm
): SchedulingResult {
  const metrics: ProcessMetrics[] = processes.map(p => {
    const ct = completionTime[p.id] || 0;
    const tat = ct - p.arrivalTime;
    const wt = tat - p.burstTime;
    const rt = (firstResponseTime[p.id] ?? p.arrivalTime) - p.arrivalTime;

    return {
      id: p.id,
      name: p.name,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      priority: p.priority,
      completionTime: ct,
      turnaroundTime: tat,
      waitingTime: wt,
      responseTime: rt,
      color: p.color
    };
  });

  const totalWt = metrics.reduce((acc, m) => acc + m.waitingTime, 0);
  const totalTat = metrics.reduce((acc, m) => acc + m.turnaroundTime, 0);
  const totalRt = metrics.reduce((acc, m) => acc + m.responseTime, 0);
  const n = metrics.length || 1;

  const avgWt = parseFloat((totalWt / n).toFixed(2));
  const avgTat = parseFloat((totalTat / n).toFixed(2));
  const avgRt = parseFloat((totalRt / n).toFixed(2));
  const throughput = totalTime > 0 ? parseFloat((n / totalTime).toFixed(4)) : 0;
  const cpuUtilization = totalTime > 0 ? parseFloat(((busyCpuTime / totalTime) * 100).toFixed(2)) : 0;

  return {
    algorithm,
    ganttChart,
    processMetrics: metrics,
    steps,
    averageWaitingTime: avgWt,
    averageTurnaroundTime: avgTat,
    averageResponseTime: avgRt,
    throughput,
    cpuUtilization,
    totalTime,
    contextSwitches
  };
}
