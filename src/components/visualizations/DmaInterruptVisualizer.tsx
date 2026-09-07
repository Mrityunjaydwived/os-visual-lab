// DMA & Hardware Interrupt Controller Visualizer
import React, { useState } from 'react';
import { Radio } from 'lucide-react';

export const DmaInterruptVisualizer: React.FC = () => {
  const [ioMode, setIoMode] = useState<'POLLING' | 'INTERRUPT' | 'DMA'>('DMA');
  const [activeStage, setActiveStage] = useState<number>(0);
  const [dataTransferProgress] = useState<number>(65);

  const interruptStages = [
    { step: 1, title: 'Device Asserts IRQ Line', desc: 'Keyboard or NIC finishes receiving packet, raising physical interrupt pin on the APIC.' },
    { step: 2, title: 'CPU Completes Current Instruction', desc: 'Hardware finishes executing current micro-op before checking interrupt line status.' },
    { step: 3, title: 'Hardware Context Save', desc: 'CPU automatically pushes Program Counter (PC), SP, and RFLAGS onto the kernel stack.' },
    { step: 4, title: 'IVT / IDT Lookup', desc: 'CPU queries Interrupt Vector Table index to retrieve pointer to the registered ISR handler.' },
    { step: 5, title: 'Execute Interrupt Service Routine (ISR)', desc: 'Kernel top-half executes privileged driver code and services device buffers.' },
    { step: 6, title: 'IRET & Resume User Code', desc: 'Interrupt Return instruction pops hardware registers and restores user process seamlessly.' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Header & I/O Mode Switcher */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            Interrupts, Traps & DMA Architecture
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Step through hardware interrupt vector handling and direct memory access (DMA) bus cycle stealing
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          {[
            { id: 'POLLING', label: 'Programmed I/O (Polling)' },
            { id: 'INTERRUPT', label: 'Interrupt-Driven I/O' },
            { id: 'DMA', label: 'Direct Memory Access (DMA)' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => {
                setIoMode(m.id as any);
                setActiveStage(0);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                ioMode === m.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {ioMode === 'INTERRUPT' ? (
        /* INTERRUPT VECTOR LIFECYCLE STEPPER */
        <div className="space-y-6">
          
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Hardware Interrupt Execution Lifecycle
            </h3>

            {/* Stepper Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
              {interruptStages.map((stage, idx) => (
                <div
                  key={stage.step}
                  onClick={() => setActiveStage(idx)}
                  className={`p-3 rounded-xl border flex flex-col justify-between transition-all cursor-pointer font-mono text-xs ${
                    activeStage === idx
                      ? 'bg-cyan-950/40 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)] scale-105'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-slate-500">Step {stage.step}</span>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeStage === idx ? '#00f0ff' : '#475569' }} />
                  </div>
                  <div className="font-bold leading-tight">{stage.title}</div>
                </div>
              ))}
            </div>

            {/* Detailed Description of Selected Stage */}
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 text-xs font-mono">
              <span className="text-cyan-400 font-bold block mb-1">
                Stage {activeStage + 1}: {interruptStages[activeStage].title}
              </span>
              <p className="text-slate-300 font-sans leading-relaxed text-sm">
                {interruptStages[activeStage].desc}
              </p>
            </div>
          </div>

        </div>
      ) : ioMode === 'DMA' ? (
        /* DMA DIRECT MEMORY ACCESS SIMULATOR */
        <div className="space-y-6">
          
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                DMA Controller (DMAC) Memory Bus Bypass
              </span>
              <span className="text-xs font-mono text-emerald-400">
                CPU Overhead: &lt; 2% (Cycle Stealing Mode)
              </span>
            </div>

            {/* Architecture Pipeline Map */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center my-6 text-center font-mono">
              
              {/* Device */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">High-Speed I/O</span>
                <div className="text-sm font-bold text-cyan-300 my-1">NVMe SSD / NIC</div>
                <span className="text-[10px] text-slate-400">Transfers 100 MB</span>
              </div>

              {/* DMA Controller */}
              <div className="p-4 rounded-xl bg-purple-950/30 border-2 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                <span className="text-[10px] text-purple-400 uppercase font-bold block">Hardware DMAC</span>
                <div className="text-sm font-bold text-purple-300 my-1">Bus Master</div>
                <span className="text-[10px] text-emerald-400">Pumping Data directly</span>
              </div>

              {/* RAM */}
              <div className="p-4 rounded-xl bg-emerald-950/30 border-2 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">Destination</span>
                <div className="text-sm font-bold text-emerald-300 my-1">Physical RAM</div>
                <span className="text-[10px] text-slate-400">Receives bytes</span>
              </div>

              {/* CPU (Free to execute other tasks) */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">CPU State</span>
                <div className="text-sm font-bold text-slate-200 my-1">Running App Threads</div>
                <span className="text-[10px] text-cyan-400">Zero Busy Waiting</span>
              </div>

            </div>

            {/* Progress Bar */}
            <div className="mt-6 pt-4 border-t border-slate-800 font-mono text-xs">
              <div className="flex justify-between text-slate-400 mb-1">
                <span>DMA Block Transfer in Progress:</span>
                <span className="text-cyan-300 font-bold">{dataTransferProgress}%</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${dataTransferProgress}%` }}
                />
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* POLLING COMPARISON */
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs font-mono">
            <span className="font-bold text-sm block mb-1">⚠️ Polling (Programmed I/O) Inefficiency:</span>
            The CPU repeatedly queries device status registers in a tight `while (device.busy)` loop. CPU utilization is 100%, but 0 useful user instructions are executed.
          </div>
        </div>
      )}

    </div>
  );
};
