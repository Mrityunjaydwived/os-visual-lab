// Complete Operating Systems Curriculum — 24 Comprehensive Modules

export interface CurriculumModule {
  id: string;
  number: number;
  title: string;
  category: 'Core Fundamentals' | 'Processes & Concurrency' | 'Memory & Storage' | 'Hardware & I/O' | 'Advanced & Modern';
  description: string;
  iconName: string;
  topics: string[];
  keyFormulas?: string[];
  visualizerId?: string;
  gateWeightage?: string;
  progressiveContent: {
    basic: {
      summary: string;
      analogy: string;
      keyConcepts: { name: string; desc: string }[];
    };
    interactive: {
      visualDescription: string;
      suggestedAction: string;
    };
    advanced: {
      kernelDetails: string;
      edgeCases: string[];
      dataStructures: string[];
    };
    gate: {
      frequentQuestions: string[];
      commonTraps: string[];
      solvedExampleSnippet: string;
    };
    expert: {
      modernOSImpl: string; // e.g. Linux CFS, Windows NT, eBPF
    };
  };
}

export const CURRICULUM_MODULES: CurriculumModule[] = [
  {
    id: 'module_01',
    number: 1,
    title: 'OS Fundamentals & Architecture',
    category: 'Core Fundamentals',
    description: 'Operating system goals, kernel vs user mode, system calls, interrupts, traps, monolithic vs microkernel architecture.',
    iconName: 'Cpu',
    visualizerId: 'dma_interrupt',
    gateWeightage: '4 - 6% (System Calls, Dual Mode, Interrupts)',
    topics: [
      'What is an Operating System?',
      'OS Goals: Convenience vs Efficiency',
      'Kernel Space vs User Space',
      'Dual-Mode Operation (User Mode vs Kernel Mode)',
      'System Calls & Software Traps',
      'Hardware Interrupts & Exceptions',
      'Monolithic, Microkernel & Hybrid Kernels',
      'Boot Process (BIOS/UEFI, Bootloader, Init)'
    ],
    keyFormulas: [
      'Dual-Mode Bit: 1 = User Mode, 0 = Kernel Mode',
      'Trap Execution: Saves PC, SP, PSW -> Transitions to Ring 0 -> IVT Lookup'
    ],
    progressiveContent: {
      basic: {
        summary: 'An Operating System acts as a government: it creates a safe environment where multiple user applications can share limited hardware without interfering with each other.',
        analogy: 'Imagine a bank teller counter: you (user application) cannot walk directly into the vault (hardware/RAM); you must submit a formal slip (System Call) to the authorized teller (Kernel).',
        keyConcepts: [
          { name: 'Kernel', desc: 'The core program running at all times with full unrestricted hardware privileges (Ring 0).' },
          { name: 'System Call', desc: 'The programmatic gateway that requests a privileged service from the operating system kernel.' },
          { name: 'Dual Mode', desc: 'Hardware protection preventing user code from executing privileged instructions (I/O, halt, MMU modification).' }
        ]
      },
      interactive: {
        visualDescription: 'Interactive Layered Diagram showing App -> C Standard Library -> Syscall Vector (int 0x80 / syscall) -> Kernel Handler -> Driver -> Hardware.',
        suggestedAction: 'Click a system call like read() to observe the CPU mode bit switch from 1 to 0 and register saving.'
      },
      advanced: {
        kernelDetails: 'Modern x86-64 CPUs use dedicated fast instructions (SYSCALL / SYSRET) bypassing interrupt vector table lookup overhead. Context saving stores RIP, RFLAGS, and RSP.',
        edgeCases: [
          'Nested interrupts with prioritized Interrupt Priority Levels (IPL).',
          'Fault vs Trap: Faults re-execute the faulting instruction (e.g. page fault); traps resume after it (e.g. syscall).'
        ],
        dataStructures: ['Interrupt Descriptor Table (IDT)', 'System Call Table', 'Task State Segment (TSS)']
      },
      gate: {
        frequentQuestions: [
          'Which instructions are privileged vs non-privileged?',
          'Distinction between Interrupt, Trap, and Exception.',
          'Microkernel vs Monolithic IPC trade-offs.'
        ],
        commonTraps: [
          'Thinking system calls can be executed in User Mode without a CPU privilege transition.',
          'Assuming changing the mode bit to Kernel Mode is a non-privileged instruction.'
        ],
        solvedExampleSnippet: 'Q: Which of the following is privileged? (A) Set CPU timer, (B) Read system time, (C) Compute arithmetic. Answer: (A) Set CPU timer is privileged.'
      },
      expert: {
        modernOSImpl: 'Linux uses modular monolithic architecture with loadable kernel modules (LKM) and eBPF (extended Berkeley Packet Filter) to run sandboxed code inside kernel space.'
      }
    }
  },
  {
    id: 'module_02',
    number: 2,
    title: 'Process Management & PCB',
    category: 'Processes & Concurrency',
    description: 'Process concept, 5-state and 7-state process lifecycles, Process Control Block (PCB), context switching overhead, fork() and exec().',
    iconName: 'Activity',
    visualizerId: 'process_lifecycle',
    gateWeightage: '6 - 8% (Process states, fork() return values, context switches)',
    topics: [
      'Program vs Process',
      'Process Lifecycle (New, Ready, Running, Waiting, Terminated)',
      'Suspended Ready & Suspended Waiting States',
      'Process Control Block (PCB) Fields',
      'Context Switching & Overhead',
      'Parent-Child Process Relationships (fork, exec, wait, exit)',
      'Zombie & Orphan Processes',
      'CPU-bound vs I/O-bound Processes'
    ],
    keyFormulas: [
      'fork() returns 0 in Child, Child PID in Parent, -1 on Error',
      'Total Processes created by n consecutive fork() calls = 2^n'
    ],
    progressiveContent: {
      basic: {
        summary: 'A program is passive code stored on disk; a process is that program brought to life in memory with active CPU registers, stack, and heap.',
        analogy: 'A recipe book on a shelf is a program. You actively baking the cake in the kitchen with bowls, oven timer, and ingredients is a process.',
        keyConcepts: [
          { name: 'PCB', desc: 'The OS identity card for a process: tracks PID, registers, PC, scheduling priority, and open file descriptors.' },
          { name: 'Context Switch', desc: 'Saving the state of the active process to its PCB and loading another process state into CPU registers.' }
        ]
      },
      interactive: {
        visualDescription: 'Visual 5-state process pipeline. Drag processes between Ready, CPU, and I/O wait queues.',
        suggestedAction: 'Click "Spawn Process" and step through Context Switching to view register save/restore.'
      },
      advanced: {
        kernelDetails: 'In Linux, processes and threads are represented identically by `struct task_struct`. The scheduler treats both as schedulable entities called tasks.',
        edgeCases: [
          'Zombie process: finished execution but parent has not yet called wait() to reap its exit code.',
          'Orphan process: parent died before child; re-parented to init (PID 1).'
        ],
        dataStructures: ['task_struct in Linux', 'Active & Expired Runqueues', 'Ready Queue Linked Lists']
      },
      gate: {
        frequentQuestions: [
          'Number of times printf is executed in nested fork() loops.',
          'Does context switch time count towards CPU burst time? (No, pure overhead).',
          'Which process state transition is voluntary vs involuntary?'
        ],
        commonTraps: [
          'Forgetting that fork() duplicates the entire address space including current loop counters and buffered stdout.',
          'Thinking a process transitions directly from Waiting to Running (must pass through Ready Queue).'
        ],
        solvedExampleSnippet: 'Q: How many processes are created by: for(int i=0; i<3; i++) fork(); Answer: 2^3 - 1 = 7 new processes (total 8 including parent).'
      },
      expert: {
        modernOSImpl: 'Linux utilizes Copy-on-Write (COW) during fork() using page table manipulation so child only duplicates physical pages when modifying them.'
      }
    }
  },
  {
    id: 'module_03',
    number: 3,
    title: 'Threads & Multicore Concurrency',
    category: 'Processes & Concurrency',
    description: 'Process vs thread, User-Level Threads (ULT) vs Kernel-Level Threads (KLT), multithreading models (M:1, 1:1, M:N), and multicore execution.',
    iconName: 'GitFork',
    visualizerId: 'process_lifecycle',
    gateWeightage: '4 - 6% (ULT vs KLT differences, Thread sharing)',
    topics: [
      'Process vs Thread',
      'What Threads Share vs What is Private',
      'User-Level Threads (ULT)',
      'Kernel-Level Threads (KLT)',
      'Multithreading Models (Many-to-One, One-to-One, Many-to-Many)',
      'Thread Local Storage (TLS)',
      'Amdahls Law for Parallel Speedup',
      'Multicore Cache Affinity'
    ],
    keyFormulas: [
      'Amdahl Law: Speedup S = 1 / ((1 - P) + P / N)',
      'Shared by Threads: Code, Global Data, Open Files, Heap',
      'Private to Threads: Stack, Registers (PC, SP), TLS'
    ],
    progressiveContent: {
      basic: {
        summary: 'Threads are lightweight sub-processes inside the same house (address space). They share the living room and kitchen (heap & global data) but have private bedrooms (stacks).',
        analogy: 'Multiple chefs cooking different courses of the same banquet in a single shared kitchen.',
        keyConcepts: [
          { name: 'KLT', desc: 'Threads created and scheduled directly by the OS kernel across multiple CPU cores simultaneously.' },
          { name: 'ULT', desc: 'Threads managed by a user-space library; fast to create but one blocking syscall blocks all sibling threads.' }
        ]
      },
      interactive: {
        visualDescription: 'Visual representation of multiple execution threads mapped onto CPU Core 0 and Core 1.',
        suggestedAction: 'Switch between Many-to-One and One-to-One models and trigger a blocking I/O call to observe thread stalling.'
      },
      advanced: {
        kernelDetails: 'POSIX threads (pthread) in modern Linux map 1:1 to kernel task structures via the clone() system call with CLONE_VM | CLONE_FS | CLONE_FILES flags.',
        edgeCases: [
          'Signal handling in multithreaded programs: who receives SIGINT or SIGSEGV?',
          'Thread-safe standard C libraries (errno is thread-local).'
        ],
        dataStructures: ['Thread Control Block (TCB)', 'Per-thread Call Stack', 'Thread Local Storage (TLS) Offset']
      },
      gate: {
        frequentQuestions: [
          'What is NOT shared between threads of the same process? (Answer: Stack and Registers).',
          'Calculate theoretical maximum speedup using Amdahl\'s law.',
          'Why can User-Level Threads not achieve true multicore parallelism?'
        ],
        commonTraps: [
          'Thinking threads share their call stack (local variables are strictly isolated on separate thread stacks).',
          'Assuming KLT context switch is as fast as ULT (KLT requires Ring 3 -> Ring 0 mode switch).'
        ],
        solvedExampleSnippet: 'Q: 75% of a program is parallelizable. On 4 cores, Speedup = 1 / ((1 - 0.75) + 0.75/4) = 1 / (0.25 + 0.1875) = 2.28x.'
      },
      expert: {
        modernOSImpl: 'Modern Java and Go runtimes feature fibers/goroutines (M:N hybrid green threads) with work-stealing schedulers multiplexed over OS kernel threads.'
      }
    }
  },
  {
    id: 'module_04',
    number: 4,
    title: 'CPU Scheduling Algorithms',
    category: 'Processes & Concurrency',
    description: 'FCFS, SJF, SRTF, Non-preemptive and Preemptive Priority, Round Robin, Multilevel Queue, and Multilevel Feedback Queue (MLFQ).',
    iconName: 'Timer',
    visualizerId: 'cpu_scheduler',
    gateWeightage: '10 - 12% (Core numericals every single year)',
    topics: [
      'Scheduling Criteria (Throughput, Turnaround, Waiting, Response)',
      'First-Come First-Served (FCFS) & Convoy Effect',
      'Shortest Job First (SJF) & Proof of Optimality for Avg WT',
      'Shortest Remaining Time First (SRTF - Preemptive SJF)',
      'Priority Scheduling & Aging Mechanism',
      'Round Robin (RR) & Quantum Tuning Trade-offs',
      'Multilevel Feedback Queue (MLFQ)',
      'Gantt Chart Construction & Metrics Calculations'
    ],
    keyFormulas: [
      'Turnaround Time (TAT) = Completion Time (CT) - Arrival Time (AT)',
      'Waiting Time (WT) = Turnaround Time (TAT) - Burst Time (BT)',
      'Response Time (RT) = Time of First CPU Allocation - Arrival Time',
      'CPU Utilization = (Total Busy Time / Total Simulation Time) * 100%'
    ],
    progressiveContent: {
      basic: {
        summary: 'The CPU scheduler is the traffic controller of the processor: deciding which waiting process gets CPU execution time next.',
        analogy: 'Supermarket checkout line: FCFS is normal queue, SJF lets customers with 1 basket cut in front of full carts, Round Robin lets each customer ring 5 items then go to back of line.',
        keyConcepts: [
          { name: 'Convoy Effect', desc: 'Short processes languishing behind one massive CPU-hog in FCFS, degrading average waiting time.' },
          { name: 'Time Quantum', desc: 'The fixed slice of CPU time allocated before preempting in Round Robin. Too large -> FCFS; too small -> high context switch overhead.' }
        ]
      },
      interactive: {
        visualDescription: 'Full interactive Gantt chart simulator with real-time Ready Queue, live CPU block, and step-by-step "WHY?" rationale box.',
        suggestedAction: 'Input customized Arrival and Burst times, switch algorithms between FCFS, SRTF, and Round Robin, and step through tick-by-tick.'
      },
      advanced: {
        kernelDetails: 'Linux Completely Fair Scheduler (CFS) does not use fixed time slices; it models an ideal multi-tasking CPU using virtual runtime (vruntime) tracked in a red-black tree.',
        edgeCases: [
          'Preemption during simultaneous arrival of shorter job.',
          'Zero-burst and tie-breaking policies (typically arrival time first, then lower PID).'
        ],
        dataStructures: ['Red-Black Tree (Linux CFS)', 'Priority Min-Heap', 'Multilevel Ready Ring Buffers']
      },
      gate: {
        frequentQuestions: [
          'Calculate Average Waiting Time and Turnaround Time for SRTF vs Round Robin.',
          'Identify optimal quantum value to minimize turnaround time.',
          'Context switch count and CPU idle interval calculations.'
        ],
        commonTraps: [
          'Forgetting that in Preemptive Priority or SRTF, a newly arrived process can preempt the running process at fractional time.',
          'Confusing Response Time (first time on CPU) with Waiting Time (total time spent in ready queue).'
        ],
        solvedExampleSnippet: 'Q: Given P1(0,8), P2(1,4), P3(2,9), P4(3,5) under SRTF. At t=1, P2 remaining (4) < P1 remaining (7), so P2 preempts P1.'
      },
      expert: {
        modernOSImpl: 'Modern data-center kernels use Energy-Aware Scheduling (EAS) allocating bursty interactive tasks to power-efficient LITTLE cores and heavy jobs to Big cores.'
      }
    }
  },
  {
    id: 'module_05',
    number: 5,
    title: 'Process Synchronization & Semaphores',
    category: 'Processes & Concurrency',
    description: 'Race conditions, critical sections, Peterson algorithm, mutexes, counting semaphores, Producer-Consumer, Readers-Writers, Dining Philosophers.',
    iconName: 'Lock',
    visualizerId: 'synchronization',
    gateWeightage: '8 - 10% (Semaphore tracing, mutex, correctness criteria)',
    topics: [
      'Race Conditions & Critical Section Problem',
      'The 3 Correctness Criteria (Mutual Exclusion, Progress, Bounded Waiting)',
      'Peterson Algorithm & Two-Process Solutions',
      'Hardware Atomic Primitives (TestAndSet, CompareAndSwap)',
      'Binary Semaphore vs Mutex',
      'Counting Semaphores (Wait/P and Signal/V operations)',
      'Classic Problem: Producer-Consumer (Bounded Buffer)',
      'Classic Problem: Readers-Writers',
      'Classic Problem: Dining Philosophers'
    ],
    keyFormulas: [
      'wait(S): while (S <= 0); S--; (Blocks when S <= 0)',
      'signal(S): S++; (Unblocks a waiting process if S <= 0 before increment)',
      'Bounded Buffer Semaphore invariant: empty + full = Capacity'
    ],
    progressiveContent: {
      basic: {
        summary: 'When two threads attempt to modify the same bank account or counter simultaneously without synchronization, data corruption occurs.',
        analogy: 'An airplane restroom with a lock: only one passenger enters at a time (Mutual Exclusion); when unoccupied, whoever needs it enters without delay (Progress).',
        keyConcepts: [
          { name: 'Critical Section', desc: 'The specific section of code where shared resources are accessed and modified.' },
          { name: 'Semaphore', desc: 'An integer synchronization variable accessed only through atomic wait() and signal() operations.' }
        ]
      },
      interactive: {
        visualDescription: 'Interactive synchronization laboratory with animated Bounded Buffer, Readers-Writers shared book, and 5 Dining Philosophers table.',
        suggestedAction: 'Click "Trigger Deadlock" in Dining Philosophers to see all 5 grab their left fork, then switch to Dijkstra Asymmetric strategy to resolve it.'
      },
      advanced: {
        kernelDetails: 'Kernel spinlocks disable interrupts on the local core to prevent deadlocks when an interrupt handler attempts to acquire a lock held by the interrupted thread.',
        edgeCases: [
          'Priority Inversion: low priority task holds lock needed by high priority task, delayed by medium priority task (solved by Priority Inheritance Protocol).',
          'Missed wakeups and spurious wakeups in conditional variables.'
        ],
        dataStructures: ['futex (Fast User-space Mutex in Linux)', 'Wait Queues', 'Turnstiles']
      },
      gate: {
        frequentQuestions: [
          'Find resulting value of counting semaphore after sequence of P and V operations.',
          'Verify if pseudo-code satisfies Mutual Exclusion, Progress, and Bounded Waiting.',
          'Minimum and maximum values assumed by a shared counter.'
        ],
        commonTraps: [
          'Assuming Progress is satisfied when a process outside its critical section can block another from entering.',
          'Swapping the order of wait(mutex) and wait(empty) in Producer-Consumer, creating an immediate deadlock.'
        ],
        solvedExampleSnippet: 'Q: Semaphore S initialized to 5. 10 wait() and 7 signal() operations executed. Final value = 5 - 10 + 7 = 2.'
      },
      expert: {
        modernOSImpl: 'Lock-free data structures utilize atomic Read-Copy-Update (RCU) in Linux, allowing readers concurrent read access with zero lock overhead.'
      }
    }
  },
  {
    id: 'module_06',
    number: 6,
    title: 'Inter-Process Communication (IPC)',
    category: 'Processes & Concurrency',
    description: 'Shared memory, message queues, pipes, named pipes (FIFOs), UNIX domain sockets, signals, and client-server communication.',
    iconName: 'Share2',
    visualizerId: 'synchronization',
    gateWeightage: '3 - 5% (Shared memory vs Message passing, Pipes)',
    topics: [
      'Why Processes Need to Communicate',
      'Shared Memory Architecture & Speed',
      'Message Passing Architecture (Direct vs Indirect, Blocking vs Non-blocking)',
      'Anonymous Pipes (pipe syscall)',
      'Named Pipes (mkfifo)',
      'UNIX Domain Sockets & Network Sockets',
      'Signals (SIGKILL, SIGTERM, SIGCHLD)',
      'Remote Procedure Calls (RPC)'
    ],
    keyFormulas: [
      'Pipes: Unidirectional by default; file descriptors fd[0] for read, fd[1] for write',
      'Direct Communication: send(P, msg), receive(Q, msg)'
    ],
    progressiveContent: {
      basic: {
        summary: 'Processes have isolated memory spaces for safety; IPC provides regulated postal routes (messages) or shared community whiteboards (shared memory).',
        analogy: 'Two neighbors talking: Passing sticky notes through the mailbox (Message Passing) vs both writing in the same shared notebook on the fence (Shared Memory).',
        keyConcepts: [
          { name: 'Pipe', desc: 'A unidirectional data conduit in RAM with producer writing to one end and consumer reading from the other.' },
          { name: 'Signal', desc: 'An asynchronous kernel notification sent to a process to notify it of an event (e.g. Ctrl+C = SIGINT).' }
        ]
      },
      interactive: {
        visualDescription: 'Data packet visualizer showing bytes flowing from Process A -> Kernel Buffer Pipe -> Process B.',
        suggestedAction: 'Send messages across a full pipe to watch the producer block until the consumer drains bytes.'
      },
      advanced: {
        kernelDetails: 'Shared memory (shmget/shmat) achieves maximum bandwidth because after initial page table mapping setup, transfers occur at RAM bus speed with zero syscall overhead.',
        edgeCases: [
          'SIGKILL (9) and SIGSTOP cannot be caught, blocked, or ignored by any user process.',
          'Broken pipe (SIGPIPE) when writing to a pipe where all read ends are closed.'
        ],
        dataStructures: ['Circular Pipe Ring Buffer', 'POSIX Message Queue Inodes', 'Signal Handler Tables']
      },
      gate: {
        frequentQuestions: [
          'Pipes are unidirectional or bidirectional? (Unidirectional in standard POSIX).',
          'Which IPC mechanism is fastest? (Shared Memory).',
          'Which signals cannot be masked or caught? (SIGKILL, SIGSTOP).'
        ],
        commonTraps: [
          'Thinking pipes write to the physical hard disk (standard anonymous pipes reside strictly in kernel VFS buffer memory).'
        ],
        solvedExampleSnippet: 'Q: Which mechanism requires kernel intervention for every data byte transferred? Answer: Message passing / Pipes (Shared memory does not).'
      },
      expert: {
        modernOSImpl: 'Android uses Binder IPC, a fast kernel driver enabling cross-process capability-based RPC with reference counting and single-copy semantics.'
      }
    }
  },
  {
    id: 'module_07',
    number: 7,
    title: 'Deadlocks & Banker\'s Algorithm',
    category: 'Processes & Concurrency',
    description: 'The 4 Coffman conditions, Resource Allocation Graphs (RAG), Deadlock Prevention, Deadlock Avoidance, Safe States, Banker\'s Algorithm.',
    iconName: 'AlertTriangle',
    visualizerId: 'bankers_deadlock',
    gateWeightage: '8 - 10% (Bankers safe sequence, RAG cycle detection)',
    topics: [
      'Deadlock Definition & System Model',
      'The 4 Necessary Coffman Conditions',
      'Resource Allocation Graph (RAG) & Cycle Detection',
      'Deadlock Prevention (Attacking Coffman Conditions)',
      'Deadlock Avoidance & Safe State Concept',
      'Bankers Algorithm (Safety & Resource-Request)',
      'Deadlock Detection & Wait-For Graph',
      'Deadlock Recovery (Process Termination & Resource Preemption)'
    ],
    keyFormulas: [
      'Need Matrix: Need[i][j] = Max[i][j] - Allocation[i][j]',
      'Safety Condition: Need[i] <= Available, then Available = Available + Allocation[i]',
      'Deadlock Prevention rule for n processes with max demand k: Total Resources >= n * (k - 1) + 1'
    ],
    progressiveContent: {
      basic: {
        summary: 'Deadlock is a gridlock where every process holds a resource that another process needs, and nobody can move forward.',
        analogy: 'A 4-way street intersection where 4 cars simultaneously pull forward into the center: each car blocked by the car to its right.',
        keyConcepts: [
          { name: '4 Conditions', desc: 'Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. If ANY ONE is broken, deadlock cannot occur.' },
          { name: 'Safe State', desc: 'A state from which there exists at least one order of process execution that allows everyone to complete without deadlock.' }
        ]
      },
      interactive: {
        visualDescription: 'Interactive RAG graph builder with nodes and edges, plus step-by-step Banker\'s Algorithm matrix verifier.',
        suggestedAction: 'Edit Available vector and Allocation matrix, click "Run Safety Check" to watch the algorithm evaluate Need <= Available step-by-step.'
      },
      advanced: {
        kernelDetails: 'General OSes (like Linux and Windows) choose the Ostrich Algorithm for deadlock handling: ignore the problem because full dynamic deadlock avoidance is too computationally expensive for general workloads.',
        edgeCases: [
          'Cycle in RAG is necessary and sufficient for single-instance resources, but only necessary (not sufficient) for multi-instance resources.',
          'Safe state is NOT deadlock, and unsafe state does NOT guarantee immediate deadlock, but contains the potential for one.'
        ],
        dataStructures: ['Allocation, Max, Available, Need Matrices', 'Adjacency List for RAG', 'Wait-For Graph']
      },
      gate: {
        frequentQuestions: [
          'Find the safe sequence for a given Banker\'s allocation table.',
          'Can a specific process request be granted immediately?',
          'Minimum number of resource units required to prevent deadlock.'
        ],
        commonTraps: [
          'Concluding an unsafe state is already deadlocked (an unsafe state may finish if processes do not request their maximum declared need simultaneously).',
          'Thinking a cycle in a multi-instance graph always implies deadlock.'
        ],
        solvedExampleSnippet: 'Q: Given Need <= Available, P1 executes and adds its Allocation to Available. Repeat to find sequence <P1, P3, P0, P2, P4>.'
      },
      expert: {
        modernOSImpl: 'Database management systems (e.g. Postgres) actively build wait-for graphs and run continuous cycle-detection background threads, aborting the newest transaction upon cycle detection.'
      }
    }
  },
  {
    id: 'module_08',
    number: 8,
    title: 'Main Memory Management & Allocation',
    category: 'Memory & Storage',
    description: 'Logical vs physical address space, MMU, compile/load/run-time binding, fixed vs variable partitions, First Fit, Best Fit, Worst Fit, fragmentation.',
    iconName: 'Layers',
    visualizerId: 'memory_allocation',
    gateWeightage: '6 - 8% (Address binding, First/Best/Worst Fit, Fragmentation)',
    topics: [
      'Logical vs Physical Address Space',
      'Memory Management Unit (MMU) & Relocation Register',
      'Address Binding (Compile time, Load time, Execution time)',
      'Contiguous Memory Allocation',
      'Fixed Partitioning (MFT) vs Variable Partitioning (MVT)',
      'Internal vs External Fragmentation',
      'First Fit, Best Fit, Worst Fit, Next Fit',
      'Compaction & Swapping'
    ],
    keyFormulas: [
      'Physical Address = Relocation Register (Base) + Logical Address',
      'Address validity check: 0 <= Logical Address < Limit Register',
      '50-Percent Rule: For First Fit, if N allocated blocks, approx 0.5 N blocks lost to fragmentation'
    ],
    progressiveContent: {
      basic: {
        summary: 'Memory management is about dividing RAM between the OS kernel and user processes while ensuring processes cannot read or overwrite each other\'s memory.',
        analogy: 'Parking lots: Fixed parking stalls (Internal fragmentation if a motorcycle parks in a semi-truck stall); Open curb parking (External fragmentation when gaps between parked cars are too small for a new car).',
        keyConcepts: [
          { name: 'Internal Fragmentation', desc: 'Allocated space inside a partition that is larger than requested and left unused.' },
          { name: 'External Fragmentation', desc: 'Total free space is sufficient to satisfy a request, but it is split into tiny non-contiguous blocks.' }
        ]
      },
      interactive: {
        visualDescription: 'Interactive RAM bar with expandable and draggable memory blocks, colored allocation chunks, and live fragmentation indicators.',
        suggestedAction: 'Allocate processes of different sizes under First Fit vs Best Fit vs Worst Fit to see which algorithm produces the worst fragmentation.'
      },
      advanced: {
        kernelDetails: 'Modern operating systems resolve external fragmentation by dispensing with contiguous allocation entirely through hardware-assisted paging.',
        edgeCases: [
          'Best Fit paradox: Best Fit produces the smallest leftover fragments, which are usually too tiny for any other process to use, worsening external fragmentation.',
          'Dynamic relocation allows processes to be moved in RAM during runtime simply by updating the MMU base register.'
        ],
        dataStructures: ['Free-list linked lists', 'Buddy Allocator Binary Trees', 'Memory Hole Bitmaps']
      },
      gate: {
        frequentQuestions: [
          'Which allocation algorithm runs fastest? (First Fit).',
          'Which partition system suffers from internal fragmentation? (Fixed partitioning).',
          'Calculate total wasted memory given block and process sizes.'
        ],
        commonTraps: [
          'Assuming Best Fit is always mathematically superior to First Fit (Best Fit creates unusable micro-holes and is slower to search).'
        ],
        solvedExampleSnippet: 'Q: Blocks: 100, 500, 200, 300, 600. Process: 212. Best Fit allocates in 300 (hole=88). Worst Fit allocates in 600 (hole=388).'
      },
      expert: {
        modernOSImpl: 'The Linux kernel memory manager uses the Buddy System for contiguous physical page frames and SLAB/SLUB allocators for small kernel data structures.'
      }
    }
  },
  {
    id: 'module_09',
    number: 9,
    title: 'Paging & Address Translation',
    category: 'Memory & Storage',
    description: 'Pages, frames, page tables, MMU hardware translation, multi-level paging, inverted page tables, Translation Lookaside Buffer (TLB), EMAT.',
    iconName: 'Grid',
    visualizerId: 'paging_tlb',
    gateWeightage: '12 - 15% (Heaviest GATE numerical topic: EMAT, bits, page table sizes)',
    topics: [
      'Paging Concept & Elimination of External Fragmentation',
      'Page Size, Frames, and Offset Decomposition',
      'Page Table Architecture & Page Table Entries (PTE)',
      'Virtual-to-Physical Address Translation Steps',
      'Translation Lookaside Buffer (TLB) & Associative Search',
      'Effective Memory Access Time (EMAT) Calculations',
      'Multi-Level Paging (Two-level, Three-level)',
      'Inverted Page Tables & Hash Tables'
    ],
    keyFormulas: [
      'Page Size = 2^d Bytes, where d = number of offset bits',
      'Virtual Pages = 2^(n - d), where n = Virtual Address bits',
      'Physical Address = (Frame Number << d) | Offset',
      'EMAT = h * (t_TLB + t_MEM) + (1 - h) * (t_TLB + (L + 1) * t_MEM) for L levels of paging'
    ],
    progressiveContent: {
      basic: {
        summary: 'Paging cuts a book into equal-sized pages (e.g. 4KB) and places each page in ANY free shelf slot (frame) in physical RAM. A page table acts as the index card pointing from book page number to shelf slot.',
        analogy: 'A binder where you can insert loose-leaf pages anywhere in any order: you find the page by checking the table of contents.',
        keyConcepts: [
          { name: 'TLB', desc: 'A blazing-fast hardware cache on the CPU chip storing the most recently translated Page -> Frame mappings.' },
          { name: 'Multi-Level Paging', desc: 'Paging the page table itself so that unused regions of virtual address space do not waste physical RAM.' }
        ]
      },
      interactive: {
        visualDescription: 'Live address breakdown widget showing Virtual Address -> VPN | Offset -> TLB hit/miss animation -> Page Table Lookup -> Physical Address.',
        suggestedAction: 'Type any 32-bit address and watch the bits split into Level 1, Level 2, and Offset, highlighting the exact frame in memory.'
      },
      advanced: {
        kernelDetails: 'x86-64 uses 4-level (or 5-level) paging (PML4 -> PDPT -> PD -> PT) with a 48-bit (or 57-bit) virtual address space. CR3 register holds the root page table physical pointer.',
        edgeCases: [
          'TLB shootdown: when modifying a page table entry on one CPU core in a multicore system, an Inter-Processor Interrupt (IPI) must invalidate sibling TLBs.',
          'PTE flags: Present bit, Read/Write bit, User/Supervisor bit, Accessed bit, Dirty bit, NX (No-Execute) bit.'
        ],
        dataStructures: ['4-level Page Directory Hierarchy', 'Inverted Page Table Hash Buckets', 'TLB CAM (Content-Addressable Memory)']
      },
      gate: {
        frequentQuestions: [
          'Calculate EMAT given TLB hit ratio and memory access times.',
          'Calculate number of levels of paging required for page table to fit in 1 frame.',
          'Calculate size of Page Table given virtual address bits and page size.'
        ],
        commonTraps: [
          'Using virtual address bits to calculate frame count instead of physical memory size.',
          'Forgetting that a k-level page table miss requires (k + 1) memory accesses in total (k for page tables + 1 for actual data).'
        ],
        solvedExampleSnippet: 'Q: 32-bit address, 4KB page, 4B PTE. Page table size = (2^32 / 2^12) * 4B = 2^20 * 4B = 4 MB.'
      },
      expert: {
        modernOSImpl: 'Linux uses Transparent Huge Pages (THP) of 2 MB or 1 GB to reduce TLB misses for memory-intensive workloads like databases and virtual machines.'
      }
    }
  },
  {
    id: 'module_10',
    number: 10,
    title: 'Virtual Memory & Demand Paging',
    category: 'Memory & Storage',
    description: 'Demand paging, page fault handling lifecycle, copy-on-write (COW), thrashing, working set model, page fault frequency (PFF).',
    iconName: 'HardDrive',
    visualizerId: 'paging_tlb',
    gateWeightage: '8 - 10% (Page fault handling steps, Effective access time with page faults)',
    topics: [
      'Virtual Memory Concept (Execution of partially loaded programs)',
      'Demand Paging & Lazy Swapper',
      'Valid-Invalid Bit in Page Table',
      'The 6 Steps of Page Fault Handling',
      'Effective Access Time with Page Fault Rate (p)',
      'Copy-On-Write (COW) in fork()',
      'Thrashing & CPU Utilization Collapse',
      'Working Set Model & Page Fault Frequency (PFF)'
    ],
    keyFormulas: [
      'Effective Access Time (EAT) = (1 - p) * t_MEM + p * t_PageFaultServiceTime',
      'Working Set W(t, delta) = set of distinct pages referenced in time window [t - delta, t]'
    ],
    progressiveContent: {
      basic: {
        summary: 'Virtual memory creates the illusion that your computer has vastly more RAM than physically installed by storing inactive pages on the SSD and loading them only on demand.',
        analogy: 'Studying in a library with a tiny desk: you only keep the 3 books you are currently reading on the desk; the other 50 books stay on library shelves until you need them.',
        keyConcepts: [
          { name: 'Page Fault', desc: 'A hardware trap generated by the MMU when an accessed virtual page is marked invalid (not currently present in physical RAM).' },
          { name: 'Thrashing', desc: 'When the system spends more time swapping pages in and out of disk than executing real user instructions.' }
        ]
      },
      interactive: {
        visualDescription: 'Animated page fault execution sequence showing: Instruction Trap -> OS context save -> Disk read issued -> Process sleeps -> I/O done interrupt -> Page table updated -> Instruction re-executed.',
        suggestedAction: 'Increase the page fault rate slider to observe the sudden cliff in CPU utilization indicating the onset of thrashing.'
      },
      advanced: {
        kernelDetails: 'When memory pressure rises, the Linux kswapd kernel daemon wakes up, scans inactive LRU page lists, flushes dirty pages to swap space, and frees frames before out-of-memory occurs.',
        edgeCases: [
          'Instruction restartability: an instruction that modified multiple registers before faulting (like auto-increment addressing) must be carefully restored by the kernel.',
          'Anonymous pages (heap/stack) backed by swap file vs file-backed pages (code/data) backed by disk files.'
        ],
        dataStructures: ['Active and Inactive Page LRU Lists', 'Swap Map Inodes', 'mm_struct and vm_area_struct']
      },
      gate: {
        frequentQuestions: [
          'Calculate maximum tolerable page fault rate p for less than 10% performance degradation.',
          'Chronological order of the 6 page fault handling steps.',
          'What causes thrashing and how does the Working Set model prevent it?'
        ],
        commonTraps: [
          'Forgetting that page fault service time is measured in milliseconds (ms), while RAM access time is in nanoseconds (ns) — a factor of 1,000,000 difference!'
        ],
        solvedExampleSnippet: 'Q: t_mem=100ns, page fault time=10ms=10^7ns. For EAT <= 200ns: (1-p)*100 + p*10^7 <= 200 => p <= 1 / 100,000.'
      },
      expert: {
        modernOSImpl: 'When RAM is completely exhausted and swap is full, the Linux Out-Of-Memory (OOM) Killer calculates badness scores and sends SIGKILL to the biggest offending process.'
      }
    }
  },
  {
    id: 'module_11',
    number: 11,
    title: 'Page Replacement Algorithms',
    category: 'Memory & Storage',
    description: 'FIFO, Optimal (Belady Min), Least Recently Used (LRU), Second Chance (Clock), Belady\'s Anomaly, stack algorithms.',
    iconName: 'RefreshCw',
    visualizerId: 'page_replacement',
    gateWeightage: '10 - 12% (Numerical questions every year on LRU, FIFO, Optimal)',
    topics: [
      'Need for Page Replacement during Page Fault',
      'First-In First-Out (FIFO) Replacement',
      'Belady\'s Anomaly (More frames causing more page faults)',
      'Optimal Page Replacement (OPT / MIN)',
      'Least Recently Used (LRU) Algorithm',
      'Approximation of LRU: Second Chance (Clock) Algorithm',
      'Counting-Based Algorithms (LFU vs MFU)',
      'Stack Algorithms Property (Inclusion Property)'
    ],
    keyFormulas: [
      'Page Fault Ratio = (Total Page Faults / Total References) * 100%',
      'Hit Ratio = (Total Hits / Total References) * 100%',
      'Stack Algorithm Property: Set of pages in n frames is always a subset of pages in (n+1) frames'
    ],
    progressiveContent: {
      basic: {
        summary: 'When a page fault occurs and all memory frames are full, the OS must choose which innocent page to kick out to make room.',
        analogy: 'A small refrigerator: when you buy a new carton of milk, which expired food container do you throw in the trash?',
        keyConcepts: [
          { name: 'LRU', desc: 'Evicts the page that has not been accessed for the longest period of time (exploiting temporal locality).' },
          { name: 'Belady\'s Anomaly', desc: 'The counterintuitive phenomenon in FIFO where increasing the number of physical frames increases page faults.' }
        ]
      },
      interactive: {
        visualDescription: 'Interactive matrix comparison of FIFO vs LRU vs Optimal vs Clock with customizable reference string and frame slider.',
        suggestedAction: 'Click "Test Belady\'s Anomaly" to run the classic string [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5] on 3 vs 4 frames.'
      },
      advanced: {
        kernelDetails: 'Pure LRU is too costly to implement in hardware (requires timestamp update or stack manipulation on every memory access); OSes implement Clock / Two-Handed Clock approximations.',
        edgeCases: [
          'Dirty bit optimization: replacing a clean (unmodified) page costs 0 disk writes; replacing a dirty page requires saving to disk first.',
          'Optimal algorithm is impossible to implement in real time because it requires prophetic knowledge of future memory accesses.'
        ],
        dataStructures: ['Circular Buffer for Clock Hand', 'Doubly Linked Hash Map (LRU cache)', 'Dirty and Referenced Bit Vectors']
      },
      gate: {
        frequentQuestions: [
          'Count total page faults for a reference string under FIFO, LRU, and Optimal.',
          'Which page replacement algorithms suffer from Belady\'s Anomaly? (FIFO, but NOT LRU or Optimal).',
          'What is a stack algorithm?'
        ],
        commonTraps: [
          'Looking backward instead of forward when computing Optimal page replacement.',
          'Not resetting the reference bit to 0 during Second Chance clock sweeps.'
        ],
        solvedExampleSnippet: 'Q: Can Optimal suffer from Belady\'s Anomaly? Answer: NO. Optimal and LRU are stack algorithms and strictly obey the inclusion property.'
      },
      expert: {
        modernOSImpl: 'Modern databases and operating systems use 2Q (Two Queue) or Adaptive Replacement Cache (ARC), dynamically balancing between frequency and recency.'
      }
    }
  },
  {
    id: 'module_12',
    number: 12,
    title: 'Segmentation & Hybrid Systems',
    category: 'Memory & Storage',
    description: 'Segmentation concept, programmer\'s view of memory, Segment Table (Base, Limit), address translation, segmentation with paging.',
    iconName: 'Columns',
    visualizerId: 'paging_tlb',
    gateWeightage: '4 - 6% (Segment table translation, Base and Limit checks)',
    topics: [
      'Programmer\'s Logical View of Memory (Code, Data, Stack, Symbol Table)',
      'Segmentation vs Paging',
      'Segment Table Architecture (Base and Limit)',
      'Address Translation with Segmentation',
      'Protection & Sharing in Segmentation',
      'Segmentation with Paging (MULTICS & x86 Architecture)',
      'External Fragmentation in Pure Segmentation'
    ],
    keyFormulas: [
      'Logical Address = (Segment Number, Offset)',
      'Validity Check: Offset < Limit, otherwise Trap (Addressing Exception)',
      'Physical Address = Base + Offset'
    ],
    progressiveContent: {
      basic: {
        summary: 'Paging cuts memory into arbitrary fixed blocks; Segmentation divides memory logically according to program modules (functions, arrays, stack, code).',
        analogy: 'Paging is like buying uniform 1-foot square storage cubes; Segmentation is like tailor-making custom boxes for your shoes, guitars, and books.',
        keyConcepts: [
          { name: 'Segment Table', desc: 'Contains the physical starting address (Base) and the valid length (Limit) of each segment.' },
          { name: 'Protection Violation', desc: 'Occurs if an offset exceeds the segment\'s Limit or attempts unauthorized write to read-only code.' }
        ]
      },
      interactive: {
        visualDescription: 'Segment Table interactive decoder showing: Logical Address (s, d) -> Comparator check (d < Limit) -> Base + d adder -> Physical Address.',
        suggestedAction: 'Enter an offset greater than the Limit to trigger an interactive segmentation fault warning.'
      },
      advanced: {
        kernelDetails: 'x86 legacy architecture uses segment registers (CS, DS, SS, ES) and Global Descriptor Tables (GDT). In 64-bit mode (long mode), segmentation is mostly disabled (flat memory model).',
        edgeCases: [
          'Shared segments: multiple processes sharing the exact same code segment base pointer with read-only execute permissions.',
          'Dynamic segment growth for user call stack.'
        ],
        dataStructures: ['Global Descriptor Table (GDT)', 'Local Descriptor Table (LDT)', 'Segment Selector Registers']
      },
      gate: {
        frequentQuestions: [
          'Given Segment Table with Base and Limit, find physical address or identify segmentation fault.',
          'Differences between Paging and Segmentation.',
          'Does pure segmentation suffer from internal or external fragmentation? (External).'
        ],
        commonTraps: [
          'Calculating physical address without checking if offset < Limit first (if offset >= Limit, it causes an error, NOT a physical address).'
        ],
        solvedExampleSnippet: 'Q: Segment 2: Base=2000, Limit=400. Offset=450. Result: Segmentation Fault (Offset 450 exceeds Limit 400).'
      },
      expert: {
        modernOSImpl: 'Modern x86-64 Linux programs use a flat memory model (Base=0, Limit=2^64-1) with paging handling all actual protection and translation.'
      }
    }
  },
  {
    id: 'module_13',
    number: 13,
    title: 'Cache Memory Hierarchy & AMAT',
    category: 'Hardware & I/O',
    description: 'Cache organization, Direct-mapped, Fully Associative, Set-Associative, Tag/Index/Offset bit breakdown, AMAT, write policies, cache coherence.',
    iconName: 'Zap',
    visualizerId: 'cache_hierarchy',
    gateWeightage: '10 - 12% (Tag/Index/Offset bits, AMAT numerical calculations)',
    topics: [
      'Memory Hierarchy (Registers, L1, L2, L3, RAM, Disk)',
      'Principle of Locality (Temporal vs Spatial Locality)',
      'Direct-Mapped Cache',
      'Set-Associative Cache (2-way, 4-way, n-way)',
      'Fully Associative Cache',
      'Tag, Index, and Block Offset Bit Calculations',
      'Average Memory Access Time (AMAT) & Multi-level AMAT',
      'Write-Through vs Write-Back (Dirty bit)',
      'Cache Coherence Basics (MESI Protocol)'
    ],
    keyFormulas: [
      'Offset bits = log2(Block Size in Bytes)',
      'Number of Sets = Cache Size / (Associativity * Block Size)',
      'Index bits = log2(Number of Sets)',
      'Tag bits = Physical Address bits - Index bits - Offset bits',
      'AMAT = HitTime + MissRate * MissPenalty'
    ],
    progressiveContent: {
      basic: {
        summary: 'CPUs execute billions of instructions per second, but RAM takes over 100 cycles to deliver a byte. Cache is a tiny, lightning-fast memory sitting right next to the ALU to prevent the CPU from starving.',
        analogy: 'A chef cooking: Spices in hand (Registers), spices on immediate counter (L1 Cache), spices on pantry shelf (L2/L3), grocery store downtown (RAM).',
        keyConcepts: [
          { name: 'Spatial Locality', desc: 'If you access byte k, you will likely access nearby bytes k+1, k+2 soon (why we fetch whole blocks).' },
          { name: 'Temporal Locality', desc: 'If you access variable x now, you will likely access x again in the immediate future (loops, counters).' }
        ]
      },
      interactive: {
        visualDescription: '3D & 2D interactive cache hierarchy showing CPU -> L1 -> L2 -> L3 -> RAM -> SSD with animated photon packets.',
        suggestedAction: 'Change Cache Size, Block Size, and Associativity to see the Tag, Index, and Offset bit split update live.'
      },
      advanced: {
        kernelDetails: 'Hardware prefetchers detect linear memory access strides and preload cache lines into L1/L2 before instructions request them.',
        edgeCases: [
          'False Sharing: two threads on different cores modifying independent variables that happen to sit in the same 64-byte cache line.',
          'Conflict misses in direct-mapped caches vs capacity misses in fully associative caches.'
        ],
        dataStructures: ['MESI State Machine (Modified, Exclusive, Shared, Invalid)', 'Snoop Bus Filter', 'LRU Tag Array']
      },
      gate: {
        frequentQuestions: [
          'Calculate number of Tag, Set, and Offset bits given cache specifications.',
          'Calculate overall AMAT for a 2-level or 3-level cache system.',
          'Calculate total cache memory size including Tag and Valid overhead bits.'
        ],
        commonTraps: [
          'Confusing bytes with words in address offset calculation.',
          'Forgetting that in Fully Associative cache, there is NO index field (0 index bits).'
        ],
        solvedExampleSnippet: 'Q: 32-bit address, 32KB cache, 64B block, 4-way. Offset=log2(64)=6. Sets=32K/(4*64)=128 -> Index=7. Tag=32-7-6=19 bits.'
      },
      expert: {
        modernOSImpl: 'Modern Intel/AMD CPUs use inclusive L3 caches acting as snoop filters for L1/L2 caches, with 64-byte standard cache lines.'
      }
    }
  },
  {
    id: 'module_14',
    number: 14,
    title: 'I/O Systems & DMA Architecture',
    category: 'Hardware & I/O',
    description: 'I/O hardware, polling, interrupt-driven I/O, Direct Memory Access (DMA), cycle stealing, device drivers, buffering, spooling.',
    iconName: 'Server',
    visualizerId: 'dma_interrupt',
    gateWeightage: '4 - 6% (DMA cycle stealing, Polling vs Interrupt overhead)',
    topics: [
      'I/O Hardware & Device Controllers',
      'Memory-Mapped I/O vs Port-Mapped I/O',
      'Programmed I/O (Polling) & Busy Waiting',
      'Interrupt-Driven I/O Architecture',
      'Direct Memory Access (DMA) Principle',
      'Burst Mode vs Cycle Stealing DMA Mode',
      'I/O Buffering (Single buffer, Double buffer, Circular buffer)',
      'Spooling (Simultaneous Peripheral Operations On-Line)'
    ],
    keyFormulas: [
      'CPU Idle / Stolen Time in DMA = (Data Transfer Rate / Memory Bandwidth) * 100%',
      'Double Buffering Speedup: Overlaps I/O transfer of block k+1 with CPU processing of block k'
    ],
    progressiveContent: {
      basic: {
        summary: 'If the CPU had to personally copy every byte from an SSD or network card to RAM, it would spend 99% of its life waiting. DMA lets hardware devices copy data straight to RAM on their own.',
        analogy: 'A CEO (CPU) delegating freight delivery: instead of carrying boxes one by one, the CEO signs an authorization form (DMA command) and lets the movers (DMA controller) unload the truck directly into the warehouse (RAM).',
        keyConcepts: [
          { name: 'DMA', desc: 'Specialized hardware that transfers blocks of data between I/O devices and main memory without continuous CPU intervention.' },
          { name: 'Cycle Stealing', desc: 'The DMA controller temporarily takes control of the memory bus for 1 bus cycle while the CPU is executing internal operations.' }
        ]
      },
      interactive: {
        visualDescription: 'Interactive animation of DMA controller taking bus control from CPU and pumping data packets directly from Disk to RAM.',
        suggestedAction: 'Toggle between Polling mode (CPU pegged at 100% busy wait) and DMA mode (CPU free to compute other tasks).'
      },
      advanced: {
        kernelDetails: 'Scatter-gather DMA allows a single DMA command to transfer data to or from multiple non-contiguous physical memory pages.',
        edgeCases: [
          'Cache coherency during DMA: DMA writes directly to RAM, potentially leaving stale data in the CPU cache (requires cache invalidation or snooping).',
          'Interrupt coalescing on high-speed 100GbE network adapters.'
        ],
        dataStructures: ['DMA Descriptor Ring Buffers', 'Device Register Maps', 'Interrupt Service Routine (ISR) Vectors']
      },
      gate: {
        frequentQuestions: [
          'Calculate percentage of CPU time consumed by DMA cycle stealing.',
          'Polling vs Interrupt trade-off: at what data rate does polling become more efficient than interrupts?',
          'Memory-mapped I/O address decoding.'
        ],
        commonTraps: [
          'Assuming the CPU is completely frozen during DMA (CPU continues executing instructions out of cache and registers unless it attempts to access the memory bus).'
        ],
        solvedExampleSnippet: 'Q: Device transfers at 2MB/s. Bus bandwidth is 20MB/s. CPU cycle stolen fraction = 2 / 20 = 10%.'
      },
      expert: {
        modernOSImpl: 'Modern high-performance Linux services use io_uring, an asynchronous zero-copy ring-buffer interface between user space and kernel space.'
      }
    }
  },
  {
    id: 'module_15',
    number: 15,
    title: 'Magnetic Disk Structure & Physical Storage',
    category: 'Memory & Storage',
    description: 'Disk platters, tracks, sectors, cylinders, read/write heads, seek time, rotational latency, transfer time, disk bandwidth.',
    iconName: 'Disc',
    visualizerId: 'disk_scheduling',
    gateWeightage: '4 - 6% (Disk access time calculations, Track/Sector numericals)',
    topics: [
      'Physical Disk Geometry (Platters, Surfaces, Tracks, Sectors)',
      'Cylinder Concept (Tracks across all platter surfaces at same radius)',
      'Components of Disk Access Time',
      'Seek Time (Arm mechanical movement)',
      'Rotational Latency (Average latency = 1/2 revolution time)',
      'Transfer Time & Disk Bandwidth',
      'Solid State Disks (SSDs) & Flash NAND vs Magnetic Disks'
    ],
    keyFormulas: [
      'Total Access Time = Seek Time + Rotational Latency + Transfer Time + Controller Overhead',
      'Average Rotational Latency = 1 / (2 * RPM) * 60 seconds',
      'Transfer Time = (Data to Transfer / Track Capacity) * (60 / RPM)'
    ],
    progressiveContent: {
      basic: {
        summary: 'A mechanical hard drive is a high-precision record player with magnetic platters spinning at 7200 RPM while microscopic heads hover nanometers above.',
        analogy: 'Finding a song on a vinyl record: moving the needle arm to the track radius (Seek Time), waiting for the record to spin to the start of the song (Rotational Latency), and playing the audio (Transfer Time).',
        keyConcepts: [
          { name: 'Seek Time', desc: 'The mechanical time taken by the disk arm to reposition the read/write head over the target cylinder (most expensive component).' },
          { name: 'Cylinder', desc: 'The vertical set of all circular tracks across all platter surfaces located at the same radial distance from the spindle.' }
        ]
      },
      interactive: {
        visualDescription: 'Interactive 3D spinning magnetic disk platter with animated moving actuator arm, highlighted cylinder tracks, and read head.',
        suggestedAction: 'Adjust disk RPM (5400 vs 7200 vs 15000 RPM) to observe rotational latency drop in real time.'
      },
      advanced: {
        kernelDetails: 'Bad sector remapping: modern disks maintain reserved spare sectors and automatically remap failing sectors transparently at the drive controller level.',
        edgeCases: [
          'Track skewing: staggering sector 0 on adjacent tracks to account for head switch and single-cylinder seek times.',
          'Cylinder head sector (CHS) addressing vs modern Logical Block Addressing (LBA).'
        ],
        dataStructures: ['LBA Mapping Table', 'Disk Request Queues', 'S.M.A.R.T. Health Telemetry']
      },
      gate: {
        frequentQuestions: [
          'Calculate total disk access time given RPM, seek time, sector size, and transfer rate.',
          'Calculate average rotational latency in milliseconds.',
          'Data capacity of a multi-surface disk pack.'
        ],
        commonTraps: [
          'Using the time for a FULL revolution instead of HALF a revolution for average rotational latency.',
          'Forgetting to multiply by the number of recording surfaces when calculating total disk capacity.'
        ],
        solvedExampleSnippet: 'Q: 7200 RPM disk. Time for 1 rev = 60 / 7200 = 8.33 ms. Average rotational latency = 8.33 / 2 = 4.17 ms.'
      },
      expert: {
        modernOSImpl: 'Modern NVMe SSDs connect directly to PCIe lanes bypassing traditional SATA AHCI controllers, supporting up to 64,000 parallel queues with 64,000 commands each.'
      }
    }
  },
  {
    id: 'module_16',
    number: 16,
    title: 'Disk Scheduling Algorithms',
    category: 'Memory & Storage',
    description: 'FCFS, SSTF, SCAN (Elevator), C-SCAN, LOOK, C-LOOK, total head movement, seek time minimization, and variance.',
    iconName: 'Compass',
    visualizerId: 'disk_scheduling',
    gateWeightage: '8 - 10% (Seek count calculations every year)',
    topics: [
      'Goal of Disk Scheduling: Minimize Seek Time & Maximize Bandwidth',
      'First-Come First-Served (FCFS) Disk Scheduling',
      'Shortest Seek Time First (SSTF) & Starvation Risk',
      'SCAN (Elevator Algorithm)',
      'Circular SCAN (C-SCAN) & Uniform Waiting Time',
      'LOOK and Circular LOOK (C-LOOK)',
      'Total Head Movement (THM) Calculations',
      'Algorithm Comparison: Seek Distance vs Fairness'
    ],
    keyFormulas: [
      'Total Head Movement = sum(|Cylinder_{i+1} - Cylinder_i|)',
      'SCAN boundary touch: Reaches cylinder 0 or Max Cylinder before reversing',
      'LOOK boundary behavior: Reverses immediately at the furthest requested track'
    ],
    progressiveContent: {
      basic: {
        summary: 'Since mechanical arm movement is the slowest part of reading a hard drive, disk scheduling orders pending I/O requests to minimize wild back-and-forth arm thrashing.',
        analogy: 'An elevator in a skyscraper: instead of going from floor 1 to floor 50 to floor 2 to floor 48 (FCFS), it travels steadily upward servicing floors in order, then reverses downward (SCAN).',
        keyConcepts: [
          { name: 'SSTF', desc: 'Services the closest track to current head position. Minimizes immediate seek, but starves far-away tracks.' },
          { name: 'C-SCAN', desc: 'Sweeps in only ONE direction servicing requests, then zips straight back to cylinder 0 without servicing. Ensures equitable wait times.' }
        ]
      },
      interactive: {
        visualDescription: 'Visual cylinder timeline comparing FCFS, SSTF, SCAN, and C-LOOK trajectories side-by-side with step-by-step head animation.',
        suggestedAction: 'Input an initial head position and request queue, select SCAN vs LOOK, and observe whether the head visits the physical boundary cylinder.'
      },
      advanced: {
        kernelDetails: 'Modern operating systems pair disk schedulers with anticipatory scheduling, waiting a few milliseconds after servicing a read request to catch adjacent reads from the same process.',
        edgeCases: [
          'Boundary touching: in GATE questions, verify whether SCAN touches the cylinder boundary (0 or Max-1) if no request exists at the boundary (standard SCAN does, LOOK does not).',
          'Direction parameter: starting sweep towards inward (track 0) vs outward (track Max).'
        ],
        dataStructures: ['Elevator Request Queue (Linux BFQ / mq-deadline)', 'Deadline FIFO Queues']
      },
      gate: {
        frequentQuestions: [
          'Calculate total head movement for SSTF, SCAN, and C-SCAN.',
          'Which algorithm provides the lowest variance in response time? (C-SCAN).',
          'Which algorithm suffers from starvation? (SSTF).'
        ],
        commonTraps: [
          'Making SCAN reverse before reaching the disk boundary (that is LOOK, not SCAN!).',
          'Adding seek distance for the circular return trip in C-SCAN when the question specifies it is zero-cost or separate.'
        ],
        solvedExampleSnippet: 'Q: Head at 50, requests 30, 70, 90. SCAN towards right (max 100): 50 -> 70 -> 90 -> 100 -> 30. Movement = (100 - 50) + (100 - 30) = 50 + 70 = 120.'
      },
      expert: {
        modernOSImpl: 'For NVMe SSDs, mechanical disk schedulers are disabled; Linux uses the "none" or "kyber" multi-queue scheduler since random access has zero seek latency.'
      }
    }
  },
  {
    id: 'module_17',
    number: 17,
    title: 'File System Interface & Directory Structure',
    category: 'Memory & Storage',
    description: 'File concept, attributes, operations, directory organizations (Single-level, Two-level, Tree, Acyclic Graph, General Graph), hard links vs symbolic links.',
    iconName: 'Folder',
    visualizerId: 'file_system',
    gateWeightage: '4 - 6% (Directory graphs, Inode links, Path resolution)',
    topics: [
      'File Concept & User View',
      'File Attributes (Name, Identifier, Type, Location, Size, Permissions)',
      'File Access Methods (Sequential, Direct/Random, Indexed)',
      'Directory Structures (Single-level, Tree, Acyclic Graph, General Graph)',
      'Dangling Pointers & Reference Counting in Acyclic Graphs',
      'Hard Links vs Symbolic (Soft) Links',
      'File System Mounting & Virtual File System (VFS)'
    ],
    keyFormulas: [
      'Hard Link: Multiple directory entries pointing to the EXACT same Inode (ref count incremented)',
      'Soft Link: Independent file whose content is the path string to the target file'
    ],
    progressiveContent: {
      basic: {
        summary: 'A file system gives structure to raw bytes on a drive, organizing billions of 1s and 0s into named folders, files, and permissions you can browse.',
        analogy: 'A warehouse: without a filing system, goods are dumped in random piles; with a file system, every item has an aisle number, bin tag, and catalog entry.',
        keyConcepts: [
          { name: 'Hard Link', desc: 'A direct pointer to the file inode. Deleting the original name keeps the file alive as long as link count > 0.' },
          { name: 'Symbolic Link', desc: 'A shortcut file containing the text path of another file. If target is deleted, the symlink breaks.' }
        ]
      },
      interactive: {
        visualDescription: 'Interactive Virtual File Explorer: create files, folders, hard links, and soft links, inspect inode reference counts.',
        suggestedAction: 'Delete the source file of a hard link and observe how the file data remains accessible via the secondary link.'
      },
      advanced: {
        kernelDetails: 'Linux Virtual File System (VFS) provides an object-oriented abstraction layer with four core object types: superblock, inode, dentry, and file.',
        edgeCases: [
          'Cycles in general graph directory structures require garbage collection or loop-detection during recursive traversal.',
          'Cross-filesystem links: hard links cannot cross filesystem boundaries; soft links can.'
        ],
        dataStructures: ['dentry (Directory Entry Cache in Linux)', 'inode structure', 'Mount Table']
      },
      gate: {
        frequentQuestions: [
          'What happens to a hard link when the original file is deleted?',
          'Which directory structure allows shared subdirectories without cycles? (Acyclic Graph).',
          'Difference between hard link and symbolic link.'
        ],
        commonTraps: [
          'Believing hard links create a copy of the file data (they share the exact same disk blocks and inode).'
        ],
        solvedExampleSnippet: 'Q: File F has hard link L. F is removed. Does L still read the contents? Answer: YES. Inode reference count decrements from 2 to 1; data is preserved.'
      },
      expert: {
        modernOSImpl: 'Modern filesystems like ZFS and Btrfs use Copy-on-Write (COW) transactions, snapshotting, and checksumming of every block to prevent silent data corruption.'
      }
    }
  },
  {
    id: 'module_18',
    number: 18,
    title: 'File Allocation Methods & Inodes',
    category: 'Memory & Storage',
    description: 'Contiguous, linked, and indexed file allocation, UNIX Inode multi-level index architecture, maximum file size calculations.',
    iconName: 'FileText',
    visualizerId: 'file_system',
    gateWeightage: '8 - 10% (Maximum file size calculations using Inodes every year)',
    topics: [
      'File Allocation Methods Overview',
      'Contiguous Allocation (Pros: Fast sequential/random; Cons: External fragmentation)',
      'Linked Allocation & File Allocation Table (FAT)',
      'Indexed Allocation & Index Blocks',
      'UNIX Inode Architecture (Direct, Single Indirect, Double Indirect, Triple Indirect)',
      'Calculation of Maximum File Size supported by Inode',
      'Space Overhead & Disk Block Address Pointers'
    ],
    keyFormulas: [
      'Pointers per Block = Block Size / Disk Pointer Size',
      'Max File Size = (Direct + P * Single + P^2 * Double + P^3 * Triple) * Block Size, where P = Pointers per Block'
    ],
    progressiveContent: {
      basic: {
        summary: 'When you save a 50MB video, the OS must decide which 4KB disk blocks to allocate. It can lay them out back-to-back (Contiguous), chain them like a treasure hunt (Linked), or keep an index book (Indexed / Inode).',
        analogy: 'Contiguous is booking an entire row of 10 adjacent airline seats; Linked is each passenger having a note in their pocket telling you where the next friend is seated; Inode is the flight attendant holding the master passenger seating chart.',
        keyConcepts: [
          { name: 'Inode', desc: 'The index data structure in UNIX that stores file metadata and block pointers (direct, indirect).' },
          { name: 'Double Indirect', desc: 'A pointer pointing to a block of pointers, each of which points to another block of pointers, which finally point to data blocks.' }
        ]
      },
      interactive: {
        visualDescription: 'Interactive Inode Block Diagram showing Direct Pointers (0-11), Single Indirect, Double Indirect, and Triple Indirect branching trees.',
        suggestedAction: 'Change Block Size and Pointer Size to see the Maximum Supported File Size calculated live.'
      },
      advanced: {
        kernelDetails: 'Ext4 uses extents (a contiguous range of up to 32,768 physical blocks stored in a B-tree) instead of classical indirect blocks, vastly reducing metadata overhead.',
        edgeCases: [
          'Sparse files: files with huge gaps of zeros allocate zero physical data blocks on disk until non-zero bytes are written.',
          'Small file inlining: storing file data directly inside unused space of the inode structure itself (e.g. ext4 inline data).'
        ],
        dataStructures: ['ext4_inode', 'Extent Tree Node', 'FAT32 Table Entries']
      },
      gate: {
        frequentQuestions: [
          'Calculate maximum file size supported by an Inode with 12 direct, 1 single, 1 double, and 1 triple indirect pointers.',
          'How many disk accesses are required to read byte number X of a file?',
          'Trade-offs between Contiguous, Linked, and Indexed allocation.'
        ],
        commonTraps: [
          'Forgetting to multiply the number of addressable blocks by the Block Size to get the answer in Bytes/MB/GB.',
          'Confusing pointer size with block size.'
        ],
        solvedExampleSnippet: 'Q: Block=1KB, Pointer=4B. Pointers/block = 1024/4 = 256. With 12 direct + 1 single: max blocks = 12 + 256 = 268 blocks = 268 KB.'
      },
      expert: {
        modernOSImpl: 'Modern filesystems use extent-based allocation with delayed allocation (delalloc), buffering writes in RAM and allocating contiguous disk blocks only when flushing.'
      }
    }
  },
  {
    id: 'module_19',
    number: 19,
    title: 'Free Space Management',
    category: 'Memory & Storage',
    description: 'Bitmaps (bit vectors), linked free lists, grouping, counting, space overhead, efficiency and hardware support.',
    iconName: 'Database',
    visualizerId: 'file_system',
    gateWeightage: '4 - 6% (Bitmap size calculations, Free space overhead)',
    topics: [
      'Why Free Space Management is Essential',
      'Bit Vector / Bitmap Technique',
      'Calculation of Bitmap Size for a Disk',
      'Linked Free List Approach',
      'Grouping Method (First block holds addresses of n free blocks)',
      'Counting Method (Tracks contiguous free extents with start block and count)',
      'Space Overhead Comparison'
    ],
    keyFormulas: [
      'Total Blocks on Disk = Disk Size / Block Size',
      'Bitmap Size (in bits) = Total Blocks on Disk',
      'Bitmap Size (in Bytes) = ceil(Total Blocks on Disk / 8)'
    ],
    progressiveContent: {
      basic: {
        summary: 'The OS must keep track of which disk blocks are currently vacant so that when you create a new file, it doesn\'t accidentally overwrite your existing homework.',
        analogy: 'A hotel front desk board: Green pins for vacant rooms, red pins for occupied rooms (Bitmap).',
        keyConcepts: [
          { name: 'Bitmap', desc: 'An array of bits where bit i = 0 indicates block i is allocated and bit i = 1 indicates block i is free.' },
          { name: 'Counting', desc: 'Instead of listing 100 consecutive free block numbers, store: "Block 500: 100 free blocks follow".' }
        ]
      },
      interactive: {
        visualDescription: 'Interactive storage block grid showing live Bitmap 1s and 0s toggling as files are allocated and deleted.',
        suggestedAction: 'Input a 1 TB disk size and 4 KB block size to compute the memory overhead needed to store the bitmap in RAM.'
      },
      advanced: {
        kernelDetails: 'Modern operating systems divide disk space into block groups (e.g. ext4 block groups), each with its own local block bitmap to prevent global lock contention.',
        edgeCases: [
          'Bitmap corruption after sudden power loss: requires fsck / journaling to recover consistent state.',
          'Hardware CPU instruction support: x86 `bsfl` (Bit Scan Forward) to find the first free 1-bit in a bitmap in 1 clock cycle.'
        ],
        dataStructures: ['Block Bitmap Blocks', 'Free Space Extent B-Trees (XFS)', 'TRIM / Discard queues for SSDs']
      },
      gate: {
        frequentQuestions: [
          'Calculate the size of the bit vector required for a disk of size D with block size B.',
          'Which free space technique is most efficient for finding contiguous blocks? (Counting / Extent tree).',
          'Memory overhead of linked list vs bitmap.'
        ],
        commonTraps: [
          'Giving the bitmap size in bits when the question asks for Bytes or Kilobytes (divide bits by 8, then 1024).'
        ],
        solvedExampleSnippet: 'Q: Disk=16GB, Block=4KB. Blocks = 16GB / 4KB = 4M blocks = 4 * 2^20 bits = 4 Mbits = 512 KB bitmap.'
      },
      expert: {
        modernOSImpl: 'SSD flash translation layers (FTL) implement TRIM commands, informing flash controller blocks are free so garbage collection does not waste time copying deleted sectors.'
      }
    }
  },
  {
    id: 'module_20',
    number: 20,
    title: 'OS Protection & Security',
    category: 'Advanced & Modern',
    description: 'Protection domains, Access Matrix, Access Control Lists (ACLs), Capability lists, principle of least privilege, authentication, buffer overflows.',
    iconName: 'Shield',
    visualizerId: 'synchronization',
    gateWeightage: '3 - 5% (Access Matrix, ACL vs Capabilities)',
    topics: [
      'Protection vs Security Concept',
      'Principle of Least Privilege',
      'Protection Domains & Rings',
      'Access Matrix Representation',
      'Access Control Lists (ACL) — Slicing Matrix by Columns',
      'Capability Lists — Slicing Matrix by Rows',
      'Revocation of Capabilities',
      'Common Vulnerabilities: Buffer Overflow & Stack Smashing'
    ],
    keyFormulas: [
      'ACL = Attached to the Object (Resource): lists [User, Permissions]',
      'Capability List = Attached to the Subject (Process/User): acts like an unforgeable ticket'
    ],
    progressiveContent: {
      basic: {
        summary: 'Protection controls who can access internal computer resources (files, memory, ports); Security prevents external malicious actors from breaking in.',
        analogy: 'ACL is a guest list held by the VIP club bouncer (he checks your ID at the door); Capability is a physical concert ticket you hold in your hand.',
        keyConcepts: [
          { name: 'Access Matrix', desc: 'A 2D grid of Domains (rows) vs Objects (columns) defining allowed rights (Read, Write, Execute).' },
          { name: 'Principle of Least Privilege', desc: 'Programs, users, and systems should operate with the bare minimum privileges necessary to perform their task.' }
        ]
      },
      interactive: {
        visualDescription: 'Interactive Access Matrix table editor: toggle permissions between Domains and Files, switch between ACL and Capability view.',
        suggestedAction: 'Attempt to execute a write operation from an unprivileged domain to trigger an access denied audit violation.'
      },
      advanced: {
        kernelDetails: 'Linux implements discretionary access control (standard UNIX rwxrwxrwx permissions) and Mandatory Access Control (MAC) via SELinux / AppArmor security modules.',
        edgeCases: [
          'Confused Deputy Problem: a privileged service tricked by an unprivileged client into misusing its authority (solved by capabilities).',
          'Stack canaries, Address Space Layout Randomization (ASLR), and Non-Executable Stack (W^X / NX bit).'
        ],
        dataStructures: ['POSIX ACL Data Structures', 'SELinux Security Contexts', 'Linux Kernel Capabilities bitmask']
      },
      gate: {
        frequentQuestions: [
          'Distinguish between ACL and Capability List.',
          'Which mechanism makes it easier to revoke access to a specific file for all users? (ACL).',
          'Which mechanism makes it easier to revoke all rights of a single user? (Capability List).'
        ],
        commonTraps: [
          'Confusing ACL (column of access matrix, stored with file) with Capability List (row of access matrix, stored with process).'
        ],
        solvedExampleSnippet: 'Q: If an object is deleted, which model naturally cleans up permissions? Answer: ACL (since the list is stored with the object itself).'
      },
      expert: {
        modernOSImpl: 'Modern container runtimes use Linux namespaces, cgroups, seccomp-bpf syscall filtering, and drop all unnecessary kernel capabilities.'
      }
    }
  },
  {
    id: 'module_21',
    number: 21,
    title: 'Interrupts, Traps & Hardware Handlers',
    category: 'Hardware & I/O',
    description: 'Hardware interrupts, software interrupts (traps), exceptions, Interrupt Vector Table (IVT / IDT), Interrupt Service Routine (ISR), priority interrupts.',
    iconName: 'Radio',
    visualizerId: 'dma_interrupt',
    gateWeightage: '4 - 6% (Interrupt sequence, Trap vs Interrupt)',
    topics: [
      'Synchronous vs Asynchronous Hardware Events',
      'Interrupt Vector Table (IVT) & Interrupt Descriptor Table (IDT)',
      'Interrupt Request Lines (IRQ) & APIC',
      'The Step-by-Step Interrupt Cycle',
      'Interrupt Service Routine (ISR) Execution',
      'Interrupt Latency & Critical Sections',
      'Maskable vs Non-Maskable Interrupts (NMI)',
      'Traps vs Exceptions (Page faults, Divide by zero)'
    ],
    keyFormulas: [
      'Interrupt Cycle: At end of every instruction cycle, CPU checks Interrupt line',
      'If Interrupt pending: Push PC & PSW to stack -> Load ISR address from IVT[IRQ] -> Set Kernel Mode'
    ],
    progressiveContent: {
      basic: {
        summary: 'An interrupt is a hardware tap on the CPU\'s shoulder telling it to immediately pause what it was doing, save its place, handle an urgent event, and resume.',
        analogy: 'Reading an engaging novel when the doorbell rings: you place a bookmark in your page (Save PC & registers), answer the door (Run ISR), and return to reading where you left off.',
        keyConcepts: [
          { name: 'Hardware Interrupt', desc: 'Asynchronous signal sent by external devices (keyboard keypress, network packet arrival, timer tick).' },
          { name: 'Trap / Exception', desc: 'Synchronous event generated internally by CPU instructions (divide by zero, invalid opcode, syscall).' }
        ]
      },
      interactive: {
        visualDescription: 'Step-by-step interrupt lifecycle animation: Keyboard pressed -> IRQ line asserted -> CPU finishes instruction -> Push registers -> Jump to IVT -> Execute ISR -> IRET.',
        suggestedAction: 'Fire an interrupt while the CPU is busy computing a math loop and trace the hardware register push/pop sequence.'
      },
      advanced: {
        kernelDetails: 'Modern Linux divides interrupt processing into Top Half (quick ISR acknowledgment with interrupts disabled) and Bottom Half (deferred heavy work in softirqs, tasklets, or workqueues).',
        edgeCases: [
          'Non-Maskable Interrupts (NMI): critical hardware failures (RAM parity errors, overheating) that the CPU cannot ignore or mask.',
          'Spurious interrupts caused by electrical noise on legacy PIC buses.'
        ],
        dataStructures: ['x86 Interrupt Descriptor Table (IDT)', 'irq_desc array in Linux', 'Kernel Stack Trapframe']
      },
      gate: {
        frequentQuestions: [
          'When does the CPU check for hardware interrupts? (At the end of each instruction execution cycle).',
          'Who saves the Program Counter when an interrupt occurs? (CPU Hardware).',
          'Difference between Maskable and Non-Maskable Interrupts.'
        ],
        commonTraps: [
          'Thinking interrupts abort the currently executing machine instruction halfway (normal interrupts wait for the current instruction to complete before vectoring).'
        ],
        solvedExampleSnippet: 'Q: What restores CPU state after an ISR completes? Answer: The privileged IRET (Interrupt Return) instruction.'
      },
      expert: {
        modernOSImpl: 'High-performance cloud servers use MSI-X (Message Signaled Interrupts) allowing PCI devices to write directly to APIC memory addresses with per-core interrupt routing.'
      }
    }
  },
  {
    id: 'module_22',
    number: 22,
    title: 'Virtualization & Hypervisors',
    category: 'Advanced & Modern',
    description: 'Virtual machines, Type 1 vs Type 2 hypervisors, trap-and-emulate, binary translation, hardware-assisted virtualization (VT-x, AMD-V), containers.',
    iconName: 'Box',
    visualizerId: 'process_lifecycle',
    gateWeightage: '2 - 4% (Hypervisor types, VM vs Container)',
    topics: [
      'Virtualization Principle & Popek-Goldberg Virtualization Requirements',
      'Type 1 Hypervisor (Bare-Metal: ESXi, Xen, KVM)',
      'Type 2 Hypervisor (Hosted: VirtualBox, VMware Workstation)',
      'Trap-and-Emulate & Sensitive Instructions',
      'Hardware-Assisted Virtualization (Intel VT-x, AMD-V, Root/Non-Root Mode)',
      'Second Level Address Translation (SLAT / EPT / NPT)',
      'Virtual Machines vs OS Containers (Docker, LXC)'
    ],
    keyFormulas: [
      'Popek-Goldberg Theorem: A machine architecture is virtualizable if all sensitive instructions are a strict subset of privileged instructions',
      'Containers share the host kernel; VMs run an independent guest kernel'
    ],
    progressiveContent: {
      basic: {
        summary: 'Virtualization lets you slice one powerful physical computer into multiple independent virtual computers, each running its own operating system completely isolated from the others.',
        analogy: 'Virtual Machines are like separate freestanding houses in a neighborhood (each has its own furnace, plumbing, and roof); Containers are like apartments in a single building (sharing the central plumbing and foundation).',
        keyConcepts: [
          { name: 'Type 1 Hypervisor', desc: 'Runs directly on bare hardware with no host operating system underneath (enterprise cloud scale).' },
          { name: 'Containers', desc: 'Lightweight isolation sharing the host OS kernel using namespaces and cgroups instead of emulating a full PC.' }
        ]
      },
      interactive: {
        visualDescription: 'Interactive architecture comparison stack: Bare Metal vs Type 1 Hypervisor vs Type 2 Hypervisor vs Linux Container.',
        suggestedAction: 'Toggle resource constraints on a guest VM to watch how the hypervisor throttles virtual CPU cycles.'
      },
      advanced: {
        kernelDetails: 'Linux KVM (Kernel-based Virtual Machine) turns the Linux kernel into a Type 1 hypervisor via `/dev/kvm`, using hardware VMXON/VMLAUNCH instructions.',
        edgeCases: [
          'Ring -1: hypervisor execution mode introduced by Intel VT-x with VM-Entry and VM-Exit transitions.',
          'Memory overhead of Nested Page Tables (EPT) causing double page walks on TLB misses.'
        ],
        dataStructures: ['Virtual Machine Control Structure (VMCS)', 'Extended Page Tables (EPT)', 'cgroups v2 hierarchy']
      },
      gate: {
        frequentQuestions: [
          'Classify KVM, VMware ESXi, VirtualBox as Type 1 vs Type 2.',
          'Why do containers have lower memory and startup overhead than VMs?',
          'What is a sensitive instruction in the Popek-Goldberg virtualization model?'
        ],
        commonTraps: [
          'Assuming Docker runs a complete guest operating system kernel (containers share the exact host kernel).'
        ],
        solvedExampleSnippet: 'Q: Which hypervisor runs directly on the bare hardware without an underlying general-purpose OS? Answer: Type 1 (Bare-Metal) hypervisor.'
      },
      expert: {
        modernOSImpl: 'MicroVMs like AWS Firecracker combine container boot times (5ms) with hardware-isolated KVM virtualization for secure serverless functions.'
      }
    }
  },
  {
    id: 'module_23',
    number: 23,
    title: 'Modern OS Concepts & Cloud Infrastructure',
    category: 'Advanced & Modern',
    description: 'NUMA architecture, multicore scheduling, Linux namespaces, cgroups, eBPF, energy-aware scheduling, serverless runtimes.',
    iconName: 'Cloud',
    visualizerId: 'os_in_action',
    gateWeightage: '2 - 4% (NUMA, Multicore cache affinity, Linux namespaces)',
    topics: [
      'Non-Uniform Memory Access (NUMA) Architecture',
      'Cache Affinity & Processor Load Balancing in Multicores',
      'Linux Namespaces (PID, Mount, Network, IPC, UTS, User)',
      'Control Groups (cgroups v2) for CPU/Memory Limits',
      'Extended Berkeley Packet Filter (eBPF) Programmability',
      'Energy-Aware Scheduling (EAS) in Mobile & Edge Devices',
      'Unikernels & Immutable Cloud Infrastructure'
    ],
    keyFormulas: [
      'NUMA Factor = Remote Memory Latency / Local Memory Latency (typically 1.5x to 3x slower)',
      'cgroups CPU limit: cpu.max = quota period (e.g. 50000 100000 = 50% of 1 core)'
    ],
    progressiveContent: {
      basic: {
        summary: 'Modern computers have dozens of CPU cores and hundreds of gigabytes of RAM. Operating systems must evolve beyond simple algorithms to balance memory distance, power draw, and cloud sandboxing.',
        analogy: 'NUMA is like a university library: your desk has books within arm\'s reach (Local Node RAM); if you need a book on the 5th floor (Remote Node RAM), you have to walk up the stairs (interconnect bus penalty).',
        keyConcepts: [
          { name: 'NUMA', desc: 'Hardware architecture where each CPU socket has dedicated local memory that it accesses faster than memory connected to other CPUs.' },
          { name: 'cgroups', desc: 'Linux kernel mechanism that meters and limits resource usage (CPU, RAM, Disk I/O) for groups of processes.' }
        ]
      },
      interactive: {
        visualDescription: 'NUMA topology visualizer: CPU Socket 0 (Local RAM) vs CPU Socket 1 (Remote RAM) with QPI/UPI bus interconnect latency meters.',
        suggestedAction: 'Migrate a process across NUMA nodes and watch memory bandwidth drop as cross-socket traffic increases.'
      },
      advanced: {
        kernelDetails: 'eBPF allows developers to run verified, sandboxed byte-code inside the Linux kernel at runtime without changing kernel source or loading modules.',
        edgeCases: [
          'NUMA thrashing: automatic NUMA balancing ping-ponging pages back and forth between sockets.',
          'Memory compaction latency spikes under heavy cloud multi-tenant loads.'
        ],
        dataStructures: ['sched_domain hierarchy in Linux', 'cgroup resource tree', 'eBPF BPF maps']
      },
      gate: {
        frequentQuestions: [
          'What is NUMA and why does remote memory access incur latency?',
          'What mechanism provides process isolation in Linux containers? (Namespaces).',
          'What mechanism enforces resource limits in Linux containers? (cgroups).'
        ],
        commonTraps: [
          'Confusing Namespaces (which control what a process can SEE) with cgroups (which control how much a process can USE).'
        ],
        solvedExampleSnippet: 'Q: Which Linux technology allows running sandboxed code inside kernel event hooks? Answer: eBPF.'
      },
      expert: {
        modernOSImpl: 'Hyperscale clouds like Google Borg and Kubernetes orchestrate billions of containerized processes using cgroups v2 memory pressure stalls (PSI).'
      }
    }
  },
  {
    id: 'module_24',
    number: 24,
    title: 'Real-Time Operating Systems (RTOS)',
    category: 'Advanced & Modern',
    description: 'Hard vs soft real-time systems, deadline scheduling, Rate Monotonic Scheduling (RMS), Earliest Deadline First (EDF), priority inversion.',
    iconName: 'Clock',
    visualizerId: 'rtos_scheduler',
    gateWeightage: '4 - 6% (Liu & Layland utilization bound, EDF optimality)',
    topics: [
      'Hard Real-Time vs Soft Real-Time Systems',
      'Real-Time Task Parameters: Period (T), Execution Time (C), Deadline (D)',
      'Rate Monotonic Scheduling (RMS) Static Priority Algorithm',
      'Liu & Layland Schedulability Bound for RMS',
      'Earliest Deadline First (EDF) Dynamic Priority Algorithm',
      'EDF Optimality & 100% Utilization Bound',
      'Priority Inversion Problem & Mars Pathfinder Incident',
      'Priority Inheritance Protocol & Priority Ceiling Protocol'
    ],
    keyFormulas: [
      'Total Task Utilization: U = sum(C_i / T_i)',
      'Liu & Layland RMS Bound: U <= n * (2^(1/n) - 1); For n=1: 100%, n=2: 82.8%, n=3: 77.9%, n->inf: ln(2) = 69.3%',
      'EDF Schedulability condition: U <= 1.0 (100%) for tasks with D_i = T_i'
    ],
    progressiveContent: {
      basic: {
        summary: 'In regular operating systems, the goal is high average speed. In a Real-Time OS (controlling an airplane autopilot or medical pacemaker), correctness depends not just on the answer, but on delivering it BEFORE THE DEADLINE.',
        analogy: 'Sending an email 2 seconds late is annoying (Soft Real-Time); an airbag deploying 2 seconds late in a car crash is fatal (Hard Real-Time).',
        keyConcepts: [
          { name: 'RMS', desc: 'Static priority policy: tasks with shorter periods (higher frequency) get higher static priorities.' },
          { name: 'EDF', desc: 'Dynamic priority policy: whichever task has the closest upcoming absolute deadline gets the CPU right now.' }
        ]
      },
      interactive: {
        visualDescription: 'Interactive real-time timeline scheduler: set periods and execution times for Tasks T1, T2, T3 and view execution vs deadlines under RMS vs EDF.',
        suggestedAction: 'Increase Task 1 execution time past the Liu & Layland bound to observe an RMS deadline miss while EDF continues scheduling safely.'
      },
      advanced: {
        kernelDetails: 'Linux PREEMPT_RT patch converts existing kernel spinlocks into sleepable sleeping locks, enabling deterministic sub-millisecond interrupt response.',
        edgeCases: [
          'Priority Inversion: Mars Pathfinder software reset bug in 1997 where a low-priority weather task starved the high-priority attitude control task through a shared mutex.',
          'Exact schedulability test (Response Time Analysis / Fixed Point Iteration) when U exceeds the Liu & Layland bound.'
        ],
        dataStructures: ['Periodic Timer Wheels', 'Priority Inheritance Mutex Blocks', 'Earliest-Deadline Min-Heap']
      },
      gate: {
        frequentQuestions: [
          'Verify if a given set of periodic tasks is schedulable under RMS using the Liu & Layland bound.',
          'Trace task execution under Earliest Deadline First (EDF).',
          'Explain the Priority Inversion problem and how Priority Inheritance resolves it.'
        ],
        commonTraps: [
          'Assuming that if U > n(2^(1/n) - 1), the task set is definitely unschedulable under RMS (the Liu & Layland test is sufficient but NOT necessary; exact response time analysis is needed).'
        ],
        solvedExampleSnippet: 'Q: T1=(2,1), T2=(4,1). U = 1/2 + 1/4 = 0.75. For n=2, RMS bound = 2*(sqrt(2)-1) = 0.828. Since 0.75 <= 0.828, guaranteed schedulable under RMS.'
      },
      expert: {
        modernOSImpl: 'Flight avionics and automotive ECUs use certified microkernels like FreeRTOS, VxWorks, or QNX Neutrino compliant with DO-178C Level A safety standards.'
      }
    }
  }
];
