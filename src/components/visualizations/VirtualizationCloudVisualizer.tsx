// Interactive Virtualization & Cloud/Container Visualizer
// Covers Module 22 (Virtualization & Hypervisors) and Module 23 (Modern OS & Cloud / Containers)
import React, { useState } from 'react';
import { 
  Server, 
  Box, 
  Activity, 
  Zap, 
  RotateCcw,
  Sliders
} from 'lucide-react';

export type VirtMode = 'HYPERVISOR_TYPE' | 'VM_EXIT_DISPATCH' | 'CONTAINER_VS_VM' | 'CGROUPS_NAMESPACES';

export const VirtualizationCloudVisualizer: React.FC = () => {
  const [activeMode, setActiveMode] = useState<VirtMode>('HYPERVISOR_TYPE');

  // ---------------------------------------------------------------------------
  // 1. HYPERVISOR ARCHITECTURE STATE
  // ---------------------------------------------------------------------------
  const [hypervisorType, setHypervisorType] = useState<'TYPE_1' | 'TYPE_2'>('TYPE_1');

  // ---------------------------------------------------------------------------
  // 2. VM EXIT / INSTRUCTION TRAP STATE
  // ---------------------------------------------------------------------------
  const [lastInstruction, setLastInstruction] = useState<string>('ADD EAX, EBX');
  const [isPrivilegedTrap, setIsPrivilegedTrap] = useState<boolean>(false);
  const [vmExitLog, setVmExitLog] = useState<string[]>([
    'Guest VM initialized in Intel VMX Non-Root Mode (Ring 0 guest).',
    'Hypervisor running in VMX Root Mode.'
  ]);

  const executeInstruction = (instruction: string, privileged: boolean) => {
    setLastInstruction(instruction);
    setIsPrivilegedTrap(privileged);

    if (privileged) {
      setVmExitLog(prev => [
        `⚠️ SENSITIVE INSTRUCTION DETECTED: [${instruction}]. Hardware raised VM-Exit!`,
        'CPU switched from VMX Non-Root -> VMX Root Mode. Hypervisor emulating instruction...',
        'VM-Resume executed. Returning control to Guest OS.',
        ...prev.slice(0, 4)
      ]);
    } else {
      setVmExitLog(prev => [
        `Unprivileged instruction [${instruction}] executed natively on physical CPU in Non-Root mode (0 hypervisor overhead).`,
        ...prev.slice(0, 4)
      ]);
    }
  };

  // ---------------------------------------------------------------------------
  // 3. CGROUPS & NAMESPACES STATE
  // ---------------------------------------------------------------------------
  const [cpuQuotaPct, setCpuQuotaPct] = useState<number>(50); // e.g. 50% CPU quota
  const [memLimitMb, setMemLimitMb] = useState<number>(512); // 512 MB limit
  const [memUsageMb, setMemUsageMb] = useState<number>(320); // 320 MB current
  const [workloadActive, setWorkloadActive] = useState<boolean>(false);

  const isOomKilled = memUsageMb > memLimitMb;

  const handleSimulateBurst = () => {
    setWorkloadActive(true);
    setMemUsageMb(prev => prev + 150);
  };

  const handleResetCgroup = () => {
    setMemUsageMb(320);
    setWorkloadActive(false);
  };

  return (
    <div className="space-y-6 font-sans select-none">
      
      {/* Sub-Mode Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-blue-400" />
          <span className="font-bold text-white text-sm font-mono">Virtualization &amp; Cloud Lab:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'HYPERVISOR_TYPE', label: '1. Type-1 vs Type-2 Hypervisor', icon: <Server className="w-3.5 h-3.5" /> },
            { id: 'VM_EXIT_DISPATCH', label: '2. Intel VT-x VM-Exit Dispatcher', icon: <Zap className="w-3.5 h-3.5" /> },
            { id: 'CONTAINER_VS_VM', label: '3. Containers vs VMs Architecture', icon: <Box className="w-3.5 h-3.5" /> },
            { id: 'CGROUPS_NAMESPACES', label: '4. Linux Cgroups & Namespaces', icon: <Sliders className="w-3.5 h-3.5" /> },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id as VirtMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                activeMode === m.id
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {m.icon}
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 1. HYPERVISOR ARCHITECTURE                                           */}
      {/* -------------------------------------------------------------------- */}
      {activeMode === 'HYPERVISOR_TYPE' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-400" />
                Hypervisor Architecture: Type-1 (Bare Metal) vs Type-2 (Hosted)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Compare direct hardware access in bare-metal hypervisors (ESXi, KVM) vs hosted virtualization (VirtualBox).
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                onClick={() => setHypervisorType('TYPE_1')}
                className={`px-3 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                  hypervisorType === 'TYPE_1'
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                Type-1 (Bare-Metal Hypervisor)
              </button>
              <button
                onClick={() => setHypervisorType('TYPE_2')}
                className={`px-3 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                  hypervisorType === 'TYPE_2'
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                Type-2 (Hosted Hypervisor)
              </button>
            </div>
          </div>

          {/* Layered Architecture Diagram */}
          <div className="max-w-2xl mx-auto space-y-2 font-mono text-xs text-center">
            {/* Top: Guest Applications */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/40 text-blue-300 font-bold">
                Guest VM 1 Apps (Nginx / Python)
              </div>
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-300 font-bold">
                Guest VM 2 Apps (PostgreSQL / Node)
              </div>
            </div>

            {/* Middle: Guest Operating Systems */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-blue-900/30 border border-blue-600/30 text-slate-200">
                Guest OS 1 (Ubuntu Linux Kernel)
              </div>
              <div className="p-3 rounded-xl bg-purple-900/30 border border-purple-600/30 text-slate-200">
                Guest OS 2 (Windows Server NT Kernel)
              </div>
            </div>

            {/* Hypervisor Layer */}
            <div className={`p-4 rounded-xl border font-bold transition-all ${
              hypervisorType === 'TYPE_1'
                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-md'
                : 'bg-amber-950/40 border-amber-500 text-amber-300'
            }`}>
              {hypervisorType === 'TYPE_1'
                ? 'Type-1 Bare-Metal Hypervisor (VMware ESXi / Linux KVM / Xen)'
                : 'Type-2 Hypervisor Application (VirtualBox / VMware Workstation)'}
              <span className="text-[10px] block font-normal text-slate-400 mt-1">
                {hypervisorType === 'TYPE_1'
                  ? 'Runs directly on physical CPU/DRAM with direct VT-x hardware execution (98% native speed).'
                  : 'Runs as user-space process on host OS; subject to host kernel scheduling and translation lag.'}
              </span>
            </div>

            {/* Host OS Layer (Type 2 Only) */}
            {hypervisorType === 'TYPE_2' && (
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
                Host Operating System (Windows 11 / macOS / Desktop Linux)
              </div>
            )}

            {/* Physical Bare-Metal Hardware */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-bold flex items-center justify-around">
              <span>Physical x86-64 / ARM CPU</span>
              <span>Physical DDR5 RAM</span>
              <span>PCIe NVMe SSDs</span>
              <span>Hardware Intel VT-x / AMD-V</span>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 2. INTEL VT-X VM-EXIT DISPATCHER                                     */}
      {/* -------------------------------------------------------------------- */}
      {activeMode === 'VM_EXIT_DISPATCH' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Hardware-Assisted CPU Virtualization (Intel VT-x VM-Exit Trap)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Execute machine instructions inside Guest VM. Unprivileged instructions run natively at hardware speed; privileged/sensitive instructions trigger a VM-Exit trap.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Instruction Dispatch Pad */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <span className="text-slate-400 font-bold block">
                Dispatch Guest Machine Instruction:
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => executeInstruction('ADD EAX, EBX', false)}
                  className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-left cursor-pointer"
                >
                  <strong className="block text-blue-400">ADD EAX, EBX</strong>
                  <span className="text-[10px] text-slate-500">Unprivileged Arithmetic</span>
                </button>

                <button
                  onClick={() => executeInstruction('MOV [RSI], RAX', false)}
                  className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-left cursor-pointer"
                >
                  <strong className="block text-blue-400">MOV [RSI], RAX</strong>
                  <span className="text-[10px] text-slate-500">Unprivileged Memory Store</span>
                </button>

                <button
                  onClick={() => executeInstruction('CLI (Clear Interrupts)', true)}
                  className="p-2.5 rounded-lg bg-rose-950/30 hover:bg-rose-950/50 border border-rose-500/40 text-rose-300 text-left cursor-pointer"
                >
                  <strong className="block text-rose-400">CLI</strong>
                  <span className="text-[10px] text-rose-400/70">Sensitive: Clear Interrupt Flag</span>
                </button>

                <button
                  onClick={() => executeInstruction('LIDT (Load IDT Pointer)', true)}
                  className="p-2.5 rounded-lg bg-rose-950/30 hover:bg-rose-950/50 border border-rose-500/40 text-rose-300 text-left cursor-pointer"
                >
                  <strong className="block text-rose-400">LIDT</strong>
                  <span className="text-[10px] text-rose-400/70">Sensitive: Load Interrupt Table</span>
                </button>

                <button
                  onClick={() => executeInstruction('IN AL, 0x60 (Read I/O)', true)}
                  className="p-2.5 rounded-lg bg-rose-950/30 hover:bg-rose-950/50 border border-rose-500/40 text-rose-300 text-left cursor-pointer"
                >
                  <strong className="block text-rose-400">IN / OUT Port</strong>
                  <span className="text-[10px] text-rose-400/70">Sensitive: Direct Hardware I/O</span>
                </button>

                <button
                  onClick={() => executeInstruction('MOV CR3, RAX (Page Table)', true)}
                  className="p-2.5 rounded-lg bg-rose-950/30 hover:bg-rose-950/50 border border-rose-500/40 text-rose-300 text-left cursor-pointer"
                >
                  <strong className="block text-rose-400">MOV CR3</strong>
                  <span className="text-[10px] text-rose-400/70">Sensitive: Change MMU Base</span>
                </button>
              </div>
            </div>

            {/* Hardware Status Monitor */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <span className="text-slate-400 font-bold block">
                Intel VT-x Hardware Execution State:
              </span>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Last Executed:</span>
                  <span className="text-white font-bold">{lastInstruction}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">CPU VMX Mode:</span>
                  <span className={`font-bold ${isPrivilegedTrap ? 'text-amber-400' : 'text-blue-400'}`}>
                    {isPrivilegedTrap ? 'VMX Root Mode (Hypervisor Active)' : 'VMX Non-Root Mode (Guest Active)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Trap Event:</span>
                  <span className={`font-bold ${isPrivilegedTrap ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {isPrivilegedTrap ? 'VM-Exit Trap (Intercepted)' : 'Direct Native Hardware Run'}
                  </span>
                </div>
              </div>

              {isPrivilegedTrap ? (
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs">
                  <strong>VM-Exit Occurred!</strong> The guest attempted to modify physical hardware state. The CPU intercepted the instruction, saved guest registers to the VMCS (Virtual Machine Control Structure), and trapped into the Hypervisor for safe emulation.
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs">
                  ✓ Instruction executed directly on physical CPU execution unit with zero VM-Exit overhead.
                </div>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Hypervisor Event Log:</span>
            {vmExitLog.map((log, idx) => (
              <div key={idx} className="text-slate-300 text-[11px]">
                › {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 3. CONTAINERS VS VMS COMPARISON                                      */}
      {/* -------------------------------------------------------------------- */}
      {activeMode === 'CONTAINER_VS_VM' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Box className="w-4 h-4 text-emerald-400" />
              Structural Comparison: Linux Containers (Docker) vs Virtual Machines
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Containers virtualize at the OS layer (sharing the host kernel via namespaces); VMs virtualize hardware (running full redundant guest kernels).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs text-center">
            {/* VM Stack */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-sm mb-2">Virtual Machine (VM)</h4>
              <div className="p-2.5 rounded bg-blue-900/40 border border-blue-500/30 text-blue-300">
                Application Code &amp; Libraries
              </div>
              <div className="p-2.5 rounded bg-amber-900/40 border border-amber-500/40 text-amber-300 font-bold">
                Full Guest OS Kernel (1.5 - 2.0 GB RAM overhead)
              </div>
              <div className="p-2.5 rounded bg-purple-900/40 border border-purple-500/30 text-purple-300">
                Hypervisor (Hardware Emulation)
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                Physical Bare Hardware
              </div>
              <span className="text-[10px] text-slate-500 block pt-2">
                Startup: 30 - 60s | Isolation: Hardware-level
              </span>
            </div>

            {/* Container Stack */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-sm mb-2">Linux Container (Docker)</h4>
              <div className="p-2.5 rounded bg-emerald-900/40 border border-emerald-500/30 text-emerald-300">
                Application Code &amp; Libraries
              </div>
              <div className="p-2.5 rounded bg-blue-950/40 border border-blue-500/40 text-blue-300 font-bold">
                Namespaces (Isolation) + Cgroups (Quotas)
              </div>
              <div className="p-2.5 rounded bg-emerald-900/40 border border-emerald-500/40 text-emerald-300 font-bold">
                Shared Host Linux Kernel (~30 MB runtime overhead)
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                Physical Bare Hardware
              </div>
              <span className="text-[10px] text-slate-500 block pt-2">
                Startup: ~50 ms | Isolation: Kernel namespace-level
              </span>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 4. LINUX CGROUPS & NAMESPACES                                        */}
      {/* -------------------------------------------------------------------- */}
      {activeMode === 'CGROUPS_NAMESPACES' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              Linux Cgroups (Resource Throttling) &amp; Namespaces Inspector
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Control groups enforce CPU quotas and Memory hard limits. If memory exceeds the limit, the kernel OOM Killer immediately terminates the container.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cgroups Sliders */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4 font-mono text-xs">
              <span className="text-slate-400 font-bold block">
                Configure /sys/fs/cgroup Limits:
              </span>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">CPU CFS Quota:</span>
                  <span className="text-blue-400 font-bold">{cpuQuotaPct}% (0.5 Cores)</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={cpuQuotaPct}
                  onChange={e => setCpuQuotaPct(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">memory.max (Hard Limit):</span>
                  <span className="text-amber-400 font-bold">{memLimitMb} MB</span>
                </div>
                <input
                  type="range"
                  min={256}
                  max={1024}
                  step={64}
                  value={memLimitMb}
                  onChange={e => setMemLimitMb(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleSimulateBurst}
                  className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Simulate Memory Allocation (+150 MB)</span>
                </button>

                <button
                  onClick={handleResetCgroup}
                  className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                  title="Reset Cgroup"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Container Status & OOM Watch */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold block">
                  Container Resource Utilization:
                </span>
                {workloadActive && (
                  <span className="text-[10px] text-amber-400 font-mono font-bold">
                    [Burst Workload Active]
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-400">Memory Usage:</span>
                    <span className={isOomKilled ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {memUsageMb} MB / {memLimitMb} MB
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all ${isOomKilled ? 'bg-rose-500' : 'bg-blue-500'}`}
                      style={{ width: `${Math.min(100, (memUsageMb / memLimitMb) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">PID Namespace:</span>
                    <span className="text-white font-bold">PID 1 (Inside) ➔ PID 9412 (Host)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">NET Namespace:</span>
                    <span className="text-white font-bold">eth0 @ 172.17.0.2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mount Namespace:</span>
                    <span className="text-white font-bold">Private OverlayFS Root</span>
                  </div>
                </div>

                {isOomKilled ? (
                  <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500 text-rose-300 text-xs">
                    <strong>⚠️ KERNEL OOM-KILLER INVOKED!</strong><br />
                    Memory usage ({memUsageMb} MB) exceeded cgroup limit ({memLimitMb} MB).
                    The kernel sent SIGKILL (signal 9) to terminate the container and reclaim physical RAM!
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs">
                    ✓ Container operating within configured cgroup quotas.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
