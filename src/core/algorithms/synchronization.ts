// Process Synchronization Engines (Producer-Consumer, Readers-Writers, Dining Philosophers, Sleeping Barber)

export interface ProducerConsumerState {
  bufferCapacity: number;
  buffer: string[]; // item labels
  mutex: number;    // 1 = unlocked, 0 = locked
  emptySlots: number; // counting semaphore
  fullSlots: number;  // counting semaphore
  producerWaiting: boolean;
  consumerWaiting: boolean;
  lastEvent: string;
  raceConditionOccurred: boolean;
}

export function createProducerConsumer(capacity: number = 5): ProducerConsumerState {
  return {
    bufferCapacity: capacity,
    buffer: [],
    mutex: 1,
    emptySlots: capacity,
    fullSlots: 0,
    producerWaiting: false,
    consumerWaiting: false,
    lastEvent: 'System initialized with empty buffer.',
    raceConditionOccurred: false
  };
}

export function produceItem(state: ProducerConsumerState, itemName?: string): ProducerConsumerState {
  const item = itemName || `Item-${Date.now() % 1000}`;
  if (state.emptySlots <= 0) {
    return {
      ...state,
      producerWaiting: true,
      lastEvent: `PRODUCER BLOCKED on wait(empty)! Buffer is full (${state.buffer.length}/${state.bufferCapacity}).`
    };
  }

  const newBuffer = [...state.buffer, item];
  return {
    ...state,
    buffer: newBuffer,
    emptySlots: state.emptySlots - 1,
    fullSlots: state.fullSlots + 1,
    producerWaiting: false,
    consumerWaiting: false,
    lastEvent: `PRODUCER added ${item} to buffer [slot ${newBuffer.length}]. signal(full) executed.`
  };
}

export function consumeItem(state: ProducerConsumerState): { state: ProducerConsumerState; item: string | null } {
  if (state.fullSlots <= 0) {
    return {
      state: {
        ...state,
        consumerWaiting: true,
        lastEvent: `CONSUMER BLOCKED on wait(full)! Buffer is empty.`
      },
      item: null
    };
  }

  const item = state.buffer[0];
  const newBuffer = state.buffer.slice(1);
  return {
    state: {
      ...state,
      buffer: newBuffer,
      emptySlots: state.emptySlots + 1,
      fullSlots: state.fullSlots - 1,
      producerWaiting: false,
      consumerWaiting: false,
      lastEvent: `CONSUMER extracted ${item} from buffer. signal(empty) executed.`
    },
    item
  };
}

// Dining Philosophers
export type PhilosopherStatus = 'THINKING' | 'HUNGRY' | 'EATING';

export interface DiningState {
  philosophers: { id: number; name: string; status: PhilosopherStatus; mealsEaten: number }[];
  forks: boolean[]; // true = in use, false = available
  deadlockState: boolean;
  strategy: 'NAIVE_CIRCULAR' | 'ASYMMETRIC_ODD_EVEN' | 'MONITOR_PICK_BOTH';
  historyLog: string[];
}

export function createDiningSimulation(
  strategy: 'NAIVE_CIRCULAR' | 'ASYMMETRIC_ODD_EVEN' | 'MONITOR_PICK_BOTH' = 'ASYMMETRIC_ODD_EVEN'
): DiningState {
  return {
    philosophers: [
      { id: 0, name: 'Aristotle', status: 'THINKING', mealsEaten: 0 },
      { id: 1, name: 'Kant', status: 'THINKING', mealsEaten: 0 },
      { id: 2, name: 'Spinoza', status: 'THINKING', mealsEaten: 0 },
      { id: 3, name: 'Nietzsche', status: 'THINKING', mealsEaten: 0 },
      { id: 4, name: 'Socrates', status: 'THINKING', mealsEaten: 0 }
    ],
    forks: [false, false, false, false, false],
    deadlockState: false,
    strategy,
    historyLog: ['Philosophers seated. All forks free.']
  };
}

// Trigger Deadlock intentionally (all 5 pick left fork simultaneously)
export function triggerDiningDeadlock(): DiningState {
  return {
    philosophers: [
      { id: 0, name: 'Aristotle', status: 'HUNGRY', mealsEaten: 0 },
      { id: 1, name: 'Kant', status: 'HUNGRY', mealsEaten: 0 },
      { id: 2, name: 'Spinoza', status: 'HUNGRY', mealsEaten: 0 },
      { id: 3, name: 'Nietzsche', status: 'HUNGRY', mealsEaten: 0 },
      { id: 4, name: 'Socrates', status: 'HUNGRY', mealsEaten: 0 }
    ],
    forks: [true, true, true, true, true],
    deadlockState: true,
    strategy: 'NAIVE_CIRCULAR',
    historyLog: [
      'DEADLOCK TRIGGERED! Every philosopher simultaneously picked their left fork and is waiting indefinitely for their right fork.',
      'Hold and Wait condition satisfied.',
      'Circular Wait loop complete (P0 -> F1 -> P1 -> F2 -> P2 -> F3 -> P3 -> F4 -> P4 -> F0 -> P0).'
    ]
  };
}

// Step one philosopher forward safely
export function stepDiningPhilosopher(state: DiningState, philId: number): DiningState {
  if (state.deadlockState) {
    return {
      ...state,
      historyLog: ['Cannot proceed! System is deadlocked. Click "Resolve Deadlock" to apply Dijkstra asymmetric solution.', ...state.historyLog]
    };
  }

  const n = state.philosophers.length;
  const phil = state.philosophers[philId];
  const newPhil = [...state.philosophers];
  const newForks = [...state.forks];
  const log = [...state.historyLog];

  const leftFork = philId;
  const rightFork = (philId + 1) % n;

  if (phil.status === 'THINKING') {
    // Become hungry
    newPhil[philId] = { ...phil, status: 'HUNGRY' };
    log.unshift(`${phil.name} became HUNGRY and wants to eat.`);
  } else if (phil.status === 'HUNGRY') {
    // Attempt to pick forks based on strategy
    if (state.strategy === 'ASYMMETRIC_ODD_EVEN') {
      // Even philosophers pick left then right; odd pick right then left
      const first = philId % 2 === 0 ? leftFork : rightFork;
      const second = philId % 2 === 0 ? rightFork : leftFork;

      if (!newForks[first] && !newForks[second]) {
        newForks[first] = true;
        newForks[second] = true;
        newPhil[philId] = { ...phil, status: 'EATING', mealsEaten: phil.mealsEaten + 1 };
        log.unshift(`${phil.name} picked up fork ${first} then ${second} and began EATING!`);
      } else {
        log.unshift(`${phil.name} cannot acquire both forks (${leftFork}, ${rightFork}) and continues waiting.`);
      }
    } else {
      // Pick both or none
      if (!newForks[leftFork] && !newForks[rightFork]) {
        newForks[leftFork] = true;
        newForks[rightFork] = true;
        newPhil[philId] = { ...phil, status: 'EATING', mealsEaten: phil.mealsEaten + 1 };
        log.unshift(`${phil.name} acquired both forks and started EATING.`);
      } else {
        log.unshift(`${phil.name} is waiting for adjacent forks.`);
      }
    }
  } else if (phil.status === 'EATING') {
    // Finished eating, release forks
    newForks[leftFork] = false;
    newForks[rightFork] = false;
    newPhil[philId] = { ...phil, status: 'THINKING' };
    log.unshift(`${phil.name} finished eating, put down forks ${leftFork} & ${rightFork}, and returned to THINKING.`);
  }

  return {
    ...state,
    philosophers: newPhil,
    forks: newForks,
    historyLog: log.slice(0, 15)
  };
}

// Readers-Writers State Machine
export interface ReadersWritersState {
  activeReaders: number;
  waitingReaders: number;
  activeWriter: boolean;
  waitingWriters: number;
  resourceValue: number;
  historyLog: string[];
}

export function createReadersWritersState(): ReadersWritersState {
  return {
    activeReaders: 0,
    waitingReaders: 0,
    activeWriter: false,
    waitingWriters: 0,
    resourceValue: 42,
    historyLog: ['Shared database initialized at value 42.']
  };
}

export function startRead(state: ReadersWritersState): ReadersWritersState {
  const log = [...state.historyLog];
  if (state.activeWriter) {
    log.unshift('READER BLOCKED: Writer is currently modifying shared resource. Reader placed in wait queue.');
    return { ...state, waitingReaders: state.waitingReaders + 1, historyLog: log.slice(0, 10) };
  }
  log.unshift(`READER ENTERED: Now reading shared database (Active Readers: ${state.activeReaders + 1}).`);
  return { ...state, activeReaders: state.activeReaders + 1, historyLog: log.slice(0, 10) };
}

export function finishRead(state: ReadersWritersState): ReadersWritersState {
  if (state.activeReaders <= 0) return state;
  const log = [...state.historyLog];
  const remaining = state.activeReaders - 1;
  log.unshift(`READER EXITED: Active Readers: ${remaining}.`);
  return { ...state, activeReaders: remaining, historyLog: log.slice(0, 10) };
}

export function startWrite(state: ReadersWritersState): ReadersWritersState {
  const log = [...state.historyLog];
  if (state.activeWriter || state.activeReaders > 0) {
    log.unshift(`WRITER BLOCKED: Cannot write while ${state.activeReaders} reader(s) or another writer holds resource.`);
    return { ...state, waitingWriters: state.waitingWriters + 1, historyLog: log.slice(0, 10) };
  }
  log.unshift('WRITER ENTERED CRITICAL SECTION: Exclusive lock acquired.');
  return { ...state, activeWriter: true, historyLog: log.slice(0, 10) };
}

export function finishWrite(state: ReadersWritersState, increment: number = 1): ReadersWritersState {
  if (!state.activeWriter) return state;
  const log = [...state.historyLog];
  const newVal = state.resourceValue + increment;
  log.unshift(`WRITER EXITED CRITICAL SECTION: Shared database updated to ${newVal}. Mutual exclusion lock released.`);
  return {
    ...state,
    activeWriter: false,
    resourceValue: newVal,
    historyLog: log.slice(0, 10)
  };
}
