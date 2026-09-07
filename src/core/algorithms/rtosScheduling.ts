// Real-Time Operating Systems (RTOS) Scheduling Engine (RMS & EDF)

export interface RealTimeTask {
  id: string;
  name: string;
  period: number;         // T_i
  executionTime: number;  // C_i
  deadline: number;       // D_i (often equals T_i)
  color?: string;
}

export interface RtosTimelineSlice {
  time: number;
  runningTaskId: string | null;
  runningTaskName: string | null;
  activeJobInstance?: number;
  missedDeadline: boolean;
  whyExplanation: string;
}

export interface RtosResult {
  algorithm: 'RMS' | 'EDF';
  utilization: number;
  utilizationBound: number; // for RMS: n(2^(1/n) - 1)
  isSchedulableByBound: boolean;
  totalTime: number;
  timeline: RtosTimelineSlice[];
  deadlineMisses: number;
}

export function calculateLiuLaylandBound(n: number): number {
  if (n <= 0) return 0;
  return parseFloat((n * (Math.pow(2, 1 / n) - 1)).toFixed(4));
}

export function runRtosScheduling(
  tasks: RealTimeTask[],
  algorithm: 'RMS' | 'EDF',
  hyperperiodOverride?: number
): RtosResult {
  if (!tasks || tasks.length === 0) {
    return {
      algorithm,
      utilization: 0,
      utilizationBound: 0,
      isSchedulableByBound: false,
      totalTime: 0,
      timeline: [],
      deadlineMisses: 0
    };
  }

  // Calculate Total Utilization: U = sum(C_i / T_i)
  const totalU = tasks.reduce((sum, t) => sum + (t.executionTime / t.period), 0);
  const n = tasks.length;
  const rmsBound = calculateLiuLaylandBound(n);

  // Greatest Common Divisor / Least Common Multiple helper for Hyperperiod
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);
  const hyperperiod = hyperperiodOverride || tasks.reduce((acc, t) => lcm(acc, t.period), tasks[0].period);
  const simLength = Math.min(hyperperiod, 36); // Bound for visual clarity

  interface Job {
    taskId: string;
    taskName: string;
    instance: number;
    releaseTime: number;
    deadline: number;
    remainingTime: number;
    period: number;
    color: string;
  }

  const jobs: Job[] = [];
  const defaultColors = ['#00f0ff', '#a855f7', '#10b981', '#f59e0b'];

  // Release all jobs up to simLength
  tasks.forEach((t, idx) => {
    const col = t.color || defaultColors[idx % defaultColors.length];
    for (let rel = 0; rel < simLength; rel += t.period) {
      jobs.push({
        taskId: t.id,
        taskName: t.name,
        instance: Math.floor(rel / t.period) + 1,
        releaseTime: rel,
        deadline: rel + (t.deadline || t.period),
        remainingTime: t.executionTime,
        period: t.period,
        color: col
      });
    }
  });

  const timeline: RtosTimelineSlice[] = [];
  let deadlineMisses = 0;

  for (let t = 0; t < simLength; t++) {
    // Check for deadline misses among active incomplete jobs
    for (const j of jobs) {
      if (j.releaseTime <= t && j.remainingTime > 0 && t >= j.deadline) {
        deadlineMisses++;
      }
    }

    // Active eligible jobs at time t
    const readyJobs = jobs.filter(j => j.releaseTime <= t && j.remainingTime > 0);

    if (readyJobs.length === 0) {
      timeline.push({
        time: t,
        runningTaskId: null,
        runningTaskName: 'IDLE',
        missedDeadline: false,
        whyExplanation: `CPU Idle: No real-time jobs currently ready to execute at t=${t}.`
      });
      continue;
    }

    // Sort according to policy
    if (algorithm === 'RMS') {
      // Shorter period = higher static priority
      readyJobs.sort((a, b) => a.period - b.period);
    } else {
      // EDF: Earliest absolute deadline = higher dynamic priority
      readyJobs.sort((a, b) => a.deadline - b.deadline);
    }

    const currentJob = readyJobs[0];
    currentJob.remainingTime -= 1;
    const isMissed = t + 1 > currentJob.deadline && currentJob.remainingTime > 0;

    timeline.push({
      time: t,
      runningTaskId: currentJob.taskId,
      runningTaskName: `${currentJob.taskName} (Job #${currentJob.instance})`,
      activeJobInstance: currentJob.instance,
      missedDeadline: isMissed,
      whyExplanation: algorithm === 'RMS'
        ? `RMS dispatched ${currentJob.taskName}: Has shortest static period (T=${currentJob.period}).`
        : `EDF dispatched ${currentJob.taskName}: Has earliest absolute deadline (d=${currentJob.deadline}).`
    });
  }

  const isSchedulable = algorithm === 'RMS' ? totalU <= rmsBound : totalU <= 1.0;

  return {
    algorithm,
    utilization: parseFloat(totalU.toFixed(4)),
    utilizationBound: algorithm === 'RMS' ? rmsBound : 1.0,
    isSchedulableByBound: isSchedulable,
    totalTime: simLength,
    timeline,
    deadlineMisses
  };
}
