// Conceptual Simulation Knowledge & Mathematical Engines for OS Visual Lab
export interface ConceptualSimData {
  title: string;
  tagline: string;
  coreFormulas: { label: string; formula: string; explanation: string }[];
  steps: { step: number; title: string; explanation: string; tip?: string }[];
  kernelDeepDive: {
    osName: string;
    subsystem: string;
    architecture: string;
    sourceSnippet?: string;
  };
  gateShortcuts: string[];
  interactiveDemonstrator: {
    question: string;
    options: { text: string; correct: boolean; feedback: string }[];
  };
}

export const CONCEPTUAL_SIMULATIONS: Record<string, ConceptualSimData> = {
  cpu_scheduler: {
    title: 'CPU Scheduling & Dispatch Architecture',
    tagline: 'How the kernel selects the next thread to execute, maximizes throughput, and bounds starvation.',
    coreFormulas: [
      {
        label: 'Turnaround Time (TAT)',
        formula: 'TAT = Completion Time - Arrival Time',
        explanation: 'Total elapsed time from process submission to complete termination.'
      },
      {
        label: 'Waiting Time (WT)',
        formula: 'WT = Turnaround Time - Burst Time',
        explanation: 'Time spent in the READY queue waiting for the CPU socket.'
      },
      {
        label: 'Response Time (RT)',
        formula: 'RT = First CPU Access Time - Arrival Time',
        explanation: 'Crucial for interactive/desktop systems (minimizing UI latency).'
      },
      {
        label: 'CPU Utilization',
        formula: 'Utilization = (Total Busy Time / Total Schedule Time) × 100%',
        explanation: 'Target is typically 40% (light load) to 90% (heavy throughput load).'
      }
    ],
    steps: [
      {
        step: 1,
        title: 'Admit to Ready Queue',
        explanation: 'When a process is spawned via fork(), the long-term scheduler admits it into RAM and inserts its PCB into the Ready Queue.'
      },
      {
        step: 2,
        title: 'Scheduling Decision Criteria',
        explanation: 'The short-term scheduler checks scheduling criteria: Non-preemptive (FCFS, SJF) only switches on yield/termination/I/O; Preemptive (RR, SRTF) switches on clock timer tick.'
      },
      {
        step: 3,
        title: 'Dispatcher Context Switch',
        explanation: 'The dispatcher saves PCB1 registers (PC, SP, GPRs), loads PCB2 registers, flushes/tags TLB, and jumps to PCB2 Program Counter in user mode.'
      }
    ],
    kernelDeepDive: {
      osName: 'Linux Kernel (v2.6.23+ to Modern)',
      subsystem: 'Completely Fair Scheduler (CFS)',
      architecture: 'Replaced traditional time-sliced queues with a self-balancing Red-Black Tree ordered by virtual runtime (vruntime). The task with the smallest vruntime is scheduled next.',
      sourceSnippet: 'struct sched_entity { struct load_weight load; struct rb_node run_node; u64 vruntime; };'
    },
    gateShortcuts: [
      'Shortest Job First (SJF) is mathematically PROVEN to yield the minimum average waiting time for a given set of processes.',
      'In Round Robin, if Quantum q >= max(Burst), it degrades to First-Come First-Served (FCFS).',
      'If Quantum q is infinitesimally small, it simulates Processor Sharing (all n processes run simultaneously at 1/n speed) but context switch overhead destroys throughput.'
    ],
    interactiveDemonstrator: {
      question: 'Which scheduling algorithm can cause starvation for compute-heavy processes with long CPU burst times?',
      options: [
        { text: 'First-Come First-Served (FCFS)', correct: false, feedback: 'Incorrect. FCFS is non-preemptive and preserves arrival order; every process eventually completes.' },
        { text: 'Shortest Remaining Time First (SRTF)', correct: true, feedback: 'Correct! Continuous arrivals of short-burst jobs will repeatedly preempt and starve long-burst jobs.' },
        { text: 'Round Robin with Q=2ms', correct: false, feedback: 'Incorrect. Round Robin guarantees bounded waiting because every process receives an equal time slice cyclically.' }
      ]
    }
  },

  process_lifecycle: {
    title: 'Process State Machine & PCB Mechanics',
    tagline: 'The dual-mode lifecycle of execution threads and kernel descriptor structures.',
    coreFormulas: [
      {
        label: 'Fork Process Tree Math',
        formula: 'Total Processes = 2^n, Child Processes = 2^n - 1',
        explanation: 'For n consecutive unnested fork() syscall invocations.'
      },
      {
        label: 'Context Switch Overhead',
        formula: 'Overhead = T_save(PCB) + T_restore(PCB) + T_cache_refill',
        explanation: 'Direct state saving (~1-3 μs) plus indirect L1/L2 cache cold-miss penalties (~10-30 μs).'
      }
    ],
    steps: [
      {
        step: 1,
        title: 'Creation (New)',
        explanation: 'Program binary is read from disk; address space (Text, Data, Heap, Stack) and PCB are allocated.'
      },
      {
        step: 2,
        title: 'Ready to Run',
        explanation: 'Process is in physical RAM, awaiting its scheduled turn on an available CPU core.'
      },
      {
        step: 3,
        title: 'I/O Blocking (Waiting)',
        explanation: 'Executing a blocking system call (e.g. read()) immediately relinquishes CPU and places the process in a wait queue.'
      },
      {
        step: 4,
        title: 'Termination & Reaping',
        explanation: 'exit() releases memory and file descriptors; the process remains a "Zombie" until the parent calls wait() to read its exit code.'
      }
    ],
    kernelDeepDive: {
      osName: 'Linux / Unix',
      subsystem: 'task_struct & init (PID 1)',
      architecture: 'Every process is described by struct task_struct (~6 KB in kernel memory). If a parent dies before reaping a child, the child becomes an "Orphan" and is automatically adopted by init/systemd (PID 1), which periodically reaps zombies.',
      sourceSnippet: 'struct task_struct { volatile long state; struct mm_struct *mm; pid_t pid; struct files_struct *files; };'
    },
    gateShortcuts: [
      'Zombie process: Executed exit(), has released memory/files, but still retains its entry in the process table until parent calls wait().',
      'Orphan process: Parent died without waiting; re-parented to init (PID 1).',
      'fork() returns 0 to the newly created child process, and returns the positive child PID to the parent process.'
    ],
    interactiveDemonstrator: {
      question: 'What happens to a child process if its parent terminates without invoking wait()?',
      options: [
        { text: 'The child process is immediately terminated by the kernel.', correct: false, feedback: 'Incorrect. The child continues executing normally.' },
        { text: 'The child becomes an Orphan and is re-parented to PID 1 (init/systemd).', correct: true, feedback: 'Correct! Init adopts the orphan and reaps its exit code when it terminates.' },
        { text: 'The child transitions to the Suspended-Blocked state.', correct: false, feedback: 'Incorrect. Swapping to disk only occurs under high memory pressure.' }
      ]
    }
  },

  paging_tlb: {
    title: 'Paging, TLB & Address Translation',
    tagline: 'Converting virtual addresses to physical frames without contiguous physical allocation.',
    coreFormulas: [
      {
        label: 'Effective Memory Access Time (EMAT)',
        formula: 'EMAT = h × (t_tlb + t_mem) + (1 - h) × (t_tlb + (k + 1) × t_mem)',
        explanation: 'Where h = TLB hit ratio, t_tlb = TLB lookup time, t_mem = main memory access latency, k = number of page table levels.'
      },
      {
        label: 'Virtual Address Bit Split',
        formula: 'VA Bits = Page Number (p) + Offset (d)',
        explanation: 'Offset bits d = log2(Page Size in bytes). Page bits p = Virtual Address Bits - d.'
      },
      {
        label: 'Page Table Size',
        formula: 'PT Size = Number of Virtual Pages × Page Table Entry (PTE) Size',
        explanation: 'Number of pages = 2^p = 2^(VA - d).'
      }
    ],
    steps: [
      {
        step: 1,
        title: 'CPU Generates Virtual Address',
        explanation: 'Instruction fetches or load/store instructions output a virtual address composed of [Page Number | Offset].'
      },
      {
        step: 2,
        title: 'Translation Lookaside Buffer (TLB) Probe',
        explanation: 'MMU hardware associatively compares the Page Number across all TLB slots in parallel (~1 ns). If hit, physical frame number is returned immediately.'
      },
      {
        step: 3,
        title: 'Page Table Walk (on TLB Miss)',
        explanation: 'If miss, the hardware page table walker traverses multi-level page tables in RAM (CR3 register base pointer), adds PTE frame number + offset, and updates the TLB.'
      }
    ],
    kernelDeepDive: {
      osName: 'x86-64 Architecture & Linux',
      subsystem: '4-Level & 5-Level Paging (PML4 / PML5)',
      architecture: 'x86-64 uses 48-bit virtual addresses divided into 9 bits PGDIR, 9 bits PUD, 9 bits PMD, 9 bits PTE, and 12 bits Offset (4 KB page). Supports Huge Pages (2 MB) and Giant Pages (1 GB) to drastically reduce TLB misses in databases.',
      sourceSnippet: 'typedef struct { unsigned long pgd; } pgd_t;'
    },
    gateShortcuts: [
      'Offset bits never change during address translation: Virtual Offset == Physical Offset.',
      'With a 2-level page table and TLB hit ratio h, an access takes 1 memory access on TLB hit, and 1 + 2 = 3 memory accesses on TLB miss.',
      'In inverted page tables, the table size is proportional to PHYSICAL memory size, independent of virtual address space size.'
    ],
    interactiveDemonstrator: {
      question: 'Given a 32-bit virtual address, 4 KB page size, and 4-byte PTEs: What is the size of a single-level page table?',
      options: [
        { text: '1 MB', correct: false, feedback: 'Incorrect. Calculate: 2^20 pages × 4 bytes.' },
        { text: '4 MB', correct: true, feedback: 'Correct! Page size 4KB -> offset d = 12 bits. Remaining page number = 32 - 12 = 20 bits -> 2^20 (1M) entries × 4 bytes = 4 MB per process!' },
        { text: '16 MB', correct: false, feedback: 'Incorrect. Offset is 12 bits, leaving 2^20 entries.' }
      ]
    }
  },

  page_replacement: {
    title: 'Page Replacement & Belady\'s Anomaly',
    tagline: 'Deciding which physical frame to victimize when demand paging triggers a page fault.',
    coreFormulas: [
      {
        label: 'Hit Ratio',
        formula: 'Hit Ratio = (Total Hits / Total Page Accesses) × 100%',
        explanation: 'Ratio of memory requests found in resident RAM frames.'
      },
      {
        label: 'Fault Ratio',
        formula: 'Fault Ratio = 100% - Hit Ratio',
        explanation: 'Percentage of requests requiring slow disk swap reads.'
      }
    ],
    steps: [
      {
        step: 1,
        title: 'Valid-Invalid Bit Check',
        explanation: 'MMU inspects the PTE. If valid bit is 0, a Page Fault Trap (Interrupt 14) is dispatched to Ring 0.'
      },
      {
        step: 2,
        title: 'Victim Selection',
        explanation: 'If all physical frames are occupied, the replacement policy (FIFO, LRU, Optimal, Clock) selects a victim frame.'
      },
      {
        step: 3,
        title: 'Disk Writeback & Swapping',
        explanation: 'If the victim frame is dirty (modified bit = 1), it is written back to swap disk; the requested page is loaded into the freed frame.'
      }
    ],
    kernelDeepDive: {
      osName: 'Linux Kernel Memory Subsystem',
      subsystem: 'kswapd & Active/Inactive LRU Lists',
      architecture: 'Pure LRU is too expensive in hardware (requires timestamp update on every clock cycle). Linux uses an approximated Clock/Second-Chance algorithm with two lists: Active List and Inactive List.',
      sourceSnippet: 'struct lruvec { struct list_head lists[NR_LRU_LISTS]; };'
    },
    gateShortcuts: [
      'Belady\'s Anomaly: For some page replacement algorithms (specifically FIFO), increasing the number of physical frames can INCREASE the number of page faults!',
      'Stack Algorithms (such as LRU and Optimal) can NEVER suffer from Belady\'s anomaly because the set of pages in an n-frame allocation is always a subset of an (n+1)-frame allocation.',
      'Optimal (OPT) algorithm replaces the page that will NOT be used for the longest period of future time.'
    ],
    interactiveDemonstrator: {
      question: 'Which of the following page replacement algorithms is immune to Belady\'s Anomaly?',
      options: [
        { text: 'First-In First-Out (FIFO)', correct: false, feedback: 'Incorrect. FIFO is the classic example that suffers from Belady\'s Anomaly.' },
        { text: 'Least Recently Used (LRU)', correct: true, feedback: 'Correct! LRU belongs to the class of Stack Algorithms and is mathematically guaranteed never to suffer Belady\'s anomaly.' },
        { text: 'Second-Chance (Clock) with simple FIFO base', correct: false, feedback: 'Incorrect. Clock approximates FIFO and can exhibit Belady\'s anomaly.' }
      ]
    }
  },

  bankers_deadlock: {
    title: 'Banker\'s Algorithm & Deadlock Avoidance',
    tagline: 'Proving system safety using Dijkstra\'s vector inequality before granting resource allocations.',
    coreFormulas: [
      {
        label: 'Need Matrix Equation',
        formula: 'Need[i][j] = Max[i][j] - Allocation[i][j]',
        explanation: 'Remaining resources process i may request before completing.'
      },
      {
        label: 'Safety Condition',
        formula: 'Need[i] <= Work (Available Vector)',
        explanation: 'If true, process i can safely complete and release its allocated resources: Work = Work + Allocation[i].'
      },
      {
        label: 'Coffman\'s 4 Conditions',
        formula: 'Mutual Exclusion + Hold & Wait + No Preemption + Circular Wait',
        explanation: 'All 4 conditions must hold simultaneously for a deadlock to occur.'
      }
    ],
    steps: [
      {
        step: 1,
        title: 'Calculate Need Matrix',
        explanation: 'Compute Need = Max - Allocation for all processes and all resource types.'
      },
      {
        step: 2,
        title: 'Find Schedulable Candidate',
        explanation: 'Find an unfinished process whose Need vector is less than or equal to current Available resources.'
      },
      {
        step: 3,
        title: 'Simulate Reclamation & Repeat',
        explanation: 'Add its Allocation back to Available. If all processes complete, the sequence is SAFE; otherwise, UNSAFE (deadlock risk).'
      }
    ],
    kernelDeepDive: {
      osName: 'Production Kernels (Linux, Windows)',
      subsystem: 'Ostrich Algorithm & lockdep',
      architecture: 'General-purpose OS kernels do NOT run Banker\'s algorithm at runtime because Max resource claims are unknown in advance. Instead, they use lock ordering rules, mutex hierarchy checks (lockdep in Linux), or the Ostrich algorithm (ignore rarely occurring deadlocks).',
      sourceSnippet: '#ifdef CONFIG_LOCKDEP\nvoid lock_acquire(struct lockdep_map *lock, ...);\n#endif'
    },
    gateShortcuts: [
      'An UNSAFE state is NOT necessarily a deadlock! An unsafe state simply means the OS cannot guarantee preventing a deadlock if every process simultaneously requests its maximum need.',
      'Safe State ⊂ All States. Unsafe State ⊃ Deadlocked State. All deadlocks are unsafe states, but not all unsafe states are deadlocked.',
      'Single unit resources: A cycle in the Resource Allocation Graph (RAG) is NECESSARY AND SUFFICIENT for deadlock. Multi-unit resources: A cycle is NECESSARY BUT NOT SUFFICIENT.'
    ],
    interactiveDemonstrator: {
      question: 'In a system with multi-instance resource types, is the presence of a cycle in the Resource Allocation Graph (RAG) a guarantee of deadlock?',
      options: [
        { text: 'Yes, a cycle always indicates deadlock.', correct: false, feedback: 'Incorrect. A cycle guarantees deadlock ONLY if each resource type has exactly ONE single instance.' },
        { text: 'No, a cycle is necessary but not sufficient for deadlock with multi-instance resources.', correct: true, feedback: 'Correct! Other processes outside the cycle may release instances that break the circular wait.' },
        { text: 'No, cycles in RAG are completely unrelated to deadlock.', correct: false, feedback: 'Incorrect. Cycles are directly related to circular wait.' }
      ]
    }
  },

  cache_hierarchy: {
    title: 'Cache Memory Hierarchy & AMAT',
    tagline: 'Bridging the nanosecond speed gap between multi-gigahertz CPUs and external DDR5 DRAM.',
    coreFormulas: [
      {
        label: 'Average Memory Access Time (AMAT)',
        formula: 'AMAT = Hit_Time + Miss_Rate × Miss_Penalty',
        explanation: 'Total average latency perceived by the CPU execution pipeline.'
      },
      {
        label: 'Multi-Level AMAT (L1, L2, L3, RAM)',
        formula: 'AMAT = T_L1 + M_L1 × (T_L2 + M_L2 × (T_L3 + M_L3 × T_RAM))',
        explanation: 'Recursive miss penalty cascading down the memory hierarchy.'
      },
      {
        label: 'Cache Address Split',
        formula: 'Address Bits = Tag Bits + Index Bits + Offset Bits',
        explanation: 'Offset = log2(Block Size). Index = log2(Number of Sets). Tag = Remaining bits.'
      }
    ],
    steps: [
      {
        step: 1,
        title: 'CPU Issues 64-Bit Memory Address',
        explanation: 'Split into Tag, Set Index, and Byte Offset.'
      },
      {
        step: 2,
        title: 'Set Lookup & Tag Compare',
        explanation: 'Set index routes to the specific cache set. Tags of all ways in that set are compared in parallel.'
      },
      {
        step: 3,
        title: 'Cache Hit vs Miss',
        explanation: 'If match and Valid=1, word is multiplexed out immediately. If miss, line is fetched from L2/L3/RAM and replacement policy (LRU/PLRU) evicts an old line.'
      }
    ],
    kernelDeepDive: {
      osName: 'Linux Kernel & Hardware MMU',
      subsystem: 'Page Coloring & False Sharing Prevention',
      architecture: 'Kernels allocate physical pages such that virtually contiguous pages map to distinct cache sets (Cache Coloring). In multicore code, variables modified by different threads are padded to 64 bytes to prevent "False Sharing" across MESI cache coherency lines.',
      sourceSnippet: '#define ____cacheline_aligned __attribute__((__aligned__(SMP_CACHE_BYTES)))'
    },
    gateShortcuts: [
      'In Direct-Mapped cache, Associativity = 1 (each set has exactly 1 line). Number of Sets = Total Cache Lines.',
      'In Fully Associative cache, Number of Sets = 1. Index bits = 0. Every line is in the single unified set.',
      'Miss Penalty is the total time required to retrieve the block from the lower level of the memory hierarchy and load it into the cache.'
    ],
    interactiveDemonstrator: {
      question: 'If L1 cache hit time is 1 ns with 95% hit rate, and main memory access time is 100 ns, what is the AMAT?',
      options: [
        { text: '5.0 ns', correct: false, feedback: 'Incorrect. Remember to include the L1 hit time.' },
        { text: '6.0 ns', correct: true, feedback: 'Correct! AMAT = 1 ns + (1 - 0.95) × 100 ns = 1 + 5 = 6.0 ns.' },
        { text: '10.5 ns', correct: false, feedback: 'Incorrect. Miss rate is 0.05 (5%).' }
      ]
    }
  },

  disk_scheduling: {
    title: 'Disk Scheduling & Mechanical Seek Optimization',
    tagline: 'Minimizing mechanical head travel distance and preventing cylinder starvation.',
    coreFormulas: [
      {
        label: 'Total Head Movement',
        formula: 'Total Distance = Σ |Track_(i) - Track_(i-1)|',
        explanation: 'Sum of absolute cylinder seek distances across the request queue.'
      },
      {
        label: 'Average Seek Time',
        formula: 'Avg Seek = (Total Head Movement / Number of Requests) × Seek_Rate_ms',
        explanation: 'Mechanical seek time dominates rotational latency (~4 ms) and transfer time (~0.05 ms).'
      }
    ],
    steps: [
      {
        step: 1,
        title: 'I/O Request Arrival',
        explanation: 'File system layer maps file logical byte offsets to physical disk cylinder/head/sector addresses.'
      },
      {
        step: 2,
        title: 'Queue Reordering',
        explanation: 'Scheduler (SSTF, SCAN, C-SCAN, LOOK, C-LOOK) reorders requests to minimize head reversals.'
      },
      {
        step: 3,
        title: 'Actuator Sweep & Service',
        explanation: 'Voice coil actuator sweeps the read/write head assembly across concentric magnetic platter tracks.'
      }
    ],
    kernelDeepDive: {
      osName: 'Linux Block Layer (I/O Schedulers)',
      subsystem: 'BFQ, Kyber, mq-deadline',
      architecture: 'Modern NVMe SSDs have zero mechanical seek time, so Linux uses multi-queue schedulers (none/mq-deadline) focused on latency and IOPS fairness rather than track elevator sweeps.',
      sourceSnippet: 'struct elevator_queue *e;'
    },
    gateShortcuts: [
      'SSTF (Shortest Seek Time First) can cause starvation for cylinders far away from the active head position!',
      'SCAN (Elevator Algorithm) moves in one direction to the extreme cylinder limit (e.g. track 199 or track 0) before reversing.',
      'LOOK only moves as far as the final request in that direction before reversing, avoiding wasted travel to disk boundaries.'
    ],
    interactiveDemonstrator: {
      question: 'Which disk scheduling algorithm reverses direction ONLY after reaching the very end of the physical disk (e.g. cylinder 0 or 199)?',
      options: [
        { text: 'LOOK', correct: false, feedback: 'Incorrect. LOOK reverses as soon as there are no further requests in that direction.' },
        { text: 'SCAN', correct: true, feedback: 'Correct! SCAN travels all the way to the boundary cylinder before reversing.' },
        { text: 'SSTF', correct: false, feedback: 'Incorrect. SSTF jumps greedily to the nearest pending request.' }
      ]
    }
  },

  file_system: {
    title: 'File Allocation Methods & Unix Inode Architecture',
    tagline: 'Directory structures, multi-level inode pointers, and free-space bitmap tracking.',
    coreFormulas: [
      {
        label: 'Pointers per Indirect Block',
        formula: 'Pointers = Block_Size_Bytes / Pointer_Size_Bytes',
        explanation: 'e.g., 4096 / 4 = 1,024 pointers per block.'
      },
      {
        label: 'Max File Size (Unix Inode)',
        formula: 'Max = [Direct + Ptr + Ptr^2 + Ptr^3] × Block_Size',
        explanation: 'Combines direct, single, double, and triple indirect pointers.'
      }
    ],
    steps: [
      {
        step: 1,
        title: 'Directory Lookup',
        explanation: 'Path "/home/user/doc.txt" traverses directory files mapping filenames to Inode numbers.'
      },
      {
        step: 2,
        title: 'Inode Fetch',
        explanation: 'Kernel reads the Inode from the disk Inode Table into the in-memory VFS inode cache.'
      },
      {
        step: 3,
        title: 'Block Indexing & I/O',
        explanation: 'Direct or indirect block pointers map file logical offsets directly to physical LBA disk blocks.'
      }
    ],
    kernelDeepDive: {
      osName: 'Linux Ext4 & VFS (Virtual File System)',
      subsystem: 'Extents & struct inode',
      architecture: 'Ext4 replaced traditional indirect block pointers with "Extents": a single extent descriptor maps up to 128 MB of contiguous blocks in a single 12-byte header, drastically shrinking metadata size for large files.',
      sourceSnippet: 'struct ext4_extent { __le32 ee_block; __le16 ee_len; __le16 ee_start_hi; __le32 ee_start_lo; };'
    },
    gateShortcuts: [
      'Inodes do NOT store the file name! File names are stored inside directory files alongside their associated Inode number.',
      'Hard links simply create another directory entry pointing to the same Inode (link count incremented).',
      'Soft links (symbolic links) have their own independent Inode whose data block contains the string path to the target file.'
    ],
    interactiveDemonstrator: {
      question: 'Where is the name of a file stored in a Unix file system?',
      options: [
        { text: 'Inside the file\'s Inode structure', correct: false, feedback: 'Incorrect. Inodes store metadata (size, owner, permissions, pointers) but NOT the filename.' },
        { text: 'Inside the directory file containing the entry', correct: true, feedback: 'Correct! A directory is a special file containing a list of (filename, inode_number) pairs.' },
        { text: 'Inside the master boot record (MBR)', correct: false, feedback: 'Incorrect. MBR contains boot code and partition tables.' }
      ]
    }
  }
};
