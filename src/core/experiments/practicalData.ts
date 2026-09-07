// Virtual OS Lab — Practical Experiments Data

export interface PracticalExperiment {
  id: string;
  number: number;
  title: string;
  category: string;
  objective: string;
  theory: string;
  defaultInputs: Record<string, any>;
  expectedObservations: string[];
  postLabQuestions: {
    question: string;
    answer: string;
    explanation: string;
  }[];
  challenge: string;
  linkedVisualizer: string;
}

export const PRACTICAL_EXPERIMENTS: PracticalExperiment[] = [
  {
    id: 'exp_01',
    number: 1,
    title: 'Evaluating CPU Scheduling Trade-offs: Convoy Effect vs Average Turnaround',
    category: 'CPU Scheduling',
    objective: 'Demonstrate the Convoy Effect in FCFS when a CPU-bound process arrives before short I/O processes, and quantify how SJF/SRTF minimizes average waiting time.',
    theory: `In FCFS scheduling, if a long process arrives first, all subsequent short processes are delayed behind it, causing severe degradation of average waiting time. SJF provides the mathematically proven minimum average waiting time by scheduling shorter jobs first.`,
    defaultInputs: {
      algorithmA: 'FCFS',
      algorithmB: 'SRTF_PREEMPTIVE',
      processes: [
        { id: 'P1', name: 'P1 (Heavy Compute)', arrivalTime: 0, burstTime: 24 },
        { id: 'P2', name: 'P2 (Quick Web Request)', arrivalTime: 1, burstTime: 3 },
        { id: 'P3', name: 'P3 (Keyboard Input)', arrivalTime: 2, burstTime: 3 }
      ]
    },
    expectedObservations: [
      'Under FCFS: P1 runs from t=0 to t=24. P2 waits 23ms! P3 waits 22ms. Average Waiting Time is massive (15.0 ms).',
      'Under SRTF: At t=1, P2 arrives with burst 3ms < P1 remaining burst 23ms. P2 immediately preempts P1! P3 runs next. Average Waiting Time plunges to only 2.0 ms!'
    ],
    postLabQuestions: [
      {
        question: 'Why does SRTF achieve a dramatically lower average waiting time than FCFS for this workload?',
        answer: 'Short jobs complete quickly and exit the system, reducing the number of waiting processes in the ready queue.',
        explanation: 'Average waiting time is directly proportional to how long jobs linger in the ready queue. Servicing short jobs first clears the queue rapidly.'
      },
      {
        question: 'What is the primary risk of using SJF/SRTF in a production operating system?',
        answer: 'Starvation of long-running processes.',
        explanation: 'If short jobs continuously arrive, long-running processes may never get CPU time unless an aging mechanism is implemented.'
      }
    ],
    challenge: 'Configure a process set where Round Robin with Quantum=4 achieves a lower average turnaround time than FCFS without causing high context switch overhead.',
    linkedVisualizer: 'cpu_scheduler'
  },
  {
    id: 'exp_02',
    number: 2,
    title: 'Empirical Verification of Belady\'s Anomaly in Page Replacement',
    category: 'Virtual Memory',
    objective: 'Demonstrate that increasing physical memory frame capacity in FIFO can counterintuitively cause MORE page faults, and verify that LRU and Optimal are immune.',
    theory: `Belady's Anomaly occurs in First-In First-Out (FIFO) page replacement because FIFO is not a stack algorithm. The set of pages in memory with n frames is not guaranteed to be a subset of the pages in (n+1) frames. Stack algorithms like LRU and Optimal are mathematically guaranteed never to suffer from Belady's Anomaly.`,
    defaultInputs: {
      referenceString: [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5],
      testFramesA: 3,
      testFramesB: 4
    },
    expectedObservations: [
      'FIFO with 3 Frames: Produces exactly 9 Page Faults.',
      'FIFO with 4 Frames: Produces 10 Page Faults! Adding more RAM worsened performance!',
      'LRU with 3 Frames (10 faults) -> 4 Frames (8 faults): Faults decrease as expected.'
    ],
    postLabQuestions: [
      {
        question: 'What mathematical property protects LRU and Optimal from Belady\'s Anomaly?',
        answer: 'The Stack Algorithm (Inclusion) property.',
        explanation: 'For any reference string, the set of pages held in n frames at any point in time is always a strict subset of the pages that would be held in (n+1) frames.'
      }
    ],
    challenge: 'Find another page reference string of length 10 or more that triggers Belady\'s Anomaly under FIFO with 3 and 4 frames.',
    linkedVisualizer: 'page_replacement'
  },
  {
    id: 'exp_03',
    number: 3,
    title: 'Deadlock Formation & Banker\'s Safe Sequence Discovery',
    category: 'Deadlocks',
    objective: 'Construct a state where processes hold partial resources and attempt concurrent allocation, identify whether the state is safe or deadlocked, and find the execution sequence.',
    theory: `Banker's Algorithm ensures deadlock avoidance by denying any resource request that would transition the system from a Safe state into an Unsafe state. A state is safe if there exists a sequence <P1, P2, ... Pn> such that each process can satisfy its maximum demand using currently available resources plus resources freed by preceding processes.`,
    defaultInputs: {
      available: [3, 3, 2],
      processes: [
        { name: 'P0', allocation: [0, 1, 0], max: [7, 5, 3] },
        { name: 'P1', allocation: [2, 0, 0], max: [3, 2, 2] },
        { name: 'P2', allocation: [3, 0, 2], max: [9, 0, 2] },
        { name: 'P3', allocation: [2, 1, 1], max: [2, 2, 2] },
        { name: 'P4', allocation: [0, 0, 2], max: [4, 3, 3] }
      ]
    },
    expectedObservations: [
      'Need Matrix calculation: P0=[7,4,3], P1=[1,2,2], P2=[6,0,0], P3=[0,1,1], P4=[4,3,1].',
      'Initial Available [3, 3, 2] can satisfy P1 or P3.',
      'Executing P1 releases [2, 0, 0] making Available [5, 3, 2]. Safe sequence found: <P1, P3, P4, P0, P2>.'
    ],
    postLabQuestions: [
      {
        question: 'If Process P1 immediately requests [1, 0, 2], can the request be safely granted?',
        answer: 'Yes, because simulating the allocation yields a valid safe state.',
        explanation: 'Request [1,0,2] <= Need [1,2,2] and <= Available [3,3,2]. New Available [2,3,0]. Safe sequence <P1, P3, P4, P0, P2> still exists.'
      }
    ],
    challenge: 'Modify the Max matrix of P0 so that the system enters an Unsafe State where no process can complete.',
    linkedVisualizer: 'bankers_deadlock'
  },
  {
    id: 'exp_04',
    number: 4,
    title: 'Cache Parameter Optimization: Block Size vs Miss Rate',
    category: 'Cache Memory',
    objective: 'Analyze how varying cache block size affects spatial locality and capacity misses, and calculate the optimal AMAT.',
    theory: `Increasing block size initially reduces compulsory misses due to spatial locality (fetching neighboring bytes). However, making blocks too large for a fixed cache size reduces the total number of blocks (sets), causing conflict and capacity misses to skyrocket and increasing the miss penalty.`,
    defaultInputs: {
      cacheSize: 64, // Bytes
      blockSizesToTest: [4, 8, 16, 32],
      accessPattern: [0, 1, 2, 3, 16, 17, 18, 19, 32, 33, 34, 35]
    },
    expectedObservations: [
      'At 4-byte block size: Addresses 0, 1, 2, 3 hit after initial miss on 0. Hit rate is 75% for that block.',
      'At 16-byte block size: A single miss preloads 16 contiguous bytes. Hit rate climbs.',
      'At 32-byte block size with a 64-byte cache: Only 2 cache blocks total! Conflict misses occur.'
    ],
    postLabQuestions: [
      {
        question: 'What is the penalty of choosing an excessively large cache block size?',
        answer: 'Higher miss penalty (longer transfer time over bus) and increased conflict misses due to fewer cache sets.',
        explanation: 'Fetching 128 bytes takes more bus cycles than 16 bytes. If those extra bytes are never read, bandwidth and cache space are wasted.'
      }
    ],
    challenge: 'Calculate the AMAT for a 2-level cache with L1 hit time 1ns, L1 miss rate 5%, L2 hit time 10ns, L2 miss rate 20%, and RAM access time 100ns.',
    linkedVisualizer: 'cache_hierarchy'
  },
  {
    id: 'exp_05',
    number: 5,
    title: 'Disk Head Travel Optimization: SCAN vs C-LOOK under Heavy I/O Load',
    category: 'Disk Scheduling',
    objective: 'Simulate mechanical arm trajectory across disk platters and verify how C-LOOK reduces both total head movement and wait variance compared to FCFS and SSTF.',
    theory: `Mechanical seek time accounts for over 80% of magnetic disk access latency. While SSTF reduces immediate seek distances, it causes severe starvation for requests on outer tracks. SCAN and C-LOOK provide predictable bounded seek trajectories.`,
    defaultInputs: {
      initialHead: 50,
      requests: [95, 180, 34, 119, 11, 123, 62, 64],
      direction: 'RIGHT',
      totalTracks: 200
    },
    expectedObservations: [
      'FCFS generates erratic arm bouncing back and forth across tracks.',
      'SCAN travels to the physical maximum boundary track (199) before reversing, adding unnecessary seek distance.',
      'C-LOOK reverses immediately at track 180 (highest pending request) and jumps directly to track 11, minimizing wasted seek travel.'
    ],
    postLabQuestions: [
      {
        question: 'Why does LOOK/C-LOOK outperform standard SCAN/C-SCAN in total head movement?',
        answer: 'LOOK does not travel all the way to cylinder 0 or Max unless a request actually exists at the boundary.',
        explanation: 'LOOK checks if there are pending requests ahead in the current direction. If none remain, it immediately reverses direction.'
      }
    ],
    challenge: 'Construct a request queue where SSTF starves a request at track 190 for more than 5 consecutive steps.',
    linkedVisualizer: 'disk_scheduling'
  }
];
