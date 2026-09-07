import type { ModuleConceptGuide } from './types';

export const MODULES_19_TO_24: Record<number, ModuleConceptGuide> = {
  19: {
    moduleNumber: 19,
    inDepthTheory: [
      {
        sectionTitle: 'Free Space Management Schemes: Bitmaps & Free Lists',
        content: 'To allocate free blocks to newly created or expanding files, the operating system tracks unused disk blocks using several standard data structures:',
        bulletPoints: [
          'Bit Vector (Bitmap): Each block is represented by 1 bit (1 = block free, 0 = block allocated). Simple and highly efficient on modern CPUs with hardware "find-first-set-bit" instructions. Bitmaps are kept in RAM and flushed to disk.',
          'Linked Free List: Free blocks are linked together as a singly linked list; each free block contains a pointer to the next free block. Takes zero additional storage (pointers live in the free blocks themselves), but traversing the list across disk platters is extremely slow.',
          'Grouping: The first free block stores the disk addresses of N free blocks; the N-th block points to the next block of addresses. Allows fast batch allocation of multiple contiguous blocks.',
          'Counting: Stores the disk address of the first free block and an integer count of contiguous free blocks following it. Highly compact for file systems with contiguous allocation and extents.'
        ]
      }
    ],
    comparisons: [
      {
        title: 'Comparison: Bitmap vs Linked Free List vs Counting',
        headers: ['Method', 'Storage Overhead', 'Contiguous Allocation Efficiency'],
        rows: [
          ['Bitmap', 'Fixed overhead (1 bit per disk block, e.g. 32 MB for 1 TB disk).', 'High: fast CPU bit-scanning finds contiguous runs easily.'],
          ['Linked Free List', 'Zero extra disk space (pointers reside inside free blocks).', 'Terrible: blocks are scattered randomly; finding contiguous blocks is impossible.'],
          ['Counting', 'Extremely small if free space is clustered into large contiguous extents.', 'Optimal: stores starting block and contiguous span count directly.']
        ]
      }
    ],
    conceptToSimulationGuide: [
      {
        simulationElement: 'Interactive Free Space Bitmap Grid & Allocation Map',
        osKernelEquivalent: 'Linux ext4 block allocation bitmaps and mballoc buddy allocator',
        whyItMatters: 'Demonstrates real-time block allocation, bitmap bit-toggling, and free block recycling.'
      }
    ],
    workedNumericals: [
      {
        title: 'Free Space Bitmap Memory Overhead Calculation',
        problemStatement: 'A storage server uses a disk of capacity 2 Terabytes (2 TB = 2^41 bytes) formatted with a block size of 4 Kilobytes (4 KB = 2^12 bytes). Calculate:\n(a) Total number of blocks on the disk.\n(b) Size of the bitmap required to track free space in bits, bytes, and Megabytes (MB).\n(c) The percentage of disk capacity consumed by the bitmap.',
        givenData: {
          'Disk Capacity': '2 TB = 2 * 2^40 bytes = 2^41 bytes',
          'Block Size': '4 KB = 2^12 bytes'
        },
        formulasUsed: [
          'Total Blocks = Disk Capacity / Block Size',
          'Bitmap Size in Bits = Total Blocks * 1 bit',
          'Bitmap Size in Bytes = Bitmap Bits / 8',
          'Overhead Percentage = (Bitmap Bytes / Disk Capacity) * 100%'
        ],
        stepByStepSolution: [
          'Step 1: Compute Total Blocks on the disk:\nTotal Blocks = 2^41 bytes / 2^12 bytes = 2^29 blocks = 536,870,912 blocks.',
          'Step 2: Compute Bitmap size in bits:\nBitmap Bits = 2^29 bits.',
          'Step 3: Convert to bytes:\nBitmap Bytes = 2^29 bits / 8 bits per byte = 2^29 / 2^3 = 2^26 bytes.',
          'Step 4: Convert to Megabytes (MB = 2^20 bytes):\nBitmap Size = 2^26 / 2^20 = 2^6 MB = 64 MB.',
          'Step 5: Compute Overhead Percentage:\nOverhead = (2^26 bytes / 2^41 bytes) * 100% = (1 / 2^15) * 100% = (1 / 32,768) * 100% = 0.00305%.'
        ],
        finalAnswer: '(a) 536,870,912 blocks; (b) 64 MB bitmap; (c) Overhead = 0.00305%',
        gateYear: 'GATE CS 2013 / 2017'
      }
    ],
    conceptualQuestions: [
      {
        question: 'Why must the OS kernel write the modified Free Space Bitmap to disk BEFORE allocating a block to a user file (Write-Ahead Logging)?',
        category: 'GATE CS',
        explanation: 'This is a fundamental crash consistency rule. If the OS allocated a block to File A, wrote File A\'s data to disk, but crashed before flushing the bitmap (so the bitmap still marks the block as FREE), then upon reboot, another process creating File B could be allocated the exact same block! File B would overwrite File A\'s data, causing silent, catastrophic data corruption. By writing the bitmap to disk first (marking the block as ALLOCATED), even if a power failure occurs before writing the file, at worst a block is temporarily leaked (which fsck can reclaim), but user data will never be silently overwritten.',
        commonTrap: 'Thinking order of disk writes does not matter. Write-ahead ordering prevents double-allocation corruption.',
        keyTakeaway: 'Bitmap allocation must be made durable before file data writes to prevent double-allocation.'
      },
      {
        question: 'How does the Counting method dramatically save memory compared to Linked Free Lists in file systems using contiguous extents?',
        category: 'Technical Interview',
        explanation: 'In file systems where files are allocated and released in large contiguous extents (e.g. 500 contiguous blocks), a Linked List requires 500 separate pointers scattered across disk. Under the Counting method, the OS records only two integers: <Starting_Block: 12000, Count: 500>. This reduces 500 entries down to a single 8-byte record, providing orders-of-magnitude storage savings and near-instant contiguous allocation.',
        commonTrap: 'Assuming Counting requires tracking every individual block. It tracks contiguous spans.',
        keyTakeaway: 'Counting groups contiguous free blocks into a single start-length tuple, saving immense memory.'
      }
    ]
  },
  20: {
    moduleNumber: 20,
    inDepthTheory: [
      {
        sectionTitle: 'Protection Domains & The Access Matrix Model',
        content: 'Operating System Protection ensures that resources (files, memory segments, CPU instructions) are accessed only by processes that have proper authorization. The abstract model of protection is the Access Matrix:',
        bulletPoints: [
          'Access Matrix Structure: Rows represent Protection Domains (Users, Processes, Roles). Columns represent Objects (Files, Devices, Memory Regions). An entry Matrix[i, j] defines the set of Access Rights that domain i can exercise on object j (e.g. {Read, Write, Execute}).',
          'Access Control Lists (ACL): The matrix is stored by Columns. Each Object has an attached list of [Domain, Rights] tuples (e.g. Unix file permissions: Owner, Group, Others; Windows NTFS ACLs).',
          'Capability Lists: The matrix is stored by Rows. Each Domain/Process possesses a cryptographically unforgeable list of capabilities [Object, Rights] like a ticket or key.'
        ]
      },
      {
        sectionTitle: 'Hardware Protection Rings & Buffer Overflow Defenses',
        content: 'CPUs enforce privilege separation via hardware Protection Rings (Ring 0 = Kernel, Ring 3 = User). Common vulnerabilities like Buffer Overflows allow attackers to overwrite a function\'s stack return address. Modern OS kernels implement defense-in-depth mitigations:',
        bulletPoints: [
          'Stack Canaries (StackGuard): A random secret integer placed between local variables and the saved return address on the stack frame. Before returning, the function verifies the canary is unchanged; if corrupted, the program aborts immediately (SIGABRT).',
          'Data Execution Prevention (DEP / NX / W^X): The MMU hardware enforces that memory pages are either Writable OR Executable, never both. Shellcode injected onto the stack cannot be executed.',
          'ASLR (Address Space Layout Randomization): The kernel randomizes the base addresses of the Stack, Heap, and Libraries at process startup, defeating hardcoded exploit return addresses.'
        ]
      }
    ],
    comparisons: [
      {
        title: 'Comparison: Access Control Lists (ACL) vs Capability Lists',
        headers: ['Dimension', 'Access Control List (ACL)', 'Capability List'],
        rows: [
          ['Storage Association', 'Stored directly on the Object (e.g. file metadata / inode).', 'Stored on the Subject / Process (e.g. file descriptor token).'],
          ['Revocation of Rights', 'Trivial: Simply edit the file\'s ACL; changes take effect immediately.', 'Extremely difficult: Must search and revoke distributed tickets held across all processes.'],
          ['Confinement Problem', 'Well protected: A process cannot delegate its rights to another unauthorized process.', 'Vulnerable: A rogue process can leak its capability ticket to another process.']
        ]
      }
    ],
    conceptToSimulationGuide: [
      {
        simulationElement: 'Access Matrix Grid & ACL vs Capability Inspector',
        osKernelEquivalent: 'POSIX ACLs (getfacl/setfacl) and Linux capabilities (cap_set_proc)',
        whyItMatters: 'Demonstrates matrix slicing into column-oriented ACLs vs row-oriented capability lists.'
      },
      {
        simulationElement: 'Stack Buffer Overflow & Stack Canary Defense Inspector',
        osKernelEquivalent: 'GCC -fstack-protector and Linux ASLR (/proc/sys/kernel/randomize_va_space)',
        whyItMatters: 'Visually shows stack frame layout, local buffer overflow, canary corruption, and hardware NX trap.'
      }
    ],
    workedNumericals: [
      {
        title: 'Access Matrix Storage Overhead: 2D Matrix vs Sparse ACL Representation',
        problemStatement: 'A multi-user operating system hosts 500 user domains and 20,000 file objects. Each access right entry requires 4 bytes. An audit shows that an average file object is shared by only 3 user domains. Compare:\n(a) Total storage required if implemented as a full 2D Access Matrix.\n(b) Total storage required if implemented as sparse Access Control Lists (ACLs), where each ACL entry stores [Domain_ID (2 bytes) + Rights (2 bytes)].\n(c) Storage savings percentage achieved by the ACL representation.',
        givenData: {
          'Domains D': '500 users',
          'Objects O': '20,000 files',
          'Full Matrix Entry': '4 bytes',
          'Average Domains per File': '3 domains',
          'ACL Entry Size': '4 bytes'
        },
        formulasUsed: [
          'Full Matrix Size = D * O * Entry_Size',
          'Sparse ACL Size = O * (Average Domains per File) * ACL_Entry_Size',
          'Savings % = (Full Size - ACL Size) / Full Size * 100%'
        ],
        stepByStepSolution: [
          'Step 1: Compute Full 2D Matrix Size:\nFull Size = 500 * 20,000 * 4 bytes = 40,000,000 bytes = 40.0 MB.',
          'Step 2: Compute Sparse ACL Size:\nTotal non-empty entries = 20,000 files * 3 domains/file = 60,000 entries.\nACL Storage = 60,000 * 4 bytes = 240,000 bytes = 240 KB = 0.24 MB.',
          'Step 3: Compute Storage Savings:\nSavings % = (40.0 MB - 0.24 MB) / 40.0 MB * 100% = (39.76 / 40.0) * 100% = 99.4%.'
        ],
        finalAnswer: '(a) Full Matrix = 40.0 MB; (b) Sparse ACL = 240 KB; (c) Storage Savings = 99.4%',
        gateYear: 'GATE CS 2015 Adapted'
      }
    ],
    conceptualQuestions: [
      {
        question: 'Why is Revocation of Access Rights trivial in an Access Control List (ACL) system, but notoriously difficult in a Capability-based system?',
        category: 'GATE CS',
        explanation: 'In an ACL system, access rights are stored in a single centralized location: attached to the Object itself (e.g. the file\'s Inode). Revoking user Alice\'s write permission simply requires deleting Alice from that single object\'s ACL; subsequent access checks fail immediately. In a Capability system, capabilities are distributed keys given to processes. A process may have copied its capability token, passed it via IPC to child or sibling processes, or stored it in data structures. Revoking the capability requires either: (1) scanning every process memory in the system to invalidate the token, (2) adding an indirection table in the kernel (which degrades capability performance), or (3) changing the object\'s cryptographic epoch (which revokes rights for ALL users).',
        commonTrap: 'Thinking capability lists can be revoked by updating the user profile.',
        keyTakeaway: 'ACLs are centralized at the object (easy revocation); capabilities are distributed across subjects (hard revocation).'
      },
      {
        question: 'How do Data Execution Prevention (DEP / NX) and Address Space Layout Randomization (ASLR) combine to stop Buffer Overflow exploits?',
        category: 'Technical Interview',
        explanation: 'A classic buffer overflow injects executable machine code (shellcode) into a stack buffer and overwrites the saved return address to jump to the stack. DEP/NX marks stack and heap memory pages as Non-Executable (W^X), so CPU hardware immediately raises a General Protection Fault if execution jumps to the stack. To bypass DEP, attackers invented Return-Oriented Programming (ROP) and return-to-libc: jumping to existing executable functions (like system()) in loaded C libraries. ASLR defeats ROP by randomizing the memory base addresses of libc, stack, and heap at every program launch. Because the attacker cannot predict the runtime address of system(), jumping to a hardcoded address crashes the process with a segmentation fault.',
        commonTrap: 'Assuming ASLR alone prevents memory corruption. ASLR prevents predicting exploit addresses.',
        keyTakeaway: 'DEP prevents running code from data buffers; ASLR prevents jumping to existing library functions.'
      }
    ]
  },
  21: {
    moduleNumber: 21,
    inDepthTheory: [
      {
        sectionTitle: 'Hardware Interrupt Architecture & The Interrupt Lifecycle',
        content: 'An Interrupt is a hardware signal sent to the processor by an external device controller (NIC, keyboard, disk, APIC timer) indicating an event requiring immediate OS service. The hardware interrupt lifecycle proceeds through exact architectural stages:',
        bulletPoints: [
          '1. Device asserts Interrupt Request (IRQ) line on the Interrupt Controller (APIC).',
          '2. APIC prioritizes and signals CPU INT pin with a vector number (0 to 255).',
          '3. CPU completes the currently executing machine instruction.',
          '4. CPU pushes EFLAGS, CS, and EIP (Program Counter) onto the kernel stack.',
          '5. Hardware clears the Interrupt Flag (CLI) to disable nested interrupts.',
          '6. CPU uses the interrupt vector as an index into the Interrupt Descriptor Table (IDT) to fetch the Interrupt Service Routine (ISR) address.',
          '7. CPU jumps to the ISR in Ring 0. When finished, ISR executes the IRET instruction to restore flags and resume user code.'
        ]
      },
      {
        sectionTitle: 'Deferred Interrupt Processing: Top-Half vs Bottom-Half Handlers',
        content: 'Handling an entire complex I/O operation inside an ISR is terrible because interrupts are disabled, increasing interrupt latency for other critical devices. Modern kernels split interrupt handling into two distinct halves:',
        bulletPoints: [
          'Top-Half (Hardirq): Runs immediately with interrupts disabled. Acknowledges hardware, reads device status, copies data into kernel ring buffer, schedules bottom-half, and exits in microseconds.',
          'Bottom-Half (Softirqs, Tasklets, Workqueues): Executes later with interrupts enabled. Handles heavy processing (e.g. TCP/IP checksums, packet routing, filesystem writes).',
          'Workqueues vs Softirqs: Softirqs run in interrupt context and CANNOT SLEEP. Workqueues run in kernel thread context and CAN SLEEP (can acquire mutexes and perform disk I/O).'
        ]
      }
    ],
    comparisons: [
      {
        title: 'Comparison: Top-Half vs Bottom-Half Interrupt Handlers',
        headers: ['Property', 'Top-Half Handler (Hardirq)', 'Bottom-Half Handler (Softirq / Workqueue)'],
        rows: [
          ['Interrupt Status', 'Runs with local interrupts disabled (CLI).', 'Runs with hardware interrupts fully enabled (STI).'],
          ['Execution Time', 'Extremely fast: strictly microseconds.', 'Can execute arbitrarily long background processing.'],
          ['Blocking Ability', 'Can NEVER sleep or block on mutex/I/O.', 'Workqueues can sleep; softirqs/tasklets cannot sleep.']
        ]
      }
    ],
    conceptToSimulationGuide: [
      {
        simulationElement: 'Interrupt Descriptor Table (IDT) Vector Lookup',
        osKernelEquivalent: 'x86-64 IDT and Linux arch/x86/kernel/irq.c',
        whyItMatters: 'Shows hardware stack push of CS, RIP, RFLAGS and vector jump to kernel ISR handler.'
      }
    ],
    workedNumericals: [
      {
        title: 'Interrupt Latency & Microcontroller CPU Utilization',
        problemStatement: 'A real-time embedded system runs a processor clocked at 100 MHz (clock cycle = 10 ns). An external sensor generates hardware interrupts at a rate of 5,000 interrupts per second. For each interrupt:\n- Hardware interrupt recognition, pipeline flush, and register saving takes 30 clock cycles.\n- IDT vector lookup takes 10 clock cycles.\n- The Top-Half ISR takes 160 clock cycles.\n- The IRET instruction takes 20 clock cycles.\nCalculate:\n(a) Total Interrupt Latency in nanoseconds before the first instruction of the ISR executes.\n(b) Total execution time required to service one complete interrupt.\n(c) The percentage of CPU time consumed purely by servicing interrupts.',
        givenData: {
          'Clock Frequency': '100 MHz (10 ns per cycle)',
          'Interrupt Rate': '5,000 interrupts/sec',
          'Save context': '30 cycles',
          'IDT Lookup': '10 cycles',
          'ISR Work': '160 cycles',
          'IRET return': '20 cycles'
        },
        formulasUsed: [
          'Latency = (Save Context + IDT Lookup) * Cycle Time',
          'Total Cycles per Interrupt = Save + IDT + ISR + IRET',
          'Total Time per Interrupt = Total Cycles * Cycle Time',
          'CPU Utilization = Interrupt Rate * Total Time per Interrupt * 100%'
        ],
        stepByStepSolution: [
          'Step 1: Compute Interrupt Latency:\nLatency Cycles = 30 + 10 = 40 cycles.\nLatency Time = 40 * 10 ns = 400 ns.',
          'Step 2: Compute Total Cycles per Interrupt:\nTotal Cycles = 30 (save) + 10 (IDT) + 160 (ISR) + 20 (IRET) = 220 cycles.',
          'Step 3: Compute Total Service Time per Interrupt:\nService Time = 220 cycles * 10 ns = 2,200 ns = 2.2 microseconds.',
          'Step 4: Compute Total Time spent per second for 5,000 interrupts:\nTime per second = 5,000 * 2.2 μs = 11,000 μs = 11.0 ms = 0.011 seconds.',
          'Step 5: Compute CPU Utilization Percentage:\nCPU Utilization = (0.011 s / 1.0 s) * 100% = 1.1%.'
        ],
        finalAnswer: '(a) Interrupt Latency = 400 ns; (b) Total Service Time = 2.2 μs; (c) CPU Utilization = 1.1%',
        gateYear: 'GATE CS 2016 Adapted'
      }
    ],
    conceptualQuestions: [
      {
        question: 'Why can a Top-Half Interrupt Handler (Hardirq) NEVER execute an operation that sleeps or blocks (e.g. acquiring a blocking mutex or calling kmalloc with GFP_KERNEL)?',
        category: 'GATE CS',
        explanation: 'A Top-Half interrupt handler runs in "Interrupt Context", NOT in a process context. In interrupt context, there is no underlying process or thread structure (task_struct) to put to sleep! If an ISR attempted to sleep (e.g. wait for a mutex), the scheduler would have no way to track what is sleeping or wake it back up. Furthermore, interrupts are disabled; if the ISR blocked, the CPU would freeze permanently in an unrecoverable kernel deadlock. Any operation requiring memory allocation or blocking synchronization must be deferred to a Bottom-Half Workqueue running in kernel thread context.',
        commonTrap: 'Thinking an ISR can use mutexes like normal user code. ISRs can only use non-blocking spinlocks.',
        keyTakeaway: 'Interrupt context has no process backing, meaning code executing in an ISR can never sleep.'
      },
      {
        question: 'What is a Non-Maskable Interrupt (NMI), and under what critical conditions is it triggered by hardware?',
        category: 'Core Concept',
        explanation: 'A standard hardware interrupt is Maskable: the CPU can temporarily ignore it by clearing the Interrupt Flag (CLI instruction) during critical section execution. A Non-Maskable Interrupt (NMI) connects to a dedicated physical CPU pin that CANNOT be disabled or ignored by software under any circumstances. NMIs are reserved strictly for catastrophic hardware emergencies, such as unrecoverable DRAM parity errors, ECC memory failures, chipset bus timeouts, or watchdog timer resets when the kernel freezes.',
        commonTrap: 'Assuming software can ignore NMIs using CLI. NMIs bypass all software interrupt masking.',
        keyTakeaway: 'NMIs cannot be masked by software and are reserved for catastrophic hardware faults.'
      }
    ]
  },
  22: {
    moduleNumber: 22,
    inDepthTheory: [
      {
        sectionTitle: 'Virtualization & Hypervisor Architecture',
        content: 'Virtualization allows a single physical host computer to execute multiple guest operating systems simultaneously in total isolation. The software layer creating and managing virtual machines is the Hypervisor (or Virtual Machine Monitor, VMM).',
        bulletPoints: [
          'Type-1 Hypervisor (Bare-Metal): Runs directly on bare hardware without an underlying host OS (e.g. VMware ESXi, Xen, KVM). Delivers high performance, low latency, and enterprise isolation.',
          'Type-2 Hypervisor (Hosted): Runs as an application inside a host operating system (e.g. Oracle VirtualBox, VMware Workstation). Simpler to install and test, but incurs host OS scheduling overhead.',
          'Popek-Goldberg Virtualization Requirements: A computer architecture is strictly virtualizable if and only if all Sensitive Instructions (those that expose hardware configuration or behavior depending on privilege mode) are a strict subset of Privileged Instructions (those that trap in user mode).'
        ]
      },
      {
        sectionTitle: 'CPU, Memory & I/O Virtualization (Hardware Assistance)',
        content: 'Early x86 processors had 17 sensitive instructions that did NOT trap in user mode (the "x86 Virtualization Hole", e.g. POPF). Modern virtualization uses hardware assistance (Intel VT-x, AMD-V):',
        bulletPoints: [
          'Intel VT-x Modes: Adds VMX Root Mode (for Hypervisor) and VMX Non-Root Mode (for Guest OS). When guest OS executes a privileged instruction, CPU performs a VM Exit trapping into the hypervisor.',
          'Two-Dimensional Paging (EPT / NPT): Guest OS manages Guest Virtual to Guest Physical (GVA -> GPA). Hypervisor hardware Extended Page Tables (EPT) translate Guest Physical to Host Physical (GPA -> HPA).',
          'SR-IOV (Single Root I/O Virtualization): Physical PCIe devices present multiple virtual endpoints directly to guest VMs, bypassing hypervisor I/O emulation overhead.'
        ]
      }
    ],
    comparisons: [
      {
        title: 'Comparison: Type-1 (Bare-Metal) vs Type-2 (Hosted) Hypervisors',
        headers: ['Dimension', 'Type-1 (Bare-Metal)', 'Type-2 (Hosted)'],
        rows: [
          ['Underlying Layer', 'Runs directly on physical bare hardware.', 'Runs on top of a standard host OS (Linux, Windows).'],
          ['Performance', 'Near-native speed (95 - 99% bare metal).', 'Noticeable latency due to double scheduling.'],
          ['Typical Deployment', 'Enterprise cloud datacenters (AWS, Azure, Google Cloud).', 'Developer laptops and local desktop testing.']
        ]
      }
    ],
    conceptToSimulationGuide: [
      {
        simulationElement: 'Two-Dimensional Page Table Walk (GVA -> GPA -> HPA)',
        osKernelEquivalent: 'Intel EPT (Extended Page Tables) / AMD NPT hardware MMU translation',
        whyItMatters: 'Shows the 2D matrix multiplication of memory walks: 4-level guest walk * 4-level EPT walk = up to 24 DRAM accesses on cold miss.'
      }
    ],
    workedNumericals: [
      {
        title: 'Two-Dimensional Paging Memory Walk Overhead Calculation',
        problemStatement: 'In Intel VT-x hardware-assisted memory virtualization with Extended Page Tables (EPT), both the Guest OS and the Host Hypervisor use 4-level page tables. Translating a Guest Virtual Address (GVA) to Host Physical Address (HPA) requires walking the guest page table, but each entry of the guest table is a Guest Physical Address (GPA) which itself requires a 4-level EPT walk! Calculate:\n(a) Total memory accesses required for a single guest memory reference in the worst case where both the Guest TLB and EPT TLB miss.\n(b) If each DRAM access takes 80 ns, calculate the total translation latency.\n(c) The performance speedup achieved by caching EPT mappings in hardware TLB.',
        givenData: {
          'Guest Page Table Levels': '4 levels',
          'EPT Page Table Levels': '4 levels',
          'DRAM Access Time': '80 ns'
        },
        formulasUsed: [
          'CR3 translation = 4 EPT accesses',
          'Each of the 4 Guest Table accesses requires 4 EPT accesses + 1 data read = 5 accesses',
          'Total Accesses = 4 (to locate Guest Table Base) + 4 * 4 (EPT walks for 4 levels) + 4 (reading 4 guest entries) + 1 (final data) = 24 memory accesses'
        ],
        stepByStepSolution: [
          'Step 1: The Guest CR3 holds a Guest Physical Address. Translating Guest CR3 to Host Physical requires 4 EPT accesses.',
          'Step 2: Level 4 Guest Table walk: Address is GPA -> requires 4 EPT accesses to read entry -> +1 guest entry access.',
          'Step 3: Level 3 Guest Table walk: Address is GPA -> requires 4 EPT accesses -> +1 guest entry access.',
          'Step 4: Level 2 Guest Table walk: Address is GPA -> requires 4 EPT accesses -> +1 guest entry access.',
          'Step 5: Level 1 Guest Table walk: Address is GPA -> requires 4 EPT accesses -> +1 guest entry access.',
          'Step 6: Final physical frame access: Address is GPA -> requires 4 EPT accesses to find final HPA frame -> +1 data byte access.',
          'Step 7: Total worst-case DRAM accesses = 4 + 4*5 = 24 physical memory accesses!',
          'Step 8: Translation Latency = 24 * 80 ns = 1,920 ns = 1.92 μs.',
          'Step 9: With a hardware TLB hit, translation takes 1 access (80 ns). Speedup = 1,920 / 80 = 24x faster.'
        ],
        finalAnswer: '(a) Worst-case Memory Accesses = 24; (b) Latency = 1.92 μs; (c) TLB Speedup = 24x faster',
        gateYear: 'GATE CS 2018 Adapted'
      }
    ],
    conceptualQuestions: [
      {
        question: 'What was the famous "x86 Virtualization Hole" that prevented classic x86 architectures from supporting pure Type-1 virtualization, and how did Intel VT-x solve it?',
        category: 'Technical Interview',
        explanation: 'According to Popek-Goldberg virtualization requirements, all sensitive instructions must be privileged (trap when run in user mode). Classic x86-32 had 17 sensitive instructions (including POPF, PUSHF, SGDT, SIDT) that were UNPRIVILEGED: when executed in Ring 1/3, instead of trapping, they failed silently or returned incorrect register values! Because the hypervisor could not trap them, it could not intercept or virtualize them safely. To fix this, Intel introduced VT-x (VMX): adding VMX Root Mode (hypervisor) and VMX Non-Root Mode (guest). In Non-Root mode, ALL sensitive instructions unconditionally trigger a VM-Exit trap to the hypervisor, resolving the virtualization hole completely in hardware.',
        commonTrap: 'Thinking binary translation was a hardware solution. Binary translation was a slow software workaround before VT-x.',
        keyTakeaway: 'Intel VT-x resolved the x86 virtualization hole by introducing hardware VM-Exit traps in Non-Root mode.'
      },
      {
        question: 'Explain the fundamental architectural difference between Paravirtualization (Xen) and Hardware-Assisted Full Virtualization (KVM/VT-x).',
        category: 'Core Concept',
        explanation: 'In Paravirtualization (Xen), the guest operating system kernel is explicitly modified and recompiled to be aware that it is running inside a virtual machine. Instead of issuing sensitive instructions that would trap, the guest OS directly executes Hypercalls (software API calls to the hypervisor, similar to syscalls). In Hardware-Assisted Full Virtualization (KVM with VT-x), the guest OS is completely unmodified and totally unaware of the hypervisor. The CPU hardware handles all sensitive instruction traps and nested page walks transparently.',
        commonTrap: 'Assuming Paravirtualization works with off-the-shelf proprietary guest OS binaries like unmodified Windows.',
        keyTakeaway: 'Paravirtualization modifies guest OS code to call hypercalls; full virtualization relies on hardware VT-x traps.'
      }
    ]
  },
  23: {
    moduleNumber: 23,
    inDepthTheory: [
      {
        sectionTitle: 'Modern Containerization: Linux Namespaces & Control Groups',
        content: 'While Virtual Machines virtualize entire hardware platforms (including running redundant guest OS kernels), Containers provide lightweight OS-level virtualization by isolating processes sharing the exact same host Linux kernel. Containerization is built on two core kernel mechanisms:',
        bulletPoints: [
          'Linux Namespaces (Isolation): Restricts what a process can SEE. Six fundamental namespaces: 1. PID (process ID virtualization; container process is PID 1), 2. NET (isolated network interfaces, routing tables, port bindings), 3. MNT (private filesystem mounts via chroot/pivot_root), 4. IPC (isolated System V IPC and POSIX message queues), 5. UTS (isolated hostnames), 6. USER (maps container root UID 0 to unprivileged host UID 1000).',
          'Control Groups / cgroups (Resource Metering): Restricts what a process can USE. Enforces hard limits, quotas, and priorities for CPU time (CFS quotas), Memory limits, I/O bandwidth, and maximum PIDs to prevent fork-bombs.'
        ]
      },
      {
        sectionTitle: 'Extended Berkeley Packet Filter (eBPF) & Cloud Infrastructure',
        content: 'eBPF is a revolutionary Linux kernel technology that allows developers to run sandboxed bytecode inside the kernel without changing kernel source code or loading risky kernel modules.',
        bulletPoints: [
          'Safety Guarantee: An in-kernel Static Verifier guarantees eBPF programs cannot crash the kernel: verifies no infinite loops, no out-of-bounds pointer dereferences, and strictly bounded instruction counts.',
          'JIT Compilation: Safe eBPF bytecode is JIT-compiled directly into native x86/ARM machine code, running at line rate for network filtering (XDP), security monitoring, and kernel tracing.'
        ]
      }
    ],
    comparisons: [
      {
        title: 'Comparison: Virtual Machines (VMs) vs Linux Containers (Docker)',
        headers: ['Feature', 'Virtual Machine (VM)', 'Linux Container (Docker)'],
        rows: [
          ['Architecture', 'Hypervisor virtualizes hardware; runs full independent Guest OS kernel.', 'Shares host kernel; isolates processes using Namespaces and Cgroups.'],
          ['Startup Latency', 'Slow: 30 - 60 seconds to boot full operating system.', 'Near-instant: milliseconds (starting a normal Linux process).'],
          ['Memory Overhead', 'High: 1 - 2 GB per VM just for guest OS kernel and system daemons.', 'Minimal: ~20 - 50 MB overhead for container runtime.'],
          ['Security Isolation', 'Strong: Hardware-enforced VM boundary via hypervisor.', 'Moderate: Relies on Linux kernel isolation boundaries (cgroups, namespaces).']
        ]
      }
    ],
    conceptToSimulationGuide: [
      {
        simulationElement: 'Linux Namespaces & Cgroups Quota Controller',
        osKernelEquivalent: 'Linux kernel /sys/fs/cgroup/ and clone(CLONE_NEWPID | CLONE_NEWNET)',
        whyItMatters: 'Demonstrates process PID isolation (PID 1 inside vs PID 8492 outside) and CPU throttle limits.'
      }
    ],
    workedNumericals: [
      {
        title: 'Container Density vs Virtual Machine Memory Footprint Calculation',
        problemStatement: 'A cloud bare-metal server has 128 GB of usable physical RAM. An enterprise needs to deploy instances of a microservice that requires 600 MB of heap memory to operate.\n- Architecture A (Virtual Machines): Each VM runs a stripped-down Linux guest OS kernel consuming 1.8 GB of RAM overhead.\n- Architecture B (Containers): Each container runs directly on the host kernel with only 40 MB of container runtime overhead.\nCalculate the maximum number of concurrent service instances that can be hosted on the server under:\n(a) Virtual Machines\n(b) Containers\n(c) The capacity scaling factor achieved by containerization.',
        givenData: {
          'Host Physical RAM': '128 GB = 131,072 MB',
          'Service Memory': '600 MB',
          'VM OS Overhead': '1.8 GB = 1,843.2 MB (Total VM RAM = 2,443.2 MB)',
          'Container Overhead': '40 MB (Total Container RAM = 640 MB)'
        },
        formulasUsed: [
          'Instances = Total RAM / RAM per Instance',
          'Scaling Factor = Container Instances / VM Instances'
        ],
        stepByStepSolution: [
          'Step 1: Compute RAM consumed per VM instance:\nRAM_VM = 1,843.2 MB + 600 MB = 2,443.2 MB.',
          'Step 2: Calculate max VM instances:\nMax VMs = floor(131,072 MB / 2,443.2 MB) = floor(53.65) = 53 instances.',
          'Step 3: Compute RAM consumed per Container instance:\nRAM_Container = 40 MB + 600 MB = 640 MB.',
          'Step 4: Calculate max Container instances:\nMax Containers = floor(131,072 MB / 640 MB) = floor(204.8) = 204 instances.',
          'Step 5: Compute Capacity Scaling Factor:\nScaling Factor = 204 / 53 = 3.85x.'
        ],
        finalAnswer: '(a) VM Capacity = 53 instances; (b) Container Capacity = 204 instances; (c) 3.85x higher density',
        gateYear: 'GATE CS 2019 Adapted'
      }
    ],
    conceptualQuestions: [
      {
        question: 'Why do Docker containers running on Linux share the host operating system kernel, and why can you NOT run a native Windows container on a Linux host without virtualization?',
        category: 'Core Concept',
        explanation: 'A container is NOT a virtual machine. A container is simply a standard Linux process running with Namespace isolation and Cgroup resource constraints. Because it is a normal process, all system calls (e.g. read(), fork(), socket()) are handled directly by the host Linux kernel. A native Windows container binary makes Windows NT system calls (e.g. NtCreateFile, NtAllocateVirtualMemory), which the Linux kernel does not understand. Running Windows containers on a Linux machine requires a full hypervisor VM running a Windows kernel to handle those system calls.',
        commonTrap: 'Thinking containers emulate foreign OS kernels.',
        keyTakeaway: 'Containers share the host kernel; foreign OS binaries require full hypervisor virtualization.'
      },
      {
        question: 'What mathematical safety guarantees does the in-kernel eBPF Static Verifier enforce before allowing bytecode to execute in the Linux kernel?',
        category: 'Technical Interview',
        explanation: 'Before loading eBPF code into Ring 0, the kernel Static Verifier performs a depth-first search of all possible execution paths to guarantee: (1) Termination: Loops must be provably bounded; infinite loops are mathematically impossible. (2) Memory Safety: Every pointer dereference is checked against bounds; reading outside allocated packet or map buffers is impossible. (3) Type Safety: Register contents and pointers cannot be cast to arbitrary memory addresses. (4) Program Size: Maximum instruction count is strictly bounded (typically 1 million instructions). This allows running custom user code at kernel speed with zero panic risk.',
        commonTrap: 'Assuming eBPF is as dangerous as a kernel module (LKM). eBPF is provably sandboxed.',
        keyTakeaway: 'The eBPF verifier guarantees bounded termination, bounds checking, and memory safety.'
      }
    ]
  },
  24: {
    moduleNumber: 24,
    inDepthTheory: [
      {
        sectionTitle: 'Real-Time Operating Systems: Hard vs Soft Real-Time',
        content: 'In a Real-Time Operating System (RTOS), the correctness of the system depends not only on the logical result of the computation, but also on the TIME at which results are delivered. Missing a timing deadline constitutes system failure.',
        bulletPoints: [
          'Hard Real-Time: Deadlines are absolute and non-negotiable (e.g. pacemaker, aircraft flight control, automotive airbags). A single missed deadline can lead to catastrophic hardware damage or loss of human life.',
          'Soft Real-Time: Missing a deadline degrades quality of service, but does not cause catastrophic system failure (e.g. video streaming, online multiplayer gaming, audio buffering).',
          'Periodic Task Model: Characterized by Period T, Execution Time (Burst) C, and Deadline D (typically D = T).'
        ]
      },
      {
        sectionTitle: 'Real-Time Scheduling: Rate Monotonic (RMS) & Earliest Deadline First (EDF)',
        content: 'RTOS algorithms schedule periodic tasks according to deadlines and periods:',
        bulletPoints: [
          'Rate Monotonic Scheduling (RMS): Static priority algorithm. Tasks with shorter periods (higher arrival rates) are assigned higher static priorities. Provably optimal among all fixed-priority algorithms. Schedulability guaranteed if Total Utilization U <= n * (2^(1/n) - 1). For n -> inf, bound approaches ln(2) = 69.3%.',
          'Earliest Deadline First (EDF): Dynamic priority algorithm. The task with the earliest absolute deadline is given highest priority. Provably optimal dynamic scheduling algorithm on uniprocessors: guaranteed schedulability if Total Utilization U <= 1.0 (100% CPU utilization).'
        ]
      },
      {
        sectionTitle: 'The Priority Inversion Problem & Priority Inheritance',
        content: 'Priority Inversion occurs when a high-priority task is blocked waiting for a shared resource held by a low-priority task, and a medium-priority task preempts the low-priority task, indirectly starving the high-priority task indefinitely (famous Mars Pathfinder incident in 1997).',
        bulletPoints: [
          'Priority Inheritance Protocol (PIP): When a high-priority task blocks on a resource held by a low-priority task, the low-priority task temporarily INHERITS the priority of the high-priority task until it releases the resource, preventing medium-priority tasks from preempting it.'
        ]
      }
    ],
    comparisons: [
      {
        title: 'Comparison: Rate Monotonic (RMS) vs Earliest Deadline First (EDF)',
        headers: ['Dimension', 'Rate Monotonic (RMS)', 'Earliest Deadline First (EDF)'],
        rows: [
          ['Priority Assignment', 'Static: Fixed inversely proportional to task period T.', 'Dynamic: Priority changes constantly based on nearest absolute deadline.'],
          ['Maximum Schedulable Utilization', 'Bounded by Liu-Layland formula (~69.3% for large n).', 'Up to 100% theoretical CPU utilization (U <= 1.0).'],
          ['Runtime Overhead', 'Extremely low: simple fixed priority comparisons.', 'Higher: requires recalculating deadlines and re-sorting queues on every arrival.']
        ]
      }
    ],
    conceptToSimulationGuide: [
      {
        simulationElement: 'RTOS Periodic Timeline & Deadline Tracker (RMS / EDF)',
        osKernelEquivalent: 'Linux SCHED_DEADLINE and FreeRTOS preemptive scheduler',
        whyItMatters: 'Interactively proves why a task set with 85% utilization fails under RMS but succeeds under EDF.'
      },
      {
        simulationElement: 'Priority Inversion & Priority Inheritance Protocol Simulator',
        osKernelEquivalent: 'POSIX pthread_mutexattr_setprotocol(PTHREAD_PRIO_INHERIT)',
        whyItMatters: 'Simulates the Mars Pathfinder spacecraft bug where a medium-priority audio task starved the high-priority telemetry task.'
      }
    ],
    workedNumericals: [
      {
        title: 'Rate Monotonic Schedulability Test (Liu-Layland Bound)',
        problemStatement: 'Consider three periodic real-time tasks with periods T and execution times C:\n- Task 1: C1 = 1.0 ms, T1 = 4.0 ms\n- Task 2: C2 = 2.0 ms, T2 = 5.0 ms\n- Task 3: C3 = 1.2 ms, T3 = 10.0 ms\n(a) Compute the individual and total CPU utilization U of this task set.\n(b) Compute the Liu and Layland theoretical utilization upper bound for n = 3 tasks.\n(c) Can this task set be guaranteed to be schedulable under Rate Monotonic Scheduling (RMS)?\n(d) Is this task set schedulable under Earliest Deadline First (EDF)?',
        givenData: {
          'Task 1': 'C1 = 1.0, T1 = 4.0',
          'Task 2': 'C2 = 2.0, T2 = 5.0',
          'Task 3': 'C3 = 1.2, T3 = 10.0',
          'Task count n': '3 tasks'
        },
        formulasUsed: [
          'Total Utilization U = Sum(Ci / Ti)',
          'RMS Liu-Layland Bound U_bound(n) = n * (2^(1/n) - 1)',
          'EDF Schedulability Criterion: U <= 1.0'
        ],
        stepByStepSolution: [
          'Step 1: Compute total utilization U:\nU = (1.0 / 4.0) + (2.0 / 5.0) + (1.2 / 10.0) = 0.25 + 0.40 + 0.12 = 0.77 (77%).',
          'Step 2: Compute Liu-Layland bound for n = 3 tasks:\nU_bound(3) = 3 * (2^(1/3) - 1) = 3 * (1.25992 - 1) = 3 * 0.25992 = 0.7798 = 77.98%.',
          'Step 3: Evaluate RMS Schedulability:\nSince Total Utilization U = 0.77 <= U_bound(3) = 0.7798, the task set STRICTLY SATISFIES the Liu-Layland condition! Schedulability under RMS is 100% mathematically guaranteed.',
          'Step 4: Evaluate EDF Schedulability:\nSince U = 0.77 <= 1.0, the task set is also 100% guaranteed to be schedulable under EDF.'
        ],
        finalAnswer: '(a) Total Utilization U = 0.77; (b) RMS Bound = 0.7798; (c) Guaranteed schedulable under RMS; (d) Guaranteed schedulable under EDF',
        gateYear: 'GATE CS 2014 / 2017 / 2020'
      }
    ],
    conceptualQuestions: [
      {
        question: 'Explain the Priority Inversion problem using High (H), Medium (M), and Low (L) priority tasks, and explain how the Priority Inheritance Protocol (PIP) resolved the Mars Pathfinder glitch.',
        category: 'GATE CS',
        explanation: 'Priority Inversion unfolds in 4 stages: (1) Low-priority task L acquires a shared resource (e.g. mutex lock on an information bus). (2) High-priority task H arrives and preempts L, but subsequently attempts to acquire the shared mutex, blocking on L. (3) Medium-priority task M arrives. Since M has higher priority than L and does NOT need the mutex, M preempts L! (4) Now M executes freely while L is stalled. Because L cannot finish to release the mutex, High-priority task H is indirectly starved by Medium-priority task M! The Priority Inheritance Protocol resolves this by elevating L\'s priority to H\'s priority the moment H blocks on it. M can no longer preempt L; L finishes quickly, releases the lock, drops back to low priority, and H executes without starvation.',
        commonTrap: 'Assuming High priority directly blocks on Medium. High blocks on Low, which is then preempted by Medium.',
        keyTakeaway: 'Priority inheritance elevates the lock-holding low priority task to avoid preemption by medium tasks.'
      },
      {
        question: 'Why can Earliest Deadline First (EDF) achieve 100% theoretical CPU utilization on uniprocessors, while Rate Monotonic (RMS) utilization is bounded around 69.3%?',
        category: 'Core Concept',
        explanation: 'Rate Monotonic is a STATIC priority algorithm: priority is permanently fixed based on period length. When periods are not harmonic multiples of each other, static priorities inevitably force idle gaps where no task can run without violating a fixed schedule, capping maximum utilization at ln(2) = 69.3%. In contrast, EDF is a DYNAMIC priority algorithm: priorities continuously change based on which task has the closest upcoming deadline. When the CPU becomes idle, EDF dynamically promotes whichever task needs execution next, ensuring every available CPU cycle is utilized as long as total workload demand does not exceed 100% (U <= 1.0).',
        commonTrap: 'Thinking EDF always beats RMS in practice. Under overload (U > 1.0), EDF experiences unpredictable cascade deadline failures.',
        keyTakeaway: 'Dynamic deadlines allow EDF to fill schedule gaps, achieving 100% utilization.'
      }
    ]
  }
};
