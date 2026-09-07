// Memory Allocation Algorithm Engine (Contiguous Allocation)

export type AllocationAlgorithm = 'FIRST_FIT' | 'BEST_FIT' | 'WORST_FIT' | 'NEXT_FIT';

export interface MemoryBlock {
  id: number;
  size: number;
  startAddress: number;
  allocatedProcessId: string | null;
  allocatedProcessName: string | null;
  allocatedSize: number;
  internalFragmentation: number;
}

export interface MemoryProcessRequest {
  id: string;
  name: string;
  size: number;
  color?: string;
}

export interface AllocationStep {
  stepIndex: number;
  process: MemoryProcessRequest;
  success: boolean;
  allocatedBlockId: number | null;
  scannedBlockIds: number[];
  internalFragmentation: number;
  whyExplanation: string;
}

export interface MemoryAllocationResult {
  algorithm: AllocationAlgorithm;
  initialBlocks: { id: number; size: number }[];
  processes: MemoryProcessRequest[];
  finalBlocks: MemoryBlock[];
  steps: AllocationStep[];
  totalMemory: number;
  totalAllocated: number;
  totalInternalFragmentation: number;
  totalExternalFragmentation: number;
  unallocatedProcesses: MemoryProcessRequest[];
  utilizationPercentage: number;
}

export function runMemoryAllocation(
  blockSizes: number[],
  processes: MemoryProcessRequest[],
  algorithm: AllocationAlgorithm
): MemoryAllocationResult {
  let currentAddress = 0;
  const blocks: MemoryBlock[] = blockSizes.map((size, idx) => {
    const start = currentAddress;
    currentAddress += size;
    return {
      id: idx,
      size,
      startAddress: start,
      allocatedProcessId: null,
      allocatedProcessName: null,
      allocatedSize: 0,
      internalFragmentation: 0
    };
  });

  const steps: AllocationStep[] = [];
  const unallocatedProcesses: MemoryProcessRequest[] = [];
  let nextFitPointer = 0;

  for (let pIdx = 0; pIdx < processes.length; pIdx++) {
    const p = processes[pIdx];
    const scannedBlocks: number[] = [];
    let chosenBlockIdx = -1;

    if (algorithm === 'FIRST_FIT') {
      for (let b = 0; b < blocks.length; b++) {
        scannedBlocks.push(blocks[b].id);
        if (blocks[b].allocatedProcessId === null && blocks[b].size >= p.size) {
          chosenBlockIdx = b;
          break;
        }
      }
    } else if (algorithm === 'BEST_FIT') {
      let minHole = Infinity;
      for (let b = 0; b < blocks.length; b++) {
        scannedBlocks.push(blocks[b].id);
        if (blocks[b].allocatedProcessId === null && blocks[b].size >= p.size) {
          const hole = blocks[b].size - p.size;
          if (hole < minHole) {
            minHole = hole;
            chosenBlockIdx = b;
          }
        }
      }
    } else if (algorithm === 'WORST_FIT') {
      let maxHole = -1;
      for (let b = 0; b < blocks.length; b++) {
        scannedBlocks.push(blocks[b].id);
        if (blocks[b].allocatedProcessId === null && blocks[b].size >= p.size) {
          const hole = blocks[b].size - p.size;
          if (hole > maxHole) {
            maxHole = hole;
            chosenBlockIdx = b;
          }
        }
      }
    } else if (algorithm === 'NEXT_FIT') {
      const n = blocks.length;
      let count = 0;
      let ptr = nextFitPointer;

      while (count < n) {
        scannedBlocks.push(blocks[ptr].id);
        if (blocks[ptr].allocatedProcessId === null && blocks[ptr].size >= p.size) {
          chosenBlockIdx = ptr;
          nextFitPointer = (ptr + 1) % n;
          break;
        }
        ptr = (ptr + 1) % n;
        count++;
      }
    }

    if (chosenBlockIdx !== -1) {
      const target = blocks[chosenBlockIdx];
      target.allocatedProcessId = p.id;
      target.allocatedProcessName = p.name;
      target.allocatedSize = p.size;
      target.internalFragmentation = target.size - p.size;

      steps.push({
        stepIndex: pIdx,
        process: p,
        success: true,
        allocatedBlockId: target.id,
        scannedBlockIds: scannedBlocks,
        internalFragmentation: target.internalFragmentation,
        whyExplanation: algorithm === 'FIRST_FIT'
          ? `Allocated ${p.name} (${p.size} KB) to Block ${target.id} (${target.size} KB) as the first sufficiently large hole found.`
          : algorithm === 'BEST_FIT'
          ? `Allocated ${p.name} (${p.size} KB) to Block ${target.id} (${target.size} KB) to minimize leftover internal fragmentation (${target.internalFragmentation} KB).`
          : algorithm === 'WORST_FIT'
          ? `Allocated ${p.name} (${p.size} KB) to Block ${target.id} (${target.size} KB) as the largest available hole, leaving ${target.internalFragmentation} KB for subsequent requests.`
          : `Allocated ${p.name} (${p.size} KB) to Block ${target.id} (${target.size} KB) continuing search from previous pointer.`
      });
    } else {
      unallocatedProcesses.push(p);
      steps.push({
        stepIndex: pIdx,
        process: p,
        success: false,
        allocatedBlockId: null,
        scannedBlockIds: scannedBlocks,
        internalFragmentation: 0,
        whyExplanation: `CANNOT ALLOCATE: No single contiguous free memory block is large enough for ${p.name} (${p.size} KB). Total free memory might be sufficient, but fragmented.`
      });
    }
  }

  const totalMemory = blocks.reduce((acc, b) => acc + b.size, 0);
  const totalAllocated = blocks.reduce((acc, b) => acc + b.allocatedSize, 0);
  const totalInternal = blocks.reduce((acc, b) => acc + b.internalFragmentation, 0);

  // External fragmentation: total free space across unallocated blocks when an allocation failed
  const freeBlocks = blocks.filter(b => b.allocatedProcessId === null);
  const totalExternal = unallocatedProcesses.length > 0
    ? freeBlocks.reduce((acc, b) => acc + b.size, 0)
    : 0;

  const utilization = totalMemory > 0
    ? parseFloat(((totalAllocated / totalMemory) * 100).toFixed(2))
    : 0;

  return {
    algorithm,
    initialBlocks: blockSizes.map((sz, id) => ({ id, size: sz })),
    processes,
    finalBlocks: blocks,
    steps,
    totalMemory,
    totalAllocated,
    totalInternalFragmentation: totalInternal,
    totalExternalFragmentation: totalExternal,
    unallocatedProcesses,
    utilizationPercentage: utilization
  };
}
