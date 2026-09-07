// OS Visual Lab — Interactive Gamification Data & Challenges

export interface OsGame {
  id: string;
  gameNumber: number;
  title: string;
  codename: string;
  objective: string;
  difficulty: 'Beginner' | 'Challenging' | 'Hardcore' | 'Expert';
  xpReward: number;
  badgeName: string;
  badgeIcon: string;
  instructions: string[];
  rules: string[];
  scoringCriteria: string;
}

export const OS_GAMES: OsGame[] = [
  {
    id: 'game_cpu_commander',
    gameNumber: 1,
    title: 'CPU Commander',
    codename: 'DISPATCH_WAR',
    objective: 'Act as the CPU scheduler dispatching incoming processes to minimize average waiting time and maintain strict deadline fairness.',
    difficulty: 'Challenging',
    xpReward: 350,
    badgeName: 'CPU Scheduling Master',
    badgeIcon: 'Timer',
    instructions: [
      'Observe processes arriving in the Incoming Queue with differing burst times and priorities.',
      'Drag or click a process to assign it to the CPU core before its patience meter expires.',
      'Decide whether to preempt a running process if a critical VIP job arrives.',
      'Maintain continuous CPU utilization above 90% while keeping average waiting time below 4.0s.'
    ],
    rules: [
      'Every second a process waits in the queue, its frustration counter increments.',
      'Letting a process wait longer than 15s causes a Deadline Timeout failure.',
      'Context switches take 0.5s of simulated penalty time, so do not preempt indiscriminately!'
    ],
    scoringCriteria: 'Score = (100 - Avg Waiting Time) * 10 + Throughput Bonus - Context Switch Penalties'
  },
  {
    id: 'game_memory_manager',
    gameNumber: 2,
    title: 'Memory Manager',
    codename: 'RAM_DEFENDER',
    objective: 'Allocate incoming dynamic process memory chunks into physical RAM blocks without causing unrecoverable external fragmentation.',
    difficulty: 'Challenging',
    xpReward: 400,
    badgeName: 'Memory Manager Grandmaster',
    badgeIcon: 'Layers',
    instructions: [
      'Incoming memory requests appear with sizes (e.g. 50MB, 120MB, 300MB) and lifetimes.',
      'Click an available free memory partition using First Fit, Best Fit, or Worst Fit.',
      'When processes terminate, their space becomes a free hole.',
      'Trigger "Defragment / Compaction" only when emergency free space is required (costs 200 energy points).'
    ],
    rules: [
      'If an incoming process cannot find a contiguous block of sufficient size, an Out Of Memory (OOM) strike is issued.',
      '3 OOM strikes end the session.'
    ],
    scoringCriteria: 'Score = Total Memory Allocated (MB) - Total Bytes Lost to Fragmentation'
  },
  {
    id: 'game_cache_master',
    gameNumber: 3,
    title: 'Cache Master',
    codename: 'L1_OVERCLOCK',
    objective: 'Tune cache size, block size, and associativity parameters to maintain a 90%+ cache hit rate under hostile memory access sequences.',
    difficulty: 'Expert',
    xpReward: 500,
    badgeName: 'Cache Master Architect',
    badgeIcon: 'Zap',
    instructions: [
      'Inspect incoming address access patterns (strided loops, random pointers, sequential arrays).',
      'Dynamically configure cache line parameters and prefetching policies.',
      'Trigger prefetch sweeps to pull anticipated cache lines into L1 before the ALU requests them.'
    ],
    rules: [
      'Each cache miss costs a 100-cycle latency penalty, dropping your system benchmark score.',
      'Exceeding maximum silicon cache budget triggers thermal throttling.'
    ],
    scoringCriteria: 'Score = Total Cache Hits * 10 - Miss Penalty Cycles'
  },
  {
    id: 'game_deadlock_breaker',
    gameNumber: 4,
    title: 'Deadlock Breaker',
    codename: 'SAFE_SEQUENCE_LOCK',
    objective: 'Safely allocate shared hardware resources (GPU, Tape Drive, Network Port) to competing threads without triggering circular wait deadlocks.',
    difficulty: 'Hardcore',
    xpReward: 450,
    badgeName: 'Deadlock Breaker Legend',
    badgeIcon: 'AlertTriangle',
    instructions: [
      'Processes request varying combinations of Resource A, B, and C.',
      'Evaluate whether granting the request leaves the system in a Banker\'s Safe State.',
      'Approve safe requests; put unsafe requests on Hold until other threads finish and release resources.'
    ],
    rules: [
      'If you approve an unsafe request and a circular wait cycle forms in the RAG, DEADLOCK occurs and the game terminates!',
      'Holding processes too long without justification deducts fairness points.'
    ],
    scoringCriteria: 'Score = Successfully Finished Safe Processes * 50 - Unsafe Denial Penalties'
  },
  {
    id: 'game_disk_controller',
    gameNumber: 5,
    title: 'Disk Controller',
    codename: 'ELEVATOR_SWEEP',
    objective: 'Command the mechanical hard disk read/write actuator arm to service sector requests with minimal mechanical travel distance.',
    difficulty: 'Beginner',
    xpReward: 300,
    badgeName: 'Disk Controller Ace',
    badgeIcon: 'Compass',
    instructions: [
      'Incoming track requests flash across cylinders 0 to 199.',
      'Select your disk scheduling algorithm (SSTF, SCAN, C-LOOK) and sweep direction.',
      'Catch priority track requests before rotational timeouts occur.'
    ],
    rules: [
      'Every cylinder traveled increases mechanical wear and latency.',
      'Keep Total Head Movement below 300 cylinders for 20 requests.'
    ],
    scoringCriteria: 'Score = 5000 - (Total Head Movement * 10)'
  },
  {
    id: 'game_thread_master',
    gameNumber: 6,
    title: 'Thread Master',
    codename: 'RACE_CONDITION_ZERO',
    objective: 'Position Mutex locks, Semaphores, and Atomic flags in concurrent thread code to eradicate race conditions without causing deadlocks.',
    difficulty: 'Hardcore',
    xpReward: 450,
    badgeName: 'Synchronization Expert',
    badgeIcon: 'Lock',
    instructions: [
      'Two or more asynchronous threads increment a shared counter or bank account.',
      'Drag and drop `wait(mutex)` and `signal(mutex)` blocks to encapsulate the Critical Section.',
      'Run the concurrency stress test at 10,000 iterations to verify zero race conditions and zero deadlocks.'
    ],
    rules: [
      'Leaving shared variables unprotected causes silent data corruption (FAILED TEST).',
      'Nested inverted locks trigger immediate deadlock.'
    ],
    scoringCriteria: 'Score = Verified Thread Safety Iterations - Lock Contention Overhead'
  },
  {
    id: 'game_os_architect',
    gameNumber: 7,
    title: 'OS Architect',
    codename: 'SYSTEM_ZENITH',
    objective: 'The Capstone Sandbox: Configure CPU cores, Scheduler, RAM, Paging size, Cache hierarchy, and Disk controller to maximize total system benchmark throughput.',
    difficulty: 'Expert',
    xpReward: 1000,
    badgeName: 'Virtual OS Architect',
    badgeIcon: 'Server',
    instructions: [
      'Pick CPU Cores (1, 2, 4, 8), Scheduling Policy (CFS, RR, MLFQ, SRTF).',
      'Configure Memory (RAM size, Page size 2KB/4KB/8KB, Replacement policy LRU/Clock).',
      'Set Cache parameters (L1/L2 size, Associativity) and Disk scheduling (SSTF, C-LOOK).',
      'Click "RUN OS BENCHMARK" to execute a realistic simulated mixed workload (Web server + 3D rendering + Database queries).',
      'Observe overall throughput, CPU utilization, page faults, and cache hit rate.'
    ],
    rules: [
      'Balance trade-offs: massive caches cost simulated silicon budget; small page sizes increase page table memory footprint.'
    ],
    scoringCriteria: 'Comprehensive OS Performance Score (0 - 10,000 pts)'
  }
];
