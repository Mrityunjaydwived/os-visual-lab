// Real-World OS Engineering Scenarios

export interface RealWorldScenario {
  id: string;
  title: string;
  industry: string;
  badge: string;
  context: string;
  problemStatement: string;
  options: {
    id: string;
    label: string;
    description: string;
    isCorrect: boolean;
    consequence: string;
  }[];
  deepExplanation: string;
  productionMetrics: {
    latency: string;
    throughput: string;
    cpuOverhead: string;
    memoryEfficiency: string;
  };
}

export const REAL_WORLD_SCENARIOS: RealWorldScenario[] = [
  {
    id: 'scenario_01',
    title: 'High-Traffic Web Server: 100,000 Concurrent Connections',
    industry: 'Cloud Infrastructure & Networking',
    badge: 'C10K Problem',
    context: `Your e-commerce platform is running a Black Friday flash sale. Within 30 seconds, incoming TCP client requests spike from 1,000 to over 100,000 concurrent HTTP connections. Your legacy Apache web server spawns a dedicated POSIX thread per connection. The server load spikes to 350.0, CPU utilization hits 100% (mostly spent in kernel context switching), and memory is exhausted.`,
    problemStatement: `How do you re-architect the operating system I/O model and process concurrency architecture to serve 100,000 concurrent connections with sub-10ms response times without crashing?`,
    options: [
      {
        id: 'opt_1',
        label: 'Increase Kernel Thread Limits & Stack Allocation',
        description: 'Configure sysctl kernel.threads-max to 200,000 and increase physical RAM.',
        isCorrect: false,
        consequence: 'System suffers catastrophic kernel thread thrashing. Context switching between 100k threads consumes 90% of all CPU cycles, leaving no CPU time to process actual HTTP packets.'
      },
      {
        id: 'opt_2',
        label: 'Migrate to Event-Driven Non-Blocking I/O (epoll / io_uring)',
        description: 'Use an asynchronous single-threaded or thread-pool-per-core event loop (like Nginx/Node.js) multiplexing 100k sockets with Linux epoll/io_uring.',
        isCorrect: true,
        consequence: 'Optimal solution! CPU context switches plunge from 500,000/sec to under 2,000/sec. Socket readiness notifications are handled in O(1) time. Latency drops to 3ms.'
      },
      {
        id: 'opt_3',
        label: 'Use Busy-Wait Polling on Sockets in User Space',
        description: 'Iterate continuously through an array of 100,000 file descriptors checking for incoming bytes.',
        isCorrect: false,
        consequence: 'CPU cores remain pegged at 100% in a tight loop checking empty sockets. Wastes immense energy and increases latency.'
      }
    ],
    deepExplanation: `The C10K/C100K problem proved that thread-per-connection architectures do not scale due to thread stack memory consumption (e.g. 100,000 * 8MB default stack = 800GB RAM!) and severe CPU context switch cache pollution. Modern high-performance servers (Nginx, Envoy, Node.js) utilize Linux epoll or io_uring. A tiny thread pool (1 worker per CPU core) monitors thousands of non-blocking sockets using OS kernel event notifications.`,
    productionMetrics: {
      latency: '< 4 ms',
      throughput: '120,000 req/sec',
      cpuOverhead: '< 15% kernel sys',
      memoryEfficiency: '92% reduction in memory overhead'
    }
  },
  {
    id: 'scenario_02',
    title: 'Financial Banking Core: The Concurrent Double-Withdrawal Race Condition',
    industry: 'FinTech & High-Frequency Transactions',
    badge: 'Atomic Locks',
    context: `A customer has an account balance of $1,000. At exactly 12:00:00.000 UTC, an automated bill payment thread attempts to withdraw $800. At 12:00:00.001 UTC, the customer swipes an ATM card in Tokyo withdrawing $800. Both application threads read the balance as $1,000 before either thread writes the deduction back to the database. The final balance is set to $200 instead of declining the second withdrawal, causing an illegal overdraft of $600.`,
    problemStatement: `Which synchronization strategy must be implemented at the OS/database interface to prevent dirty reads and race conditions while preserving high transaction throughput?`,
    options: [
      {
        id: 'opt_1',
        label: 'Global Mutex on the Entire Database',
        description: 'Lock the entire customer database with a single mutex during any balance check or update.',
        isCorrect: false,
        consequence: 'Guarantees correctness, but completely ruins scalability. All bank transactions worldwide serialize behind a single global lock; transactions/sec collapses from 20,000 to 50.'
      },
      {
        id: 'opt_2',
        label: 'Row-Level Optimistic Concurrency Control (OCC) with Compare-And-Swap (CAS)',
        description: 'Verify the account version/timestamp has not changed before committing the write. If changed, abort and retry.',
        isCorrect: true,
        consequence: 'Excellent balance of correctness and extreme parallelism. One thread succeeds immediately; the colliding thread aborts, re-reads the updated $200 balance, and declines the second $800 withdrawal.'
      },
      {
        id: 'opt_3',
        label: 'Ignore locking and rely on asynchronous periodic reconciliation',
        description: 'Let both withdrawals pass and let a nightly batch job reconcile accounts.',
        isCorrect: false,
        consequence: 'Financial loss and severe regulatory compliance violations. Cash has already been dispensed from the physical ATM.'
      }
    ],
    deepExplanation: `This classic race condition violates the Atomicity, Consistency, Isolation, Durability (ACID) requirements of transactional systems. Using hardware atomic Compare-And-Swap (CAS) primitives or row-level pessimistic locks (SELECT ... FOR UPDATE) ensures the read-modify-write cycle is strictly atomic for that specific account ID without bottlenecking unrelated customer accounts.`,
    productionMetrics: {
      latency: '1.2 ms',
      throughput: '45,000 tx/sec',
      cpuOverhead: '3% lock contention',
      memoryEfficiency: '100% data integrity'
    }
  },
  {
    id: 'scenario_03',
    title: 'Mobile Smartphone OS: The Out-Of-Memory (OOM) Lifecycle Crash',
    industry: 'Mobile Systems (Android / iOS)',
    badge: 'OOM Killer',
    context: `A smartphone user is playing a high-end 3D game that consumes 3.2 GB of RAM. The phone has 4 GB total physical RAM (with 600 MB reserved for the kernel and modem). A sudden incoming video call launches, requiring 500 MB of RAM. Physical RAM is completely exhausted. The smartphone does not use disk swap because continuous flash NAND writes would burn out the phone's storage chip within months.`,
    problemStatement: `How does the mobile operating system manage memory exhaustion in real time to keep the phone responsive without crashing active user calls?`,
    options: [
      {
        id: 'opt_1',
        label: 'Kill the incoming video call because it is the newest process',
        description: 'Deny memory to the incoming call and terminate it immediately.',
        isCorrect: false,
        consequence: 'Horrible user experience. Emergency calls or incoming notifications are dropped.'
      },
      {
        id: 'opt_2',
        label: 'Low Memory Killer (LMK) with Process Priority Hierarchy & zRAM Compression',
        description: 'Compress inactive anonymous memory in RAM using zRAM (LZO/LZ4). If memory is still critically low, kill background cached processes with highest oom_score_adj before touching foreground apps.',
        isCorrect: true,
        consequence: 'Flawless execution! Background browser tabs and music history are discarded or compressed; foreground game is paused safely; video call connects instantly with zero dropped frames.'
      },
      {
        id: 'opt_3',
        label: 'Freeze the CPU until the user manually swipes away apps in the task switcher',
        description: 'Halt all processes and pop up a system modal dialog.',
        isCorrect: false,
        consequence: 'The operating system triggers an ANR (Application Not Responding) Watchdog panic and reboots the phone.'
      }
    ],
    deepExplanation: `Mobile OSes do not use secondary flash storage for swapping due to NAND wear limits and power constraints. Instead, Android uses zRAM (a compressed block device in RAM) and the Low Memory Killer daemon (lmkd). Processes are assigned priority classes: Foreground -> Visible -> Service -> Cached. When memory thresholds cross critical boundaries, cached background processes are killed in order of memory consumption.`,
    productionMetrics: {
      latency: '< 10 ms reclaim',
      throughput: 'N/A',
      cpuOverhead: '4% compression load',
      memoryEfficiency: '2.5x effective RAM via zRAM'
    }
  },
  {
    id: 'scenario_04',
    title: 'Database Engine Buffer Pool: The Sequential Scan Cache Wipeout',
    industry: 'Database Systems (PostgreSQL / MySQL InnoDB)',
    badge: 'Cache Pollution',
    context: `A large enterprise database has a 64 GB RAM Buffer Pool running an LRU page eviction algorithm to cache hot customer index blocks (giving 98% cache hit rate). An analyst runs a reporting query: "SELECT * FROM historical_logs WHERE message LIKE '%error%';" which performs a full sequential table scan across a 200 GB table on disk. The sequential scan floods the buffer pool with 200 GB of single-use data pages, completely evicting all hot customer index pages from RAM! Cache hit rate plummets from 98% to 12%, bringing online banking to a crawl.`,
    problemStatement: `How do you modify the buffer pool page replacement policy to protect frequently accessed pages from being evicted by one-off sequential table scans?`,
    options: [
      {
        id: 'opt_1',
        label: 'Increase the physical RAM of the server to 300 GB',
        description: 'Add more hardware to hold both the logs and the index in RAM.',
        isCorrect: false,
        consequence: 'Extremely expensive, temporary band-aid. Next month\'s log table will be 500 GB, causing the exact same cache wipeout.'
      },
      {
        id: 'opt_2',
        label: 'Implement Midpoint Insertion / 2Q / Adaptive Replacement Cache (ARC)',
        description: 'Divide the buffer pool into Young and Old generations (or probationary and protected queues). New pages are loaded into the probationary queue and only promoted to protected if accessed more than once.',
        isCorrect: true,
        consequence: 'Cache pollution prevented! The 200 GB sequential log scan streams through the small probationary queue and is discarded immediately without evicting a single hot customer index page.'
      },
      {
        id: 'opt_3',
        label: 'Switch from LRU to pure FIFO page replacement',
        description: 'Evict pages strictly by the time they entered memory.',
        isCorrect: false,
        consequence: 'Worse performance. FIFO discards hot pages even faster and suffers from Belady\'s Anomaly.'
      }
    ],
    deepExplanation: `Standard LRU replacement is vulnerable to "cache scan pollution". Modern database engines (such as MySQL InnoDB and PostgreSQL) use modified LRU algorithms. In InnoDB, the LRU list is split into New (5/8) and Old (3/8). New pages are inserted at the midpoint (head of the Old sublist). A page is only promoted to the New sublist if it is accessed again after a configurable time window (innodb_old_blocks_time), shielding hot cache pages from massive sequential reads.`,
    productionMetrics: {
      latency: '0.8 ms index lookup',
      throughput: '85,000 queries/sec',
      cpuOverhead: '1% buffer pool overhead',
      memoryEfficiency: '99.1% steady-state cache hit rate'
    }
  }
];
