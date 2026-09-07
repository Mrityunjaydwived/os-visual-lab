// Interactive 3D/2D Virtual Visual Laboratory Page with Dual Visual & Conceptual Simulation Modes
import React, { useState } from 'react';
import { useAppStore, type VisualLabTab } from '../core/store/useStore';
import { CpuSchedulerVisualizer } from '../components/visualizations/CpuSchedulerVisualizer';
import { ProcessLifecycleVisualizer } from '../components/visualizations/ProcessLifecycleVisualizer';
import { MemoryMapVisualizer } from '../components/visualizations/MemoryMapVisualizer';
import { PagingVisualizer } from '../components/visualizations/PagingVisualizer';
import { PageReplacementVisualizer } from '../components/visualizations/PageReplacementVisualizer';
import { CacheHierarchyVisualizer } from '../components/visualizations/CacheHierarchyVisualizer';
import { BankersDeadlockVisualizer } from '../components/visualizations/BankersDeadlockVisualizer';
import { SynchronizationVisualizer } from '../components/visualizations/SynchronizationVisualizer';
import { DiskSchedulingVisualizer } from '../components/visualizations/DiskSchedulingVisualizer';
import { FileSystemVisualizer } from '../components/visualizations/FileSystemVisualizer';
import { DmaInterruptVisualizer } from '../components/visualizations/DmaInterruptVisualizer';
import { RtosVisualizer } from '../components/visualizations/RtosVisualizer';
import { IpcProtectionVisualizer } from '../components/visualizations/IpcProtectionVisualizer';
import { VirtualizationCloudVisualizer } from '../components/visualizations/VirtualizationCloudVisualizer';
import { ConceptualSimulationViewer } from '../components/visualizations/ConceptualSimulationViewer';
import { 
  Eye, 
  Cpu, 
  Activity,
  Layers, 
  Grid, 
  RefreshCw, 
  Zap, 
  AlertTriangle, 
  Lock, 
  Compass, 
  FolderTree,
  Radio, 
  Clock,
  BookOpen,
  Share2,
  Server
} from 'lucide-react';

export const VisualLabPage: React.FC = () => {
  const { activeVisualLabTab, setVisualLabTab } = useAppStore();
  const [labMode, setLabMode] = useState<'VISUAL' | 'CONCEPTUAL'>('VISUAL');

  const tabs: { id: VisualLabTab; label: string; icon: React.ReactNode; moduleNumber: number }[] = [
    { id: 'cpu_scheduler', label: 'CPU Scheduling', icon: <Cpu className="w-4 h-4" />, moduleNumber: 4 },
    { id: 'process_lifecycle', label: 'Process & PCB', icon: <Activity className="w-4 h-4" />, moduleNumber: 2 },
    { id: 'memory_allocation', label: 'Memory Allocation', icon: <Layers className="w-4 h-4" />, moduleNumber: 8 },
    { id: 'paging_tlb', label: 'Paging & TLB', icon: <Grid className="w-4 h-4" />, moduleNumber: 9 },
    { id: 'page_replacement', label: 'Page Replacement', icon: <RefreshCw className="w-4 h-4" />, moduleNumber: 11 },
    { id: 'cache_hierarchy', label: 'Cache & AMAT', icon: <Zap className="w-4 h-4" />, moduleNumber: 13 },
    { id: 'bankers_deadlock', label: 'Deadlock & Banker', icon: <AlertTriangle className="w-4 h-4" />, moduleNumber: 7 },
    { id: 'synchronization', label: 'Synchronization', icon: <Lock className="w-4 h-4" />, moduleNumber: 5 },
    { id: 'ipc_protection', label: 'IPC & Protection', icon: <Share2 className="w-4 h-4" />, moduleNumber: 6 },
    { id: 'disk_scheduling', label: 'Disk Scheduling', icon: <Compass className="w-4 h-4" />, moduleNumber: 16 },
    { id: 'file_system', label: 'File System & Inodes', icon: <FolderTree className="w-4 h-4" />, moduleNumber: 18 },
    { id: 'dma_interrupt', label: 'DMA & Interrupts', icon: <Radio className="w-4 h-4" />, moduleNumber: 14 },
    { id: 'virtualization_cloud', label: 'Virtualization & Cloud', icon: <Server className="w-4 h-4" />, moduleNumber: 22 },
    { id: 'rtos_scheduler', label: 'RTOS (RMS / EDF)', icon: <Clock className="w-4 h-4" />, moduleNumber: 24 },
  ];

  const currentTabInfo = tabs.find(t => t.id === activeVisualLabTab) || tabs[0];

  return (
    <div className="space-y-6 py-4 select-none">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5 tracking-tight">
            <Eye className="w-6 h-6 text-blue-400" />
            Virtual OS Simulation Laboratory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Explore 14 interactive hardware &amp; kernel algorithm simulators with real-time controls and conceptual theory.
          </p>
        </div>

        {/* Global Simulation Mode Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setLabMode('VISUAL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              labMode === 'VISUAL'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Visual Simulation</span>
          </button>

          <button
            onClick={() => setLabMode('CONCEPTUAL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              labMode === 'CONCEPTUAL'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Conceptual Simulation &amp; Theory</span>
          </button>
        </div>
      </div>

      {/* Simulator Switcher Segmented Pill Bar */}
      <div className="p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {tabs.map(tab => {
          const isActive = activeVisualLabTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setVisualLabTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Mode Content: Visual Simulator vs Conceptual Theory */}
      <div className="min-h-[500px]">
        {labMode === 'VISUAL' ? (
          <div>
            {activeVisualLabTab === 'cpu_scheduler' && <CpuSchedulerVisualizer />}
            {activeVisualLabTab === 'process_lifecycle' && <ProcessLifecycleVisualizer />}
            {activeVisualLabTab === 'memory_allocation' && <MemoryMapVisualizer />}
            {activeVisualLabTab === 'paging_tlb' && <PagingVisualizer />}
            {activeVisualLabTab === 'page_replacement' && <PageReplacementVisualizer />}
            {activeVisualLabTab === 'cache_hierarchy' && <CacheHierarchyVisualizer />}
            {activeVisualLabTab === 'bankers_deadlock' && <BankersDeadlockVisualizer />}
            {activeVisualLabTab === 'synchronization' && <SynchronizationVisualizer />}
            {activeVisualLabTab === 'ipc_protection' && <IpcProtectionVisualizer />}
            {activeVisualLabTab === 'disk_scheduling' && <DiskSchedulingVisualizer />}
            {activeVisualLabTab === 'file_system' && <FileSystemVisualizer />}
            {activeVisualLabTab === 'dma_interrupt' && <DmaInterruptVisualizer />}
            {activeVisualLabTab === 'virtualization_cloud' && <VirtualizationCloudVisualizer />}
            {activeVisualLabTab === 'rtos_scheduler' && <RtosVisualizer />}
          </div>
        ) : (
          <ConceptualSimulationViewer 
            tabKey={activeVisualLabTab} 
            relatedModuleNumber={currentTabInfo.moduleNumber} 
          />
        )}
      </div>

    </div>
  );
};
