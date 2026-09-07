// Disk Scheduling Algorithm Engine (Deterministic & Step-by-Step)

export type DiskAlgorithm = 'FCFS' | 'SSTF' | 'SCAN' | 'C_SCAN' | 'LOOK' | 'C_LOOK';
export type DiskDirection = 'LEFT' | 'RIGHT'; // LEFT = towards 0 (inward/down), RIGHT = towards max (outward/up)

export interface DiskStep {
  stepIndex: number;
  currentTrack: number;
  nextTrack: number;
  distance: number;
  totalMovementSoFar: number;
  remainingQueue: number[];
  whyExplanation: string;
}

export interface DiskSchedulingResult {
  algorithm: DiskAlgorithm;
  initialHead: number;
  direction: DiskDirection;
  totalCylinders: number;
  seekSequence: number[];
  steps: DiskStep[];
  totalHeadMovement: number;
  averageSeekDistance: number;
  seekTimeEstimateMs: number; // Assuming ~0.1ms per track
}

export function runDiskScheduling(
  requests: number[],
  initialHead: number,
  direction: DiskDirection = 'RIGHT',
  totalCylinders: number = 200,
  algorithm: DiskAlgorithm = 'FCFS',
  seekTimePerCylinderMs: number = 0.1
): DiskSchedulingResult {
  if (!requests || requests.length === 0) {
    return {
      algorithm,
      initialHead,
      direction,
      totalCylinders,
      seekSequence: [initialHead],
      steps: [],
      totalHeadMovement: 0,
      averageSeekDistance: 0,
      seekTimeEstimateMs: 0
    };
  }

  const maxCylinder = totalCylinders - 1;
  return executeDiskAlgorithm(requests, initialHead, direction, maxCylinder, algorithm, seekTimePerCylinderMs);
}

export function executeDiskAlgorithm(
  requests: number[],
  initialHead: number,
  direction: DiskDirection,
  maxCylinder: number,
  algorithm: DiskAlgorithm,
  seekTimePerCylinderMs: number = 0.1
): DiskSchedulingResult {
  let sequence: number[] = [];
  const reqs = [...requests];

  if (algorithm === 'FCFS') {
    sequence = [initialHead, ...reqs];
  } else if (algorithm === 'SSTF') {
    sequence = [initialHead];
    const pending = [...reqs];
    let curr = initialHead;

    while (pending.length > 0) {
      let minDist = Infinity;
      let chosenIdx = 0;

      for (let i = 0; i < pending.length; i++) {
        const dist = Math.abs(pending[i] - curr);
        if (dist < minDist) {
          minDist = dist;
          chosenIdx = i;
        }
      }

      curr = pending[chosenIdx];
      sequence.push(curr);
      pending.splice(chosenIdx, 1);
    }
  } else if (algorithm === 'SCAN') {
    // Elevator algorithm: moves in given direction to boundary, then reverses
    sequence = [initialHead];
    const left = reqs.filter(r => r < initialHead).sort((a, b) => b - a); // descending
    const right = reqs.filter(r => r >= initialHead).sort((a, b) => a - b); // ascending

    if (direction === 'RIGHT') {
      sequence.push(...right);
      if (left.length > 0) {
        sequence.push(maxCylinder); // touches boundary
        sequence.push(...left);
      }
    } else {
      sequence.push(...left);
      if (right.length > 0) {
        sequence.push(0); // touches boundary 0
        sequence.push(...right);
      }
    }
  } else if (algorithm === 'C_SCAN') {
    // Circular SCAN: moves in one direction to end, jumps to 0, continues
    sequence = [initialHead];
    const left = reqs.filter(r => r < initialHead).sort((a, b) => a - b); // ascending
    const right = reqs.filter(r => r >= initialHead).sort((a, b) => a - b); // ascending

    if (direction === 'RIGHT') {
      sequence.push(...right);
      if (left.length > 0) {
        sequence.push(maxCylinder);
        sequence.push(0); // Circular jump
        sequence.push(...left);
      }
    } else {
      const leftDesc = reqs.filter(r => r <= initialHead).sort((a, b) => b - a);
      const rightDesc = reqs.filter(r => r > initialHead).sort((a, b) => b - a);
      sequence.push(...leftDesc);
      if (rightDesc.length > 0) {
        sequence.push(0);
        sequence.push(maxCylinder);
        sequence.push(...rightDesc);
      }
    }
  } else if (algorithm === 'LOOK') {
    // LOOK moves only as far as final request in current direction, without touching 0 or max boundary
    sequence = [initialHead];
    const left = reqs.filter(r => r < initialHead).sort((a, b) => b - a); // descending
    const right = reqs.filter(r => r >= initialHead).sort((a, b) => a - b); // ascending

    if (direction === 'RIGHT') {
      sequence.push(...right);
      sequence.push(...left);
    } else {
      sequence.push(...left);
      sequence.push(...right);
    }
  } else if (algorithm === 'C_LOOK') {
    // Circular LOOK: only goes as far as last request, wraps around to lowest/highest requested
    sequence = [initialHead];
    const left = reqs.filter(r => r < initialHead).sort((a, b) => a - b); // ascending
    const right = reqs.filter(r => r >= initialHead).sort((a, b) => a - b); // ascending

    if (direction === 'RIGHT') {
      sequence.push(...right);
      sequence.push(...left);
    } else {
      const leftDesc = reqs.filter(r => r <= initialHead).sort((a, b) => b - a);
      const rightDesc = reqs.filter(r => r > initialHead).sort((a, b) => b - a);
      sequence.push(...leftDesc);
      sequence.push(...rightDesc);
    }
  }

  // Remove contiguous duplicates if any
  const cleanSequence: number[] = [];
  for (let i = 0; i < sequence.length; i++) {
    if (i === 0 || sequence[i] !== sequence[i - 1]) {
      cleanSequence.push(sequence[i]);
    }
  }

  // Calculate discrete steps
  const steps: DiskStep[] = [];
  let totalHeadMovement = 0;

  for (let i = 0; i < cleanSequence.length - 1; i++) {
    const curr = cleanSequence[i];
    const next = cleanSequence[i + 1];
    const dist = Math.abs(next - curr);
    totalHeadMovement += dist;

    let why = '';
    if (algorithm === 'FCFS') {
      why = `Servicing track ${next} in the exact order requested in FIFO queue.`;
    } else if (algorithm === 'SSTF') {
      why = `Track ${next} chosen because distance |${next} - ${curr}| = ${dist} cylinders is the shortest seek distance available.`;
    } else if (algorithm === 'SCAN') {
      why = next === maxCylinder || next === 0
        ? `Reached disk boundary cylinder ${next}. Reversing head arm sweep direction.`
        : `Elevator arm continuing sweep in ${direction === 'RIGHT' ? 'higher' : 'lower'} cylinder direction to track ${next}.`;
    } else if (algorithm === 'C_SCAN') {
      why = (curr === maxCylinder && next === 0) || (curr === 0 && next === maxCylinder)
        ? `Circular return without servicing requests between ${curr} and ${next}.`
        : `Servicing track ${next} during unidirectional sweep.`;
    } else if (algorithm === 'LOOK') {
      why = `LOOK arm reached furthest pending request and reversed to service track ${next}.`;
    } else {
      why = `C-LOOK jumped to start of cylinder sequence to service track ${next}.`;
    }

    steps.push({
      stepIndex: i,
      currentTrack: curr,
      nextTrack: next,
      distance: dist,
      totalMovementSoFar: totalHeadMovement,
      remainingQueue: cleanSequence.slice(i + 2),
      whyExplanation: why
    });
  }

  const reqCount = requests.length || 1;
  const avgSeek = parseFloat((totalHeadMovement / reqCount).toFixed(2));
  const seekTime = parseFloat((totalHeadMovement * seekTimePerCylinderMs).toFixed(2));

  return {
    algorithm,
    initialHead,
    direction,
    totalCylinders: maxCylinder + 1,
    seekSequence: cleanSequence,
    steps,
    totalHeadMovement,
    averageSeekDistance: avgSeek,
    seekTimeEstimateMs: seekTime
  };
}
