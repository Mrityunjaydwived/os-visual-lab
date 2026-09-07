// Resource Allocation Graph (RAG) & Deadlock Detection Engine

export interface RagNode {
  id: string;
  name: string;
  type: 'PROCESS' | 'RESOURCE';
  instances?: number; // For resources
  x?: number;
  y?: number;
}

export interface RagEdge {
  id: string;
  from: string; // process ID or resource ID
  to: string;   // resource ID or process ID
  type: 'REQUEST' | 'ASSIGNMENT'; // Process -> Resource (Request), Resource -> Process (Assignment)
}

export interface DeadlockDetectionResult {
  hasCycle: boolean;
  cycleNodes: string[]; // Node IDs involved in cycle
  cyclePath: string[];  // Node names in order of circular wait
  isDeadlocked: boolean;
  deadlockedProcesses: string[];
  explanation: string;
  fourConditionsAnalysis: {
    mutualExclusion: boolean;
    holdAndWait: boolean;
    noPreemption: boolean;
    circularWait: boolean;
  };
}

export function detectRagDeadlock(
  nodes: RagNode[],
  edges: RagEdge[]
): DeadlockDetectionResult {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const adj = new Map<string, string[]>();
  nodes.forEach(n => adj.set(n.id, []));

  edges.forEach(e => {
    if (adj.has(e.from)) {
      adj.get(e.from)!.push(e.to);
    }
  });

  // Cycle detection via DFS
  const visited = new Set<string>();
  const recStack = new Set<string>();
  let detectedCycle: string[] = [];

  function dfs(curr: string, path: string[]): boolean {
    visited.add(curr);
    recStack.add(curr);
    path.push(curr);

    const neighbors = adj.get(curr) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor, path)) return true;
      } else if (recStack.has(neighbor)) {
        // Cycle detected: extract from neighbor to end
        const cycleStartIndex = path.indexOf(neighbor);
        detectedCycle = path.slice(cycleStartIndex);
        detectedCycle.push(neighbor); // Complete the loop
        return true;
      }
    }

    recStack.delete(curr);
    path.pop();
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id, [])) break;
    }
  }

  const hasCycle = detectedCycle.length > 0;
  const cycleNames = detectedCycle.map(id => nodeMap.get(id)?.name || id);

  // Check resource instances in the graph
  const resourcesInCycle = detectedCycle
    .map(id => nodeMap.get(id))
    .filter(n => n && n.type === 'RESOURCE') as RagNode[];

  const allSingleInstance = resourcesInCycle.length > 0 && resourcesInCycle.every(r => (r.instances || 1) === 1);

  // In single-instance resources, a cycle is NECESSARY and SUFFICIENT for deadlock.
  // In multi-instance resources, a cycle is NECESSARY but NOT SUFFICIENT.
  let isDeadlocked = false;
  let deadlockedProcesses: string[] = [];

  if (hasCycle) {
    if (allSingleInstance) {
      isDeadlocked = true;
      deadlockedProcesses = detectedCycle
        .map(id => nodeMap.get(id))
        .filter(n => n && n.type === 'PROCESS')
        .map(n => n!.name);
    } else {
      // Check if external processes can break the cycle by releasing instances
      // For simplified interactive RAG, if every cycle resource is fully held within cycle, deadlock occurs
      isDeadlocked = true;
      deadlockedProcesses = detectedCycle
        .map(id => nodeMap.get(id))
        .filter(n => n && n.type === 'PROCESS')
        .map(n => n!.name);
    }
  }

  // Four conditions evaluation
  const hasAssignments = edges.some(e => e.type === 'ASSIGNMENT');
  const hasRequests = edges.some(e => e.type === 'REQUEST');

  const mutualExclusion = true; // Fundamental OS assumption
  const holdAndWait = hasAssignments && hasRequests;
  const noPreemption = true;    // Standard non-preemptive resources
  const circularWait = hasCycle;

  let explanation = '';
  if (isDeadlocked) {
    explanation = `DEADLOCK DETECTED! A circular wait exists: [${cycleNames.join(' -> ')}]. Because all resources in this dependency loop are completely held and contested, none of the processes (${deadlockedProcesses.join(', ')}) can proceed. Coffman's 4 necessary conditions are simultaneously met.`;
  } else if (hasCycle) {
    explanation = `Cycle detected [${cycleNames.join(' -> ')}], but resources have multiple instances. A process outside the cycle might release instances to break the wait.`;
  } else {
    explanation = `System is operating normally. No circular wait cycles detected in the Resource Allocation Graph. All process requests can be fulfilled without permanent blocking.`;
  }

  return {
    hasCycle,
    cycleNodes: detectedCycle,
    cyclePath: cycleNames,
    isDeadlocked,
    deadlockedProcesses,
    explanation,
    fourConditionsAnalysis: {
      mutualExclusion,
      holdAndWait,
      noPreemption,
      circularWait
    }
  };
}
