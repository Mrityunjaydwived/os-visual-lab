// Cache Memory Simulation & AMAT Calculation Engine

export type CacheMapping = 'DIRECT_MAPPED' | 'SET_ASSOCIATIVE_2' | 'SET_ASSOCIATIVE_4' | 'FULLY_ASSOCIATIVE';

export interface CacheLine {
  valid: boolean;
  tag: number;
  dataBlock: number;
  lastAccessTick: number;
  dirty: boolean;
}

export interface CacheSet {
  lines: CacheLine[];
}

export interface AddressBreakdown {
  address: number;
  binaryString: string;
  tagBits: number;
  indexBits: number;
  offsetBits: number;
  tagValue: number;
  indexValue: number;
  offsetValue: number;
}

export interface CacheAccessStep {
  stepIndex: number;
  address: number;
  breakdown: AddressBreakdown;
  setIndex: number;
  isHit: boolean;
  hitLineIndex?: number;
  evictedLine?: { tag: number; block: number } | null;
  whyExplanation: string;
}

export interface CacheSimulationResult {
  mapping: CacheMapping;
  cacheSizeBytes: number;
  blockSizeBytes: number;
  associativityWays: number;
  numSets: number;
  tagBits: number;
  indexBits: number;
  offsetBits: number;
  steps: CacheAccessStep[];
  hits: number;
  misses: number;
  hitRatio: number;
  missRatio: number;
  finalState: CacheSet[];
}

export function parseAddress(
  address: number,
  addressBusBits: number,
  indexBits: number,
  offsetBits: number
): AddressBreakdown {
  const tagBits = addressBusBits - indexBits - offsetBits;
  const binaryString = address.toString(2).padStart(addressBusBits, '0');

  const offsetMask = (1 << offsetBits) - 1;
  const offsetValue = address & offsetMask;

  const indexMask = (1 << indexBits) - 1;
  const indexValue = (address >> offsetBits) & indexMask;

  const tagValue = address >> (offsetBits + indexBits);

  return {
    address,
    binaryString,
    tagBits,
    indexBits,
    offsetBits,
    tagValue,
    indexValue,
    offsetValue
  };
}

export function runCacheSimulation(
  accessSequence: number[],
  cacheSizeBytes: number = 64, // e.g. 64 Bytes
  blockSizeBytes: number = 8,  // e.g. 8 Bytes
  mapping: CacheMapping = 'DIRECT_MAPPED',
  addressBusBits: number = 16
): CacheSimulationResult {
  let ways = 1;
  if (mapping === 'SET_ASSOCIATIVE_2') ways = 2;
  if (mapping === 'SET_ASSOCIATIVE_4') ways = 4;
  if (mapping === 'FULLY_ASSOCIATIVE') ways = Math.max(1, cacheSizeBytes / blockSizeBytes);

  const totalLines = Math.max(1, cacheSizeBytes / blockSizeBytes);
  const numSets = Math.max(1, totalLines / ways);

  const offsetBits = Math.round(Math.log2(blockSizeBytes));
  const indexBits = mapping === 'FULLY_ASSOCIATIVE' ? 0 : Math.round(Math.log2(numSets));
  const tagBits = addressBusBits - indexBits - offsetBits;

  // Initialize Cache Sets
  const cacheSets: CacheSet[] = Array.from({ length: numSets }, () => ({
    lines: Array.from({ length: ways }, () => ({
      valid: false,
      tag: -1,
      dataBlock: -1,
      lastAccessTick: 0,
      dirty: false
    }))
  }));

  const steps: CacheAccessStep[] = [];
  let hits = 0;
  let misses = 0;
  let globalTick = 0;

  for (let s = 0; s < accessSequence.length; s++) {
    globalTick++;
    const addr = accessSequence[s];
    const blockNum = Math.floor(addr / blockSizeBytes);
    const breakdown = parseAddress(addr, addressBusBits, indexBits, offsetBits);
    const setIdx = mapping === 'FULLY_ASSOCIATIVE' ? 0 : breakdown.indexValue;
    const targetSet = cacheSets[setIdx];

    // Check hit
    let hitLineIdx = -1;
    for (let w = 0; w < targetSet.lines.length; w++) {
      const line = targetSet.lines[w];
      if (line.valid && line.tag === breakdown.tagValue) {
        hitLineIdx = w;
        break;
      }
    }

    if (hitLineIdx !== -1) {
      hits++;
      targetSet.lines[hitLineIdx].lastAccessTick = globalTick;

      steps.push({
        stepIndex: s,
        address: addr,
        breakdown,
        setIndex: setIdx,
        isHit: true,
        hitLineIndex: hitLineIdx,
        evictedLine: null,
        whyExplanation: `CACHE HIT! Address 0x${addr.toString(16).toUpperCase()} matched Set ${setIdx} with Tag ${breakdown.tagValue}. Word fetched with zero miss penalty.`
      });
    } else {
      misses++;
      // Find invalid line or LRU line
      let replaceLineIdx = targetSet.lines.findIndex(l => !l.valid);
      let evicted: { tag: number; block: number } | null = null;

      if (replaceLineIdx === -1) {
        // LRU replacement
        let oldestTick = Infinity;
        for (let w = 0; w < targetSet.lines.length; w++) {
          if (targetSet.lines[w].lastAccessTick < oldestTick) {
            oldestTick = targetSet.lines[w].lastAccessTick;
            replaceLineIdx = w;
          }
        }
        evicted = {
          tag: targetSet.lines[replaceLineIdx].tag,
          block: targetSet.lines[replaceLineIdx].dataBlock
        };
      }

      // Load new block
      targetSet.lines[replaceLineIdx] = {
        valid: true,
        tag: breakdown.tagValue,
        dataBlock: blockNum,
        lastAccessTick: globalTick,
        dirty: false
      };

      steps.push({
        stepIndex: s,
        address: addr,
        breakdown,
        setIndex: setIdx,
        isHit: false,
        hitLineIndex: undefined,
        evictedLine: evicted,
        whyExplanation: evicted
          ? `CACHE MISS! Tag ${breakdown.tagValue} not found in Set ${setIdx}. Evicted LRU Tag ${evicted.tag} (Block ${evicted.block}) and loaded Block ${blockNum} from main memory.`
          : `CACHE MISS (Compulsory / Cold Start)! Loaded Block ${blockNum} into previously empty line in Set ${setIdx}.`
      });
    }
  }

  const total = accessSequence.length || 1;
  const hitRatio = parseFloat(((hits / total) * 100).toFixed(2));
  const missRatio = parseFloat(((misses / total) * 100).toFixed(2));

  return {
    mapping,
    cacheSizeBytes,
    blockSizeBytes,
    associativityWays: ways,
    numSets,
    tagBits,
    indexBits,
    offsetBits,
    steps,
    hits,
    misses,
    hitRatio,
    missRatio,
    finalState: cacheSets
  };
}

// AMAT Calculation Helper
// AMAT = HitTime + MissRate * MissPenalty
export function calculateAmat(
  hitTimeL1: number,
  missRateL1: number, // 0 to 1
  hitTimeL2: number = 0,
  missRateL2: number = 0, // 0 to 1
  memAccessTime: number = 100
): {
  singleLevelAmat: number;
  multiLevelAmat: number;
  l1Penalty: number;
  amatFormula: string;
} {
  const singleLevelAmat = hitTimeL1 + missRateL1 * memAccessTime;
  const l2Penalty = hitTimeL2 + missRateL2 * memAccessTime;
  const multiLevelAmat = hitTimeL1 + missRateL1 * l2Penalty;

  return {
    singleLevelAmat: parseFloat(singleLevelAmat.toFixed(3)),
    multiLevelAmat: parseFloat(multiLevelAmat.toFixed(3)),
    l1Penalty: parseFloat(l2Penalty.toFixed(3)),
    amatFormula: `AMAT = T_L1 + M_L1 * (T_L2 + M_L2 * T_RAM)`
  };
}
