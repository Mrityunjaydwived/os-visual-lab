import type { ModuleConceptGuide } from './types';

export const MODULES_7_TO_12: Record<number, ModuleConceptGuide> = {
  7: {
    moduleNumber: 7,
    inDepthTheory: [
      {
        sectionTitle: 'The Deadlock Problem & The 4 Coffman Conditions',
        content: 'A Deadlock is a state in which two or more competing processes are permanently blocked because each process holds a resource that another process needs, and neither can proceed. All four Coffman conditions must hold simultaneously for a deadlock to occur:',
        bulletPoints: [
          'Mutual Exclusion: At least one resource must be held in a non-shareable mode (only one process can use it at a time).',
          'Hold and Wait: A process must be holding at least one resource and simultaneously waiting to acquire additional resources held by other processes.',
          'No Preemption: Resources cannot be forcibly confiscated from a process; they can only be released voluntarily after the process finishes its task.',
          'Circular Wait: A closed chain of processes exists {P0, P1, ..., Pn} such that P0 is waiting for a resource held by P1, P1 is waiting for P2, and Pn is waiting for P0.'
        ]
      },
      {
        sectionTitle: 'Deadlock Handling Strategies',
        content: 'Operating systems handle deadlocks via four primary paradigms: Prevention, Avoidance, Detection & Recovery, and Ignorance (Ostrich Algorithm).',
        bulletPoints: [
          'Deadlock Prevention: Design protocol constraints to ensure at least one Coffman condition can never hold (e.g. Havender\'s total ordering of resources prevents Circular Wait).',
          'Deadlock Avoidance: The OS inspects every resource request dynamically. If granting the request leaves the system in a Safe State, it is granted; otherwise, the process must wait (Banker\'s Algorithm).',
          'Deadlock Detection & Recovery: Allow deadlocks to occur, periodically construct a Wait-for Graph to detect cycles, and recover by aborting processes or preempting resources.',
          'Ostrich Algorithm: Stick your head in the sand and assume deadlocks are rare (used by general-purpose OS like Linux and Windows due to avoidance performance overhead).'
        ]
      },
      {
        sectionTitle: 'Banker\'s Algorithm & Safe States',
        content: 'Dijkstra\'s Banker\'s Algorithm is a deadlock avoidance algorithm for systems with multiple instances of each resource type. A state is Safe if there exists at least one Safe Sequence <P0, P1, ..., Pn> such that for each Pi, its remaining Need can be satisfied by the currently Available resources plus the resources already held by all preceding processes Pj (j < i).',
        bulletPoints: [
          'Data Structures: Available[m] vector, Max[n][m] matrix, Allocation[n][m] matrix, Need[n][m] matrix where Need[i][j] = Max[i][j] - Allocation[i][j].',
          'Safety Test: Repeatedly find an uncompleted process Pi whose Need <= Work. If found, add its Allocation to Work (Work = Work + Allocation_i), mark it finished, and repeat. If all processes finish, the state is SAFE.'
        ]
      }
    ],
    comparisons: [
      {
        title: 'Comparison: Deadlock Prevention vs Avoidance vs Detection',
        headers: ['Strategy', 'Deadlock Prevention', 'Deadlock Avoidance', 'Deadlock Detection'],
        rows: [
          ['Approach', 'Impose static design constraints to eliminate Coffman conditions.', 'Dynamically evaluate every resource request before granting (Safe state check).', 'Grant requests freely; run periodic detection algorithm to detect cycles.'],
          ['Resource Utilization', 'Lowest: severely restricts how resources are requested (causes underutilization).', 'Moderate: requires processes to declare maximum resource needs in advance.', 'Highest: no prior declaration needed, but recovery costs (aborts) can be severe.'],
          ['Runtime Overhead', 'Low runtime overhead (enforced at compile time or protocol level).', 'High runtime overhead: O(m * n^2) calculation on every single resource request.', 'Moderate: detection algorithm runs only periodically or when CPU utilization drops.']
        ]
      },
      {
        title: 'Comparison: Safe State vs Unsafe State vs Deadlock State',
        headers: ['State', 'Definition', 'Deadlock Implication'],
        rows: [
          ['Safe State', 'There exists at least one sequence to finish all processes without deadlock.', 'Guaranteed 100% Deadlock-Free.'],
          ['Unsafe State', 'No guaranteed safe sequence exists; a deadlock COULD happen if worst-case requests arrive.', 'Not necessarily deadlocked yet, but can transition into deadlock.'],
          ['Deadlock State', 'Two or more processes are actively blocked in a circular wait.', 'Actively deadlocked; zero progress possible without intervention.']
        ]
      }
    ],
    conceptToSimulationGuide: [
      {
        simulationElement: 'Banker\'s Algorithm Matrix & Safety Vector Sandbox',
        osKernelEquivalent: 'POSIX pthread_mutex lock dependency graphs & lockdep kernel checker',
        whyItMatters: 'Interactively proves whether an immediate resource allocation request keeps the system in a safe state.'
      },
      {
        simulationElement: 'Resource Allocation Graph (RAG) Cycle Detector',
        osKernelEquivalent: 'Wait-For-Graph cycle analysis in transaction managers',
        whyItMatters: 'Demonstrates why cycles in single-instance graphs guarantee deadlock, while in multi-instance graphs they only indicate potential deadlock.'
      }
    ],
    workedNumericals: [
      {
        title: 'Banker\'s Algorithm Safe State & Request Grant Verification',
        problemStatement: 'Consider a system with 5 processes (P0 to P4) and 3 resource types (A, B, C) with total instances: A = 10, B = 5, C = 7.\nCurrent Allocation:\n- P0: (0, 1, 0), Max: (7, 5, 3)\n- P1: (2, 0, 0), Max: (3, 2, 2)\n- P2: (3, 0, 2), Max: (9, 0, 2)\n- P3: (2, 1, 1), Max: (2, 2, 2)\n- P4: (0, 0, 2), Max: (4, 3, 3)\n\n(a) Compute the Need matrix and the Available vector.\n(b) Is the current state safe? Find a valid safe execution sequence.\n(c) If P1 requests (1, 0, 2), can the request be granted immediately?',
        givenData: {
          'Total Resources': 'A = 10, B = 5, C = 7',
          'Processes': '5 (P0 to P4)',
          'Resource Types': '3 (A, B, C)'
        },
        formulasUsed: [
          'Need[i][j] = Max[i][j] - Allocation[i][j]',
          'Available = Total - Sum(Allocation across all processes)',
          'Safety Condition: Need_i <= Work -> Work = Work + Allocation_i'
        ],
        stepByStepSolution: [
          'Step 1: Compute Total Allocated: A = 0+2+3+2+0 = 7; B = 1+0+0+1+0 = 2; C = 0+0+2+1+2 = 5.',
          'Step 2: Available = Total - Allocated = (10-7, 5-2, 7-5) = (3, 3, 2).',
          'Step 3: Compute Need Matrix (Max - Allocation):\n- Need(P0) = (7, 4, 3)\n- Need(P1) = (1, 2, 2)\n- Need(P2) = (6, 0, 0)\n- Need(P3) = (0, 1, 1)\n- Need(P4) = (4, 3, 1)',
          'Step 4: Execute Safety Algorithm with Work = (3, 3, 2):\n- Can P0 run? Need (7,4,3) > (3,3,2) -> No.\n- Can P1 run? Need (1,2,2) <= (3,3,2) -> Yes! P1 finishes. New Work = (3,3,2) + (2,0,0) = (5, 3, 2).\n- Can P3 run? Need (0,1,1) <= (5,3,2) -> Yes! P3 finishes. New Work = (5,3,2) + (2,1,1) = (7, 4, 3).\n- Can P4 run? Need (4,3,1) <= (7,4,3) -> Yes! P4 finishes. New Work = (7,4,3) + (0,0,2) = (7, 4, 5).\n- Can P0 run? Need (7,4,3) <= (7,4,5) -> Yes! P0 finishes. New Work = (7,4,5) + (0,1,0) = (7, 5, 5).\n- Can P2 run? Need (6,0,0) <= (7,5,5) -> Yes! P2 finishes. New Work = (7,5,5) + (3,0,2) = (10, 5, 7).',
          'Step 5: All processes finish! Valid Safe Sequence = <P1, P3, P4, P0, P2>. The system is SAFE.',
          'Step 6: Evaluate Request(P1) = (1, 0, 2):\n- Check 1: Request <= Need(P1)? (1, 0, 2) <= (1, 2, 2) -> True.\n- Check 2: Request <= Available? (1, 0, 2) <= (3, 3, 2) -> True.\n- Speculative allocation: New Available = (3,3,2) - (1,0,2) = (2, 3, 0).\n- New Need(P1) = (0, 2, 0), New Alloc(P1) = (3, 0, 2).\n- Safety check on speculative state: With Work = (2, 3, 0), can any process run? P0 needs (7,4,3) > Work; P1 needs (0,2,0) <= (2,3,0) -> P1 runs, Work becomes (2,3,0)+(3,0,2) = (5,3,2). Then P3 runs, etc. A safe sequence <P1, P3, P4, P0, P2> still exists!'
        ],
        finalAnswer: '(a) Available = (3, 3, 2); (b) Safe Sequence: <P1, P3, P4, P0, P2>; (c) Yes, Request(P1) can be granted immediately.',
        gateYear: 'GATE CS 2018 / 2021'
      },
      {
        title: 'Minimum Resources to Guarantee Deadlock-Free Execution',
        problemStatement: 'A system shares a single pool of identical resources among N processes. Each process has a maximum requirement of M resources. What is the mathematical condition and minimum number of total resources R required to guarantee that the system will never experience a deadlock?',
        givenData: {
          'Number of processes': 'N',
          'Maximum resource requirement per process': 'M'
        },
        formulasUsed: [
          'Worst-case allocation before any process can finish = N * (M - 1)',
          'To ensure at least one process can finish and release its resources: R >= N * (M - 1) + 1'
        ],
        stepByStepSolution: [
          'Step 1: Consider the worst-case deadlock scenario where every single process is allocated M - 1 resources.',
          'Step 2: In this state, every process is waiting for 1 additional resource to complete.',
          'Step 3: Total resources allocated across all N processes in this worst-case state = N * (M - 1).',
          'Step 4: If the system has only N * (M - 1) resources, all processes are stuck holding M - 1 and waiting for 1, causing a permanent deadlock.',
          'Step 5: If the system possesses at least 1 additional resource, that resource can be granted to any one process, allowing it to reach M, finish execution, and release all its M resources back to the pool.',
          'Step 6: Therefore, the minimum resources required to prevent deadlock = N * (M - 1) + 1.'
        ],
        finalAnswer: 'Minimum Resources R = N * (M - 1) + 1',
        gateYear: 'GATE CS 2013 / 2017'
      }
    ],
    conceptualQuestions: [
      {
        question: 'Is an Unsafe State in Banker\'s Algorithm synonymous with a Deadlock State? Explain the precise distinction.',
        category: 'GATE CS',
        explanation: 'No! An Unsafe State is NOT necessarily a deadlock state. An unsafe state simply means that the operating system can no longer GUARANTEE that all processes will finish if every process simultaneously requests its maximum declared resource limit. However, in real execution, processes frequently finish and release resources without ever requesting their maximum limits. Therefore, a system can enter an unsafe state and return to a safe state without ever experiencing an actual deadlock. All deadlock states are unsafe, but not all unsafe states are deadlocked.',
        commonTrap: 'Assuming that entering an unsafe state means the system has crashed into an active deadlock.',
        keyTakeaway: 'Deadlock is a subset of Unsafe states: Safe -> Unsafe -> Deadlock.'
      },
      {
        question: 'How does Havender\'s Hierarchical Resource Ordering eliminate Circular Wait in Deadlock Prevention?',
        category: 'Core Concept',
        explanation: 'Havender\'s protocol assigns a unique global integer index to every resource type (e.g. F: R -> {1, 2, ..., k}). The OS strictly enforces that a process can only request a resource R_b if F(R_b) > F(R_a), where R_a is the highest-indexed resource currently held by that process. This mathematical ordering makes circular wait topologically impossible: a circular chain would require F(R0) < F(R1) < ... < F(Rn) < F(R0), which is a contradiction because no integer can be strictly less than itself.',
        commonTrap: 'Thinking processes must acquire all resources at once. Hierarchical ordering allows dynamic requests as long as index increases.',
        keyTakeaway: 'Strict resource indexing prevents circular dependency cycles in the resource allocation graph.'
      }
    ]
  },
  8: {
    moduleNumber: 8,
    inDepthTheory: [
      {
        sectionTitle: 'Logical vs Physical Address Spaces & The MMU',
        content: 'An address generated by the CPU is a Logical (or Virtual) Address. The address seen by the memory hardware bus is the Physical Address. The hardware device mapping virtual addresses to physical addresses at runtime is the Memory Management Unit (MMU).',
        bulletPoints: [
          'Base Register (Relocation Register): Holds the smallest physical address of the process partition.',
          'Limit Register: Specifies the exact range/size of the logical address space.',
          'Hardware Protection: The CPU hardware compares every logical address: if logical address >= Limit, an MMU trap (Segmentation Fault) is raised; otherwise, Physical Address = Logical Address + Base Register.'
        ]
      },
      {
        sectionTitle: 'Contiguous Memory Allocation: Fixed vs Dynamic Partitioning',
        content: 'In contiguous memory allocation, each process is contained in a single contiguous section of memory.',
        bulletPoints: [
          'Fixed (Static) Partitioning: RAM is divided into fixed-size partitions at boot time. Simple, but suffers from Internal Fragmentation (unused RAM inside an allocated block).',
          'Dynamic (Variable) Partitioning: The OS allocates exact block sizes requested by incoming processes from free memory holes. Suffers from External Fragmentation (total free RAM satisfies request, but is split into non-contiguous fragments).'
        ]
      },
      {
        sectionTitle: 'Dynamic Storage Allocation Strategies: First Fit, Best Fit, Worst Fit',
        content: 'When a process arrives requiring N bytes of memory, the OS searches the free hole list:',
        bulletPoints: [
          'First Fit: Allocates the FIRST hole that is large enough. Fast search; stops at the first match.',
          'Best Fit: Allocates the SMALLEST hole that is big enough. Produces the smallest leftover hole, but searches the entire list unless sorted by size.',
          'Worst Fit: Allocates the LARGEST hole available. Leaves the largest remaining hole, which is often large enough to be useful to another process.',
          'Compaction: Moving allocated memory blocks to coalesce all free holes into one large contiguous block. Only possible if relocation is dynamic at execution time.'
        ]
      }
    ],
    comparisons: [
      {
        title: 'Comparison: Internal Fragmentation vs External Fragmentation',
        headers: ['Dimension', 'Internal Fragmentation', 'External Fragmentation'],
        rows: [
          ['Definition', 'Allocated memory block is larger than the requested memory; unused space sits inside the partition.', 'Total free memory across RAM is large enough, but non-contiguous; cannot satisfy contiguous request.'],
          ['Occurrence', 'Occurs in Fixed Partitioning and Paging (within the final page of a process).', 'Occurs in Dynamic (Variable) Partitioning and pure Segmentation.'],
          ['Solution', 'Reduce partition/page size; dynamic allocation.', 'Paging, Segmentation, or dynamic Compaction (shuffling memory).']
        ]
      },
      {
        title: 'Comparison: First Fit vs Best Fit vs Worst Fit',
        headers: ['Algorithm', 'Search Strategy', 'Leftover Hole Characteristic'],
        rows: [
          ['First Fit', 'Fastest: Scans list and selects first hole >= size.', 'Arbitrary leftover size; fast and memory-efficient in simulations.'],
          ['Best Fit', 'Scans entire list to find hole with minimum (Hole - Request >= 0).', 'Leaves tiny slivers of leftover RAM that are useless to any future process.'],
          ['Worst Fit', 'Scans entire list to find largest hole (maximum Hole - Request).', 'Leaves large usable leftover holes, but ruins large holes needed by large jobs.']
        ]
      }
    ],
    conceptToSimulationGuide: [
      {
        simulationElement: 'Interactive Memory Allocation Map & Hole Inspector',
        osKernelEquivalent: 'Linux buddy allocator / glibc malloc arenas',
        whyItMatters: 'Visually shows the generation of tiny unusable memory holes in Best Fit vs large usable fragments in Worst Fit.'
      },
      {
        simulationElement: 'Base & Limit Relocation Register Validator',
        osKernelEquivalent: 'x86 segment limit checks and CR3 page base register',
        whyItMatters: 'Demonstrates hardware address translation and bounds checking protection traps.'
      }
    ],
    workedNumericals: [
      {
        title: 'Memory Allocation Trace: First Fit vs Best Fit vs Worst Fit',
        problemStatement: 'Given five memory partitions of sizes: 100 KB, 500 KB, 200 KB, 300 KB, and 600 KB (in order). Trace how four processes of sizes 212 KB, 417 KB, 112 KB, and 426 KB are allocated using:\n(a) First Fit\n(b) Best Fit\n(c) Worst Fit\nDetermine which algorithm makes the most efficient use of memory and whether any process must wait.',
        givenData: {
          'Partitions': '[100 KB, 500 KB, 200 KB, 300 KB, 600 KB]',
          'Processes': 'P1 = 212 KB, P2 = 417 KB, P3 = 112 KB, P4 = 426 KB'
        },
        formulasUsed: [
          'First Fit: First block with size >= request',
          'Best Fit: Block with min(size - request) where size >= request',
          'Worst Fit: Block with max(size - request) where size >= request'
        ],
        stepByStepSolution: [
          'Step 1: First Fit Trace:\n- P1 (212 KB): First block >= 212 is 500 KB -> Allocated to 500 KB (rem: 288 KB).\n- P2 (417 KB): Next block >= 417 is 600 KB -> Allocated to 600 KB (rem: 183 KB).\n- P3 (112 KB): First block >= 112 is 200 KB -> Allocated to 200 KB (rem: 88 KB).\n- P4 (426 KB): Remaining blocks: 100, 288, 88, 300, 183. None is >= 426 KB -> P4 MUST WAIT!',
          'Step 2: Best Fit Trace:\n- P1 (212 KB): Best block is 300 KB (diff: 88 KB) -> Allocated to 300 KB.\n- P2 (417 KB): Best block is 500 KB (diff: 83 KB) -> Allocated to 500 KB.\n- P3 (112 KB): Best block is 200 KB (diff: 88 KB) -> Allocated to 200 KB.\n- P4 (426 KB): Best block is 600 KB (diff: 174 KB) -> Allocated to 600 KB!\n- In Best Fit, ALL 4 PROCESSES ARE SUCCESSFULLY ALLOCATED!',
          'Step 3: Worst Fit Trace:\n- P1 (212 KB): Largest block is 600 KB -> Allocated to 600 KB (rem: 388 KB).\n- P2 (417 KB): Largest block is 500 KB -> Allocated to 500 KB (rem: 83 KB).\n- P3 (112 KB): Largest remaining block is 388 KB -> Allocated to 388 KB (rem: 276 KB).\n- P4 (426 KB): Remaining blocks: 100, 83, 200, 300, 276. None is >= 426 KB -> P4 MUST WAIT!'
        ],
        finalAnswer: 'Best Fit succeeds for all processes. First Fit and Worst Fit both leave P4 waiting.',
        gateYear: 'GATE CS 2010 / 2016'
      }
    ],
    conceptualQuestions: [
      {
        question: 'Why does Best Fit often create worse external fragmentation in practice compared to First Fit or Worst Fit?',
        category: 'Core Concept',
        explanation: 'Best Fit specifically selects the partition whose size is closest to the requested size. Consequently, the remaining leftover hole is the absolute smallest possible sliver of memory (e.g. 4 bytes, 12 bytes). These tiny residual slivers are too small to satisfy any subsequent process memory requests, and quickly accumulate throughout physical RAM as unusable fragmented holes.',
        commonTrap: 'Assuming Best Fit is always the "best" algorithm because of its name.',
        keyTakeaway: 'Best Fit generates tiny unusable fragments; First Fit is typically faster and causes less total fragmentation.'
      },
      {
        question: 'Under what architectural conditions can Memory Compaction be performed to eliminate external fragmentation?',
        category: 'GATE CS',
        explanation: 'Compaction (moving allocated memory blocks to coalesce free holes into one large block) can ONLY be performed if memory relocation is dynamic and performed at RUNTIME (Execution Time). If addresses are bound at compile time or load time, memory addresses are hard-coded into the machine instructions and cannot be shifted in RAM without corrupting pointers. Runtime dynamic relocation uses hardware Base and Limit registers in the MMU; moving a process simply requires copying its bytes in RAM and updating its single Base Register.',
        commonTrap: 'Believing that compaction can be applied to any system regardless of address binding method.',
        keyTakeaway: 'Compaction requires dynamic runtime address relocation via hardware base registers.'
      }
    ]
  },
  9: {
    moduleNumber: 9,
    inDepthTheory: [
      {
        sectionTitle: 'Paging Fundamentals & Hardware Address Translation',
        content: 'Paging is a memory management scheme that eliminates external fragmentation by decoupling logical address space from physical contiguous memory. Physical memory is broken into fixed-sized blocks called Frames. Logical memory is broken into blocks of the exact same size called Pages (typically 4 KB).',
        bulletPoints: [
          'Address Translation: A logical address generated by the CPU is divided into Page Number (p) and Page Offset (d). Physical Address = (Frame Number f, Offset d).',
          'Page Table: Maintained per-process in kernel memory. Maps Page Number p -> Frame Number f.',
          'Zero External Fragmentation: Any free frame can be allocated to any page of any process. Only internal fragmentation exists (at most Page Size - 1 bytes in the final page).'
        ]
      },
      {
        sectionTitle: 'Translation Lookaside Buffer (TLB) & Effective Access Time',
        content: 'Because page tables reside in main memory (DRAM), every data access requires TWO physical memory references: one to read the page table entry (PTE) and one to read the actual byte. To eliminate this 50% performance penalty, modern CPUs include a fast hardware associative cache called the Translation Lookaside Buffer (TLB).',
        bulletPoints: [
          'TLB Hit: Page number is found in TLB cache (takes ~1 ns). Frame number is retrieved immediately.',
          'TLB Miss: Page number is missing in TLB. The MMU must perform a Page Table Walk in DRAM, load the entry into TLB, and then access the data.',
          'Effective Memory Access Time (EMAT): EMAT = h * (t_TLB + t_MEM) + (1 - h) * (t_TLB + 2 * t_MEM) where h is TLB hit ratio.'
        ]
      },
      {
        sectionTitle: 'Multilevel Paging & Inverted Page Tables',
        content: 'On 32-bit and 64-bit architectures, single-level page tables become excessively large (e.g. 4 MB per process on 32-bit, terabytes on 64-bit). Hierarchical (Multilevel) Paging pages the page table itself, allocating inner page tables only for memory regions that are actively mapped.',
        bulletPoints: [
          'Inverted Page Table: Has exactly one entry per physical frame in RAM (rather than per virtual page per process), indexed by Frame Number. Drastically reduces memory overhead, but requires hashing to search efficiently.'
        ]
      }
    ],
    comparisons: [
      {
        title: 'Comparison: Paging vs Segmentation',
        headers: ['Property', 'Paging', 'Segmentation'],
        rows: [
          ['Block Size', 'Fixed size (e.g. 4 KB), determined strictly by CPU hardware architecture.', 'Variable size, determined by logical user program units (functions, stack, heap).'],
          ['Fragmentation', 'Suffers ONLY from Internal Fragmentation in the last page (no external).', 'Suffers from External Fragmentation (no internal fragmentation).'],
          ['Programmer Visibility', 'Completely transparent to programmer; managed purely by OS and MMU.', 'Visible to programmer/compiler as distinct named segments.'],
          ['Sharing & Protection', 'Harder to share arbitrary data structures because pages don\'t match logical boundaries.', 'Easy: Code segment or shared library can be shared via a single segment table entry.']
        ]
      },
      {
        title: 'Comparison: Single-Level vs Two-Level Paging',
        headers: ['Metric', 'Single-Level Paging', 'Two-Level Paging'],
        rows: [
          ['Memory Overhead for Sparse Processes', 'Massive: Entire page table (e.g. 4 MB) must reside contiguously in RAM even if process uses 8 KB.', 'Minimal: Only the top-level Page Directory (4 KB) plus active 2nd-level tables are allocated.'],
          ['Memory Access Latency on TLB Miss', 'Requires 1 additional DRAM access to read PTE.', 'Requires 2 additional DRAM accesses (Outer Page Directory + Inner Page Table).']
        ]
      }
    ],
    conceptToSimulationGuide: [
      {
        simulationElement: 'Virtual Address Slicer (VPN & Offset Bits)',
        osKernelEquivalent: 'x86-64 4-Level Paging (PML4 -> PDPT -> PD -> PT)',
        whyItMatters: 'Interactively shows how high-order bits index page table directories while low-order bits pass unchanged as byte offsets.'
      },
      {
        simulationElement: 'TLB Hit / Miss Latency Calculator',
        osKernelEquivalent: 'Hardware MMU associative TLB cache and CR3 page directory register',
        whyItMatters: 'Calculates the real-time degradation of EMAT as TLB hit ratio falls from 99% to 80%.'
      }
    ],
    workedNumericals: [
      {
        title: 'Effective Memory Access Time (EMAT) with Two-Level Paging',
        problemStatement: 'A computer system uses two-level paging with a TLB. Memory specs:\n- TLB access time = 20 ns\n- Main Memory access time = 100 ns\n- TLB Hit Ratio = 90%\nCalculate:\n(a) Effective Memory Access Time (EMAT) when TLB hits.\n(b) Effective Memory Access Time (EMAT) when TLB misses.\n(c) Overall Average Effective Memory Access Time.',
        givenData: {
          'TLB Access Time t_tlb': '20 ns',
          'Memory Access Time t_mem': '100 ns',
          'TLB Hit Ratio h': '0.90 (90%)',
          'Paging Levels': '2 levels'
        },
        formulasUsed: [
          'EMAT_hit = t_tlb + t_mem',
          'EMAT_miss = t_tlb + (Levels * t_mem) + t_mem = t_tlb + (Levels + 1) * t_mem',
          'EMAT_overall = h * EMAT_hit + (1 - h) * EMAT_miss'
        ],
        stepByStepSolution: [
          'Step 1: Compute access time on TLB Hit:\n- Look up TLB: 20 ns.\n- Access physical frame in DRAM: 100 ns.\n- EMAT_hit = 20 + 100 = 120 ns.',
          'Step 2: Compute access time on TLB Miss in 2-level paging:\n- Look up TLB (miss): 20 ns.\n- Access Outer Page Table in DRAM: 100 ns.\n- Access Inner Page Table in DRAM: 100 ns.\n- Access final Physical Data Frame in DRAM: 100 ns.\n- EMAT_miss = 20 + 100 + 100 + 100 = 320 ns.',
          'Step 3: Compute Overall EMAT:\n- EMAT = 0.90 * (120 ns) + (1 - 0.90) * (320 ns)\n- EMAT = 108 ns + 0.10 * 320 ns = 108 + 32 = 140 ns.'
        ],
        finalAnswer: '(a) EMAT_hit = 120 ns; (b) EMAT_miss = 320 ns; (c) Overall EMAT = 140 ns',
        gateYear: 'GATE CS 2015 / 2019'
      },
      {
        title: '32-Bit Paging Architecture Table Size Calculation',
        problemStatement: 'A 32-bit processor has a virtual address space of 4 GB with 4 KB pages. Each Page Table Entry (PTE) takes 4 bytes. Calculate:\n(a) Number of bits used for Page Offset.\n(b) Number of bits used for Virtual Page Number (VPN).\n(c) Total number of pages in the logical address space.\n(d) Total size of a single-level page table.',
        givenData: {
          'Address Bits': '32 bits',
          'Page Size': '4 KB = 4,096 bytes = 2^12 bytes',
          'PTE Size': '4 bytes'
        },
        formulasUsed: [
          'Offset Bits d = log2(Page Size)',
          'VPN Bits p = Total Address Bits - d',
          'Total Pages = 2^p',
          'Page Table Size = Total Pages * PTE Size'
        ],
        stepByStepSolution: [
          'Step 1: Page Size = 4 KB = 2^12 bytes. Therefore, Offset d = 12 bits.',
          'Step 2: VPN Bits p = 32 - 12 = 20 bits.',
          'Step 3: Total Pages = 2^20 = 1,048,576 pages (1M pages).',
          'Step 4: Page Table Size = 2^20 entries * 4 bytes/entry = 4 * 2^20 bytes = 4 MB.'
        ],
        finalAnswer: '(a) Offset = 12 bits; (b) VPN = 20 bits; (c) Pages = 1,048,576; (d) Single-Level Page Table Size = 4 MB per process',
        gateYear: 'GATE CS 2011 / 2017'
      }
    ],
    conceptualQuestions: [
      {
        question: 'Why does a single-level page table on a 32-bit system require 4 MB of contiguous memory per process even if the process only executes a tiny 8 KB program?',
        category: 'GATE CS',
        explanation: 'Because a single-level page table is indexed directly by the Virtual Page Number (VPN). The hardware MMU computes: PTE_address = PTBR + (VPN * sizeof(PTE)). If the table were not allocated contiguously for all possible 2^20 VPNs, indexing would point to invalid or arbitrary memory addresses. Thus, the entire 4 MB table must exist in contiguous physical RAM. Multilevel paging solves this by creating an outer Page Directory where only populated address regions allocate inner 4 KB page tables.',
        commonTrap: 'Thinking page tables grow dynamically in single-level paging. Direct array indexing requires a fixed contiguous allocation.',
        keyTakeaway: 'Direct array indexing requires contiguous allocation, motivating multi-level hierarchical paging.'
      },
      {
        question: 'What is the role of the Dirty (Modified) Bit in a Page Table Entry (PTE) during page replacement?',
        category: 'Core Concept',
        explanation: 'The Dirty Bit is set to 1 by the CPU MMU hardware whenever a store/write instruction modifies the content of that physical page. When the page replacement algorithm selects a victim page to evict: (1) If Dirty Bit == 0 (Clean), the page on disk is identical to memory; the OS simply discards the frame without writing to disk. (2) If Dirty Bit == 1 (Dirty), the page has been modified; the OS MUST write the 4 KB page back to the swap/backing store on disk, incurring a massive I/O delay. The Dirty bit halves page-out I/O overhead on clean pages.',
        commonTrap: 'Assuming all evicted pages must be written back to disk.',
        keyTakeaway: 'The dirty bit avoids writing unmodified pages back to disk, drastically reducing swap I/O.'
      }
    ]
  },
  10: {
    moduleNumber: 10,
    inDepthTheory: [
      {
        sectionTitle: 'Virtual Memory & Demand Paging Mechanics',
        content: 'Virtual Memory separates user logical memory from physical memory, allowing the execution of processes that are only partially in memory. Demand Paging implements a "lazy swapper": pages are loaded into physical RAM only when they are accessed during instruction execution.',
        bulletPoints: [
          'Valid/Invalid Bit: In the Page Table, 1 indicates the page is valid and currently in physical RAM. 0 indicates the page is either invalid or currently on the secondary backing store (disk swap).',
          'Page Fault Trap: When the CPU accesses a page whose valid bit is 0, the MMU generates a Page Fault exception (Trap 14 on x86).',
          'Page Fault Service Sequence: 1. OS traps into kernel. 2. Verify logical address validity. 3. Find free physical frame. 4. Issue disk I/O via DMA to read page from swap. 5. Update PTE with frame number and set Valid = 1. 6. Restart the faulting instruction.'
        ]
      },
      {
        sectionTitle: 'Thrashing & Working Set Model',
        content: 'If a process does not have enough frames to hold its active working set of pages, it constantly page faults. Thrashing occurs when a system spends more time paging (swapping pages in and out of disk) than executing useful user instructions.',
        bulletPoints: [
          'Thrashing Collapse: When CPU utilization drops because processes are stalled waiting for disk I/O, a naive OS scheduler increases the degree of multiprogramming by admitting more processes, stealing more frames, worsening page faults, and causing CPU utilization to plummet to near zero.',
          'Working Set Model (Peter Denning): Defines the Working Set WS(t, delta) as the set of unique pages referenced in the most recent delta time window. If total working set demand > total physical frames (Sum(WS_i) > D), thrashing is imminent.',
          'Page Fault Frequency (PFF): Sets upper and lower thresholds for page fault rates. If rate exceeds upper bound, allocate more frames; if rate falls below lower bound, reclaim frames.'
        ]
      }
    ],
    comparisons: [
      {
        title: 'Comparison: Pure Demand Paging vs Pre-paging',
        headers: ['Parameter', 'Pure Demand Paging', 'Pre-paging'],
        rows: [
          ['Startup Behavior', 'Process starts with zero pages in RAM; first instruction immediately triggers a page fault.', 'OS predicts and pre-loads initial working set pages before execution starts.'],
          ['Overhead', 'High initial page fault storm causing slow startup latency.', 'May waste RAM and I/O loading pages that are never actually referenced by the program.']
        ]
      },
      {
        title: 'Comparison: Global vs Local Page Replacement',
        headers: ['Policy', 'Global Page Replacement', 'Local Page Replacement'],
        rows: [
          ['Scope', 'A process can select a victim frame from the set of ALL frames, even those owned by other processes.', 'Each process can only select replacement victims from its own allocated pool of frames.'],
          ['Thrashing Propagation', 'High: One thrashing process steals frames from healthy processes, spreading thrashing system-wide.', 'Low: Thrashing is quarantined to the offending process without dragging down other processes.']
        ]
      }
    ],
    conceptToSimulationGuide: [
      {
        simulationElement: 'Thrashing Cliff & CPU Utilization Curve',
        osKernelEquivalent: 'Linux kswapd kernel daemon / oom-killer (Out of Memory Killer)',
        whyItMatters: 'Interactively shows how increasing degree of multiprogramming past the threshold causes throughput to collapse.'
      },
      {
        simulationElement: 'Page Fault State Machine Tracker',
        osKernelEquivalent: 'Linux do_page_fault() kernel handler and swap cache',
        whyItMatters: 'Traces the 6-step lifecycle from hardware Trap 14 to disk DMA completion and instruction restart.'
      }
    ],
    workedNumericals: [
      {
        title: 'Maximum Allowable Page Fault Rate for Performance Bound',
        problemStatement: 'A computer system has a normal memory access time of 100 ns. When a page fault occurs, handling the fault and reading the page from disk takes 8 ms (8,000,000 ns). What is the maximum allowable page fault rate p such that the effective memory access time does not degrade by more than 10% (i.e. EMAT <= 110 ns)?',
        givenData: {
          'Normal Memory Access Time t_mem': '100 ns',
          'Page Fault Service Time t_fault': '8,000,000 ns',
          'Max Allowable EMAT': '110 ns (10% degradation over 100 ns)'
        },
        formulasUsed: [
          'EMAT = (1 - p) * t_mem + p * t_fault',
          'p <= (EMAT_max - t_mem) / (t_fault - t_mem)'
        ],
        stepByStepSolution: [
          'Step 1: Set up the equation: (1 - p) * 100 + p * 8,000,000 <= 110.',
          'Step 2: Expand terms: 100 - 100*p + 8,000,000*p <= 110.',
          'Step 3: Simplify: 7,999,900 * p <= 10.',
          'Step 4: Solve for p: p <= 10 / 7,999,900 = 1 / 799,990 ~= 0.00000125.',
          'Step 5: Convert to scientific notation / percentage: p <= 1.25 * 10^-6 (or at most 1 page fault every 800,000 memory accesses).'
        ],
        finalAnswer: 'Maximum Allowable Page Fault Rate p <= 1.25 * 10^-6 (0.000125%)',
        gateYear: 'GATE CS 2014 / 2018'
      }
    ],
    conceptualQuestions: [
      {
        question: 'Why must CPU hardware support "Restartable Instructions" for Demand Paging to function properly?',
        category: 'GATE CS',
        explanation: 'In demand paging, a page fault exception can occur in the middle of executing ANY instruction (e.g. fetching an operand from memory). When the page fault occurs, the CPU must abort the instruction midway, save the architectural state, trap to the OS to fetch the missing page from disk, and then RE-EXECUTE the exact same instruction from scratch as if the fault never occurred. If instructions modify CPU registers before faulting (e.g. auto-increment/decrement instructions like MOV (R1)+, (R2)+ where R1 is incremented before accessing R2 which faults), the CPU hardware must maintain undo registers to roll back R1 to its pre-instruction state.',
        commonTrap: 'Thinking page faults only occur before an instruction begins. A fault can occur on operand fetch midway.',
        keyTakeaway: 'Hardware must be able to roll back partially executed instructions to restart cleanly.'
      },
      {
        question: 'What is Thrashing, and what actions does an operating system kernel take when it detects thrashing?',
        category: 'Core Concept',
        explanation: 'Thrashing occurs when the sum of working set demands of all active processes exceeds the total physical memory available (Sum(WS) > RAM). The system spends virtually all its time swapping pages in and out of disk, while the CPU sits idle waiting for I/O. To cure thrashing, the OS MUST decrease the degree of multiprogramming: it suspends (swaps out to disk) one or more entire processes, reclaiming all their frames and distributing them to the remaining active processes so they can achieve their working sets and finish.',
        commonTrap: 'Thinking the OS should add more processes to increase CPU utilization. That worsens thrashing catastrophically.',
        keyTakeaway: 'The cure for thrashing is to suspend processes and reduce the degree of multiprogramming.'
      }
    ]
  },
  11: {
    moduleNumber: 11,
    inDepthTheory: [
      {
        sectionTitle: 'Page Replacement Algorithms: FIFO, Optimal, and LRU',
        content: 'When a page fault occurs and no physical memory frames are free, the OS must select a victim frame to page out to swap. The quality of a page replacement algorithm is measured by how few page faults it produces on a given reference string.',
        bulletPoints: [
          'FIFO (First-In First-Out): The simplest algorithm. Replaces the oldest page loaded in memory. Suffers from Belady\'s Anomaly.',
          'Optimal (OPT / MIN): Replaces the page that will not be used for the longest period of time in the future. Provably produces the lowest possible page fault rate. Impossible to implement in practice because it requires clairvoyant knowledge of future references; used as a theoretical benchmark.',
          'LRU (Least Recently Used): Replaces the page that has not been accessed for the longest period of time in the past. Uses the recent past as an approximation of the near future. Belongs to the class of Stack Algorithms; mathematically immune to Belady\'s Anomaly.'
        ]
      },
      {
        sectionTitle: 'Belady\'s Anomaly & Stack Algorithms',
        content: 'Common intuition suggests that giving a process more physical frames should always decrease (or maintain) the number of page faults. In 1969, Laszlo Belady proved that under FIFO, increasing the number of physical frames can actually INCREASE the total number of page faults! This phenomenon is known as Belady\'s Anomaly.',
        bulletPoints: [
          'Stack Algorithm Definition: An algorithm where the set of pages in memory for N frames is ALWAYS a strict subset of the pages in memory for N+1 frames (M(N) subset M(N+1)).',
          'Immunity: Stack algorithms (LRU, Optimal, LFU) can NEVER suffer from Belady\'s Anomaly.',
          'Non-stack algorithms (FIFO, Second Chance) can exhibit Belady\'s Anomaly because the oldest page in memory has no mathematical correlation with frequency or recency of use.'
        ]
      },
      {
        sectionTitle: 'Approximations of LRU: Clock (Second Chance) Algorithm',
        content: 'True LRU requires hardware counters or a doubly-linked stack updated on EVERY single memory reference, which is prohibitively expensive. Operating systems approximate LRU using reference bits.',
        bulletPoints: [
          'Clock Algorithm: Frames are arranged in a circular buffer with a pointer hand. Each frame has a 1-bit Reference Bit (set to 1 by MMU on access).',
          'Clock Sweep: When a victim is needed, the hand inspects the current frame. If Reference Bit == 1, clear it to 0 and advance hand (second chance). If Reference Bit == 0, select this frame as the victim!'
        ]
      }
    ],
    comparisons: [
      {
        title: 'Comparison: FIFO vs LRU vs Optimal Page Replacement',
        headers: ['Criteria', 'FIFO', 'LRU', 'Optimal (OPT)'],
        rows: [
          ['Selection Basis', 'Oldest arrival time in memory.', 'Longest time since last reference.', 'Longest time until next future reference.'],
          ['Belady\'s Anomaly', 'Suffers from Belady\'s Anomaly.', 'Immune (Stack Algorithm).', 'Immune (Stack Algorithm).'],
          ['Implementability', 'Very easy (simple queue).', 'Complex/Expensive (requires hardware support or Clock approximation).', 'Impossible in practice (benchmark only).']
        ]
      },
      {
        title: 'Comparison: Clock (Second Chance) vs Pure LRU',
        headers: ['Feature', 'Clock (Second Chance)', 'Pure LRU'],
        rows: [
          ['Hardware Overhead', 'Only 1 reference bit per frame set by MMU.', 'Requires timestamp register on every read/write or doubly linked list manipulation.'],
          ['Memory Access Penalty', 'Zero overhead on cache hit (hardware sets 1 bit).', 'High overhead unless supported by dedicated associative cache logic.'],
          ['Accuracy', 'Good approximation of LRU.', 'Exact LRU ordering.']
        ]
      }
    ],
    conceptToSimulationGuide: [
      {
        simulationElement: 'Frame Stack History & Belady\'s Anomaly Comparator',
        osKernelEquivalent: 'Linux active/inactive LRU page lists (lru_gen in modern kernels)',
        whyItMatters: 'Side-by-side comparison showing FIFO page faults increasing from 9 to 10 when frames increase from 3 to 4.'
      },
      {
        simulationElement: 'Circular Clock Hand Sweep Visualizer',
        osKernelEquivalent: 'Linux page reclaiming kswapd daemon second-chance scan',
        whyItMatters: 'Demonstrates clearing reference bits to 0 on the first sweep and evicting on the second sweep.'
      }
    ],
    workedNumericals: [
      {
        title: 'Full Page Fault Comparison: FIFO vs LRU vs Optimal',
        problemStatement: 'Trace the page replacement behavior for the reference string:\n7, 0, 1, 2, 0, 3, 0, 4, 2, 3\nusing 3 physical frames initially empty. Compute the number of page faults and page hits for:\n(a) FIFO\n(b) LRU\n(c) Optimal',
        givenData: {
          'Reference String': '7, 0, 1, 2, 0, 3, 0, 4, 2, 3 (10 references)',
          'Number of Frames': '3 frames'
        },
        formulasUsed: [
          'Page Fault occurs when referenced page is NOT present in any frame',
          'Hit Ratio = (Total Hits / Total References) * 100%'
        ],
        stepByStepSolution: [
          'Step 1: FIFO Trace (3 frames):\n- Ref 7: Fault [7, -, -]\n- Ref 0: Fault [7, 0, -]\n- Ref 1: Fault [7, 0, 1]\n- Ref 2: Fault (evict 7) [2, 0, 1]\n- Ref 0: HIT   [2, 0, 1]\n- Ref 3: Fault (evict 0) [2, 3, 1]\n- Ref 0: Fault (evict 1) [2, 3, 0]\n- Ref 4: Fault (evict 2) [4, 3, 0]\n- Ref 2: Fault (evict 3) [4, 2, 0]\n- Ref 3: Fault (evict 0) [4, 2, 3]\nTotal FIFO Faults = 9 faults (1 hit).',
          'Step 2: LRU Trace (3 frames):\n- Ref 7: Fault [7, -, -]\n- Ref 0: Fault [7, 0, -]\n- Ref 1: Fault [7, 0, 1]\n- Ref 2: Fault (evict 7, least recently used) [2, 0, 1]\n- Ref 0: HIT   [2, 0, 1] (0 is now most recently used)\n- Ref 3: Fault (evict 1) [2, 0, 3]\n- Ref 0: HIT   [2, 0, 3]\n- Ref 4: Fault (evict 2) [4, 0, 3]\n- Ref 2: Fault (evict 3) [4, 0, 2]\n- Ref 3: Fault (evict 0) [4, 3, 2]\nTotal LRU Faults = 8 faults (2 hits).',
          'Step 3: Optimal Trace (3 frames):\n- Ref 7: Fault [7, -, -]\n- Ref 0: Fault [7, 0, -]\n- Ref 1: Fault [7, 0, 1]\n- Ref 2: Fault (evict 7, never used again) [2, 0, 1]\n- Ref 0: HIT   [2, 0, 1]\n- Ref 3: Fault (evict 1, never used again) [2, 0, 3]\n- Ref 0: HIT   [2, 0, 3]\n- Ref 4: Fault (evict 2, next used at t=8; 0 used at t=6; 3 at t=9 -> evict 3) [2, 0, 4]\n- Ref 2: HIT   [2, 0, 4]\n- Ref 3: Fault (evict 4) [2, 0, 3]\nTotal Optimal Faults = 6 faults (4 hits).'
        ],
        finalAnswer: 'FIFO = 9 faults; LRU = 8 faults; Optimal = 6 faults',
        gateYear: 'GATE CS 2012 / 2016'
      },
      {
        title: 'Mathematical Proof of Belady\'s Anomaly in FIFO',
        problemStatement: 'Demonstrate Belady\'s Anomaly using the classic reference string: 1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5 under FIFO by calculating the page faults for:\n(a) 3 physical frames\n(b) 4 physical frames',
        givenData: {
          'Reference String': '1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5 (12 references)',
          'Frame Counts': '3 frames vs 4 frames'
        },
        formulasUsed: [
          'FIFO eviction selects the oldest loaded frame'
        ],
        stepByStepSolution: [
          'Step 1: Trace for 3 Frames under FIFO:\n- Ref 1: Fault [1, -, -]\n- Ref 2: Fault [1, 2, -]\n- Ref 3: Fault [1, 2, 3]\n- Ref 4: Fault (evict 1) [4, 2, 3]\n- Ref 1: Fault (evict 2) [4, 1, 3]\n- Ref 2: Fault (evict 3) [4, 1, 2]\n- Ref 5: Fault (evict 4) [5, 1, 2]\n- Ref 1: HIT   [5, 1, 2]\n- Ref 2: HIT   [5, 1, 2]\n- Ref 3: Fault (evict 1) [5, 3, 2]\n- Ref 4: Fault (evict 2) [5, 3, 4]\n- Ref 5: HIT   [5, 3, 4]\nTotal Page Faults for 3 Frames = 9 faults.',
          'Step 2: Trace for 4 Frames under FIFO:\n- Ref 1: Fault [1, -, -, -]\n- Ref 2: Fault [1, 2, -, -]\n- Ref 3: Fault [1, 2, 3, -]\n- Ref 4: Fault [1, 2, 3, 4]\n- Ref 1: HIT   [1, 2, 3, 4]\n- Ref 2: HIT   [1, 2, 3, 4]\n- Ref 5: Fault (evict 1) [5, 2, 3, 4]\n- Ref 1: Fault (evict 2) [5, 1, 3, 4]\n- Ref 2: Fault (evict 3) [5, 1, 2, 4]\n- Ref 3: Fault (evict 4) [5, 1, 2, 3]\n- Ref 4: Fault (evict 5) [4, 1, 2, 3]\n- Ref 5: Fault (evict 1) [4, 5, 2, 3]\nTotal Page Faults for 4 Frames = 10 faults.',
          'Step 3: Comparison: Increasing frames from 3 to 4 increased faults from 9 to 10. This proves Belady\'s Anomaly.'
        ],
        finalAnswer: '3 Frames = 9 faults; 4 Frames = 10 faults. Belady\'s Anomaly is proven.',
        gateYear: 'GATE CS 2008 / 2017'
      }
    ],
    conceptualQuestions: [
      {
        question: 'What is a "Stack Algorithm" in virtual memory, and why are stack algorithms mathematically guaranteed to never suffer from Belady\'s Anomaly?',
        category: 'GATE CS',
        explanation: 'A page replacement algorithm is classified as a Stack Algorithm if the set of pages resident in physical memory for N frames is ALWAYS a strict subset of the set of pages resident in memory for N+1 frames (i.e. S(N, t) subset S(N+1, t) for all t). In algorithms like LRU, adding an extra (N+1)-th frame simply stores the (N+1)-th most recently used page without altering the relative ordering of the top N pages. Therefore, any page reference that was a hit with N frames is GUARANTEED to also be a hit with N+1 frames. Hence, page faults can never increase with more frames.',
        commonTrap: 'Thinking stack algorithms use an actual CPU call stack. It refers to the inclusion property of the mathematical set.',
        keyTakeaway: 'The inclusion property guarantees that hits in N frames remain hits in N+1 frames.'
      },
      {
        question: 'How does the Enhanced Second-Chance (Clock) algorithm prioritize page replacement using both the Reference Bit and the Dirty Bit?',
        category: 'Technical Interview',
        explanation: 'The Enhanced Second Chance algorithm evaluates each page based on an ordered pair: (Reference Bit, Dirty Bit), creating 4 priority classes:\n1. (0, 0): Neither recently used nor modified (BEST candidate to replace; clean and unreferenced).\n2. (0, 1): Not recently used, but modified (requires I/O write before replacing).\n3. (1, 0): Recently used, but clean (likely to be used again soon).\n4. (1, 1): Recently used and modified (WORST candidate to replace).\nThe algorithm scans the circular queue searching for the lowest non-empty class, clearing reference bits on passed pages. This policy minimizes expensive disk swap writes.',
        commonTrap: 'Confusing the order of (0,1) and (1,0). A clean page is always preferred over a dirty page to avoid disk I/O.',
        keyTakeaway: 'Prioritizing (0,0) evictions saves expensive disk writes while approximating LRU.'
      }
    ]
  },
  12: {
    moduleNumber: 12,
    inDepthTheory: [
      {
        sectionTitle: 'Segmentation: The Logical User View of Memory',
        content: 'While paging divides memory into uniform, mechanical 4 KB blocks, Segmentation divides memory into logical units that match a programmer\'s view of a program: code segment, stack segment, heap segment, and symbol table.',
        bulletPoints: [
          'Logical Address: Composed of a two-tuple <Segment Number s, Offset d>.',
          'Segment Table: Maps each segment number to its Segment Base (starting physical address) and Segment Limit (length of the segment).',
          'Hardware Protection: The MMU verifies: if Offset d >= Limit, trap (Addressing Exception); otherwise, Physical Address = Base + d.'
        ]
      },
      {
        sectionTitle: 'Paged Segmentation (Hybrid Architecture)',
        content: 'Pure segmentation suffers severely from External Fragmentation: as variable-sized segments are allocated and freed, physical memory becomes fragmented. To solve this, architectures like the Intel x86-32 implement Paged Segmentation.',
        bulletPoints: [
          'Architecture: Logical address is first translated into a linear address via the Segment Table, and the linear address is subsequently translated into a physical address via Page Tables.',
          'Benefits: Programmer retains logical modular protection and sharing (code vs data segments) while the operating system eliminates external fragmentation via physical 4 KB paging.'
        ]
      }
    ],
    comparisons: [
      {
        title: 'Comparison: Pure Segmentation vs Paged Segmentation',
        headers: ['Dimension', 'Pure Segmentation', 'Paged Segmentation (Intel x86)'],
        rows: [
          ['Physical Allocation', 'Segments must be loaded as contiguous physical memory blocks.', 'Segments are broken into non-contiguous 4 KB pages.'],
          ['External Fragmentation', 'Severe: Free memory is fragmented into odd-sized holes.', 'Zero: All physical memory is allocated in uniform 4 KB frames.'],
          ['Hardware Complexity', 'Requires Base and Limit registers.', 'Requires Segment Table + Two-Level Page Tables in MMU.']
        ]
      }
    ],
    conceptToSimulationGuide: [
      {
        simulationElement: 'Segment Table Lookup & Limit Comparator',
        osKernelEquivalent: 'x86 Global Descriptor Table (GDT) and Local Descriptor Table (LDT)',
        whyItMatters: 'Visually shows the bound check d < Limit and highlights the exact illegal address that triggers a Segmentation Fault.'
      }
    ],
    workedNumericals: [
      {
        title: 'Segment Address Translation & Bounds Violation Check',
        problemStatement: 'Given the following Segment Table:\n- Segment 0: Base = 219, Limit = 600\n- Segment 1: Base = 2300, Limit = 14\n- Segment 2: Base = 90, Limit = 100\n- Segment 3: Base = 1327, Limit = 580\n- Segment 4: Base = 1952, Limit = 96\n\nTranslate the following logical addresses into physical addresses, or indicate an addressing trap:\n(a) (0, 430)\n(b) (1, 10)\n(c) (2, 500)\n(d) (3, 400)\n(e) (4, 112)',
        givenData: {
          'Segment Table': '5 segments (0 to 4) with Base and Limit'
        },
        formulasUsed: [
          'Condition: If Offset d < Limit -> Physical Address = Base + d',
          'If Offset d >= Limit -> TRAP (Addressing Violation / Segmentation Fault)'
        ],
        stepByStepSolution: [
          'Step 1: Evaluate (0, 430):\n- Limit(0) = 600. Since 430 < 600, valid!\n- Physical Address = Base(0) + d = 219 + 430 = 649.',
          'Step 2: Evaluate (1, 10):\n- Limit(1) = 14. Since 10 < 14, valid!\n- Physical Address = Base(1) + d = 2300 + 10 = 2310.',
          'Step 3: Evaluate (2, 500):\n- Limit(2) = 100. Offset 500 >= 100 -> TRAP! Illegal memory access (Segmentation Fault).',
          'Step 4: Evaluate (3, 400):\n- Limit(3) = 580. Since 400 < 580, valid!\n- Physical Address = Base(3) + d = 1327 + 400 = 1727.',
          'Step 5: Evaluate (4, 112):\n- Limit(4) = 96. Offset 112 >= 96 -> TRAP! Illegal memory access.'
        ],
        finalAnswer: '(a) PA = 649; (b) PA = 2310; (c) TRAP; (d) PA = 1727; (e) TRAP',
        gateYear: 'GATE CS 2011 / 2018'
      }
    ],
    conceptualQuestions: [
      {
        question: 'Why is sharing code (e.g. shared dynamic libraries) and access protection much more natural in Segmentation than in Paging?',
        category: 'Core Concept',
        explanation: 'In Segmentation, program components are organized along semantic boundaries (e.g. Code segment, Data segment, Stack segment). An entire code library occupies a distinct segment. To protect or share it, the OS simply sets the Read-Only flag in that segment descriptor or points another process segment table entry to the same base address. In Paging, however, code and data are arbitrarily sliced across 4 KB boundaries; a function or variable might start on one page and end on another, making it messy to enforce protections without padding.',
        commonTrap: 'Assuming paging provides cleaner semantic security. Paging only provides mechanical isolation.',
        keyTakeaway: 'Segments align with logical program boundaries, making access permissions natural.'
      },
      {
        question: 'Explain why pure Segmentation suffers from External Fragmentation, while pure Paging suffers from Internal Fragmentation.',
        category: 'GATE CS',
        explanation: 'In pure Segmentation, segments vary in size based on programmer code size (e.g., a function segment of 3.4 KB, a data segment of 18 KB). As processes terminate and new segments are loaded, free physical memory is broken into arbitrary irregularly-sized holes (External Fragmentation). In pure Paging, physical memory is strictly allocated in uniform, fixed-size blocks (4 KB frames). Any frame can satisfy any page request, so external fragmentation is zero. However, if a process needs 5 KB, it is given two 4 KB pages (8 KB total), wasting 3 KB inside the second frame (Internal Fragmentation).',
        commonTrap: 'Confusing internal vs external fragmentation sources.',
        keyTakeaway: 'Variable-size allocations cause external fragmentation; fixed-size allocations cause internal fragmentation.'
      }
    ]
  }
};
