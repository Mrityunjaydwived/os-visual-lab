// Paging & TLB Address Translation Visualizer
import React, { useState } from 'react';
import { Grid, Zap, HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';

interface PageTableEntry {
  pageNumber: number;
  frameNumber: number;
  valid: boolean;
}

interface TlbEntry {
  pageNumber: number;
  frameNumber: number;
}

const DEFAULT_PAGE_TABLE: PageTableEntry[] = [
  { pageNumber: 0, frameNumber: 5, valid: true },
  { pageNumber: 1, frameNumber: 12, valid: true },
  { pageNumber: 2, frameNumber: 3, valid: true },
  { pageNumber: 3, frameNumber: 0, valid: false }, // Page fault
  { pageNumber: 4, frameNumber: 8, valid: true },
  { pageNumber: 5, frameNumber: 1, valid: true },
  { pageNumber: 6, frameNumber: 0, valid: false },
  { pageNumber: 7, frameNumber: 15, valid: true },
];

const INITIAL_TLB: TlbEntry[] = [
  { pageNumber: 0, frameNumber: 5 },
  { pageNumber: 2, frameNumber: 3 },
  { pageNumber: 5, frameNumber: 1 },
  { pageNumber: 7, frameNumber: 15 }
];

export const PagingVisualizer: React.FC = () => {
  const [pageSizeKB, setPageSizeKB] = useState<number>(4); // 4 KB
  const [virtualAddress, setVirtualAddress] = useState<number>(8520); // sample decimal address
  const [tlbHitRatio, setTlbHitRatio] = useState<number>(90); // 90%
  const [tlbTimeNs, setTlbTimeNs] = useState<number>(10);
  const [memTimeNs, setMemTimeNs] = useState<number>(100);

  const [pageTable] = useState<PageTableEntry[]>(DEFAULT_PAGE_TABLE);
  const [tlb] = useState<TlbEntry[]>(INITIAL_TLB);

  // Address calculations
  const pageSizeBytes = pageSizeKB * 1024;
  const offsetBits = Math.log2(pageSizeBytes);
  const pageNumber = Math.floor(virtualAddress / pageSizeBytes);
  const offset = virtualAddress % pageSizeBytes;

  // TLB check
  const tlbMatch = tlb.find(t => t.pageNumber === pageNumber);
  const isTlbHit = Boolean(tlbMatch);

  // Page Table check
  const pte = pageTable.find(p => p.pageNumber === pageNumber);
  const isPageFault = !pte || !pte.valid;
  const frameNumber = isTlbHit ? tlbMatch!.frameNumber : (pte && pte.valid ? pte.frameNumber : null);
  const physicalAddress = frameNumber !== null ? (frameNumber * pageSizeBytes) + offset : null;

  // EMAT Calculation
  const h = tlbHitRatio / 100;
  const emat = (h * (tlbTimeNs + memTimeNs)) + ((1 - h) * (tlbTimeNs + 2 * memTimeNs));

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Grid className="w-5 h-5 text-cyan-400" />
            Virtual Memory Paging & TLB Address Translation
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Step through MMU translation from Virtual Address to Physical Frame with TLB lookup and EMAT
          </p>
        </div>

        {/* Page Size Config */}
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
          <span className="text-slate-400">Page Size:</span>
          <select
            value={pageSizeKB}
            onChange={e => setPageSizeKB(parseInt(e.target.value))}
            className="bg-slate-900 text-cyan-300 font-mono rounded px-2 py-0.5 border border-slate-700 focus:outline-none"
          >
            <option value="1">1 KB (10 offset bits)</option>
            <option value="2">2 KB (11 offset bits)</option>
            <option value="4">4 KB (12 offset bits)</option>
            <option value="8">8 KB (13 offset bits)</option>
          </select>
        </div>
      </div>

      {/* Address Input & Bit Decomposition Card */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Virtual Address Decoder
            </span>
            <span className="text-xs text-slate-500 ml-2 font-mono">
              (Binary split into Page Number and Offset)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Input Decimal Address:</span>
            <input
              type="number"
              min="0"
              max="65535"
              value={virtualAddress}
              onChange={e => setVirtualAddress(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-28 bg-slate-950 text-cyan-300 font-mono text-sm px-2.5 py-1 rounded-lg border border-slate-700 focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Visual Binary Split Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Page Number (VPN) */}
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-center">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
              Virtual Page Number (VPN)
            </span>
            <div className="text-2xl font-black text-cyan-300 font-mono my-1">
              Page #{pageNumber}
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Formula: floor({virtualAddress} / {pageSizeBytes})
            </span>
          </div>

          {/* Offset (d) */}
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 text-center">
            <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block">
              Page Byte Offset (d)
            </span>
            <div className="text-2xl font-black text-purple-300 font-mono my-1">
              {offset} bytes
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Formula: {virtualAddress} mod {pageSizeBytes} ({offsetBits} bits)
            </span>
          </div>

        </div>
      </div>

      {/* Translation Pipeline: TLB -> Page Table -> Physical Address */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TLB Cache Box */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                TLB Associative Cache
              </span>
              {isTlbHit ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> TLB HIT
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> TLB MISS
                </span>
              )}
            </div>

            <div className="mt-3 space-y-1 font-mono text-xs">
              <div className="grid grid-cols-2 text-[10px] text-slate-500 pb-1 border-b border-slate-800">
                <span>Page #</span>
                <span>Frame #</span>
              </div>
              {tlb.map((entry, idx) => {
                const isMatch = entry.pageNumber === pageNumber;
                return (
                  <div
                    key={idx}
                    className={`grid grid-cols-2 p-1.5 rounded transition-colors ${
                      isMatch
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                        : 'text-slate-400'
                    }`}
                  >
                    <span>Page {entry.pageNumber}</span>
                    <span>Frame {entry.frameNumber}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800 leading-relaxed font-sans">
            {isTlbHit ? (
              <span className="text-emerald-400">
                ⚡ TLB Hit! Frame {tlbMatch?.frameNumber} retrieved directly in {tlbTimeNs} ns without reading RAM page table.
              </span>
            ) : (
              <span className="text-slate-400">
                TLB Miss. MMU must make an extra memory access to read the Page Table from RAM.
              </span>
            )}
          </div>
        </div>

        {/* Page Table in Main Memory */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Page Table in RAM
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                8 Entries Loaded
              </span>
            </div>

            <div className="mt-3 space-y-1 font-mono text-xs max-h-48 overflow-y-auto">
              <div className="grid grid-cols-3 text-[10px] text-slate-500 pb-1 border-b border-slate-800">
                <span>Page</span>
                <span>Frame</span>
                <span className="text-right">Valid</span>
              </div>
              {pageTable.map((entry) => {
                const isCurrent = entry.pageNumber === pageNumber;
                return (
                  <div
                    key={entry.pageNumber}
                    className={`grid grid-cols-3 p-1.5 rounded transition-colors ${
                      isCurrent
                        ? entry.valid
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                          : 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40'
                        : 'text-slate-400'
                    }`}
                  >
                    <span>P{entry.pageNumber}</span>
                    <span>{entry.valid ? `F${entry.frameNumber}` : '—'}</span>
                    <span className={`text-right ${entry.valid ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {entry.valid ? '1' : '0 (Fault)'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] mt-3 pt-2 border-t border-slate-800 font-sans">
            {isPageFault ? (
              <span className="text-rose-400 font-semibold">
                ⚠️ PAGE FAULT! Page {pageNumber} has Valid Bit = 0. Operating system must swap page from disk!
              </span>
            ) : (
              <span className="text-emerald-400">
                ✓ Valid entry found: Page {pageNumber} maps to Physical Frame {pte?.frameNumber}.
              </span>
            )}
          </div>
        </div>

        {/* Physical Address Result */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#060a14] border border-cyan-500/30 flex flex-col justify-between shadow-xl">
          <div>
            <div className="pb-2 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-200">
              Synthesized Physical Address
            </div>

            <div className="my-6 text-center">
              {physicalAddress !== null ? (
                <div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    Physical RAM Address
                  </div>
                  <div className="text-2xl font-black text-emerald-400 font-mono my-1">
                    {physicalAddress}
                  </div>
                  <div className="text-xs font-mono text-cyan-300">
                    Hex: 0x{physicalAddress.toString(16).toUpperCase()}
                  </div>
                  <div className="mt-3 inline-block px-3 py-1 rounded bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300">
                    Frame {frameNumber} × {pageSizeBytes} + Offset {offset}
                  </div>
                </div>
              ) : (
                <div className="text-rose-400 font-mono text-xs p-4 bg-rose-950/20 border border-rose-500/30 rounded-xl">
                  <span>CANNOT RESOLVE:</span>
                  <div className="text-sm font-bold mt-1">Page Fault Trap Initiated</div>
                </div>
              )}
            </div>
          </div>

          {/* Formula Rationale */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400">
            <span className="text-cyan-400 block text-[10px] uppercase font-bold">Translation Formula</span>
            PA = (Frame_Number &lt;&lt; {offsetBits}) | Offset
          </div>
        </div>

      </div>

      {/* Effective Memory Access Time (EMAT) Calculator Card */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-purple-400" />
          Effective Memory Access Time (EMAT) Numerical Calculator
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              TLB Hit Ratio: <strong className="text-cyan-300">{tlbHitRatio}%</strong>
            </label>
            <input
              type="range"
              min="50"
              max="99"
              value={tlbHitRatio}
              onChange={e => setTlbHitRatio(parseInt(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              TLB Access Time: <strong className="text-purple-300">{tlbTimeNs} ns</strong>
            </label>
            <input
              type="number"
              min="1"
              value={tlbTimeNs}
              onChange={e => setTlbTimeNs(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              RAM Access Time: <strong className="text-emerald-300">{memTimeNs} ns</strong>
            </label>
            <input
              type="number"
              min="10"
              value={memTimeNs}
              onChange={e => setMemTimeNs(Math.max(10, parseInt(e.target.value) || 10))}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/30 text-center font-mono">
            <span className="text-[10px] text-slate-500 uppercase block">Calculated EMAT</span>
            <span className="text-xl font-black text-purple-300">{emat.toFixed(2)} ns</span>
          </div>

        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <span>Formula: EMAT = h × (t_TLB + t_MEM) + (1 - h) × (t_TLB + 2 × t_MEM)</span>
          <span className="text-cyan-400">Single-level page table model</span>
        </div>
      </div>

    </div>
  );
};
