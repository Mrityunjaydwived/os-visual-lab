import type { ModuleConceptGuide } from './types';

export const MODULES_13_TO_18: Record<number, ModuleConceptGuide> = {
  13: {
    moduleNumber: 13,
    inDepthTheory: [
      {
        sectionTitle: 'Cache Memory Hierarchy & The Principle of Locality',
        content: 'Due to the growing performance gap between ultra-fast CPU cores and relatively slow main memory (DRAM), modern computers employ a hierarchical caching system (L1, L2, L3 SRAM caches). Caching relies entirely on the Principle of Locality:',
        bulletPoints: [
          'Temporal Locality: If a memory location is accessed once, it is highly likely to be accessed again in the near future (e.g. loop counters, stack variables).',
          'Spatial Locality: If a memory location is accessed, nearby memory locations are likely to be accessed soon (e.g. sequential array traversal, sequential instruction execution).',
          'Average Memory Access Time (AMAT): AMAT = Hit_Time + (Miss_Rate * Miss_Penalty).'
        ]
      },
      {
        sectionTitle: 'Cache Mapping Architectures: Direct, Associative, and Set-Associative',
        content: 'A cache line contains a valid bit, a tag, dirty bit, and a data block (typically 64 bytes). The physical address is decomposed into three bitfields:',
        bulletPoints: [
          'Direct Mapped: Each memory block maps to exactly ONE cache line (Index = Block_Number % Cache_Lines). Fast access, but severe conflict misses.',
          'Fully Associative: A memory block can be placed in ANY cache line. Eliminates conflict misses, but requires expensive hardware comparators to search all tags in parallel.',
          'N-Way Set Associative: Memory blocks map to a set of N lines (Set = Block_Number % Sets). Combines the speed of direct mapping with the flexibility of associativity.'
        ]
      },
      {
        sectionTitle: 'Cache Write Policies & Miss Types (The 3 Cs)',
        content: 'Cache misses are categorized into three classes: Compulsory (cold start), Capacity (cache too small), and Conflict (collision in direct/set-associative caches). Write policies govern coherence with DRAM:',
        bulletPoints: [
          'Write-Through: Data is written simultaneously to the cache line AND to DRAM. Safe and simple, but incurs memory bus write traffic.',
          'Write-Back: Data is updated ONLY in the cache line, and a Dirty Bit is set. The block is written back to DRAM only when evicted from the cache.'
        ]
      }
    ],
    comparisons: [
      {
        title: 'Comparison: Direct Mapped vs N-Way Set Associative vs Fully Associative',
        headers: ['Property', 'Direct Mapped (1-Way)', 'N-Way Set Associative (2/4/8-Way)', 'Fully Associative'],
        rows: [
          ['Block Placement', 'Strictly 1 specific line determined by index.', 'Any of N lines within a specific set.', 'Any line anywhere in the entire cache.'],
          ['Hardware Comparators', 'Only 1 tag comparator required.', 'N tag comparators operating in parallel.', 'M comparators (one per line across entire cache).'],
          ['Conflict Misses', 'High (severe thrashing if two active blocks map to same index).', 'Low (dramatically reduced with N >= 4).', 'Zero (conflict misses do not exist).']
        ]
      },
      {
        title: 'Comparison: Write-Through vs Write-Back Policies',
        headers: ['Dimension', 'Write-Through', 'Write-Back'],
        rows: [
          ['DRAM Write Frequency', 'On every single store/write instruction.', 'Only upon eviction of a dirty cache line.'],
          ['Memory Bus Traffic', 'High continuous write traffic; requires write buffer.', 'Low traffic; coalesces multiple writes to the same line.'],
          ['Dirty Bit Required', 'No: DRAM is always in sync with cache.', 'Yes: Tracks modified lines that must be flushed on eviction.']
        ]
      }
    ],
    conceptToSimulationGuide: [
      {
        simulationElement: 'Cache Line Inspector & Tag Match Comparator',
        osKernelEquivalent: 'Hardware L1/L2/L3 CPU caches and Linux perf cache-miss counters',
        whyItMatters: 'Demonstrates bit slicing into Tag, Set Index, and Block Offset, and shows how associativity resolves conflict misses.'
      },
      {
        simulationElement: 'Hierarchical AMAT Waterfall Latency Cascade',
        osKernelEquivalent: 'Intel Smart Cache multi-core L3 uncore ring bus',
        whyItMatters: 'Interactively calculates how a 1% decrease in L1 miss rate drops overall CPU stalls dramatically.'
      }
    ],
    workedNumericals: [
      {
        title: 'Multilevel Cache AMAT (Average Memory Access Time) Calculation',
        problemStatement: 'A modern processor features three levels of on-chip cache with the following access parameters:\n- L1 Cache: Hit Time = 1.0 ns, Miss Rate = 5% (0.05)\n- L2 Cache: Hit Time = 4.0 ns, Miss Rate = 15% (0.15)\n- L3 Cache: Hit Time = 12.0 ns, Miss Rate = 30% (0.30)\n- Main Memory (DRAM): Access Time = 80.0 ns\nCalculate the overall Average Memory Access Time (AMAT) of the processor.',
        givenData: {
          'L1': 't_hit = 1.0 ns, miss_rate = 0.05',
          'L2': 't_hit = 4.0 ns, miss_rate = 0.15',
          'L3': 't_hit = 12.0 ns, miss_rate = 0.30',
          'DRAM': 't_mem = 80.0 ns'
        },
        formulasUsed: [
          'AMAT = L1_Hit + L1_Miss * (L2_Hit + L2_Miss * (L3_Hit + L3_Miss * DRAM_Time))'
        ],
        stepByStepSolution: [
          'Step 1: Compute penalty of missing L3: DRAM_Time = 80.0 ns.',
          'Step 2: Compute effective access time for L3: L3_Eff = L3_Hit + (L3_Miss * DRAM_Time) = 12.0 + (0.30 * 80.0) = 12.0 + 24.0 = 36.0 ns.',
          'Step 3: Compute effective access time for L2: L2_Eff = L2_Hit + (L2_Miss * L3_Eff) = 4.0 + (0.15 * 36.0) = 4.0 + 5.4 = 9.4 ns.',
          'Step 4: Compute overall AMAT seen by the CPU core: AMAT = L1_Hit + (L1_Miss * L2_Eff) = 1.0 + (0.05 * 9.4) = 1.0 + 0.47 = 1.47 ns.'
        ],
        finalAnswer: 'Overall AMAT = 1.47 ns',
        gateYear: 'GATE CS 2017 / 2021'
      },
      {
        title: 'Cache Address Bitfield Decomposition',
        problemStatement: 'A 32-bit physical address system has a 64 KB, 4-way set-associative cache with 32-byte cache lines. Determine:\n(a) Number of bits used for the Block Offset.\n(b) Number of cache sets.\n(c) Number of bits used for the Set Index.\n(d) Number of bits used for the Tag.',
        givenData: {
          'Physical Address Width': '32 bits',
          'Cache Size': '64 KB = 65,536 bytes = 2^16 bytes',
          'Line (Block) Size': '32 bytes = 2^5 bytes',
          'Associativity N': '4-way'
        },
        formulasUsed: [
          'Block Offset Bits = log2(Line Size)',
          'Total Cache Lines = Cache Size / Line Size',
          'Number of Sets = Total Cache Lines / Associativity N',
          'Set Index Bits = log2(Number of Sets)',
          'Tag Bits = Physical Address Bits - Set Index Bits - Block Offset Bits'
        ],
        stepByStepSolution: [
          'Step 1: Block Offset bits = log2(32) = 5 bits.',
          'Step 2: Total lines in cache = 64 KB / 32 bytes = 65,536 / 32 = 2,048 lines = 2^11 lines.',
          'Step 3: Number of sets = 2,048 lines / 4 lines per set = 512 sets = 2^9 sets.',
          'Step 4: Set Index bits = log2(512) = 9 bits.',
          'Step 5: Tag bits = 32 - (Set Index + Block Offset) = 32 - (9 + 5) = 32 - 14 = 18 bits.'
        ],
        finalAnswer: '(a) Block Offset = 5 bits; (b) Sets = 512; (c) Set Index = 9 bits; (d) Tag = 18 bits',
        gateYear: 'GATE CS 2013 / 2018'
      }
    ],
    conceptualQuestions: [
      {
        question: 'Explain the "3 Cs" classification of cache misses (Compulsory, Capacity, Conflict) and how increasing cache associativity directly impacts each.',
        category: 'GATE CS',
        explanation: 'The 3 Cs are: (1) Compulsory Misses (Cold start): First reference to a memory block; inevitable when a program starts. (2) Capacity Misses: Occur because the cache is too small to hold all blocks needed during execution, even in a fully associative cache. (3) Conflict Misses (Collision): Occur when multiple memory blocks map to the same set or line in a direct-mapped or set-associative cache, evicting an active block. Increasing associativity from 1-way to N-way directly eliminates Conflict misses without changing cache size. However, it has ZERO effect on Compulsory misses and virtually zero effect on Capacity misses.',
        commonTrap: 'Thinking increasing associativity reduces capacity misses. Capacity misses depend strictly on total cache size.',
        keyTakeaway: 'Associativity eliminates conflict misses, but cannot fix capacity or cold-start misses.'
      },
      {
        question: 'Why does a Write-Back cache require a Dirty Bit in every cache line, while a Write-Through cache does not?',
        category: 'Technical Interview',
        explanation: 'In Write-Through, every write to the cache line is immediately written to DRAM. Thus, the data in the cache is always identical to the data in DRAM at all times. When a line is evicted, it can simply be overwritten without checking. In Write-Back, writes update ONLY the cache line, leaving DRAM with stale data. The Dirty Bit is set to 1 to record that the cache line has been modified. When the line is eventually evicted to make room for another block, the cache controller checks the Dirty Bit: if 1, it must write the block back to DRAM; if 0, it can discard it immediately. Without a dirty bit, the cache would either have to flush every line (ruining performance) or lose updates.',
        commonTrap: 'Assuming Write-Through needs a dirty bit to prevent data corruption.',
        keyTakeaway: 'The dirty bit signals whether an evicted line must be flushed to DRAM to preserve memory coherence.'
      }
    ]
  },
  14: {
    moduleNumber: 14,
    inDepthTheory: [
      {
        sectionTitle: 'I/O Hardware & Communication Techniques',
        content: 'The operating system interacts with peripheral devices (disks, NICs, keyboards, displays) through device controllers. The three fundamental methods for controlling I/O operations are:',
        bulletPoints: [
          'Programmed I/O (Polling / Busy-Waiting): The CPU repeatedly reads the status register of the device controller in a tight while-loop until the device is ready. Wastes 100% of CPU cycles during slow mechanical operations.',
          'Interrupt-Driven I/O: The CPU issues a command to the device controller and switches to executing other user processes. When the device is finished, it asserts a hardware interrupt line (IRQ). The CPU saves its context, jumps to the Interrupt Service Routine (ISR), and transfers data. Ideal for low-bandwidth devices (keyboards, serial ports).',
          'Direct Memory Access (DMA): For high-speed block devices (disks, network interfaces), passing data word-by-word through CPU registers imposes massive interrupt overhead. A specialized DMA Controller takes control of the memory bus and transfers entire data blocks directly between device buffers and physical RAM.'
        ]
      },
      {
        sectionTitle: 'DMA Controller Architecture & Bus Transfer Modes',
        content: 'A DMA Controller contains an Address Register, Count Register, and Control/Status Registers. Once initiated by the CPU, it operates in one of three modes:',
        bulletPoints: [
          'Burst Mode: The DMA controller takes over the memory bus and transfers an entire multi-megabyte block in one continuous burst. The CPU is locked out of memory during this burst.',
          'Cycle Stealing Mode: The DMA controller requests the bus for a single bus cycle, transfers one word, and immediately releases the bus back to the CPU. The DMA controller interweaves words between CPU instruction fetches, minimizing CPU stalling.',
          'Transparent Mode: The DMA controller transfers data only during CPU clock cycles when the CPU is decoding internal instructions and not actively using the external memory bus.'
        ]
      }
    ],
    comparisons: [
      {
        title: 'Comparison: Polling vs Interrupt-Driven I/O vs DMA',
        headers: ['Feature', 'Polling (Programmed I/O)', 'Interrupt-Driven I/O', 'Direct Memory Access (DMA)'],
        rows: [
          ['CPU Overhead', 'Maximum: CPU spins continuously in a loop polling status.', 'Moderate: CPU interrupted per word/byte transferred.', 'Minimal: CPU interrupted only once per multi-kilobyte block.'],
          ['Data Transfer Agent', 'CPU execution unit.', 'CPU execution unit via ISR.', 'Dedicated hardware DMA Controller.'],
          ['Best Suited For', 'Fast, predictable devices or dedicated microcontrollers.', 'Low-speed, bursty devices (keyboard, mouse).', 'High-throughput block devices (hard drives, 10GbE NICs).']
        ]
      },
      {
        title: 'Comparison: Memory-Mapped I/O vs Port-Mapped (Isolated) I/O',
        headers: ['Parameter', 'Memory-Mapped I/O', 'Port-Mapped (Isolated) I/O'],
        rows: [
          ['Address Space', 'Device registers share the exact same physical address space as RAM.', 'Separate, isolated I/O address space (e.g. 64 KB on x86).'],
          ['CPU Instructions', 'Standard memory instructions: MOV, LOAD, STORE.', 'Dedicated privileged hardware instructions: IN and OUT.'],
          ['Protection', 'Protected naturally by MMU page table permissions.', 'Protected by restricting IN/OUT instructions to Ring 0 (IOPL flag).']
        ]
      }
    ],
    conceptToSimulationGuide: [
      {
        simulationElement: 'DMA Bus Mastership & Cycle Stealing Visualizer',
        osKernelEquivalent: 'PCIe bus mastering and Linux dma_alloc_coherent / ring buffers',
        whyItMatters: 'Demonstrates the bus handshake (Bus Request, Bus Grant) and CPU cycle stealing.'
      },
      {
        simulationElement: 'Interrupt Vector Table & IRQ Dispatcher',
        osKernelEquivalent: 'x86-64 Advanced Programmable Interrupt Controller (APIC)',
        whyItMatters: 'Shows hardware priority arbitration when multiple devices assert interrupts simultaneously.'
      }
    ],
    workedNumericals: [
      {
        title: 'DMA Cycle Stealing Overhead & CPU Stalling Calculation',
        problemStatement: 'A 2.0 GHz processor (clock period = 0.5 ns) transfers data from a high-speed NVMe drive via a DMA controller operating in Cycle Stealing Mode over a 32-bit (4-byte) wide memory bus. The disk transfers data at 40 MB/s. Each DMA bus transfer cycle takes 2 bus cycles (4.0 ns) during which the CPU cannot access memory. Calculate:\n(a) Number of DMA bus cycles stolen per second.\n(b) Total time the CPU is locked out of memory per second.\n(c) The percentage of CPU cycles stolen by the DMA controller.',
        givenData: {
          'CPU Frequency': '2.0 GHz (clock = 0.5 ns)',
          'Disk Transfer Rate': '40 MB/s = 40,000,000 bytes/s',
          'Bus Width': '32 bits = 4 bytes per transfer',
          'Bus Cycle Duration': '4.0 ns per transfer'
        },
        formulasUsed: [
          'Transfers per second = Transfer Rate / Bytes per Transfer',
          'Stolen Time per second = Transfers per second * Duration per Transfer',
          'CPU Stolen Percentage = (Stolen Time / 1.0 second) * 100%'
        ],
        stepByStepSolution: [
          'Step 1: Compute number of DMA bus transfers needed per second:\nTransfers = 40,000,000 bytes/s / 4 bytes/transfer = 10,000,000 transfers/sec (10M transfers).',
          'Step 2: Compute total time the CPU is locked out of the bus per second:\nStolen Time = 10,000,000 transfers * 4.0 ns/transfer = 40,000,000 ns = 0.040 seconds = 40 ms.',
          'Step 3: Compute percentage of CPU time stolen by DMA:\nStolen Percentage = (0.040 s / 1.0 s) * 100% = 4.0%.'
        ],
        finalAnswer: '(a) 10 Million transfers/s; (b) 40 ms per second; (c) CPU Overhead = 4.0%',
        gateYear: 'GATE CS 2012 / 2019'
      }
    ],
    conceptualQuestions: [
      {
        question: 'What exact steps does the CPU perform before and after a DMA block transfer, and what is its role DURING the transfer?',
        category: 'Core Concept',
        explanation: 'Before the transfer, the CPU initializes the DMA controller by writing four values into its registers: (1) Source address (device register or memory pointer), (2) Destination address, (3) Transfer direction (read or write), and (4) Count (number of bytes). The CPU then issues the START command and immediately switches to executing other user processes. DURING the transfer, the CPU plays ZERO role; the DMA controller autonomously transfers data over the bus. After the transfer finishes, the DMA controller asserts an Interrupt Request (IRQ). The CPU catches the interrupt, updates driver status flags, and wakes up the process waiting for the I/O.',
        commonTrap: 'Thinking the CPU must monitor the DMA controller during transfer. The transfer is completely autonomous.',
        keyTakeaway: 'The CPU only initializes the DMA controller and processes the completion interrupt.'
      },
      {
        question: 'What is the architectural difference between Memory-Mapped I/O and Port-Mapped (Isolated) I/O?',
        category: 'Technical Interview',
        explanation: 'In Memory-Mapped I/O, device control and data registers are mapped directly into the physical address space alongside normal RAM. The CPU interacts with devices using standard instructions (e.g. MOV, LOAD, STORE) to specific physical memory addresses. The standard MMU page tables enforce access permissions. In Port-Mapped (Isolated) I/O (e.g. legacy x86), the CPU hardware provides a completely separate 16-bit address space specifically for I/O ports. Interacting with devices requires dedicated machine instructions (IN and OUT) which cannot be used for normal memory and are strictly privileged (restricted to Ring 0).',
        commonTrap: 'Confusing memory-mapped I/O with memory-mapped files (mmap). Memory-mapped I/O maps hardware controller registers.',
        keyTakeaway: 'Memory-mapped I/O uses standard load/store instructions; port-mapped I/O uses dedicated IN/OUT instructions.'
      }
    ]
  },
  15: {
    moduleNumber: 15,
    inDepthTheory: [
      {
        sectionTitle: 'Magnetic Disk Geometry & Mechanical Components',
        content: 'A magnetic Hard Disk Drive (HDD) consists of one or more flat circular platters coated with magnetic material mounted on a spindle rotating at high speeds (e.g. 5,400, 7,200, or 15,000 RPM). Both surfaces of each platter are covered by a Read/Write Head mounted on a common actuator arm.',
        bulletPoints: [
          'Tracks & Cylinders: The platter surface is logically divided into concentric circular rings called Tracks. The set of all tracks at the exact same arm radius across all platter surfaces forms a Cylinder.',
          'Sectors: Each track is divided into fixed-size segments called Sectors (traditionally 512 bytes, now 4,096 bytes under Advanced Format).',
          'Disk Access Time: Access_Time = Seek_Time + Rotational_Latency + Transfer_Time + Controller_Overhead.'
        ]
      },
      {
        sectionTitle: 'Disk Performance Parameters: Seek, Rotation, and Transfer',
        content: 'Accessing data on a magnetic disk involves mechanical and electronic delays:',
        bulletPoints: [
          'Seek Time: The mechanical time required for the actuator arm to move the read/write heads to the specified cylinder. Dominates random access latency (typically 4 - 10 ms).',
          'Rotational Latency: The mechanical time spent waiting for the target sector to rotate underneath the read/write head. Average Rotational Latency = 1 / (2 * RPM).',
          'Transfer Time: The electronic time required to stream data bytes from the sector under the head into controller memory. Transfer_Time = Data_Size / (Rotational_Speed * Track_Capacity).'
        ]
      },
      {
        sectionTitle: 'Solid State Drives (SSD) & Flash Storage Architecture',
        content: 'Solid State Drives (SSDs) use NAND flash memory with zero moving parts, eliminating seek time and rotational latency.',
        bulletPoints: [
          'Pages vs Blocks: SSD reads and writes occur at the granularity of a Page (typically 4 KB). However, erasing can ONLY occur at the granularity of an entire Block (typically 128 - 256 pages = 2 MB).',
          'Write Amplification & TRIM: Overwriting data requires reading the whole block, updating the page, erasing the block, and rewriting it. The OS TRIM command informs the SSD when file sectors are deleted, enabling proactive background garbage collection.',
          'Wear Leveling: Firmware algorithms evenly distribute writes across physical flash blocks to prevent early burnout of memory cells.'
        ]
      }
    ],
    comparisons: [
      {
        title: 'Comparison: Hard Disk Drive (HDD) vs Solid State Drive (SSD)',
        headers: ['Characteristic', 'Hard Disk Drive (HDD)', 'Solid State Drive (SSD)'],
        rows: [
          ['Mechanism', 'Mechanical rotating platters and moving magnetic heads.', 'Non-volatile electronic NAND flash semiconductor cells.'],
          ['Random Access Latency', 'Slow: 5 - 15 ms (limited by mechanical seek and rotation).', 'Fast: 0.05 - 0.1 ms (direct electrical addressing).'],
          ['Overwrite Behavior', 'Sectors can be overwritten directly in-place magnetically.', 'Cannot overwrite in-place; requires block erase before rewrite.'],
          ['Shock Resistance', 'Fragile: mechanical head crash can scratch platters.', 'Immune to physical vibration and drops.']
        ]
      }
    ],
    conceptToSimulationGuide: [
      {
        simulationElement: 'Rotating Disk Platter & Actuator Arm Simulator',
        osKernelEquivalent: 'Linux block device request queue and SCSI disk driver',
        whyItMatters: 'Visually depicts seek time arm traversal and rotational sector alignment delay.'
      }
    ],
    workedNumericals: [
      {
        title: 'Complete Disk Access Time Calculation',
        problemStatement: 'A magnetic hard disk rotates at 7,200 RPM, has an average seek time of 6.0 ms, 512 bytes per sector, 200 sectors per track, and a controller overhead of 0.2 ms. Calculate:\n(a) Average rotational latency in milliseconds.\n(b) Data transfer rate in bytes per second.\n(c) Transfer time for one 512-byte sector in milliseconds.\n(d) Total average access time to read one sector.',
        givenData: {
          'Rotational Speed': '7,200 RPM = 7,200 / 60 = 120 rotations/second',
          'Average Seek Time': '6.0 ms',
          'Sector Size': '512 bytes',
          'Sectors per Track': '200 sectors (Track Capacity = 200 * 512 = 102,400 bytes)',
          'Controller Overhead': '0.2 ms'
        },
        formulasUsed: [
          'Rotational Latency T_rot = 1 / (2 * Rotational_Speed_RPS)',
          'Transfer Rate = Rotations_per_sec * Track_Capacity',
          'Transfer Time T_trans = Sector_Size / Transfer Rate',
          'Total Access Time = Seek + Rotational Latency + Transfer Time + Controller Overhead'
        ],
        stepByStepSolution: [
          'Step 1: Compute Average Rotational Latency:\nOne full revolution = 1 / 120 s = 0.008333 s = 8.333 ms.\nAverage latency (half revolution) = 8.333 ms / 2 = 4.167 ms.',
          'Step 2: Compute Data Transfer Rate:\nTransfer Rate = 120 rev/s * (200 * 512 bytes) = 120 * 102,400 = 12,288,000 bytes/s = 12.288 MB/s.',
          'Step 3: Compute Transfer Time for one sector:\nT_trans = 512 bytes / 12,288,000 bytes/s = 0.00004167 s = 0.0417 ms.',
          'Step 4: Compute Total Access Time:\nTotal Time = 6.0 ms (seek) + 4.167 ms (rotation) + 0.0417 ms (transfer) + 0.2 ms (overhead) = 10.4087 ms.'
        ],
        finalAnswer: '(a) Rotational Latency = 4.17 ms; (b) Transfer Rate = 12.29 MB/s; (c) Transfer Time = 0.042 ms; (d) Total Access Time = 10.41 ms',
        gateYear: 'GATE CS 2015 / 2018'
      },
      {
        title: 'Raw Magnetic Disk Capacity Calculation',
        problemStatement: 'A hard disk has 4 double-sided platters (all surfaces usable for recording). The disk has 10,000 cylinders, 500 sectors per track, and each sector stores 4,096 bytes (4 KB). Calculate the total formatted capacity of the disk in Gigabytes (GB, where 1 GB = 10^9 bytes) and Gibibytes (GiB, where 1 GiB = 2^30 bytes).',
        givenData: {
          'Platters': '4 double-sided platters = 8 recording surfaces',
          'Cylinders': '10,000 cylinders (10,000 tracks per surface)',
          'Sectors per Track': '500 sectors',
          'Bytes per Sector': '4,096 bytes = 2^12 bytes'
        },
        formulasUsed: [
          'Total Capacity = Surfaces * Cylinders * Sectors_per_Track * Bytes_per_Sector'
        ],
        stepByStepSolution: [
          'Step 1: Compute total sectors on the disk:\nTotal Sectors = 8 surfaces * 10,000 tracks/surface * 500 sectors/track = 40,000,000 sectors (40M sectors).',
          'Step 2: Compute total bytes:\nTotal Bytes = 40,000,000 * 4,096 bytes = 163,840,000,000 bytes.',
          'Step 3: Convert to decimal GB (10^9):\nCapacity = 163.84 GB.',
          'Step 4: Convert to binary GiB (2^30 = 1,073,741,824 bytes):\nCapacity = 163,840,000,000 / 1,073,741,824 = 152.59 GiB.'
        ],
        finalAnswer: 'Total Capacity = 163.84 GB (or 152.59 GiB)',
        gateYear: 'GATE CS 2010 / 2016'
      }
    ],
    conceptualQuestions: [
      {
        question: 'Why can an SSD read and write at the granularity of a Page (4 KB), but can only erase at the granularity of an entire Block (2 MB)? What is Write Amplification?',
        category: 'Core Concept',
        explanation: 'In NAND flash memory, individual floating-gate transistors can be programmed (written) by injecting electrons to change a 1 into a 0 at low voltages on a page level. However, clearing electrons to change a 0 back into a 1 requires applying a high-voltage electrical pulse that spans across an entire physical Block (thousands of transistors). Because flash cannot overwrite 0s without erasing, updating a 4 KB page requires: (1) reading the entire 2 MB block into RAM, (2) modifying the 4 KB page, (3) erasing the physical 2 MB block, and (4) writing the 2 MB block back. This causes Write Amplification: writing 4 KB of user data results in 2 MB of physical flash writes, wearing out flash cells much faster.',
        commonTrap: 'Assuming SSDs overwrite data in-place like magnetic hard disks.',
        keyTakeaway: 'Flash requires block erases before page writes, causing write amplification.'
      },
      {
        question: 'Why does organizing tracks into "Cylinders" across multiple platter surfaces minimize mechanical seek delays?',
        category: 'Technical Interview',
        explanation: 'In a multi-platter hard drive, all read/write heads are physically mounted on a single rigid actuator bracket. When the actuator arm moves, all heads move together to the exact same radial track position across all platter surfaces. This vertical cylinder of tracks can be read or written simply by switching between heads electrically in microseconds, without moving the mechanical arm. By placing related data on the same cylinder across multiple surfaces, the OS avoids slow mechanical seek times (milliseconds).',
        commonTrap: 'Thinking read/write heads can move independently on different platters.',
        keyTakeaway: 'Heads move together on a single arm; switching tracks within a cylinder is purely electronic.'
      }
    ]
  },
  16: {
    moduleNumber: 16,
    inDepthTheory: [
      {
        sectionTitle: 'Disk Scheduling Objectives & Algorithms',
        content: 'Because seek time dominates disk access latency, the operating system maintains a queue of pending disk I/O requests and schedules their servicing order to minimize total head movement (seek distance) and provide fair response times.',
        bulletPoints: [
          'FCFS (First-Come First-Served): Services requests in arrival order. Perfectly fair, but produces wild actuator oscillations across the disk, resulting in terrible average seek times.',
          'SSTF (Shortest Seek Time First): Selects the request with the minimum seek distance from the current head position. Substantially reduces seek time, but causes Starvation of distant requests if a steady stream of requests arrives near the head.',
          'SCAN (Elevator Algorithm): The head sweeps in one direction across the disk, servicing all requests in its path until it reaches the end of the disk, then reverses direction and sweeps back. Prevents starvation.',
          'C-SCAN (Circular SCAN): The head sweeps in one direction servicing requests until it reaches the boundary, then immediately returns to the beginning of the disk without servicing requests on the return trip. Provides uniform waiting time.',
          'LOOK and C-LOOK: Enhancements of SCAN and C-SCAN where the head reverses or wraps around immediately at the FURTHEST pending request, rather than traveling all the way to the physical disk boundary (0 or max).'
        ]
      }
    ],
    comparisons: [
      {
        title: 'Comparison: SCAN vs C-SCAN vs LOOK vs C-LOOK',
        headers: ['Algorithm', 'Boundary Behavior', 'Direction of Service'],
        rows: [
          ['SCAN', 'Travels all the way to physical boundary cylinder (0 or Max).', 'Services in both directions (reverses sweep).'],
          ['LOOK', 'Reverses at the furthest pending request; never touches boundary.', 'Services in both directions.'],
          ['C-SCAN', 'Travels all the way to boundary, then jumps to 0.', 'Services in ONE direction only; jump trip services zero requests.'],
          ['C-LOOK', 'Jumps directly to lowest pending request; never touches boundary.', 'Services in ONE direction only.']
        ]
      }
    ],
    conceptToSimulationGuide: [
      {
        simulationElement: 'Disk Cylinder Arm Seek Trajectory Canvas',
        osKernelEquivalent: 'Linux I/O Schedulers: BFQ (Budget Fair Queueing), mq-deadline, kyber',
        whyItMatters: 'Interactively proves why C-LOOK yields significantly lower total head movement than SCAN while preventing starvation.'
      }
    ],
    workedNumericals: [
      {
        title: 'Complete Disk Scheduling Comparison (200 Cylinders)',
        problemStatement: 'A disk drive has 200 cylinders (numbered 0 to 199). The current head position is at cylinder 53, moving towards higher cylinder numbers (Right). The pending request queue is:\n98, 183, 37, 122, 14, 124, 65, 67\nCalculate the total head movement (in cylinders) for:\n(a) FCFS\n(b) SSTF\n(c) SCAN\n(d) C-SCAN\n(e) LOOK\n(f) C-LOOK',
        givenData: {
          'Queue': '[98, 183, 37, 122, 14, 124, 65, 67]',
          'Initial Head': '53',
          'Direction': 'Towards higher cylinders (Right)',
          'Cylinders Range': '0 to 199'
        },
        formulasUsed: [
          'Total Movement = Sum of |Next_Track - Current_Track| across the seek sequence'
        ],
        stepByStepSolution: [
          'Step 1: FCFS Sequence: 53 -> 98 -> 183 -> 37 -> 122 -> 14 -> 124 -> 65 -> 67.\nMovement = |98-53| + |183-98| + |37-183| + |122-37| + |14-122| + |124-14| + |65-124| + |67-65| = 45 + 85 + 146 + 85 + 108 + 110 + 59 + 2 = 640 cylinders.',
          'Step 2: SSTF Sequence (pick closest track):\nFrom 53 -> 65 (diff 12) -> 67 (2) -> 37 (30) -> 14 (23) -> 98 (84) -> 122 (24) -> 124 (2) -> 183 (59).\nMovement = 12 + 2 + 30 + 23 + 84 + 24 + 2 + 59 = 236 cylinders.',
          'Step 3: SCAN Sequence (sweep right to boundary 199, then reverse):\n53 -> 65 -> 67 -> 98 -> 122 -> 124 -> 183 -> 199 (boundary) -> 37 -> 14.\nMovement = (199 - 53) + (199 - 14) = 146 + 185 = 331 cylinders.',
          'Step 4: C-SCAN Sequence (sweep right to 199, jump to 0, sweep right):\n53 -> 65 -> 67 -> 98 -> 122 -> 124 -> 183 -> 199 -> 0 -> 14 -> 37.\nMovement = (199 - 53) + (199 - 0) + (37 - 0) = 146 + 199 + 37 = 382 cylinders.',
          'Step 5: LOOK Sequence (sweep right to max requested 183, then reverse to 14):\n53 -> 65 -> 67 -> 98 -> 122 -> 124 -> 183 -> 37 -> 14.\nMovement = (183 - 53) + (183 - 14) = 130 + 169 = 299 cylinders.',
          'Step 6: C-LOOK Sequence (sweep right to 183, jump to lowest requested 14, sweep right to 37):\n53 -> 65 -> 67 -> 98 -> 122 -> 124 -> 183 -> 14 -> 37.\nMovement = (183 - 53) + (183 - 14) + (37 - 14) = 130 + 169 + 23 = 322 cylinders.'
        ],
        finalAnswer: 'FCFS = 640; SSTF = 236; SCAN = 331; C-SCAN = 382; LOOK = 299; C-LOOK = 322 cylinders',
        gateYear: 'GATE CS 2014 / 2019'
      }
    ],
    conceptualQuestions: [
      {
        question: 'Why does C-SCAN provide a more uniform waiting time for all cylinders compared to standard SCAN?',
        category: 'GATE CS',
        explanation: 'In standard SCAN, when the arm reaches one end of the disk and reverses, the cylinders immediately adjacent to the reversal point receive immediate service again, having waited almost zero time. Meanwhile, requests at the opposite end of the disk have waited the entire sweep across the platter. In C-SCAN, the head treats cylinders as a circular list: it sweeps in only one direction, servicing requests, and then returns to the start without servicing any tracks. Thus, all cylinders wait approximately the same duration between successive service sweeps, providing a uniform waiting time distribution.',
        commonTrap: 'Assuming SCAN is fairer because it services requests on both forward and return trips.',
        keyTakeaway: 'C-SCAN provides uniform waiting time by servicing in a single direction only.'
      },
      {
        question: 'Under what specific workload condition does the SSTF algorithm degenerate into FCFS?',
        category: 'Technical Interview',
        explanation: 'SSTF degenerates into FCFS when the disk request queue depth is consistently 1 (i.e. each new request arrives only after the previous request has completed). If only one request is pending in the queue at any given time, SSTF has no choice of which request to select: the single pending request is trivially the "shortest seek distance" available, so requests are serviced in their exact arrival order.',
        commonTrap: 'Thinking SSTF requires high queue depth to degenerate into FCFS. It degenerates when queue depth is 1.',
        keyTakeaway: 'When queue depth is 1, all scheduling algorithms degenerate into FCFS.'
      }
    ]
  },
  17: {
    moduleNumber: 17,
    inDepthTheory: [
      {
        sectionTitle: 'File System Architecture & Directory Structures',
        content: 'A File System provides the persistent storage abstraction mapping logical files to physical disk blocks. Files have attributes (Name, Type, Size, Permissions, Inode ID, Modification Times).',
        bulletPoints: [
          'Directory Structures: Directories map human-readable file names to internal metadata records (Inodes).',
          'Single-Level Directory: All files in one directory; name collisions inevitable.',
          'Two-Level Directory: Per-user directories; isolates users but prohibits sharing.',
          'Tree-Structured Directory: Modern hierarchical directory tree with pathnames (absolute: /usr/bin/cat, relative: ../file.txt).',
          'Acyclic Graph Directory (DAG): Allows directories and files to have shared subdirectories/files via Links.'
        ]
      },
      {
        sectionTitle: 'Hard Links vs Soft (Symbolic) Links',
        content: 'Modern file systems implement two distinct linking mechanisms:',
        bulletPoints: [
          'Hard Link: A direct directory entry pointing to an existing file\'s Inode number. A file can have multiple hard links. Deleting one link simply decrements the Inode\'s reference count (i_nlink). The physical data blocks are freed ONLY when reference count reaches 0. Cannot cross filesystem partitions; prohibited on directories to prevent cycles.',
          'Soft (Symbolic) Link: A special file whose data content is simply a pathname string pointing to the target file. Can cross filesystems and link to directories. If the target file is deleted, the symlink remains as a Dangling Link.'
        ]
      },
      {
        sectionTitle: 'System-Wide vs Per-Process Open-File Tables',
        content: 'When an application invokes open(path, flags), the kernel maintains two coordinated lookup tables:',
        bulletPoints: [
          'Per-Process File Descriptor Table: Indexed by integer fd (0=stdin, 1=stdout, 2=stderr). Each entry points to an entry in the System-Wide Open-File Table.',
          'System-Wide Open-File Table: Tracks file offset (current read/write byte pointer), access mode, locks, and a pointer to the In-Memory Inode Table.',
          'Sharing: When a parent forks a child, the child inherits the file descriptor table; both point to the same system-wide table entry and therefore SHARE the read/write offset pointer!'
        ]
      }
    ],
    comparisons: [
      {
        title: 'Comparison: Hard Link vs Soft (Symbolic) Link',
        headers: ['Dimension', 'Hard Link', 'Soft (Symbolic) Link'],
        rows: [
          ['Target Reference', 'Points directly to the file Inode number.', 'Contains a pathname text string pointing to target.'],
          ['Target Deleted', 'File data remains intact until all hard links are deleted (ref count = 0).', 'Becomes a broken dangling link; read fails with ENOENT.'],
          ['Filesystem Boundaries', 'Strictly prohibited from crossing filesystem partitions.', 'Can span across different partitions, disks, and network mounts.'],
          ['Directory Linking', 'Forbidden for ordinary users to prevent directory cycles.', 'Fully supported for directories.']
        ]
      }
    ],
    conceptToSimulationGuide: [
      {
        simulationElement: 'Directory Tree & Inode Link Reference Counter',
        osKernelEquivalent: 'Linux VFS struct dentry, struct inode, and link() / symlink() syscalls',
        whyItMatters: 'Interactively shows why deleting a file with hard links leaves data intact until reference count hits 0.'
      }
    ],
    workedNumericals: [
      {
        title: 'Open File Table Pointer Resolution & Fork Sharing Trace',
        problemStatement: 'A process executes the following sequence of C system calls:\n  int fd1 = open("data.txt", O_RDONLY);\n  int fd2 = open("data.txt", O_RDONLY);\n  int fd3 = dup(fd1);\n\nTrace the entries in the Per-Process File Descriptor Table and the System-Wide Open-File Table:\n(a) How many distinct entries are created in the Per-Process File Table?\n(b) How many distinct entries are created in the System-Wide Open-File Table?\n(c) If a 10-byte read is performed on fd1, what is the file offset of fd1, fd2, and fd3?',
        givenData: {
          'Calls': 'open twice on "data.txt", dup on fd1',
          'Read': 'read(fd1, buf, 10)'
        },
        formulasUsed: [
          'Each open() call creates a NEW entry in the System-Wide Open-File Table with offset 0',
          'dup() duplicates the descriptor, pointing to the SAME System-Wide Open-File Table entry'
        ],
        stepByStepSolution: [
          'Step 1: Per-Process File Table:\n- fd1 is assigned index 3.\n- fd2 is assigned index 4.\n- fd3 is assigned index 5 via dup(fd1).\nTotal per-process entries = 3.',
          'Step 2: System-Wide Open-File Table:\n- First open("data.txt") creates System-Wide Entry E1 (offset = 0).\n- Second open("data.txt") creates System-Wide Entry E2 (offset = 0).\n- dup(fd1) makes fd3 point to existing Entry E1.\nTotal system-wide open file entries = 2 (E1 and E2).',
          'Step 3: Read execution on fd1:\n- read(fd1, buf, 10) advances the offset in Entry E1 from 0 to 10.\n- Since fd3 points to E1, fd3 offset is now 10!\n- Since fd2 points to E2 (which was untouched), fd2 offset remains 0.'
        ],
        finalAnswer: '(a) Per-Process Descriptors = 3; (b) System-Wide Entries = 2; (c) Offset(fd1) = 10, Offset(fd2) = 0, Offset(fd3) = 10',
        gateYear: 'GATE CS 2016 / 2020'
      }
    ],
    conceptualQuestions: [
      {
        question: 'Why do Unix operating systems strictly forbid users from creating Hard Links to Directories?',
        category: 'GATE CS',
        explanation: 'Allowing hard links to directories would allow users to create directed cycles (loops) in the file system directory tree. If a cycle exists, standard recursive directory traversal utilities (e.g. ls -R, du, find, or backup daemons) would enter infinite loops. Furthermore, garbage collection and reference counting would fail: a cyclic directory loop would have non-zero link reference counts even if disconnected from the root directory, resulting in permanent orphan disk leaks that fsck cannot resolve.',
        commonTrap: 'Assuming soft links avoid this problem. Soft links can create cycles, but traversal programs can detect symlinks via lstat without entering them.',
        keyTakeaway: 'Prohibiting hard links to directories preserves an acyclic tree structure.'
      },
      {
        question: 'What happens to the target data of a file when a Hard Link is deleted vs when a Soft (Symbolic) Link is deleted?',
        category: 'Core Concept',
        explanation: 'When a Hard Link is removed via unlink() or rm, the OS decrements the Inode\'s link count (i_nlink). If link count is still > 0, the physical file data blocks remain completely untouched and accessible through the other hard links. The data blocks and Inode are freed only when link count hits 0 and no active processes hold an open file descriptor to it. In contrast, deleting a Soft Link simply removes the small text pointer file; the original target file is completely unaffected. If the target file is deleted instead, the soft link remains as a broken dangling link that points to a non-existent path.',
        commonTrap: 'Thinking that deleting the "original" file deletes all its hard links. All hard links have equal status.',
        keyTakeaway: 'Hard links share equal ownership of the inode; soft links are merely path pointers.'
      }
    ]
  },
  18: {
    moduleNumber: 18,
    inDepthTheory: [
      {
        sectionTitle: 'File Allocation Methods: Contiguous, Linked, and Indexed',
        content: 'An allocation method defines how disk blocks are allocated for files:',
        bulletPoints: [
          'Contiguous Allocation: Each file occupies a contiguous set of blocks on disk. Fast sequential and random access (one seek). However, it suffers from severe External Fragmentation and files cannot grow dynamically without relocation.',
          'Linked Allocation: Each file is a linked list of disk blocks; each block contains a pointer to the next block. Zero external fragmentation and files can grow freely. However, random access is terrible (must traverse pointers sequentially), and losing a single pointer corrupts the entire remaining file. FAT (File Allocation Table) caches these pointers in RAM.',
          'Indexed Allocation: Brings all pointers together into a dedicated Index Block. Supports fast direct random access without external fragmentation, but wastes memory for small files (allocating an entire index block for a 100-byte file).'
        ]
      },
      {
        sectionTitle: 'Unix Inode Architecture: Direct and Indirect Blocks',
        content: 'To balance fast access for small files with scalability for multi-terabyte files, Unix-like systems (Linux ext4) utilize a multi-level index structure called an Inode (Index Node).',
        bulletPoints: [
          'Direct Pointers (typically 12): Point directly to data blocks. Small files (< 48 KB) require zero indirect lookups.',
          'Single Indirect Pointer: Points to an index block containing disk block addresses.',
          'Double Indirect Pointer: Points to an index block that points to single indirect index blocks.',
          'Triple Indirect Pointer: A 3-level tree enabling multi-terabyte file addressing.'
        ]
      }
    ],
    comparisons: [
      {
        title: 'Comparison: Contiguous vs Linked vs Indexed Allocation',
        headers: ['Property', 'Contiguous Allocation', 'Linked Allocation (FAT)', 'Indexed Allocation (Unix Inode)'],
        rows: [
          ['Sequential Access', 'Extremely fast (consecutive tracks).', 'Moderate: follows pointers across disk.', 'Fast: reads index block into memory.'],
          ['Random Access', 'Fast: Block_k = Start + k.', 'Terrible: requires k sequential disk reads.', 'Fast: direct lookup in index block.'],
          ['External Fragmentation', 'Severe problem.', 'None: any free block can be linked.', 'None: any free block can be indexed.'],
          ['File Growth', 'Difficult: requires pre-allocation or relocation.', 'Trivial: allocate free block and link pointer.', 'Easy: append pointer to index block.']
        ]
      }
    ],
    conceptToSimulationGuide: [
      {
        simulationElement: 'Unix Inode Direct & Indirect Block Tree Canvas',
        osKernelEquivalent: 'Linux ext4_inode structure and extent trees',
        whyItMatters: 'Demonstrates multi-level pointer dereferencing and calculates exact disk I/O counts for large file byte offsets.'
      }
    ],
    workedNumericals: [
      {
        title: 'Maximum File Size in a Unix Inode File System',
        problemStatement: 'A Unix Inode contains 12 direct block pointers, 1 single indirect pointer, 1 double indirect pointer, and 1 triple indirect pointer. Disk block size = 4 KB (4,096 bytes), and each disk block address pointer takes 4 bytes. Calculate:\n(a) Number of block pointers that fit in one 4 KB index block.\n(b) Maximum file size addressable using only direct pointers.\n(c) Maximum file size addressable using the single indirect pointer.\n(d) Maximum file size addressable using the double indirect pointer.\n(e) Total maximum file size supported by this Inode architecture.\n(f) Number of disk block accesses required to read a byte at offset 20,000,000 (20 MB), assuming no blocks are cached.',
        givenData: {
          'Block Size': '4 KB = 4,096 bytes = 2^12 bytes',
          'Pointer Size': '4 bytes = 2^2 bytes',
          'Pointers in Inode': '12 direct, 1 single indirect, 1 double indirect, 1 triple indirect'
        },
        formulasUsed: [
          'Pointers per Block = Block Size / Pointer Size',
          'Direct Capacity = 12 * Block Size',
          'Single Indirect Capacity = (Pointers per Block) * Block Size',
          'Double Indirect Capacity = (Pointers per Block)^2 * Block Size',
          'Triple Indirect Capacity = (Pointers per Block)^3 * Block Size'
        ],
        stepByStepSolution: [
          'Step 1: Pointers per block = 4,096 / 4 = 1,024 pointers = 2^10 pointers.',
          'Step 2: Direct pointers capacity = 12 * 4 KB = 48 KB.',
          'Step 3: Single indirect capacity = 1,024 * 4 KB = 4,096 KB = 4 MB.',
          'Step 4: Double indirect capacity = 1,024 * 1,024 * 4 KB = 1,048,576 * 4 KB = 4,194,304 KB = 4 GB.',
          'Step 5: Triple indirect capacity = 1,024 * 1,024 * 1,024 * 4 KB = 1,073,741,824 * 4 KB = 4 TB.',
          'Step 6: Total Maximum File Size = 48 KB + 4 MB + 4 GB + 4 TB ~= 4.004 TB.',
          'Step 7: Analyze byte offset 20,000,000 (~19.07 MB):\n- 48 KB (direct) + 4 MB (single indirect) = 4.048 MB.\n- Since 19.07 MB > 4.048 MB, the offset falls into the DOUBLE INDIRECT block!\n- Accesses needed without cache:\n  1. Read Double Indirect Index Block.\n  2. Read Single Indirect Index Block.\n  3. Read the actual Data Block.\n- Total disk accesses = 3.'
        ],
        finalAnswer: '(a) 1,024 pointers; (b) 48 KB; (c) 4 MB; (d) 4 GB; (e) Max File Size ~= 4.004 TB; (f) 3 disk accesses',
        gateYear: 'GATE CS 2012 / 2015 / 2021'
      }
    ],
    conceptualQuestions: [
      {
        question: 'How does the Unix Inode design achieve fast I/O performance for small files while still allowing files to grow to multi-terabyte sizes?',
        category: 'GATE CS',
        explanation: 'Empirical studies of file systems (e.g. Sprite, Linux) show that over 80% of files are small (< 48 KB). The Unix Inode places 12 direct block pointers directly inside the Inode structure itself. For small files, the operating system retrieves the exact disk block addresses immediately upon reading the Inode—requiring ZERO indirect block reads. For large files, indirect pointers provide a hierarchical tree (single, double, triple indirect) that scales capacity exponentially up to terabytes without wasting pointer memory for small files.',
        commonTrap: 'Thinking all files go through indirect index tables.',
        keyTakeaway: 'Direct pointers ensure zero-overhead access for small files, while indirect trees scale for large files.'
      },
      {
        question: 'Why does the MS-DOS File Allocation Table (FAT) store linked-list pointers in a centralized table in RAM rather than embedding them directly in data blocks on disk?',
        category: 'Technical Interview',
        explanation: 'In pure linked allocation where each disk block embeds a 4-byte pointer to the next block, seeking to byte 100 MB requires reading all 25,000 preceding data blocks from the slow mechanical disk just to follow the pointer chain. FAT solves this by extracting all next-block pointers out of data blocks and consolidating them into a single centralized array (the File Allocation Table) that is cached entirely in fast RAM. Traversal to any random file block is performed in RAM at memory bus speeds with ZERO disk I/O, requiring only a single final disk read to fetch the target block.',
        commonTrap: 'Believing FAT solves external fragmentation. FAT eliminates external fragmentation, but its primary breakthrough was fast RAM-cached seeking.',
        keyTakeaway: 'FAT caches block pointers in RAM, turning slow disk pointer-chasing into fast memory indexing.'
      }
    ]
  }
};
