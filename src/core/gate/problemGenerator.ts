// Dynamic GATE Numerical Problem Generator
import type { GeneratedNumericalProblem } from './types';

export function generateRandomProblem(topicCategory?: string): GeneratedNumericalProblem {
  const generators = [
    generateTlbEmatProblem,
    generateCacheAmatProblem,
    generatePagingAddressProblem,
    generateDiskSchedulingProblem,
    generateSemaphoreValueProblem,
    generateCpuSchedulingProblem,
    generateMultiLevelPagingProblem
  ];

  if (topicCategory) {
    if (topicCategory.includes('tlb')) return generateTlbEmatProblem();
    if (topicCategory.includes('cache')) return generateCacheAmatProblem();
    if (topicCategory.includes('paging')) return generatePagingAddressProblem();
    if (topicCategory.includes('disk')) return generateDiskSchedulingProblem();
    if (topicCategory.includes('semaphore')) return generateSemaphoreValueProblem();
    if (topicCategory.includes('cpu')) return generateCpuSchedulingProblem();
  }

  const chosen = generators[Math.floor(Math.random() * generators.length)];
  return chosen();
}

// 1. TLB Effective Memory Access Time (EMAT)
export function generateTlbEmatProblem(): GeneratedNumericalProblem {
  const hitRatioPercent = [80, 85, 90, 95, 98][Math.floor(Math.random() * 5)];
  const h = hitRatioPercent / 100;
  const tlbTime = [10, 15, 20, 25][Math.floor(Math.random() * 4)];
  const memTime = [100, 120, 150, 200][Math.floor(Math.random() * 4)];

  // Single-level page table:
  // On TLB Hit: tlbTime + memTime (1 memory access to fetch data)
  // On TLB Miss: tlbTime + memTime (page table) + memTime (data) = tlbTime + 2 * memTime
  // EMAT = h * (tlbTime + memTime) + (1 - h) * (tlbTime + 2 * memTime)
  //      = tlbTime + memTime + (1 - h) * memTime = tlbTime + (2 - h) * memTime
  const emat = parseFloat((tlbTime + (2 - h) * memTime).toFixed(2));

  return {
    id: `num_tlb_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    topic: 'Virtual Memory & Paging',
    title: 'Effective Memory Access Time (EMAT) with TLB',
    problemStatement: `Consider a system with a single-level page table where physical memory access time is ${memTime} ns and TLB access time is ${tlbTime} ns. If the TLB hit ratio is ${hitRatioPercent}%, calculate the Effective Memory Access Time (EMAT) in nanoseconds (ns).`,
    parameters: { hitRatioPercent, tlbTime, memTime },
    correctAnswer: emat,
    tolerance: 0.1,
    formula: `EMAT = h * (t_TLB + t_MEM) + (1 - h) * (t_TLB + 2 * t_MEM)`,
    hints: [
      `Hint 1: If the page table entry is in the TLB (Hit), we only make 1 main memory access (to read the actual word/data). Time = t_TLB + t_MEM.`,
      `Hint 2: If TLB misses, we first access the TLB, then access main memory to read the Page Table, and then access main memory again for data. Time = t_TLB + 2 * t_MEM.`,
      `Hint 3: Combine with probabilities: EMAT = ${h} * (${tlbTime} + ${memTime}) + ${parseFloat((1 - h).toFixed(2))} * (${tlbTime} + ${2 * memTime}).`
    ],
    fullSolution: [
      `Step 1: Identify given values:`,
      `  - TLB Access Time (t_TLB) = ${tlbTime} ns`,
      `  - Main Memory Access Time (t_MEM) = ${memTime} ns`,
      `  - TLB Hit Ratio (h) = ${hitRatioPercent}% = ${h}`,
      `  - TLB Miss Ratio (1 - h) = ${(1 - h).toFixed(2)}`,
      `Step 2: Compute access time on TLB Hit:`,
      `  T_hit = t_TLB + t_MEM = ${tlbTime} + ${memTime} = ${tlbTime + memTime} ns`,
      `Step 3: Compute access time on TLB Miss (single-level page table requires 1 extra memory lookup for PTE):`,
      `  T_miss = t_TLB + 2 * t_MEM = ${tlbTime} + 2 * ${memTime} = ${tlbTime + 2 * memTime} ns`,
      `Step 4: Calculate weighted average:`,
      `  EMAT = ${h} * (${tlbTime + memTime}) + ${(1 - h).toFixed(2)} * (${tlbTime + 2 * memTime}) = ${emat} ns`
    ],
    commonTrap: `Forgetting that on a TLB miss, TWO main memory accesses are required (one for the Page Table Entry and one for the actual data byte).`
  };
}

// 2. Cache AMAT (Average Memory Access Time)
export function generateCacheAmatProblem(): GeneratedNumericalProblem {
  const l1HitTime = [1, 2, 4][Math.floor(Math.random() * 3)];
  const l1MissRatePercent = [5, 8, 10, 15][Math.floor(Math.random() * 4)];
  const m1 = l1MissRatePercent / 100;
  const l2HitTime = [8, 10, 15][Math.floor(Math.random() * 3)];
  const l2MissRatePercent = [20, 25, 30][Math.floor(Math.random() * 3)];
  const m2 = l2MissRatePercent / 100;
  const memTime = [100, 120, 150][Math.floor(Math.random() * 3)];

  // AMAT = T_L1 + M_L1 * (T_L2 + M_L2 * T_RAM)
  const l2Penalty = l2HitTime + m2 * memTime;
  const amat = parseFloat((l1HitTime + m1 * l2Penalty).toFixed(2));

  return {
    id: `num_amat_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    topic: 'Cache Memory Hierarchy',
    title: 'Two-Level Cache AMAT Calculation',
    problemStatement: `A processor has a two-level cache hierarchy with the following parameters:
- L1 Cache: Hit Time = ${l1HitTime} ns, Miss Rate = ${l1MissRatePercent}%
- L2 Cache: Hit Time = ${l2HitTime} ns, Local Miss Rate = ${l2MissRatePercent}%
- Main Memory: Access Time = ${memTime} ns
Calculate the Average Memory Access Time (AMAT) in ns.`,
    parameters: { l1HitTime, l1MissRatePercent, l2HitTime, l2MissRatePercent, memTime },
    correctAnswer: amat,
    tolerance: 0.1,
    formula: `AMAT = T_L1 + MissRate_L1 * (T_L2 + MissRate_L2 * T_RAM)`,
    hints: [
      `Hint 1: First find the Miss Penalty seen by L1. Whenever L1 misses, we look up L2.`,
      `Hint 2: The access time at L2 is: T_L2 + MissRate_L2 * T_RAM.`,
      `Hint 3: Plug L2 penalty into AMAT = ${l1HitTime} + ${m1} * (${l2HitTime} + ${m2} * ${memTime}).`
    ],
    fullSolution: [
      `Step 1: Given values:`,
      `  - T_L1 = ${l1HitTime} ns, M_L1 = ${m1}`,
      `  - T_L2 = ${l2HitTime} ns, M_L2 = ${m2}`,
      `  - T_RAM = ${memTime} ns`,
      `Step 2: Compute L1 Miss Penalty (which is AMAT of L2):`,
      `  Penalty_L1 = T_L2 + M_L2 * T_RAM = ${l2HitTime} + (${m2} * ${memTime}) = ${l2Penalty.toFixed(2)} ns`,
      `Step 3: Compute overall AMAT:`,
      `  AMAT = T_L1 + M_L1 * Penalty_L1 = ${l1HitTime} + (${m1} * ${l2Penalty.toFixed(2)}) = ${amat} ns`
    ],
    commonTrap: `Confusing Local Miss Rate with Global Miss Rate. Here local miss rate of L2 is given, so multiply by M_L2 directly.`
  };
}

// 3. Virtual Memory Address Translation
export function generatePagingAddressProblem(): GeneratedNumericalProblem {
  const pageSizeKB = [2, 4, 8][Math.floor(Math.random() * 3)];
  const pageSizeBytes = pageSizeKB * 1024;
  const offsetBits = Math.log2(pageSizeBytes);
  const virtualAddressBits = [16, 20, 24][Math.floor(Math.random() * 3)];

  const virtualAddress = Math.floor(Math.random() * Math.min(65535, Math.pow(2, virtualAddressBits) - 1));
  const pageNum = Math.floor(virtualAddress / pageSizeBytes);
  const offset = virtualAddress % pageSizeBytes;

  return {
    id: `num_paging_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    topic: 'Paging & Address Translation',
    title: 'Virtual Address Decomposition (Page Number & Offset)',
    problemStatement: `A system uses paging with a page size of ${pageSizeKB} KB and a ${virtualAddressBits}-bit virtual address space.
For the virtual address ${virtualAddress} (in decimal), what is the Page Number (in decimal)?`,
    parameters: { pageSizeKB, virtualAddressBits, virtualAddress },
    correctAnswer: pageNum,
    tolerance: 0,
    formula: `Page Number = floor(Virtual Address / Page Size), Offset = Virtual Address mod Page Size`,
    hints: [
      `Hint 1: Convert page size to bytes: ${pageSizeKB} KB = ${pageSizeBytes} bytes.`,
      `Hint 2: Since each page holds ${pageSizeBytes} bytes, Page Number = floor(${virtualAddress} / ${pageSizeBytes}).`,
      `Hint 3: Number of offset bits = log2(${pageSizeBytes}) = ${offsetBits} bits.`
    ],
    fullSolution: [
      `Step 1: Page size in bytes = ${pageSizeKB} * 1024 = ${pageSizeBytes} Bytes = 2^${offsetBits} Bytes.`,
      `Step 2: Offset requires ${offsetBits} bits.`,
      `Step 3: Page Number = floor(${virtualAddress} / ${pageSizeBytes}) = ${pageNum}.`,
      `Step 4: The offset within the page is ${virtualAddress} % ${pageSizeBytes} = ${offset}.`
    ],
    commonTrap: `Forgetting to convert Kilobytes (KB) to Bytes (multiplying by 1024, not 1000).`
  };
}

// 4. Disk Scheduling Seek Movement
export function generateDiskSchedulingProblem(): GeneratedNumericalProblem {
  const initialHead = 53;
  const queue = [98, 183, 37, 122, 14, 124, 65, 67];
  // SSTF from 53:
  // 53 -> 65 (dist 12) -> 67 (dist 2) -> 37 (dist 30) -> 14 (dist 23) -> 98 (dist 84) -> 122 (dist 24) -> 124 (dist 2) -> 183 (dist 59)
  // Total = 12 + 2 + 30 + 23 + 84 + 24 + 2 + 59 = 236
  const totalMovement = 236;

  return {
    id: `num_disk_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    topic: 'Disk Scheduling',
    title: 'SSTF Total Head Movement',
    problemStatement: `A disk system has requests for tracks: [${queue.join(', ')}]. The read/write head is currently positioned at track ${initialHead}. Using the Shortest Seek Time First (SSTF) scheduling algorithm, what is the total head movement (in cylinders)?`,
    parameters: { initialHead, queue },
    correctAnswer: totalMovement,
    tolerance: 0,
    formula: `Total Movement = sum(|track_{i+1} - track_i|)`,
    hints: [
      `Hint 1: At each step, find the pending request with the minimal absolute distance |target - current|.`,
      `Hint 2: Starting at 53: closest is 65 (|65-53| = 12). From 65: closest is 67 (|67-65| = 2).`,
      `Hint 3: From 67, closest is 37 (|67-37| = 30), then 14 (|37-14| = 23), then 98 (|98-14| = 84), then 122, 124, 183.`
    ],
    fullSolution: [
      `Step 1: Trajectory path under SSTF:`,
      `  53 -> 65 : dist = 12`,
      `  65 -> 67 : dist = 2`,
      `  67 -> 37 : dist = 30`,
      `  37 -> 14 : dist = 23`,
      `  14 -> 98 : dist = 84`,
      `  98 -> 122 : dist = 24`,
      `  122 -> 124 : dist = 2`,
      `  124 -> 183 : dist = 59`,
      `Step 2: Total movement = 12 + 2 + 30 + 23 + 84 + 24 + 2 + 59 = ${totalMovement} cylinders.`
    ],
    commonTrap: `Selecting the absolute lowest track instead of the closest track relative to the CURRENT head position.`
  };
}

// 5. Counting Semaphore Arithmetic
export function generateSemaphoreValueProblem(): GeneratedNumericalProblem {
  const initialVal = [7, 10, 12, 15][Math.floor(Math.random() * 4)];
  const pOps = [14, 18, 20][Math.floor(Math.random() * 3)]; // P / wait() decrements
  const vOps = [6, 8, 10][Math.floor(Math.random() * 3)];   // V / signal() increments

  // Value = initial - P + V
  const finalVal = initialVal - pOps + vOps;

  return {
    id: `num_sem_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    topic: 'Process Synchronization',
    title: 'Counting Semaphore Operations',
    problemStatement: `A counting semaphore S is initialized to ${initialVal}. Subsequently, ${pOps} wait (P) operations and ${vOps} signal (V) operations are completed on S. What is the resulting value of S?`,
    parameters: { initialVal, pOps, vOps },
    correctAnswer: finalVal,
    tolerance: 0,
    formula: `S_final = S_initial - P_operations + V_operations`,
    hints: [
      `Hint 1: Recall that wait(S) or P(S) decrements semaphore value by 1: S = S - 1.`,
      `Hint 2: Signal(S) or V(S) increments semaphore value by 1: S = S + 1.`,
      `Hint 3: S_final = ${initialVal} - ${pOps} + ${vOps}.`
    ],
    fullSolution: [
      `Step 1: A P (wait) operation decrements the semaphore counter by 1. Total decrement = ${pOps}.`,
      `Step 2: A V (signal) operation increments the semaphore counter by 1. Total increment = ${vOps}.`,
      `Step 3: Resulting value = ${initialVal} - ${pOps} + ${vOps} = ${finalVal}.`,
      `Note: If the value is negative (e.g. ${finalVal}), it indicates that |${finalVal}| processes are currently blocked in the semaphore waiting queue.`
    ],
    commonTrap: `Confusing P and V: P (Proberen) is wait/decrement; V (Verhogen) is signal/increment.`
  };
}

// 6. CPU Scheduling Non-preemptive Average Waiting Time
export function generateCpuSchedulingProblem(): GeneratedNumericalProblem {
  // P1: AT=0, BT=4; P2: AT=1, BT=3; P3: AT=2, BT=1; P4: AT=3, BT=2
  // FCFS:
  // P1: CT=4, TAT=4, WT=0
  // P2: CT=7, TAT=6, WT=3
  // P3: CT=8, TAT=6, WT=5
  // P4: CT=10, TAT=7, WT=5
  // Avg WT = (0 + 3 + 5 + 5)/4 = 3.25
  const avgWt = 3.25;

  return {
    id: `num_cpu_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    topic: 'CPU Scheduling',
    title: 'FCFS Average Waiting Time',
    problemStatement: `Consider 4 processes with (Arrival Time, Burst Time) in ms:
P1: (0, 4)
P2: (1, 3)
P3: (2, 1)
P4: (3, 2)
Using the First-Come First-Served (FCFS) scheduling algorithm, what is the Average Waiting Time in ms?`,
    parameters: {
      processes: [
        { name: 'P1', at: 0, bt: 4 },
        { name: 'P2', at: 1, bt: 3 },
        { name: 'P3', at: 2, bt: 1 },
        { name: 'P4', at: 3, bt: 2 }
      ]
    },
    correctAnswer: avgWt,
    tolerance: 0.05,
    formula: `Waiting Time = Turnaround Time - Burst Time = Completion Time - Arrival Time - Burst Time`,
    hints: [
      `Hint 1: Construct the Gantt chart: P1 runs [0 to 4], P2 runs [4 to 7], P3 runs [7 to 8], P4 runs [8 to 10].`,
      `Hint 2: Find Completion Time (CT) for each: P1=4, P2=7, P3=8, P4=10.`,
      `Hint 3: TAT = CT - AT. P1: 4-0=4; P2: 7-1=6; P3: 8-2=6; P4: 10-3=7. WT = TAT - BT.`
    ],
    fullSolution: [
      `Step 1: Gantt Chart execution:`,
      `  [0] P1 [4] P2 [7] P3 [8] P4 [10]`,
      `Step 2: Calculate metrics:`,
      `  - P1: CT=4, TAT=4-0=4, WT=4-4=0`,
      `  - P2: CT=7, TAT=7-1=6, WT=6-3=3`,
      `  - P3: CT=8, TAT=8-2=6, WT=6-1=5`,
      `  - P4: CT=10, TAT=10-3=7, WT=7-2=5`,
      `Step 3: Average Waiting Time = (0 + 3 + 5 + 5) / 4 = 13 / 4 = 3.25 ms.`
    ],
    commonTrap: `Calculating Waiting Time as Completion Time minus Burst Time, while omitting the Arrival Time subtraction.`
  };
}

// 7. Multi-Level Page Table Size
export function generateMultiLevelPagingProblem(): GeneratedNumericalProblem {
  const pteBytes = 4; // 4 Bytes
  const pageSizeKB = 4; // 4 KB
  const pageSizeBytes = pageSizeKB * 1024; // 4096
  const entriesPerTable = pageSizeBytes / pteBytes; // 1024 entries
  const bitsPerLevel = Math.log2(entriesPerTable); // 10 bits

  return {
    id: `num_multilevel_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    topic: 'Paging & Memory Management',
    title: 'Bits per Level in Multi-Level Paging',
    problemStatement: `In a 32-bit architecture using 2-level paging, the page size is ${pageSizeKB} KB and each Page Table Entry (PTE) is ${pteBytes} Bytes. If each page table must fit exactly into a single page frame, how many bits are used for the Level-1 (outer) page table index?`,
    parameters: { pteBytes, pageSizeKB },
    correctAnswer: bitsPerLevel,
    tolerance: 0,
    formula: `Entries per Page Table = Page Size / PTE Size, Bits per Level = log2(Entries per Page Table)`,
    hints: [
      `Hint 1: Calculate the size of a page frame in bytes: ${pageSizeKB} KB = ${pageSizeBytes} Bytes.`,
      `Hint 2: Find how many PTEs fit in one frame: ${pageSizeBytes} / ${pteBytes} = ${entriesPerTable} entries.`,
      `Hint 3: The number of index bits required to address ${entriesPerTable} entries is log2(${entriesPerTable}).`
    ],
    fullSolution: [
      `Step 1: Size of one page table frame = ${pageSizeKB} * 1024 = 4096 Bytes.`,
      `Step 2: Number of Page Table Entries per page table = 4096 Bytes / 4 Bytes = 1024 entries = 2^10.`,
      `Step 3: To index 1024 entries in the page table, exactly 10 bits are required for the Level-1 index (and 10 bits for Level-2, with 12 bits for byte offset in a 32-bit address: 10 + 10 + 12 = 32 bits).`
    ],
    commonTrap: `Using 12 bits for the page table index by confusing page offset bits (12 bits) with the page table index bits (10 bits).`
  };
}
