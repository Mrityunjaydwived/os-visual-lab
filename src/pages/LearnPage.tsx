// Complete Curriculum Learning Page with Comprehensive GFG-Standard Concepts, Visual Simulators, Practice Sandbox, and Worked Numericals
import React, { useState } from 'react';
import { useAppStore, type VisualLabTab } from '../core/store/useStore';
import { CURRICULUM_MODULES, type CurriculumModule } from '../core/curriculum/modulesData';
import { COMPLETE_STUDY_MATERIAL } from '../core/curriculum/completeStudyMaterial';
import { PracticeSandbox, type PracticeTopic } from '../components/practice/PracticeSandbox';
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
import { 
  BookOpen, 
  Lightbulb, 
  Eye, 
  Cpu, 
  Award, 
  CheckCircle2, 
  Search,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Calculator,
  HelpCircle,
  Table
} from 'lucide-react';

export type CurriculumTabId = 
  | 'CONCEPT_STUDY'
  | 'VISUAL_SIM'
  | 'PRACTICE_SANDBOX'
  | 'WORKED_NUMERICALS'
  | 'GATE_CORNER'
  | 'KERNEL_INTERNALS';

export const LearnPage: React.FC = () => {
  const { selectedModuleId, setSelectedModule, setSection, markModuleComplete, progress } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<CurriculumTabId>('CONCEPT_STUDY');

  // Categories
  const categories = ['All', 'Core Fundamentals', 'Processes & Concurrency', 'Memory & Storage', 'Hardware & I/O', 'Advanced & Modern'];

  // Filter modules
  const filteredModules = CURRICULUM_MODULES.filter(m => {
    const matchesCat = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const activeModule: CurriculumModule = 
    CURRICULUM_MODULES.find(m => m.id === selectedModuleId) || CURRICULUM_MODULES[0];

  const isCompleted = progress.completedModules.includes(activeModule.id);
  const studyGuide = COMPLETE_STUDY_MATERIAL[activeModule.number];

  // Map module to visualizer tab
  const getModuleVisualizerTab = (module: CurriculumModule): VisualLabTab => {
    if (module.visualizerId) {
      if (module.visualizerId === 'process_lifecycle') return 'process_lifecycle';
      if (module.visualizerId === 'file_system') return 'file_system';
      if (module.visualizerId === 'cpu_scheduler') return 'cpu_scheduler';
      if (module.visualizerId === 'memory_allocation') return 'memory_allocation';
      if (module.visualizerId === 'paging_tlb') return 'paging_tlb';
      if (module.visualizerId === 'page_replacement') return 'page_replacement';
      if (module.visualizerId === 'cache_hierarchy') return 'cache_hierarchy';
      if (module.visualizerId === 'bankers_deadlock') return 'bankers_deadlock';
      if (module.visualizerId === 'synchronization') return 'synchronization';
      if (module.visualizerId === 'disk_scheduling') return 'disk_scheduling';
      if (module.visualizerId === 'dma_interrupt') return 'dma_interrupt';
      if (module.visualizerId === 'rtos_scheduler') return 'rtos_scheduler';
    }

    if (module.number === 1 || module.number === 21) return 'dma_interrupt';
    if (module.number === 2 || module.number === 3) return 'process_lifecycle';
    if (module.number === 4) return 'cpu_scheduler';
    if (module.number === 5) return 'synchronization';
    if (module.number === 6 || module.number === 20) return 'ipc_protection';
    if (module.number === 7) return 'bankers_deadlock';
    if (module.number === 8) return 'memory_allocation';
    if (module.number === 9 || module.number === 10 || module.number === 12) return 'paging_tlb';
    if (module.number === 11) return 'page_replacement';
    if (module.number === 13) return 'cache_hierarchy';
    if (module.number === 14) return 'dma_interrupt';
    if (module.number === 15 || module.number === 16) return 'disk_scheduling';
    if (module.number === 17 || module.number === 18 || module.number === 19) return 'file_system';
    if (module.number === 22 || module.number === 23) return 'virtualization_cloud';
    if (module.number === 24) return 'rtos_scheduler';
    return 'cpu_scheduler';
  };

  const currentVisualizerTab = getModuleVisualizerTab(activeModule);

  // Map module to practice sandbox topic
  const getPracticeTopic = (moduleNum: number): PracticeTopic => {
    if (moduleNum === 4 || moduleNum === 2 || moduleNum === 3) return 'CPU_SCHEDULING';
    if (moduleNum === 11) return 'PAGE_REPLACEMENT';
    if (moduleNum === 15 || moduleNum === 16) return 'DISK_SCHEDULING';
    if (moduleNum === 8 || moduleNum === 17 || moduleNum === 18 || moduleNum === 19) return 'MEMORY_ALLOCATION';
    if (moduleNum === 9 || moduleNum === 10 || moduleNum === 12 || moduleNum === 13) return 'PAGING_MATH';
    return 'CPU_SCHEDULING';
  };

  const renderEmbeddedVisualizer = (tab: VisualLabTab) => {
    switch (tab) {
      case 'cpu_scheduler': return <CpuSchedulerVisualizer />;
      case 'process_lifecycle': return <ProcessLifecycleVisualizer />;
      case 'memory_allocation': return <MemoryMapVisualizer />;
      case 'paging_tlb': return <PagingVisualizer />;
      case 'page_replacement': return <PageReplacementVisualizer />;
      case 'cache_hierarchy': return <CacheHierarchyVisualizer />;
      case 'bankers_deadlock': return <BankersDeadlockVisualizer />;
      case 'synchronization': return <SynchronizationVisualizer />;
      case 'ipc_protection': return <IpcProtectionVisualizer />;
      case 'disk_scheduling': return <DiskSchedulingVisualizer />;
      case 'file_system': return <FileSystemVisualizer />;
      case 'dma_interrupt': return <DmaInterruptVisualizer />;
      case 'virtualization_cloud': return <VirtualizationCloudVisualizer />;
      case 'rtos_scheduler': return <RtosVisualizer />;
      default: return <CpuSchedulerVisualizer />;
    }
  };

  return (
    <div className="space-y-6 py-4 select-none">
      
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5 tracking-tight">
            <BookOpen className="w-6 h-6 text-blue-400" />
            24-Module Operating Systems Master Curriculum
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete study material, comparison tables, interactive visualizers, custom practice sandboxes, and worked numerical proofs.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-slate-400">Curriculum Mastery:</span>
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold">
            {progress.completedModules.length} / {CURRICULUM_MODULES.length} Completed
          </span>
        </div>
      </div>

      {/* Main Grid: Modules Navigation Sidebar vs Module Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Sidebar: Modules List (Col 4) */}
        <div className="lg:col-span-4 space-y-3">
          
          {/* Search & Category Filter */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter by topic or keyword..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-1 rounded-md text-[10px] font-mono transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white font-bold shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Module Cards Scrollable Column */}
          <div className="space-y-1.5 max-h-[720px] overflow-y-auto pr-1">
            {filteredModules.map(m => {
              const isSelected = m.id === activeModule.id;
              const completed = progress.completedModules.includes(m.id);

              return (
                <div
                  key={m.id}
                  onClick={() => {
                    setSelectedModule(m.id);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-blue-400 font-bold">
                      Module {m.number < 10 ? `0${m.number}` : m.number}
                    </span>
                    {completed && (
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Done
                      </span>
                    )}
                  </div>
                  <h4 className={`text-xs font-semibold leading-snug ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {m.title}
                  </h4>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/80 text-[10px] font-mono text-slate-500">
                    <span>{m.category}</span>
                    <span>{m.topics.length} topics</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Content Area: Module Detail & Tabs (Col 8) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Module Header Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
                Module {activeModule.number}: {activeModule.category}
              </span>

              <button
                onClick={() => markModuleComplete(activeModule.id)}
                className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isCompleted
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isCompleted ? 'Completed (+100 XP)' : 'Mark Complete (+100 XP)'}</span>
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {activeModule.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              {activeModule.description}
            </p>

            {/* Key Formulas if available */}
            {activeModule.keyFormulas && activeModule.keyFormulas.length > 0 && (
              <div className="mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                <span className="text-[10px] uppercase font-bold text-blue-400 block mb-1">
                  Core Mathematical Invariants &amp; Rules:
                </span>
                {activeModule.keyFormulas.map((f, idx) => (
                  <div key={idx} className="text-slate-300 font-medium">
                    › {f}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Curriculum View Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 overflow-x-auto text-xs font-medium scrollbar-none">
            {[
              { id: 'CONCEPT_STUDY', label: '1. Complete Study Guide', icon: <BookOpen className="w-3.5 h-3.5" /> },
              { id: 'VISUAL_SIM', label: '2. Visual Simulator', icon: <Eye className="w-3.5 h-3.5" /> },
              { id: 'PRACTICE_SANDBOX', label: '3. Practice Sandbox', icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" /> },
              { id: 'WORKED_NUMERICALS', label: '4. Numericals & Conceptual Qs', icon: <Calculator className="w-3.5 h-3.5" /> },
              { id: 'GATE_CORNER', label: '5. GATE CS Exam Corner', icon: <Award className="w-3.5 h-3.5" /> },
              { id: 'KERNEL_INTERNALS', label: '6. Kernel Internals', icon: <Cpu className="w-3.5 h-3.5" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as CurriculumTabId)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content Panels */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm text-xs space-y-6">
            
            {/* -------------------------------------------------------------- */}
            {/* 1. COMPLETE STUDY GUIDE TAB                                    */}
            {/* -------------------------------------------------------------- */}
            {activeTab === 'CONCEPT_STUDY' && (
              <div className="space-y-6 font-sans leading-relaxed text-sm">
                
                {/* Basic Summary & Real-World Analogy */}
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30">
                    <h5 className="font-bold text-blue-300 text-xs uppercase font-mono mb-1 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5" /> Real-World Mental Model &amp; Analogy:
                    </h5>
                    <p className="text-slate-300 italic text-xs leading-relaxed">
                      "{activeModule.progressiveContent.basic.analogy}"
                    </p>
                  </div>

                  <p className="text-slate-200 text-xs leading-relaxed">
                    {activeModule.progressiveContent.basic.summary}
                  </p>
                </div>

                {/* In-Depth Theory Sections (GFG Standard) */}
                {studyGuide && studyGuide.inDepthTheory && (
                  <div className="space-y-4 pt-2 border-t border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 font-mono">
                      In-Depth Academic &amp; Technical Breakdown
                    </h4>

                    {studyGuide.inDepthTheory.map((sec, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <h5 className="font-bold text-white text-xs font-mono">
                          {sec.sectionTitle}
                        </h5>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {sec.content}
                        </p>
                        {sec.bulletPoints && (
                          <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs pt-1">
                            {sec.bulletPoints.map((bp, bIdx) => (
                              <li key={bIdx}>{bp}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Comparison Tables */}
                {studyGuide && studyGuide.comparisons && studyGuide.comparisons.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-slate-800 font-mono">
                    {studyGuide.comparisons.map((tbl, tIdx) => (
                      <div key={tIdx} className="space-y-2">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Table className="w-3.5 h-3.5 text-blue-400" />
                          {tbl.title}
                        </span>

                        <div className="overflow-x-auto rounded-xl border border-slate-800">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 text-[11px]">
                                {tbl.headers.map((h, hIdx) => (
                                  <th key={hIdx} className="py-2.5 px-3 font-bold">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 bg-slate-900/60 text-slate-300 text-[11px]">
                              {tbl.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-slate-800/40">
                                  <td className="py-2 px-3 font-semibold text-blue-400">{row[0]}</td>
                                  <td className="py-2 px-3">{row[1]}</td>
                                  <td className="py-2 px-3 text-slate-400">{row[2]}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* From Concept to Simulation Section */}
                {studyGuide && studyGuide.conceptToSimulationGuide && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      From Concept to Simulation: Connecting Theory to the Simulator
                    </h5>
                    
                    <div className="space-y-2 text-xs">
                      {studyGuide.conceptToSimulationGuide.map((mapItem, mIdx) => (
                        <div key={mIdx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{mapItem.simulationElement}</span>
                            <span className="text-[10px] text-blue-400 font-semibold">{mapItem.osKernelEquivalent}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                            {mapItem.whyItMatters}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Terminology Grid */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <h5 className="font-bold text-slate-200 text-xs uppercase font-mono">
                    Key Definitions:
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeModule.progressiveContent.basic.keyConcepts.map((kc, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <strong className="text-blue-300 block mb-1 font-mono text-xs">{kc.name}</strong>
                        <span className="text-slate-400 text-[11px] leading-relaxed">{kc.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-slate-800">
                  <span className="text-xs text-slate-400 font-mono">Ready to experiment with the live simulator?</span>
                  <button
                    onClick={() => setActiveTab('VISUAL_SIM')}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Launch Visual Simulator ➔</span>
                  </button>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------- */}
            {/* 2. VISUAL SIMULATION TAB                                       */}
            {/* -------------------------------------------------------------- */}
            {activeTab === 'VISUAL_SIM' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-bold">Interactive Hardware Visualizer</span>
                  </div>

                  <button
                    onClick={() => setSection('VISUAL_LAB', currentVisualizerTab)}
                    className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Open Full Screen in Visual Lab</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <div className="pt-1">
                  {renderEmbeddedVisualizer(currentVisualizerTab)}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------- */}
            {/* 3. CUSTOM PRACTICE SANDBOX TAB                                 */}
            {/* -------------------------------------------------------------- */}
            {activeTab === 'PRACTICE_SANDBOX' && (
              <div className="space-y-4">
                <PracticeSandbox initialTopic={getPracticeTopic(activeModule.number)} />
              </div>
            )}

            {/* -------------------------------------------------------------- */}
            {/* 4. WORKED NUMERICAL PROBLEMS TAB                               */}
            {/* -------------------------------------------------------------- */}
            {activeTab === 'WORKED_NUMERICALS' && (
              <div className="space-y-5 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-blue-400" />
                    Step-by-Step Worked Numerical Problems
                  </h4>
                  <span className="text-[10px] text-slate-500">Deterministic Mathematical Proofs</span>
                </div>

                {studyGuide && studyGuide.workedNumericals && studyGuide.workedNumericals.length > 0 ? (
                  studyGuide.workedNumericals.map((num, idx) => (
                    <div key={idx} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{num.title}</span>
                        {num.gateYear && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            {num.gateYear}
                          </span>
                        )}
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-sans leading-relaxed text-xs">
                        <strong>Problem Statement:</strong><br />
                        <span className="text-slate-300 font-mono whitespace-pre-wrap">{num.problemStatement}</span>
                      </div>

                      {/* Formulas Used */}
                      <div className="space-y-1 text-[11px]">
                        <span className="text-blue-400 font-bold block">Key Formulas Applied:</span>
                        {num.formulasUsed.map((f, fIdx) => (
                          <div key={fIdx} className="p-1.5 rounded bg-slate-900 text-blue-300">
                            › {f}
                          </div>
                        ))}
                      </div>

                      {/* Step by Step Solution */}
                      <div className="space-y-1.5 pt-1 text-slate-300">
                        <span className="text-emerald-400 font-bold block text-[11px]">Step-by-Step Mathematical Derivation:</span>
                        {num.stepByStepSolution.map((step, sIdx) => (
                          <div key={sIdx} className="p-2 rounded bg-slate-900/60 border border-slate-800/80 leading-relaxed">
                            {step}
                          </div>
                        ))}
                      </div>

                      {/* Final Verified Answer */}
                      <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-bold text-xs">
                        ✓ Final Answer: {num.finalAnswer}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-400 space-y-2">
                    <Calculator className="w-8 h-8 text-blue-400 mx-auto opacity-50" />
                    <p className="text-sm text-slate-300">Worked numerical problem for Module {activeModule.number}</p>
                    <p className="text-xs text-slate-500">
                      You can practice custom calculations in the Practice Sandbox tab!
                    </p>
                    <button
                      onClick={() => setActiveTab('PRACTICE_SANDBOX')}
                      className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-medium text-xs mt-2"
                    >
                      Open Practice Sandbox
                    </button>
                  </div>
                )}

                {/* Section B: Conceptual & GATE Deep-Dive Questions */}
                {studyGuide && studyGuide.conceptualQuestions && studyGuide.conceptualQuestions.length > 0 && (
                  <div className="space-y-4 pt-6 border-t border-slate-800">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-400" />
                        In-Depth Conceptual, Interview &amp; GATE Questions
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">Exam Analysis &amp; Trap Detection</span>
                    </div>

                    {studyGuide.conceptualQuestions.map((q, qIdx) => (
                      <div key={qIdx} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-sans">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {q.category}
                          </span>
                        </div>

                        <h5 className="text-xs sm:text-sm font-bold text-white leading-snug">
                          {q.question}
                        </h5>

                        <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs leading-relaxed space-y-1.5">
                          <strong className="text-emerald-400 block font-mono text-[11px] uppercase tracking-wider">
                            Comprehensive Solution &amp; Conceptual Analysis:
                          </strong>
                          <p>{q.explanation}</p>
                        </div>

                        {q.commonTrap && (
                          <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs leading-relaxed">
                            <strong className="font-mono font-bold text-rose-400 text-[11px] block uppercase tracking-wider">
                              ⚠️ Common Trap &amp; Exam Misconception:
                            </strong>
                            <span>{q.commonTrap}</span>
                          </div>
                        )}

                        <div className="p-2.5 rounded-lg bg-blue-950/20 border border-blue-500/20 text-blue-300 text-xs font-mono">
                          <span className="text-blue-400 font-bold">Key Takeaway: </span>
                          <span>{q.keyTakeaway}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* -------------------------------------------------------------- */}
            {/* 5. GATE CS EXAM CORNER TAB                                     */}
            {/* -------------------------------------------------------------- */}
            {activeTab === 'GATE_CORNER' && (
              <div className="space-y-4 font-sans leading-relaxed">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono">
                  <span className="text-amber-400 font-bold">GATE CS Syllabus Weightage:</span>
                  <span className="text-slate-300">{activeModule.gateWeightage}</span>
                </div>

                <div>
                  <h5 className="font-bold text-slate-200 text-xs uppercase font-mono mb-2">
                    Frequently Tested Concepts:
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs">
                    {activeModule.progressiveContent.gate.frequentQuestions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs leading-relaxed">
                  <strong className="block mb-1 font-mono uppercase font-bold text-rose-400">
                    ⚠️ Common Traps &amp; Pitfalls in GATE:
                  </strong>
                  <ul className="list-disc list-inside space-y-1">
                    {activeModule.progressiveContent.gate.commonTraps.map((trap, idx) => (
                      <li key={idx}>{trap}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 flex justify-between items-center font-mono">
                  <span className="text-slate-400 text-xs">Practice 36+ verified previous year questions:</span>
                  <button
                    onClick={() => setSection('GATE_ARENA')}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Practice GATE Questions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------- */}
            {/* 6. KERNEL INTERNALS TAB                                        */}
            {/* -------------------------------------------------------------- */}
            {activeTab === 'KERNEL_INTERNALS' && (
              <div className="space-y-4 leading-relaxed font-sans">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 font-mono mb-1">
                    Kernel Internals &amp; Implementation Details
                  </h4>
                  <p className="text-slate-300 text-sm">
                    {activeModule.progressiveContent.advanced.kernelDetails}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h5 className="font-bold text-slate-200 text-xs uppercase font-mono mb-2">
                    Corner Cases &amp; Critical Hazards:
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs">
                    {activeModule.progressiveContent.advanced.edgeCases.map((ec, idx) => (
                      <li key={idx}>{ec}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-bold text-slate-200 text-xs uppercase font-mono mb-2">
                    Kernel Data Structures:
                  </h5>
                  <div className="flex flex-wrap gap-2 font-mono">
                    {activeModule.progressiveContent.advanced.dataStructures.map((ds, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-blue-400 text-xs">
                        {ds}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-400">
                  <span className="text-emerald-400 font-bold block mb-1">Modern Production Systems:</span>
                  {activeModule.progressiveContent.expert.modernOSImpl}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
