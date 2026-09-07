import type { ModuleConceptGuide } from './types';

export const MODULES_1_TO_6: Record<number, ModuleConceptGuide> = {
  1: {
    moduleNumber: 1,
    inDepthTheory: [
      {
        sectionTitle: 'What is an Operating System & Its Core Architecture',
        content: 'An Operating System (OS) is system software acting as an intermediary between computer hardware and user applications. Its primary objectives are convenience (abstracting low-level hardware intricacies into user-friendly abstractions) and efficiency (optimizing allocation and utilization of hardware resources such as the CPU, RAM, and I/O controllers).',
        bulletPoints: [
          'Resource Allocator: Manages conflicting requests for CPU time, physical memory partitions, and shared I/O devices fairly and efficiently.',
          'Control Program: Governs user execution to prevent unauthorized operations, kernel corruption, and hardware deadlock.',
          'Abstraction Layer: Transforms physical disk sectors into files, physical RAM into virtual address spaces, and hardware timer pulses into preemptive time slices.'
        ]
      },
      {
        sectionTitle: 'Dual-Mode Operation: User Mode vs Kernel Mode',
        content: 'To prevent application bugs or malicious programs from crashing the entire system or intercepting sensitive data, modern CPUs feature hardware-enforced privilege rings (typically Ring 0 for Kernel Mode and Ring 3 for User Mode). The Processor Status Word (PSW) maintains a hardware Mode Bit: 0 indicates Kernel Mode (Supervisor/Privileged) and 1 indicates User Mode.',
        bulletPoints: [
          'User Mode (Ring 3): Application processes execute with restricted instructions. Modifying page tables (CR3 register), disabling interrupts (CLI), accessing I/O ports directly, or issuing CPU halt (HLT) triggers a General Protection Fault.',
          'Kernel Mode (Ring 0): The OS kernel executes with unrestricted machine privileges, managing page mappings, interrupt handlers, and hardware devices.',
          'Mode Switching: Controlled transition from User to Kernel mode occurs solely via Hardware Interrupts, Software Traps/Exceptions, or System Calls.'
        ]
      },
      {
        sectionTitle: 'System Calls, Software Traps & Hardware Interrupts',
        content: 'A System Call is the programmatic mechanism through which an application requests privileged kernel services (e.g. read(), write(), fork()). A standard library wrapper loads the system call number into register RAX/EAX, passes arguments via CPU registers, and fires a software trap (such as the x86-64 syscall or int 0x80 instruction).',
        bulletPoints: [
          'Trap (Software Interrupt): Generated synchronously by software instructions (e.g. syscall, zero division, or invalid memory address).',
          'Interrupt (Hardware): Generated asynchronously by external hardware controllers (e.g. network card packet arrival, disk read complete, timer chip).',
          'Exception: CPU-internal fault detected during instruction decoding or execution.'
        ]
      }
    ],
    comparisons: [
      {
        title: 'Comparison: Monolithic Kernel vs Microkernel Architecture',
        headers: ['Parameter', 'Monolithic Kernel (Linux, Windows)', 'Microkernel (Mach, QNX, L4)'],
        rows: [
          ['Architecture', 'All OS services (FS, VFS, drivers, IPC, scheduler) run in single kernel address space.', 'Only minimal essential mechanisms (IPC, low-level scheduling, address space) run in kernel space.'],
          ['Performance', 'Extremely fast. Function calls within kernel space require no context switches.', 'Slower due to high context-switch overhead of message-passing IPC between user-space servers.'],
          ['Reliability & Safety', 'Lower: A single device driver crash or memory bug can panic the entire system.', 'High: Driver crashes run in user space and can be restarted without halting the kernel.'],
          ['Extensibility', 'Harder to extend without recompiling or loading kernel modules.', 'Very easy to extend by adding new user-space daemon servers.']
        ]
      },
      {
        title: 'Comparison: Hardware Interrupt vs Software Trap vs CPU Exception',
        headers: ['Property', 'Hardware Interrupt', 'Software Trap (Syscall)', 'CPU Exception'],
        rows: [
          ['Source', 'External hardware device (timer, keyboard, disk).', 'Software execution of dedicated trap instruction.', 'CPU execution unit encountering invalid condition.'],
          ['Synchronicity', 'Asynchronous (can occur at any clock cycle).', 'Synchronous (occurs at specific instruction in program).', 'Synchronous (occurs at the exact faulting instruction).'],
          ['Re-execution', 'Never re-executes; resumes interrupted instruction.', 'Resumes at the next consecutive instruction.', 'Faults re-execute instruction after fixing (e.g. page fault); aborts terminate.']
        ]
      }
    ],
    conceptToSimulationGuide: [
      {
        simulationElement: 'DMA & Interrupt Controller Visualizer',
        osKernelEquivalent: 'Interrupt Descriptor Table (IDT) & Hardware APIC',
        whyItMatters: 'Demonstrates how hardware devices steal bus cycles without CPU involvement and notify the kernel via Interrupt Service Routines (ISRs).'
      },
      {
        simulationElement: 'Mode Bit Toggle (0 vs 1)',
        osKernelEquivalent: 'CPU Processor Status Word (PSW) Current Privilege Level (CPL)',
        whyItMatters: 'Shows the exact point where execution transitions from unprivileged Ring 3 application code to Ring 0 kernel handlers.'
      }
    ],
    workedNumericals: [
      {
        title: 'System Call Overhead & Context Switch Latency',
        problemStatement: 'A database process executes 100,000 read() system calls. Each system call incurs 2 context/mode switches (User -> Kernel -> User). If each mode switch takes 0.5 microseconds and the kernel read handler takes 2.0 microseconds to complete, calculate the total execution time spent and the percentage of time wasted purely on mode switching overhead.',
        givenData: {
          'System Calls Count': '100,000 calls',
          'Mode Switches per Call': '2 switches (Ring 3 -> Ring 0 -> Ring 3)',
          'Cost per Mode Switch': '0.5 μs',
          'Kernel Handler Duration': '2.0 μs'
        },
        formulasUsed: [
          'Total Mode Switch Time = Count * (Switches per Call * Cost per Switch)',
          'Total Handler Time = Count * Handler Duration',
          'Total Execution Time = Total Mode Switch Time + Total Handler Time',
          'Overhead Percentage = (Total Mode Switch Time / Total Execution Time) * 100%'
        ],
        stepByStepSolution: [
          'Step 1: Compute the mode switch time per call: 2 * 0.5 μs = 1.0 μs per system call.',
          'Step 2: Total time spent per system call = 1.0 μs (overhead) + 2.0 μs (work) = 3.0 μs.',
          'Step 3: Total execution time for 100,000 calls = 100,000 * 3.0 μs = 300,000 μs = 0.30 seconds.',
          'Step 4: Total overhead time = 100,000 * 1.0 μs = 100,000 μs = 0.10 seconds.',
          'Step 5: Overhead percentage = (0.10 s / 0.30 s) * 100% = 33.33%.'
        ],
        finalAnswer: 'Total Execution Time = 0.30 s (300 ms); Mode Switch Overhead = 33.33%',
        gateYear: 'GATE CS 2018 Adapted'
      }
    ],
    conceptualQuestions: [
      {
        question: 'Why can user mode code not execute an instruction to flip the CPU Mode Bit from 1 (User) to 0 (Kernel)?',
        category: 'Core Concept',
        explanation: 'If user-space code could execute an instruction modifying the Mode Bit directly, the entire hardware security boundary would collapse; any malicious program could grant itself Ring 0 privileges and bypass OS protections. Therefore, the CPU instruction that modifies the Mode Bit is itself classified as a Privileged Instruction. The only way to enter Kernel Mode is through hardware-supervised gateways: an interrupt, exception, or trap instruction that automatically saves the program counter and vectors through a pre-configured kernel table.',
        commonTrap: 'Assuming software can switch privilege by writing directly to CPU control registers like CR0 or PSW in user mode.',
        keyTakeaway: 'The mode switch is hardware-enforced: entering kernel mode requires an architectural trap vector.'
      },
      {
        question: 'Explain the technical difference between a Fault, a Trap, and an Abort in modern processor exceptions.',
        category: 'GATE CS',
        explanation: 'In x86/ARM architectures, exceptions are categorized into three classes based on restart behavior: (1) Fault: Correctable error (e.g. Page Fault). The saved Program Counter points to the faulting instruction itself; once the kernel handles it (loads the page), the instruction is re-executed. (2) Trap: Intentional notification (e.g. syscall or debugger breakpoint). The saved PC points to the subsequent instruction to resume smoothly. (3) Abort: Unrecoverable hardware failure (e.g. machine check, parity error, double fault); the process or kernel terminates immediately.',
        commonTrap: 'Thinking that all exceptions abort the program. A Page Fault is an exception that is an essential, normal part of virtual memory execution.',
        keyTakeaway: 'Faults re-execute the same instruction, traps resume at the next instruction, aborts terminate.'
      }
    ]
  },
  2: {
    moduleNumber: 2,
    inDepthTheory: [
      {
        sectionTitle: 'Program vs Process & The Address Space Model',
        content: 'A program is a passive entity stored on disk (an ELF binary or EXE containing compiled machine instructions). A process is an active program in execution, encompassing the Program Counter (PC), CPU register contents, and a private address space divided into four main segments: Text (instructions), Data (initialized/uninitialized globals), Heap (dynamic allocations via malloc/brk), and Stack (local variables, function frames, return addresses).',
        bulletPoints: [
          'Stack grows downward towards lower memory addresses; Heap grows upward towards higher memory addresses.',
          'Stack overflow occurs when stack and heap collide or stack exceeds configured resource limits (ulimit -s).',
          'Text and constant data segments are mapped read-only to prevent self-modifying code errors.'
        ]
      },
      {
        sectionTitle: 'Process Lifecycle & The Process Control Block (PCB)',
        content: 'The operating system manages processes using state machines (5-state: New, Ready, Running, Waiting/Blocked, Terminated; 7-state: adds Suspended-Ready and Suspended-Waiting when RAM is overcommitted). The Process Control Block (struct task_struct in Linux) is the kernel data structure maintaining complete process state.',
        bulletPoints: [
          'PCB Contents: Process ID (PID), Program Counter (PC), CPU registers (SP, BP, general purpose), scheduling priority, memory pointers (page directory base CR3), list of open file descriptors, I/O status.',
          'Ready -> Running: CPU Dispatcher selects process from Ready Queue.',
          'Running -> Waiting: Process issues blocking I/O or waits for child completion via wait().',
          'Waiting -> Ready: I/O device completes transfer; hardware interrupt moves process back to Ready Queue.'
        ]
      },
      {
        sectionTitle: 'Process Creation: fork(), exec(), wait(), and Zombie/Orphan States',
        content: 'In Unix-like systems, process creation follows the fork-exec model. fork() creates an exact duplicate child process. exec() replaces the current process address space with a new executable binary. wait() allows a parent to collect a child termination status.',
        bulletPoints: [
          'fork() returns twice: returns 0 to the child process and returns the child PID to the parent process; returns -1 on failure.',
          'Zombie Process: A child process that has terminated execution, but its parent has not yet executed wait() to collect its exit status. It occupies an entry in the process table.',
          'Orphan Process: A process whose parent has terminated before it. The init / systemd process (PID 1) automatically adopts orphans and reaps them when they exit.'
        ]
      }
    ],
    comparisons: [
      {
        title: 'Comparison: Program vs Process',
        headers: ['Attribute', 'Program', 'Process'],
        rows: [
          ['Nature', 'Passive entity stored as a static file on disk.', 'Active entity executing in physical RAM and CPU.'],
          ['Lifetime', 'Permanent until deleted from storage.', 'Transient: exists only from creation (fork) to termination (exit).'],
          ['Resources', 'Only occupies secondary disk storage.', 'Requires CPU time, registers, RAM address space, file descriptors.']
        ]
      },
      {
        title: 'Comparison: Zombie Process vs Orphan Process',
        headers: ['Feature', 'Zombie Process', 'Orphan Process'],
        rows: [
          ['State', 'Terminated (dead), but still present in process table.', 'Still actively executing in memory.'],
          ['Cause', 'Parent has not yet invoked wait() to read exit code.', 'Parent terminated without waiting for child.'],
          ['Resolution', 'Parent calls wait(), or killing parent re-parents to PID 1.', 'Adopted by PID 1 (init/systemd) which calls wait() on exit.']
        ]
      }
    ],
    conceptToSimulationGuide: [
      {
        simulationElement: 'Process Lifecycle 5-State / 7-State Canvas',
        osKernelEquivalent: 'Linux task_struct state flags (TASK_RUNNING, TASK_INTERRUPTIBLE, TASK_ZOMBIE)',
        whyItMatters: 'Allows tracking exact CPU register saving and state transitions during voluntary I/O blocks vs involuntary timer preemption.'
      },
      {
        simulationElement: 'PCB Inspector Panel',
        osKernelEquivalent: 'Linux struct task_struct in include/linux/sched.h',
        whyItMatters: 'Shows live values of PID, PC, Stack Pointer, and Open File Descriptors across process switches.'
      }
    ],
    workedNumericals: [
      {
        title: 'Process Creation Count with Consecutive fork() Calls',
        problemStatement: 'Determine the total number of processes created, the number of child processes, and the total number of times the message "OS" is printed by the following C code snippet:\n\nint main() {\n  for(int i = 0; i < 3; i++) {\n    fork();\n  }\n  printf("OS\\n");\n  return 0;\n}',
        givenData: {
          'Loop iterations': '3 (i = 0, 1, 2)',
          'fork() invocation': '1 call per iteration',
          'Initial processes': '1 (Parent process)'
        },
        formulasUsed: [
          'Total processes after n consecutive unconditional fork() calls = 2^n',
          'Child processes created = 2^n - 1',
          'Total print statements executed = Total processes * prints per process'
        ],
        stepByStepSolution: [
          'Step 1: At iteration i = 0, the initial parent executes fork(). Total processes = 2^1 = 2.',
          'Step 2: At iteration i = 1, both existing processes execute fork(). Total processes = 2^2 = 4.',
          'Step 3: At iteration i = 2, all 4 processes execute fork(). Total processes = 2^3 = 8.',
          'Step 4: All 8 processes exit the loop and proceed to the printf("OS\\n") statement.',
          'Step 5: Each of the 8 processes prints "OS" once.',
          'Step 6: Number of newly created child processes = 8 - 1 = 7.'
        ],
        finalAnswer: 'Total Processes = 8; Newly Created Children = 7; "OS" printed = 8 times',
        gateYear: 'GATE CS 2012 / 2017'
      },
      {
        title: 'Context Switch Frequency & Overhead Calculation',
        problemStatement: 'A preemptive round-robin scheduler uses a time quantum Q = 10 ms. The system runs 5 CPU-bound processes. If each context switch takes S = 0.5 ms, calculate the effective CPU utilization and the total time required to complete 100 seconds of pure CPU work across all processes.',
        givenData: {
          'Time Quantum Q': '10 ms',
          'Context Switch Overhead S': '0.5 ms',
          'Total Pure CPU Burst Required': '100 seconds = 100,000 ms'
        },
        formulasUsed: [
          'Effective CPU Utilization = Q / (Q + S) * 100%',
          'Total Elapsed Time = Total CPU Work / (Q / (Q + S))'
        ],
        stepByStepSolution: [
          'Step 1: During each quantum cycle, CPU spends 10 ms executing useful code and 0.5 ms in context switching.',
          'Step 2: Total cycle duration = 10 ms + 0.5 ms = 10.5 ms.',
          'Step 3: CPU Utilization = 10 / 10.5 = 0.95238 = 95.24%.',
          'Step 4: Number of quantums needed = 100,000 ms / 10 ms = 10,000 quantums.',
          'Step 5: Total context switch time = 10,000 * 0.5 ms = 5,000 ms = 5 seconds.',
          'Step 6: Total elapsed time = 100 seconds + 5 seconds = 105 seconds.'
        ],
        finalAnswer: 'Effective CPU Utilization = 95.24%; Total Elapsed Time = 105.0 seconds',
        gateYear: 'GATE CS 2015'
      }
    ],
    conceptualQuestions: [
      {
        question: 'How does Copy-on-Write (COW) optimize process creation in fork(), and what triggers the actual duplication of a memory page?',
        category: 'Core Concept',
        explanation: 'Traditionally, fork() created an exact physical duplicate of the parent process memory, which was extremely wasteful because most children immediately invoke exec(), discarding the copied memory. Under Copy-on-Write (COW), the kernel creates child page tables pointing to the exact same physical pages as the parent, but marks all writable pages as READ-ONLY. When either parent or child attempts to write to a page, the CPU MMU raises a Page Fault exception. The OS kernel page fault handler intercepts this, allocates a new physical frame, copies the single 4 KB page content, updates the writing process page table to read-write, and resumes execution. Only modified pages are ever duplicated.',
        commonTrap: 'Thinking that COW copies memory in the background immediately after fork(). Pages are only copied on demand when a write occurs.',
        keyTakeaway: 'COW delays page copying until the exact moment of a write operation, achieving near-zero fork() overhead.'
      },
      {
        question: 'Can a process transition directly from the Waiting/Blocked state to the Running state? Why or why not?',
        category: 'GATE CS',
        explanation: 'No. In a standard multi-tasking operating system, a process can NEVER transition directly from Waiting to Running. When the I/O event or resource for which the process was waiting arrives, the hardware interrupt moves the process into the Ready Queue (Ready state). The process must then wait for the CPU scheduler to pick it according to the scheduling algorithm. Only the CPU Dispatcher can move a process from Ready to Running.',
        commonTrap: 'Assuming that completing a high-priority I/O immediately gives the process direct CPU control without entering the ready queue.',
        keyTakeaway: 'The Waiting -> Running transition does not exist; all blocked processes must enter the Ready queue first.'
      }
    ]
  },
  3: {
    moduleNumber: 3,
    inDepthTheory: [
      {
        sectionTitle: 'Process vs Thread: Lightweight Execution Contexts',
        content: 'A Thread is the smallest unit of CPU execution within a process. Often called a lightweight process (LWP), a thread shares the process address space, open files, signal handlers, and code/global data with other sibling threads, but retains its own private Program Counter (PC), CPU registers, and private Call Stack.',
        bulletPoints: [
          'Shared by All Threads in a Process: Code segment, Data segment, Heap, Open file descriptors, Working directory, Signal disposition.',
          'Private to Each Individual Thread: Thread ID (TID), Program Counter (PC), Register state, Call Stack (local function variables and activation records), Thread Local Storage (TLS).'
        ]
      },
      {
        sectionTitle: 'User-Level Threads (ULT) vs Kernel-Level Threads (KLT)',
        content: 'Threads can be implemented in user space (ULT) via user runtime libraries (e.g. GNU Portable Threads) or in kernel space (KLT) directly managed by the operating system kernel (e.g. POSIX pthreads on Linux, Win32 threads on Windows).',
        bulletPoints: [
          'User-Level Threads (Many-to-One): Fast creation and context switching (no kernel mode switch required). However, if one thread executes a blocking system call (e.g. read()), the entire process and all sibling threads block.',
          'Kernel-Level Threads (One-to-One): The kernel is aware of each thread and can schedule them simultaneously onto multiple CPU cores. If one thread blocks on I/O, other threads continue executing. Switching threads requires a mode transition into Ring 0.'
        ]
      },
      {
        sectionTitle: 'Amdahl\'s Law & Multicore Speedup Limits',
        content: 'Adding more CPU cores to a system does not yield linear speedup if a portion of the application is strictly sequential (e.g. initialization, critical sections). Amdahl\'s Law establishes the theoretical maximum speedup possible given parallel fraction P and N processing cores.',
        bulletPoints: [
          'Formula: Speedup S = 1 / ((1 - P) + P / N)',
          'As N -> Infinity, maximum theoretical speedup is bounded by 1 / (1 - P). For example, if 10% of code is serial (P = 0.90), maximum speedup can never exceed 10x regardless of how many thousands of cores are available.'
        ]
      }
    ],
    comparisons: [
      {
        title: 'Comparison: Process vs Thread',
        headers: ['Criteria', 'Process', 'Thread'],
        rows: [
          ['Address Space', 'Isolated address space; separate page tables per process.', 'Shares address space, heap, and open files with sibling threads.'],
          ['Creation Overhead', 'High: Requires PCB creation, address space cloning or COW setup.', 'Low: Requires only TCB and new stack allocation.'],
          ['Communication', 'Requires IPC (Pipes, Sockets, Shared Memory, Message Queues).', 'Direct communication via shared heap and global memory variables.'],
          ['Crash Impact', 'A crash in one process does not affect other processes.', 'A segmentation fault in one thread crashes the entire parent process.']
        ]
      },
      {
        title: 'Comparison: User-Level Threads (ULT) vs Kernel-Level Threads (KLT)',
        headers: ['Parameter', 'User-Level Threads (ULT)', 'Kernel-Level Threads (KLT)'],
        rows: [
          ['Management', 'Managed entirely by user-level thread library without kernel knowledge.', 'Managed directly by the OS kernel scheduler.'],
          ['Multicore Scaling', 'Cannot achieve true multicore parallelism (kernel sees only 1 process).', 'Can execute in parallel on separate physical cores.'],
          ['Blocking I/O', 'One thread blocking on system call blocks all sibling threads.', 'One thread blocking allows kernel to schedule other sibling threads.'],
          ['Switching Speed', 'Extremely fast (pure user-space register save; no Ring 0 trap).', 'Slower (requires mode switch into kernel space).']
        ]
      }
    ],
    conceptToSimulationGuide: [
      {
        simulationElement: 'Thread Execution & Core Mapping Canvas',
        osKernelEquivalent: 'Linux clone() system call with CLONE_VM, CLONE_FS, CLONE_FILES flags',
        whyItMatters: 'Visualizes how multiple threads share a single heap while executing on distinct CPU cores simultaneously.'
      },
      {
        simulationElement: 'Blocking System Call Stalling Demo',
        osKernelEquivalent: 'POSIX pthreads vs Many-to-One Green Threads runtime scheduler',
        whyItMatters: 'Demonstrates why ULT threads stall when an unbuffered read() system call is executed.'
      }
    ],
    workedNumericals: [
      {
        title: 'Amdahl\'s Law Speedup Calculation with Multicore Scaling',
        problemStatement: 'An operating system image processing program consists of an algorithm where 80% of execution can be parallelized across multiple threads, while 20% is strictly sequential due to file header parsing. Calculate:\n(a) The speedup achieved when running on a 4-core CPU.\n(b) The speedup achieved when running on an 8-core CPU.\n(c) The theoretical maximum speedup limit even with an infinite number of CPU cores.',
        givenData: {
          'Parallel fraction P': '0.80',
          'Sequential fraction (1 - P)': '0.20',
          'Core count 1': 'N = 4',
          'Core count 2': 'N = 8'
        },
        formulasUsed: [
          'Speedup S(N) = 1 / ((1 - P) + (P / N))',
          'Maximum Speedup S_max = lim(N -> inf) 1 / ((1 - P) + P/N) = 1 / (1 - P)'
        ],
        stepByStepSolution: [
          'Step 1: Calculate speedup for N = 4 cores:\nS(4) = 1 / ((1 - 0.80) + 0.80 / 4) = 1 / (0.20 + 0.20) = 1 / 0.40 = 2.50x.',
          'Step 2: Calculate speedup for N = 8 cores:\nS(8) = 1 / ((1 - 0.80) + 0.80 / 8) = 1 / (0.20 + 0.10) = 1 / 0.30 = 3.33x.',
          'Step 3: Calculate theoretical maximum speedup as N -> infinity:\nS_max = 1 / (1 - 0.80) = 1 / 0.20 = 5.00x.'
        ],
        finalAnswer: '(a) S(4) = 2.50x; (b) S(8) = 3.33x; (c) S_max = 5.00x',
        gateYear: 'GATE CS 2016'
      }
    ],
    conceptualQuestions: [
      {
        question: 'If a program consists of 8 User-Level Threads (ULT) running on an 8-core processor, can all 8 threads execute concurrently in parallel? Explain.',
        category: 'GATE CS',
        explanation: 'No. User-Level Threads are completely invisible to the operating system kernel. From the OS scheduler perspective, the entire application is a single thread of control (a single process). Therefore, the kernel allocates at most one CPU core to that process at any given moment. The user runtime library multiplexes the 8 threads onto that single core sequentially. To achieve true multicore parallel execution, Kernel-Level Threads (KLT) or a 1:1 / M:N multithreading model is strictly required.',
        commonTrap: 'Assuming that having 8 threads and 8 physical cores automatically guarantees 8x parallel execution.',
        keyTakeaway: 'The OS scheduler only assigns physical CPU cores to kernel-visible schedulable entities.'
      },
      {
        question: 'Which components of memory are NOT shared between threads of the same process?',
        category: 'Technical Interview',
        explanation: 'Threads of the same process do NOT share their Call Stacks or their CPU Register state (including Program Counter and Stack Pointer). Each thread must maintain an independent call stack to trace its own function invocations, local parameters, and return addresses. Threads also have Thread Local Storage (TLS). All other memory segments—including the Code Segment (Text), Global/Static variables (Data), the dynamic Heap, and open file descriptors—are completely shared.',
        commonTrap: 'Thinking that local variables inside functions are shared across threads. They are allocated on the per-thread private stack.',
        keyTakeaway: 'Stacks and registers are private; code, data, heap, and open files are shared.'
      }
    ]
  },
  4: {
    moduleNumber: 4,
    inDepthTheory: [
      {
        sectionTitle: 'CPU Scheduling Fundamentals & Performance Criteria',
        content: 'CPU scheduling is the core mechanism by which the operating system decides which ready process is allocated the CPU when the currently running process relinquishes it. The scheduler aims to maximize CPU utilization and throughput, while minimizing turnaround time, waiting time, and response time.',
        bulletPoints: [
          'Turnaround Time (TAT): Elapsed time from process submission (Arrival Time) to its completion (Completion Time). TAT = CT - AT.',
          'Waiting Time (WT): Total time a process spends waiting in the ready queue. WT = TAT - Burst Time (BT).',
          'Response Time (RT): Time from process arrival to its first time scheduled on the CPU. RT = First CPU Time - AT.',
          'Preemptive vs Non-Preemptive: Preemptive scheduling allows the OS to forcibly interrupt a running process when a higher-priority or shorter job arrives or time quantum expires.'
        ]
      },
      {
        sectionTitle: 'Classical Scheduling Algorithms: FCFS, SJF, SRTF, and Round Robin',
        content: 'Different scheduling algorithms target different optimization goals. FCFS is non-preemptive and prone to the Convoy Effect. SJF (Shortest Job First) is provably optimal for minimizing average waiting time. SRTF is the preemptive counterpart of SJF. Round Robin (RR) allocates a fixed time quantum Q, ensuring fair responsiveness.',
        bulletPoints: [
          'Convoy Effect (FCFS): Short processes stuck behind one massive CPU-bound process, resulting in terrible average waiting time.',
          'SJF Optimality: Moving short jobs ahead of long jobs reduces the waiting time of the short job by more than it increases the waiting time of the long job.',
          'Round Robin Tuning: If quantum Q is too large, RR degenerates into FCFS. If Q is too small, excessive context switch overhead degrades CPU throughput.'
        ]
      },
      {
        sectionTitle: 'Multilevel Queue (MLQ) & Multilevel Feedback Queue (MLFQ)',
        content: 'In real-world systems, processes have divergent needs: interactive desktop tasks need fast response times, while batch computations need high throughput. Multilevel Feedback Queue (MLFQ) separates ready processes into multiple priority queues with decreasing priority and increasing time slices, dynamically adjusting process priority based on observed behavior.',
        bulletPoints: [
          'Rule 1: If Priority(A) > Priority(B), A runs and B waits.',
          'Rule 2: If Priority(A) == Priority(B), A and B run in Round Robin.',
          'Rule 3: When a job enters the system, it is placed at the highest priority queue with a small quantum.',
          'Rule 4: Once a job uses up its time allotment at a given level (regardless of how many times it gave up the CPU), its priority is reduced (moves down one queue).',
          'Rule 5: Priority Boost (Aging): After some periodic time period S, move all jobs in the system to the topmost queue to prevent starvation.'
        ]
      }
    ],
    comparisons: [
      {
        title: 'Comparison: Preemptive vs Non-Preemptive Scheduling',
        headers: ['Parameter', 'Preemptive Scheduling (SRTF, RR, Preemptive Priority)', 'Non-Preemptive Scheduling (FCFS, SJF, Priority)'],
        rows: [
          ['CPU Relinquishment', 'The kernel can interrupt running process via timer interrupt or higher-priority arrival.', 'Process holds CPU until it voluntarily terminates or blocks on I/O.'],
          ['Context Switch Cost', 'Higher overhead due to frequent state saving and ready queue reordering.', 'Lower overhead: context switch occurs only when a job finishes or yields.'],
          ['Responsiveness', 'High responsiveness; ideal for interactive and real-time systems.', 'Poor responsiveness; a long job can monopolize CPU indefinitely.'],
          ['Starvation Risk', 'Possible for long jobs if high-priority/short jobs arrive continuously.', 'Generally low (except in non-preemptive SJF under continuous arrival).']
        ]
      },
      {
        title: 'Comparison: Shortest Job First (SJF) vs Round Robin (RR)',
        headers: ['Metric', 'Shortest Job First (SJF / SRTF)', 'Round Robin (RR)'],
        rows: [
          ['Optimization Goal', 'Minimizes Average Waiting Time (provably optimal).', 'Provides fair allocation and minimizes Response Time.'],
          ['Knowledge of Burst', 'Requires future knowledge of next CPU burst duration.', 'Requires no prior knowledge of process burst times.'],
          ['Starvation', 'Long jobs suffer starvation under heavy short job load.', 'Completely starvation-free; every job gets a slice every N*Q time.']
        ]
      }
    ],
    conceptToSimulationGuide: [
      {
        simulationElement: 'Live Gantt Chart & Time Step Counter',
        osKernelEquivalent: 'Linux Completely Fair Scheduler (CFS) vruntime red-black tree dispatch',
        whyItMatters: 'Shows exact chronological process preemption points, context switch boundaries, and idle intervals.'
      },
      {
        simulationElement: 'Process Metrics Table (CT, TAT, WT, RT)',
        osKernelEquivalent: 'Linux /proc/[pid]/schedstat execution tracking counters',
        whyItMatters: 'Mathematically verifies formula calculations against the visual timeline output.'
      }
    ],
    workedNumericals: [
      {
        title: 'SRTF (Shortest Remaining Time First) Complete Metrics Derivation',
        problemStatement: 'Consider the following four processes arriving at the ready queue with their respective Arrival Times (AT) and Burst Times (BT):\n- P1: AT = 0 ms, BT = 8 ms\n- P2: AT = 1 ms, BT = 4 ms\n- P3: AT = 2 ms, BT = 9 ms\n- P4: AT = 3 ms, BT = 5 ms\n\nConstruct the Gantt chart using SRTF (Preemptive SJF) and compute the Completion Time (CT), Turnaround Time (TAT), and Waiting Time (WT) for each process. Calculate the Average Waiting Time and Average Turnaround Time.',
        givenData: {
          'P1': 'AT = 0, BT = 8',
          'P2': 'AT = 1, BT = 4',
          'P3': 'AT = 2, BT = 9',
          'P4': 'AT = 3, BT = 5'
        },
        formulasUsed: [
          'TAT = CT - AT',
          'WT = TAT - BT',
          'Avg WT = (Sum of WT) / N',
          'Avg TAT = (Sum of TAT) / N'
        ],
        stepByStepSolution: [
          'Step 1: At t = 0, only P1 is present. P1 starts executing. Remaining BT: P1 = 8.',
          'Step 2: At t = 1, P2 arrives with BT = 4. Remaining BT for P1 = 7. Since 4 < 7, P2 preempts P1. P2 executes.',
          'Step 3: At t = 2, P3 arrives (BT = 9). P2 has 3 remaining. P2 continues.',
          'Step 4: At t = 3, P4 arrives (BT = 5). P2 has 2 remaining. P2 continues.',
          'Step 5: At t = 5, P2 finishes execution (CT = 5). Ready processes: P1 (rem 7), P4 (rem 5), P3 (rem 9). P4 has shortest remaining burst (5). P4 executes.',
          'Step 6: At t = 10, P4 finishes execution (CT = 10). Ready processes: P1 (rem 7), P3 (rem 9). P1 executes.',
          'Step 7: At t = 17, P1 finishes execution (CT = 17). Ready processes: P3 (rem 9). P3 executes.',
          'Step 8: At t = 26, P3 finishes execution (CT = 26).',
          'Step 9: Calculate metrics per process:\n- P1: CT = 17, TAT = 17 - 0 = 17, WT = 17 - 8 = 9 ms.\n- P2: CT = 5,  TAT = 5 - 1 = 4,   WT = 4 - 4 = 0 ms.\n- P3: CT = 26, TAT = 26 - 2 = 24, WT = 24 - 9 = 15 ms.\n- P4: CT = 10, TAT = 10 - 3 = 7,  WT = 7 - 5 = 2 ms.',
          'Step 10: Compute averages:\nAvg TAT = (17 + 4 + 24 + 7) / 4 = 52 / 4 = 13.0 ms.\nAvg WT = (9 + 0 + 15 + 2) / 4 = 26 / 4 = 6.50 ms.'
        ],
        finalAnswer: 'Average Turnaround Time = 13.0 ms; Average Waiting Time = 6.50 ms',
        gateYear: 'GATE CS 2011 / 2019'
      }
    ],
    conceptualQuestions: [
      {
        question: 'Why is Shortest Job First (SJF) mathematically optimal for minimizing average waiting time, yet cannot be implemented directly in general-purpose operating systems?',
        category: 'GATE CS',
        explanation: 'SJF is provably optimal because scheduling shorter jobs first shortens the waiting times of all subsequent jobs in the queue by a margin greater than the extension imposed on the longer job. However, it cannot be implemented directly in general-purpose OS kernels because the exact duration of the next CPU burst of an arbitrary user process cannot be known in advance before it runs. Kernels must approximate next burst length using exponential smoothing / moving average: tau_{n+1} = alpha * t_n + (1 - alpha) * tau_n.',
        commonTrap: 'Confusing theoretical optimality with practical feasibility.',
        keyTakeaway: 'SJF requires future knowledge of burst lengths, which can only be approximated via exponential smoothing.'
      },
      {
        question: 'Explain the Convoy Effect in FCFS scheduling and its negative impact on overall system I/O utilization.',
        category: 'Core Concept',
        explanation: 'The Convoy Effect occurs in FCFS when one CPU-intensive process with a very long burst holds the CPU, while numerous I/O-bound processes with short bursts sit idle in the Ready queue. While the CPU hog executes, all I/O devices sit idle. When the CPU hog finally finishes and initiates an I/O operation, all short processes rush through their tiny CPU bursts and queue up at the I/O device, leaving the CPU completely idle. This cyclic imbalance severely degrades both CPU and device utilization compared to round-robin or preemptive policies.',
        commonTrap: 'Assuming Convoy Effect only hurts CPU waiting times. It equally causes starvation and under-utilization of peripheral I/O devices.',
        keyTakeaway: 'The convoy effect results in poor, bursty utilization of both CPU and I/O hardware.'
      }
    ]
  },
  5: {
    moduleNumber: 5,
    inDepthTheory: [
      {
        sectionTitle: 'The Critical Section Problem & Correctness Criteria',
        content: 'When concurrent processes or threads access shared resources (e.g. shared memory variables, files, linked lists) without coordination, a Race Condition can occur where the final outcome depends on the non-deterministic interleaving of instruction execution. The code block accessing shared state is called the Critical Section.',
        bulletPoints: [
          'Mutual Exclusion: If process P_i is executing in its critical section, no other processes can be executing in their critical sections.',
          'Progress: If no process is executing in its critical section and some processes wish to enter, only those processes not executing in their remainder sections can participate in deciding who enters next, and this selection cannot be postponed indefinitely.',
          'Bounded Waiting: There must exist a bound on the number of times other processes are allowed to enter their critical sections after a process has made a request to enter and before that request is granted (prevents starvation).'
        ]
      },
      {
        sectionTitle: 'Software Solutions: Peterson\'s Algorithm',
        content: 'Peterson\'s Algorithm is a classical software solution for two processes (P0 and P1) that guarantees all three correctness criteria on single-instruction architectures.',
        bulletPoints: [
          'Shared Variables: boolean flag[2] (initialized to false; flag[i]=true means Pi is ready) and int turn (indicates whose turn it is to enter).',
          'Protocol for Process i: flag[i] = true; turn = j; while (flag[j] && turn == j); /* Critical Section */ flag[i] = false;',
          'Why it works: Mutual exclusion is guaranteed because turn cannot be both 0 and 1 simultaneously. Progress and bounded waiting hold because each process graciously yields the turn to the other.'
        ]
      },
      {
        sectionTitle: 'Hardware Synchronization & Semaphores',
        content: 'Modern multi-core architectures use hardware atomic read-modify-write instructions (TestAndSet, CompareAndSwap) to build lock primitives. Dijkstra introduced Semaphores: an integer variable S accessed exclusively through two atomic operations: wait() (also known as P) and signal() (also known as V).',
        bulletPoints: [
          'wait(S): while (S <= 0); S--; (In non-busy-waiting implementations, decrements S and blocks calling process on a semaphore wait queue if S < 0).',
          'signal(S): S++; (In block-and-wakeup implementations, increments S and unblocks one sleeping process from the queue if S <= 0).',
          'Counting Semaphore: Value can range over an unrestricted integer domain; controls access to a pool of N identical resources.',
          'Binary Semaphore (Mutex): Value can only be 0 or 1; guarantees strict mutual exclusion.'
        ]
      }
    ],
    comparisons: [
      {
        title: 'Comparison: Mutex Lock vs Counting Semaphore',
        headers: ['Feature', 'Mutex (Binary Semaphore)', 'Counting Semaphore'],
        rows: [
          ['Value Range', 'Strictly binary: 0 (locked) or 1 (unlocked).', 'Arbitrary non-negative integer domain (0 to N).'],
          ['Ownership', 'Has strict thread ownership: only the thread that acquired the mutex can release it.', 'No ownership concept: any thread can invoke signal(S) to wake up waiting threads.'],
          ['Primary Purpose', 'Mutual exclusion for a single critical section.', 'Resource counting, producer-consumer coordination, and signaling.']
        ]
      },
      {
        title: 'Comparison: Busy Waiting (Spinlock) vs Block-and-Wakeup Semaphore',
        headers: ['Property', 'Spinlock (Busy Waiting)', 'Block-and-Wakeup Semaphore'],
        rows: [
          ['CPU Consumption', 'Continuously loops in while loop, consuming 100% CPU cycles.', 'Puts process to sleep in waiting state, yielding CPU to other ready processes.'],
          ['Context Switch Cost', 'Zero context switch latency when lock is released quickly.', 'High latency: requires 2 context switches (putting to sleep and waking up).'],
          ['Ideal Use Case', 'Very short lock holding times on multicore systems (OS kernel internal locks).', 'Long wait durations, user-space applications, and uniprocessor systems.']
        ]
      }
    ],
    conceptToSimulationGuide: [
      {
        simulationElement: 'Interactive Semaphore State & Wait Queue',
        osKernelEquivalent: 'Linux struct semaphore and futex (Fast Userspace Mutex) system calls',
        whyItMatters: 'Demonstrates how wait() decrements the counter and suspends excess threads into the wait queue.'
      },
      {
        simulationElement: 'Producer-Consumer Buffer Monitor',
        osKernelEquivalent: 'POSIX sem_init, sem_wait, sem_post on circular buffer',
        whyItMatters: 'Visualizes synchronization using empty, full, and mutex semaphores to prevent race conditions.'
      }
    ],
    workedNumericals: [
      {
        title: 'Counting Semaphore Final Value & Blocked Processes',
        problemStatement: 'A counting semaphore S is initialized to the value 7. A series of operations are executed concurrently by various processes: 15 wait(S) operations and 9 signal(S) operations. Assuming a non-busy-waiting (block-and-wakeup) implementation of semaphores:\n(a) What is the final value of the semaphore S?\n(b) How many processes, if any, are currently suspended/blocked on the semaphore wait queue?',
        givenData: {
          'Initial Value S_0': '7',
          'Total wait(S) operations': '15',
          'Total signal(S) operations': '9'
        },
        formulasUsed: [
          'S_final = S_0 - Count(wait) + Count(signal)',
          'Blocked Processes = |S_final| if S_final < 0, else 0'
        ],
        stepByStepSolution: [
          'Step 1: In a block-and-wakeup semaphore implementation, wait(S) decrements S by 1, and signal(S) increments S by 1.',
          'Step 2: Total change = -15 + 9 = -6.',
          'Step 3: Final semaphore value S_final = 7 - 15 + 9 = 7 - 6 = +1.',
          'Step 4: Since S_final = +1 > 0, the semaphore still has 1 available permit.',
          'Step 5: Number of blocked processes = 0 (no processes are blocked because S >= 0).'
        ],
        finalAnswer: '(a) Final Semaphore Value S = +1; (b) Blocked Processes = 0',
        gateYear: 'GATE CS 2014 / 2020'
      }
    ],
    conceptualQuestions: [
      {
        question: 'In the Critical Section problem, what is the precise definition of "Progress", and why does a strict alternating turn variable solution (turn = 0, turn = 1) violate Progress?',
        category: 'GATE CS',
        explanation: 'Progress mandates that if no process is currently in its critical section, and one or more processes wish to enter, only those processes NOT executing in their remainder sections can participate in deciding who enters next, and this selection cannot be postponed indefinitely. Under strict alternation (P0 sets turn=1 on exit, P1 sets turn=0 on exit), suppose P0 exits and does not want to re-enter. P1 enters, exits, and wishes to enter AGAIN. P1 is blocked because turn is 0 (P0\'s turn), even though P0 is off doing other things and not competing. Thus, a process outside the critical section prevents an interested process from entering, violating Progress.',
        commonTrap: 'Confusing Mutual Exclusion with Progress. Strict alternation perfectly satisfies Mutual Exclusion, but catastrophically fails Progress.',
        keyTakeaway: 'Progress ensures that an uninterested or slow process cannot block an eager process from entering.'
      },
      {
        question: 'Why are spinlocks strictly forbidden on uniprocessor (single-core) systems, yet actively used inside multicore operating system kernels?',
        category: 'Technical Interview',
        explanation: 'On a single-core CPU, if process A is spinning in a while-loop waiting for a lock to be released by process B, process A is actively consuming 100% of the single CPU. Process B cannot execute to release the lock until process A times out and is preempted! Thus, spinning on a single-core system is pure wasted time. On a multicore system, however, process B is executing concurrently on Core 1 while process A spins on Core 0. If the lock is held for only a few machine instructions, spinning avoids the massive overhead of two context switches (thousands of CPU cycles).',
        commonTrap: 'Thinking spinlocks are universally bad due to busy waiting. When lock holding times are shorter than a context switch, spinlocks are optimal.',
        keyTakeaway: 'Spinlocks make sense only when the lock holder runs concurrently on another physical core.'
      }
    ]
  },
  6: {
    moduleNumber: 6,
    inDepthTheory: [
      {
        sectionTitle: 'Inter-Process Communication (IPC) Models: Shared Memory vs Message Passing',
        content: 'Processes in an operating system can be independent or cooperating. Cooperating processes require IPC mechanisms for data exchange. The two fundamental IPC paradigms are Shared Memory and Message Passing.',
        bulletPoints: [
          'Shared Memory: Communicating processes establish a shared physical memory region mapped into their respective virtual address spaces. Once mapped, reads and writes occur at hardware memory bus speeds with zero kernel intervention. Requires user synchronization (e.g. semaphores) to prevent race conditions.',
          'Message Passing: Communicating processes exchange discrete messages mediated by the operating system kernel via system calls (send(), receive()). Ideal for exchanging smaller amounts of data and distributed networks.'
        ]
      },
      {
        sectionTitle: 'Pipes & Message Queues: Unidirectional & Typed Communication',
        content: 'Pipes provide a FIFO byte-stream channel between processes.',
        bulletPoints: [
          'Anonymous Pipes: Created via pipe(fd[2]). Unidirectional: fd[0] is read end, fd[1] is write end. Only usable between related processes that share file descriptors via fork().',
          'Named Pipes (FIFOs): Created via mkfifo() in the file system namespace. Persists after processes terminate; can be used by unrelated processes.',
          'Message Queues: A linked list of discrete typed messages stored in kernel space. A receiver can select messages based on priority or type rather than strict FIFO.'
        ]
      },
      {
        sectionTitle: 'Sockets & Remote Procedure Calls (RPC)',
        content: 'For communication across network boundaries or decoupled processes on the same host, Unix Domain Sockets and Internet Sockets (TCP/UDP) provide standard client-server interfaces using file descriptor abstractions.',
        bulletPoints: [
          'Unix Domain Sockets: Faster than TCP loopback (127.0.0.1) because protocol checksums and routing overhead are bypassed entirely.',
          'RPC (Remote Procedure Call): Stubs abstract network message serialization (marshalling) to allow a client to invoke a function on a remote machine as if it were a local function call.'
        ]
      }
    ],
    comparisons: [
      {
        title: 'Comparison: Shared Memory vs Message Passing IPC',
        headers: ['Dimension', 'Shared Memory', 'Message Passing'],
        rows: [
          ['Kernel Involvement', 'Only during initial setup (shmget/shmat); zero kernel calls during data transfer.', 'Every message requires system call traps (send, receive) and kernel buffer copies.'],
          ['Transfer Speed', 'Maximum possible speed (direct DRAM bus read/write).', 'Slower due to mode switch latency and double memory copies.'],
          ['Synchronization', 'Explicit programmer responsibility (must use semaphores or mutexes).', 'Handled automatically by the kernel (receive blocks until message arrives).'],
          ['Distributed Systems', 'Cannot be directly shared across physical network nodes.', 'Naturally scales across local machines and distributed networks.']
        ]
      },
      {
        title: 'Comparison: Anonymous Pipe vs Named Pipe (FIFO)',
        headers: ['Feature', 'Anonymous Pipe', 'Named Pipe (FIFO)'],
        rows: [
          ['Filesystem Presence', 'Exists only in kernel memory; has no directory path.', 'Exists as a special FIFO file node in the filesystem directory tree.'],
          ['Process Relationship', 'Strictly requires parent-child or sibling relationship (via fork()).', 'Can be used by any two completely unrelated processes with file permissions.'],
          ['Lifetime', 'Destroyed as soon as all referencing process file descriptors close.', 'Persists in filesystem until explicitly removed via unlink() or rm.']
        ]
      }
    ],
    conceptToSimulationGuide: [
      {
        simulationElement: 'IPC Data Transfer & Protocol Inspector',
        osKernelEquivalent: 'POSIX shm_open / Linux pipe buffer ring / mq_open',
        whyItMatters: 'Demonstrates the structural differences in data flow between zero-copy shared memory and kernel-mediated message queues.'
      },
      {
        simulationElement: 'Pipe Capacity & Blocking State Visualizer',
        osKernelEquivalent: 'Linux F_SETPIPE_SZ / pipe buffer page queue (typically 64 KB)',
        whyItMatters: 'Shows write() blocking when a pipe is full and read() blocking when a pipe is empty.'
      }
    ],
    workedNumericals: [
      {
        title: 'IPC Throughput & Latency: Shared Memory vs Message Passing',
        problemStatement: 'Two processes need to transfer a 64 MB video buffer. System specs:\n- System call mode switch overhead = 1.0 μs (per send or receive)\n- Memory copy speed = 8 GB/s = 8,000 MB/s\nIn Message Passing, the buffer must be copied twice (User space -> Kernel buffer -> User space) using 4 KB chunks with 1 send() and 1 receive() syscall per chunk. In Shared Memory, the buffer is mapped directly and copied once by the writer and read once by the reader at bus speed with 0 syscalls during transfer.\nCalculate the total transfer time and throughput for both methods.',
        givenData: {
          'Buffer Size': '64 MB',
          'Memory Copy Speed': '8,000 MB/s',
          'Chunk Size': '4 KB = 0.004 MB',
          'Syscall Overhead': '1.0 μs per call (2 calls per chunk = 2.0 μs)'
        },
        formulasUsed: [
          'Memory Copy Time = Data Size / Copy Speed',
          'Total Chunks = 64 MB / 0.004 MB = 16,384 chunks',
          'Message Passing Time = (2 * Copy Time) + (Total Chunks * 2.0 μs Syscall Overhead)',
          'Shared Memory Time = 1 * Copy Time (single write + concurrent read)'
        ],
        stepByStepSolution: [
          'Step 1: Compute time to copy 64 MB once: 64 MB / 8,000 MB/s = 0.008 seconds = 8.0 ms.',
          'Step 2: Shared Memory transfer time = 8.0 ms. Effective throughput = 64 MB / 0.008 s = 8,000 MB/s.',
          'Step 3: Message Passing memory copy time (2 copies) = 2 * 8.0 ms = 16.0 ms.',
          'Step 4: Total chunks = 64 * 1024 KB / 4 KB = 16,384 chunks.',
          'Step 5: Total syscall overhead = 16,384 * 2.0 μs = 32,768 μs = 32.77 ms.',
          'Step 6: Total Message Passing time = 16.0 ms + 32.77 ms = 48.77 ms.',
          'Step 7: Message Passing throughput = 64 MB / 0.04877 s = 1,312.3 MB/s.'
        ],
        finalAnswer: 'Shared Memory Time = 8.0 ms (8,000 MB/s); Message Passing Time = 48.77 ms (1,312.3 MB/s). Shared Memory is 6.1x faster.',
        gateYear: 'GATE CS 2017 Adapted'
      }
    ],
    conceptualQuestions: [
      {
        question: 'What signal is generated by the operating system when a process attempts to write to a pipe whose read end has been closed by all reading processes?',
        category: 'Technical Interview',
        explanation: 'The kernel sends the SIGPIPE (Broken Pipe) signal to the writing process. By default, SIGPIPE terminates the writing process unless the process has explicitly installed a signal handler or masked the signal with sigaction(). Additionally, the write() system call returns -1 with the global error number set to EPIPE. This design prevents processes from producing orphaned data into closed buffers.',
        commonTrap: 'Thinking that write() simply blocks forever waiting for a reader to reappear. It immediately triggers SIGPIPE.',
        keyTakeaway: 'Writing to a pipe with no active readers triggers SIGPIPE and returns EPIPE.'
      },
      {
        question: 'Why does Shared Memory require no kernel intervention during data transfers, and what is the key trade-off involved?',
        category: 'Core Concept',
        explanation: 'Shared memory is set up by configuring the MMUs of two or more processes so that their page table entries (PTEs) map different virtual addresses to the exact same physical memory frames. Once mapped, any instruction executing a MOV or store command writes directly into physical RAM. The CPU MMU handles translation in hardware without raising any exception or trap into Ring 0. The trade-off is that the kernel provides ZERO synchronization: if two processes write concurrently, data will be corrupted. The application developers must coordinate access using synchronization primitives (e.g., mutexes, semaphores, or atomic CAS).',
        commonTrap: 'Believing that shared memory includes automatic locking mechanisms.',
        keyTakeaway: 'Shared memory offers raw memory speed, but delegates all synchronization duties to user code.'
      }
    ]
  }
};
