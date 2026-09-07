// Page Replacement Algorithm Engine (Deterministic & Mathematically Rigorous)

export type PageReplacementAlgorithm = 'FIFO' | 'LRU' | 'OPTIMAL' | 'CLOCK';

export interface PageStep {
  stepIndex: number;
  page: number;
  frames: (number | null)[];
  isHit: boolean;
  evictedPage: number | null;
  referenceBits?: number[]; // For Clock algorithm
  whyExplanation: string;
}

export interface PageReplacementResult {
  algorithm: PageReplacementAlgorithm;
  referenceString: number[];
  frameCount: number;
  steps: PageStep[];
  pageFaults: number;
  pageHits: number;
  faultRatio: number; // percentage
  hitRatio: number; // percentage
  beladyAnomalyDetected?: boolean;
}

export function runPageReplacement(
  referenceString: number[],
  frameCount: number,
  algorithm: PageReplacementAlgorithm
): PageReplacementResult {
  if (!referenceString || referenceString.length === 0 || frameCount <= 0) {
    return {
      algorithm,
      referenceString: [],
      frameCount,
      steps: [],
      pageFaults: 0,
      pageHits: 0,
      faultRatio: 0,
      hitRatio: 0
    };
  }

  switch (algorithm) {
    case 'FIFO':
      return runFIFO(referenceString, frameCount);
    case 'LRU':
      return runLRU(referenceString, frameCount);
    case 'OPTIMAL':
      return runOptimal(referenceString, frameCount);
    case 'CLOCK':
      return runClock(referenceString, frameCount);
    default:
      return runFIFO(referenceString, frameCount);
  }
}

// 1. First-In First-Out (FIFO)
function runFIFO(refString: number[], frameCount: number): PageReplacementResult {
  const frames: (number | null)[] = Array(frameCount).fill(null);
  const steps: PageStep[] = [];
  let faults = 0;
  let hits = 0;
  let oldestPointer = 0;

  refString.forEach((page, idx) => {
    const existingIndex = frames.indexOf(page);
    if (existingIndex !== -1) {
      hits++;
      steps.push({
        stepIndex: idx,
        page,
        frames: [...frames],
        isHit: true,
        evictedPage: null,
        whyExplanation: `Page ${page} is already in frame ${existingIndex} (HIT). No frame modification needed.`
      });
    } else {
      faults++;
      const evicted = frames[oldestPointer];
      const targetFrame = oldestPointer;
      frames[oldestPointer] = page;
      oldestPointer = (oldestPointer + 1) % frameCount;

      steps.push({
        stepIndex: idx,
        page,
        frames: [...frames],
        isHit: false,
        evictedPage: evicted,
        whyExplanation: evicted !== null
          ? `PAGE FAULT: Page ${page} not present. Evicted oldest page ${evicted} from frame ${targetFrame} (FIFO order).`
          : `PAGE FAULT: Empty frame ${targetFrame} available. Loaded page ${page}.`
      });
    }
  });

  const total = refString.length;
  return {
    algorithm: 'FIFO',
    referenceString: refString,
    frameCount,
    steps,
    pageFaults: faults,
    pageHits: hits,
    faultRatio: parseFloat(((faults / total) * 100).toFixed(2)),
    hitRatio: parseFloat(((hits / total) * 100).toFixed(2))
  };
}

// 2. Least Recently Used (LRU)
function runLRU(refString: number[], frameCount: number): PageReplacementResult {
  const frames: (number | null)[] = Array(frameCount).fill(null);
  const lastUsed: Record<number, number> = {};
  const steps: PageStep[] = [];
  let faults = 0;
  let hits = 0;

  refString.forEach((page, idx) => {
    const existingIndex = frames.indexOf(page);
    if (existingIndex !== -1) {
      hits++;
      lastUsed[page] = idx;
      steps.push({
        stepIndex: idx,
        page,
        frames: [...frames],
        isHit: true,
        evictedPage: null,
        whyExplanation: `Page ${page} hit in frame ${existingIndex}. Updated last accessed time to step ${idx}.`
      });
    } else {
      faults++;
      let targetFrame = frames.indexOf(null);
      let evicted: number | null = null;

      if (targetFrame !== -1) {
        // Free frame available
        frames[targetFrame] = page;
        lastUsed[page] = idx;
        steps.push({
          stepIndex: idx,
          page,
          frames: [...frames],
          isHit: false,
          evictedPage: null,
          whyExplanation: `PAGE FAULT: Empty frame ${targetFrame} found. Allocated page ${page}.`
        });
      } else {
        // Find LRU page among currently loaded frames
        let minAccessTime = Infinity;
        let lruFrameIndex = 0;

        for (let f = 0; f < frameCount; f++) {
          const p = frames[f]!;
          const accessTime = lastUsed[p] ?? -1;
          if (accessTime < minAccessTime) {
            minAccessTime = accessTime;
            lruFrameIndex = f;
          }
        }

        evicted = frames[lruFrameIndex];
        frames[lruFrameIndex] = page;
        lastUsed[page] = idx;

        steps.push({
          stepIndex: idx,
          page,
          frames: [...frames],
          isHit: false,
          evictedPage: evicted,
          whyExplanation: `PAGE FAULT: Evicted page ${evicted} from frame ${lruFrameIndex} because it was least recently used (last accessed at step ${minAccessTime}).`
        });
      }
    }
  });

  const total = refString.length;
  return {
    algorithm: 'LRU',
    referenceString: refString,
    frameCount,
    steps,
    pageFaults: faults,
    pageHits: hits,
    faultRatio: parseFloat(((faults / total) * 100).toFixed(2)),
    hitRatio: parseFloat(((hits / total) * 100).toFixed(2))
  };
}

// 3. Optimal (Belady's Min / OPT)
function runOptimal(refString: number[], frameCount: number): PageReplacementResult {
  const frames: (number | null)[] = Array(frameCount).fill(null);
  const steps: PageStep[] = [];
  let faults = 0;
  let hits = 0;

  refString.forEach((page, idx) => {
    const existingIndex = frames.indexOf(page);
    if (existingIndex !== -1) {
      hits++;
      steps.push({
        stepIndex: idx,
        page,
        frames: [...frames],
        isHit: true,
        evictedPage: null,
        whyExplanation: `Page ${page} hit in frame ${existingIndex}.`
      });
    } else {
      faults++;
      const emptyFrame = frames.indexOf(null);

      if (emptyFrame !== -1) {
        frames[emptyFrame] = page;
        steps.push({
          stepIndex: idx,
          page,
          frames: [...frames],
          isHit: false,
          evictedPage: null,
          whyExplanation: `PAGE FAULT: Empty frame ${emptyFrame} available. Loaded page ${page}.`
        });
      } else {
        // Look into the future for all current frames
        let farthestFuture = -1;
        let victimFrame = 0;
        let victimPage = frames[0]!;

        for (let f = 0; f < frameCount; f++) {
          const currentInFrame = frames[f]!;
          let nextUse = Infinity;

          for (let future = idx + 1; future < refString.length; future++) {
            if (refString[future] === currentInFrame) {
              nextUse = future;
              break;
            }
          }

          if (nextUse > farthestFuture) {
            farthestFuture = nextUse;
            victimFrame = f;
            victimPage = currentInFrame;
          }
        }

        frames[victimFrame] = page;
        steps.push({
          stepIndex: idx,
          page,
          frames: [...frames],
          isHit: false,
          evictedPage: victimPage,
          whyExplanation: farthestFuture === Infinity
            ? `PAGE FAULT: Evicted page ${victimPage} because it will never be referenced again in the future.`
            : `PAGE FAULT: Evicted page ${victimPage} because its next reference is farthest in the future (step ${farthestFuture}).`
        });
      }
    }
  });

  const total = refString.length;
  return {
    algorithm: 'OPTIMAL',
    referenceString: refString,
    frameCount,
    steps,
    pageFaults: faults,
    pageHits: hits,
    faultRatio: parseFloat(((faults / total) * 100).toFixed(2)),
    hitRatio: parseFloat(((hits / total) * 100).toFixed(2))
  };
}

// 4. Second Chance / Clock
function runClock(refString: number[], frameCount: number): PageReplacementResult {
  const frames: (number | null)[] = Array(frameCount).fill(null);
  const refBits: number[] = Array(frameCount).fill(0);
  const steps: PageStep[] = [];
  let faults = 0;
  let hits = 0;
  let clockHand = 0;

  refString.forEach((page, idx) => {
    const existingIndex = frames.indexOf(page);
    if (existingIndex !== -1) {
      hits++;
      refBits[existingIndex] = 1; // Give second chance
      steps.push({
        stepIndex: idx,
        page,
        frames: [...frames],
        isHit: true,
        evictedPage: null,
        referenceBits: [...refBits],
        whyExplanation: `Page ${page} hit in frame ${existingIndex}. Set reference bit to 1.`
      });
    } else {
      faults++;
      const emptyIndex = frames.indexOf(null);
      if (emptyIndex !== -1) {
        frames[emptyIndex] = page;
        refBits[emptyIndex] = 1;
        steps.push({
          stepIndex: idx,
          page,
          frames: [...frames],
          isHit: false,
          evictedPage: null,
          referenceBits: [...refBits],
          whyExplanation: `PAGE FAULT: Empty frame ${emptyIndex} loaded with page ${page} (ref bit=1).`
        });
      } else {
        // Clock cycle scan
        let replaced = false;
        let evicted: number | null = null;

        while (!replaced) {
          if (refBits[clockHand] === 0) {
            evicted = frames[clockHand];
            frames[clockHand] = page;
            refBits[clockHand] = 1;
            const targetFrame = clockHand;
            clockHand = (clockHand + 1) % frameCount;
            replaced = true;

            steps.push({
              stepIndex: idx,
              page,
              frames: [...frames],
              isHit: false,
              evictedPage: evicted,
              referenceBits: [...refBits],
              whyExplanation: `PAGE FAULT: Clock hand at frame ${targetFrame} found reference bit = 0. Evicted page ${evicted}, loaded ${page}, advance hand to ${clockHand}.`
            });
          } else {
            // Clear reference bit and advance
            refBits[clockHand] = 0;
            clockHand = (clockHand + 1) % frameCount;
          }
        }
      }
    }
  });

  const total = refString.length;
  return {
    algorithm: 'CLOCK',
    referenceString: refString,
    frameCount,
    steps,
    pageFaults: faults,
    pageHits: hits,
    faultRatio: parseFloat(((faults / total) * 100).toFixed(2)),
    hitRatio: parseFloat(((hits / total) * 100).toFixed(2))
  };
}

// Belady's Anomaly Test: Default string [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]
export function checkBeladysAnomaly(
  refString: number[] = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]
): {
  stringUsed: number[];
  faults3Frames: number;
  faults4Frames: number;
  anomalyDetected: boolean;
  explanation: string;
} {
  const res3 = runFIFO(refString, 3);
  const res4 = runFIFO(refString, 4);

  const anomalyDetected = res4.pageFaults > res3.pageFaults;
  return {
    stringUsed: refString,
    faults3Frames: res3.pageFaults,
    faults4Frames: res4.pageFaults,
    anomalyDetected,
    explanation: anomalyDetected
      ? `Belady's Anomaly Confirmed! For FIFO with 3 frames, faults = ${res3.pageFaults}. When frame capacity increased to 4, faults increased to ${res4.pageFaults}! This counterintuitive behavior occurs because FIFO is not a stack algorithm.`
      : `No anomaly detected for this sequence. (3 frames: ${res3.pageFaults} faults, 4 frames: ${res4.pageFaults} faults).`
  };
}
