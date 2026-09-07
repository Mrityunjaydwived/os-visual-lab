// Interactive File System & Inode Allocation Visualizer
import React, { useState } from 'react';
import { 
  FolderTree, 
  FileText, 
  Plus, 
  Trash2, 
  HardDrive, 
  BookOpen, 
  AlertTriangle 
} from 'lucide-react';

export type AllocationType = 'CONTIGUOUS' | 'LINKED' | 'INDEXED_INODE';

export interface FileEntry {
  id: string;
  name: string;
  sizeBlocks: number;
  color: string;
  startBlock?: number;
  blocks: number[];
  inode?: {
    directBlocks: number[];
    singleIndirectBlock?: number;
    indirectBlocks: number[];
    permissions: string;
    uid: number;
  };
}

export const FileSystemVisualizer: React.FC = () => {
  const [mode, setMode] = useState<'VISUAL' | 'CONCEPT'>('VISUAL');
  const [allocationType, setAllocationType] = useState<AllocationType>('INDEXED_INODE');
  const TOTAL_BLOCKS = 64;

  const [files, setFiles] = useState<FileEntry[]>([
    {
      id: 'f1',
      name: 'kernel.bin',
      sizeBlocks: 6,
      color: '#3B82F6',
      startBlock: 0,
      blocks: [0, 1, 2, 3, 4, 5],
      inode: {
        directBlocks: [0, 1, 2, 3, 4, 5],
        permissions: '-rwxr-xr-x',
        uid: 0,
        indirectBlocks: []
      }
    },
    {
      id: 'f2',
      name: 'database.sqlite',
      sizeBlocks: 4,
      color: '#F59E0B',
      startBlock: 8,
      blocks: [8, 9, 10, 11],
      inode: {
        directBlocks: [8, 9, 10, 11],
        permissions: '-rw-r--r--',
        uid: 1000,
        indirectBlocks: []
      }
    },
    {
      id: 'f3',
      name: 'app.log',
      sizeBlocks: 3,
      color: '#10B981',
      startBlock: 14,
      blocks: [14, 15, 16],
      inode: {
        directBlocks: [14, 15, 16],
        permissions: '-rw-rw-r--',
        uid: 1000,
        indirectBlocks: []
      }
    }
  ]);

  const [newFileName, setNewFileName] = useState('notes.txt');
  const [newFileSize, setNewFileSize] = useState(4);
  const [selectedFileId, setSelectedFileId] = useState<string>('f1');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute occupied disk blocks map
  const blockMap: { fileId: string; color: string; blockIndexInFile: number }[] = new Array(TOTAL_BLOCKS).fill(null);

  files.forEach(f => {
    f.blocks.forEach((blkIdx, i) => {
      if (blkIdx < TOTAL_BLOCKS) {
        blockMap[blkIdx] = { fileId: f.id, color: f.color, blockIndexInFile: i };
      }
    });
  });

  const freeBlockCount = blockMap.filter(b => b === null).length;
  const usedBlockCount = TOTAL_BLOCKS - freeBlockCount;

  const selectedFile = files.find(f => f.id === selectedFileId) || files[0];

  const handleCreateFile = () => {
    setErrorMessage(null);
    if (!newFileName.trim()) return;
    if (newFileSize > freeBlockCount) {
      setErrorMessage(`Not enough free disk blocks! Requested ${newFileSize}, but only ${freeBlockCount} free.`);
      return;
    }

    const colors = ['#3B82F6', '#F59E0B', '#10B981', '#6366F1', '#EC4899', '#06B6D4'];
    const chosenColor = colors[files.length % colors.length];

    if (allocationType === 'CONTIGUOUS') {
      // Find contiguous run of free blocks
      let runStart = -1;
      let runLen = 0;

      for (let i = 0; i < TOTAL_BLOCKS; i++) {
        if (blockMap[i] === null) {
          if (runLen === 0) runStart = i;
          runLen++;
          if (runLen === newFileSize) break;
        } else {
          runLen = 0;
          runStart = -1;
        }
      }

      if (runLen < newFileSize) {
        setErrorMessage(`Contiguous Allocation Failed! External fragmentation prevents finding a continuous chunk of ${newFileSize} blocks.`);
        return;
      }

      const allocatedBlocks = Array.from({ length: newFileSize }, (_, i) => runStart + i);
      const newFile: FileEntry = {
        id: `f_${Date.now()}`,
        name: newFileName,
        sizeBlocks: newFileSize,
        color: chosenColor,
        startBlock: runStart,
        blocks: allocatedBlocks
      };
      setFiles(prev => [...prev, newFile]);
      setSelectedFileId(newFile.id);
    } else {
      // Linked or Indexed Allocation: Grab any free blocks
      const allocatedBlocks: number[] = [];
      for (let i = 0; i < TOTAL_BLOCKS && allocatedBlocks.length < newFileSize; i++) {
        if (blockMap[i] === null) {
          allocatedBlocks.push(i);
        }
      }

      const newFile: FileEntry = {
        id: `f_${Date.now()}`,
        name: newFileName,
        sizeBlocks: newFileSize,
        color: chosenColor,
        blocks: allocatedBlocks,
        inode: {
          directBlocks: allocatedBlocks.slice(0, 4),
          indirectBlocks: allocatedBlocks.slice(4),
          permissions: '-rw-r--r--',
          uid: 1000
        }
      };
      setFiles(prev => [...prev, newFile]);
      setSelectedFileId(newFile.id);
    }

    setNewFileName(`doc_${files.length + 1}.bin`);
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    if (selectedFileId === fileId) {
      const remaining = files.filter(f => f.id !== fileId);
      if (remaining.length > 0) setSelectedFileId(remaining[0].id);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 select-none">
      
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-blue-400" />
              File System Allocation &amp; Inode Simulator
            </h3>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-xs font-mono font-medium border border-blue-500/20">
              Unix Inode / Ext4 Map
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate Contiguous, Linked, and Unix Inode block allocation, inspect free-space bit vectors, and calculate max file bounds.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => setMode('VISUAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              mode === 'VISUAL' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Visual Allocation Map
          </button>
          <button
            onClick={() => setMode('CONCEPT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              mode === 'CONCEPT' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Conceptual Deep-Dive &amp; Inode Math
          </button>
        </div>
      </div>

      {mode === 'VISUAL' ? (
        <div className="space-y-6">
          
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            
            {/* Allocation Strategy Selector */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono">Allocation Method:</span>
              {(['CONTIGUOUS', 'LINKED', 'INDEXED_INODE'] as AllocationType[]).map(type => (
                <button
                  key={type}
                  onClick={() => {
                    setAllocationType(type);
                    setErrorMessage(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-medium transition-all cursor-pointer ${
                    allocationType === type
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {type === 'CONTIGUOUS' ? 'Contiguous' : type === 'LINKED' ? 'Linked List' : 'Unix Inode (Indexed)'}
                </button>
              ))}
            </div>

            {/* Create File Form */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newFileName}
                onChange={e => setNewFileName(e.target.value)}
                placeholder="Filename"
                className="w-32 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono focus:border-blue-500 focus:outline-none"
              />
              <select
                value={newFileSize}
                onChange={e => setNewFileSize(Number(e.target.value))}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                <option value={2}>2 Blocks (8 KB)</option>
                <option value={4}>4 Blocks (16 KB)</option>
                <option value={6}>6 Blocks (24 KB)</option>
                <option value={8}>8 Blocks (32 KB)</option>
              </select>

              <button
                onClick={handleCreateFile}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create File</span>
              </button>
            </div>

          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Physical Storage Block Map (64 Blocks) */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white font-bold flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-400" />
                Physical Disk Blocks (64 Blocks • 4 KB Block Size • 256 KB Total Disk)
              </span>
              <span className="text-slate-400">
                Used: <strong className="text-blue-400">{usedBlockCount}</strong> / {TOTAL_BLOCKS} ({Math.round((usedBlockCount/TOTAL_BLOCKS)*100)}%)
              </span>
            </div>

            {/* 64 Block Grid */}
            <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 pt-1">
              {Array.from({ length: TOTAL_BLOCKS }).map((_, blockIdx) => {
                const occupancy = blockMap[blockIdx];
                const isSelectedFileBlock = occupancy && occupancy.fileId === selectedFileId;

                return (
                  <div
                    key={blockIdx}
                    onClick={() => {
                      if (occupancy) setSelectedFileId(occupancy.fileId);
                    }}
                    style={{ backgroundColor: occupancy ? occupancy.color : undefined }}
                    className={`h-9 rounded-lg border text-center flex flex-col items-center justify-center transition-all ${
                      occupancy 
                        ? isSelectedFileBlock
                          ? 'border-white ring-2 ring-blue-400 shadow-md font-bold text-white cursor-pointer'
                          : 'border-slate-700/60 text-white/90 hover:brightness-125 cursor-pointer'
                        : 'bg-slate-900 border-slate-800 text-slate-600'
                    }`}
                    title={occupancy ? `Block ${blockIdx}: Assigned to ${files.find(f => f.id === occupancy.fileId)?.name}` : `Block ${blockIdx}: Free`}
                  >
                    <span className="text-[10px] font-bold">{blockIdx}</span>
                    <span className="text-[8px] opacity-80">{occupancy ? `#${occupancy.blockIndexInFile}` : 'free'}</span>
                  </div>
                );
              })}
            </div>

            {/* Free Space Bit Vector */}
            <div className="pt-2 flex flex-wrap items-center gap-1 text-[10px] text-slate-400">
              <span className="text-slate-500 mr-2">Free Space Bitmap:</span>
              <div className="font-mono text-slate-300 break-all bg-slate-900 px-2 py-1 rounded border border-slate-800 max-w-full">
                {Array.from({ length: TOTAL_BLOCKS }).map((_, i) => blockMap[i] === null ? '0' : '1').join('')}
              </div>
            </div>
          </div>

          {/* Bottom Grid: Directory Table & Inode Inspector */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Directory Table (Col 6) */}
            <div className="md:col-span-6 p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <span className="text-white font-bold block pb-2 border-b border-slate-800">
                Directory Table Entries
              </span>

              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {files.map(file => (
                  <div
                    key={file.id}
                    onClick={() => setSelectedFileId(file.id)}
                    className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                      selectedFileId === file.id
                        ? 'bg-slate-800 border-blue-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: file.color }} />
                      <div>
                        <div className="font-bold text-xs">{file.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {file.sizeBlocks} Blocks ({file.sizeBlocks * 4} KB) • Blocks: [{file.blocks.join(', ')}]
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete File"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Inode Inspector (Col 6) */}
            <div className="md:col-span-6 p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-white font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  Unix Inode Inspector: {selectedFile.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Inode #{selectedFile.blocks[0] + 128}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">File Permissions:</span>
                  <span className="text-emerald-400 font-bold">{selectedFile.inode?.permissions || '-rw-r--r--'}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Owner UID:</span>
                  <span className="text-slate-200 font-bold">1000 (user)</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">File Size:</span>
                  <span className="text-blue-400 font-bold">{selectedFile.sizeBlocks * 4096} Bytes</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Link Count:</span>
                  <span className="text-slate-200 font-bold">1 (hard link)</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-slate-400 block text-[10px] mb-1 font-bold">
                  Direct Block Pointers (0 to 11):
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedFile.blocks.map((blk, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-blue-600/20 border border-blue-500/30 text-blue-300 text-[10px]">
                      ptr[{idx}] ➔ Block {blk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* CONCEPTUAL DEEP-DIVE & INODE MATH */
        <div className="space-y-6 text-slate-300 leading-relaxed text-sm">
          
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              File Allocation Strategies Comparison
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs font-sans">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <strong className="text-blue-400 font-mono block">1. Contiguous Allocation</strong>
                <p className="text-slate-400 text-[11px]">
                  Fastest sequential and direct access (1 seek). However, suffers from external fragmentation and cannot dynamically expand files easily.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <strong className="text-emerald-400 font-mono block">2. Linked List Allocation</strong>
                <p className="text-slate-400 text-[11px]">
                  Zero external fragmentation. However, random access is terrible (O(N) seeks to find block K), and pointer corruptions break the entire file.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <strong className="text-purple-400 font-mono block">3. Unix Indexed Inode</strong>
                <p className="text-slate-400 text-[11px]">
                  Uses direct block pointers for small files, and single/double/triple indirect blocks for large files, balancing fast access with massive capacity.
                </p>
              </div>
            </div>
          </div>

          {/* GATE CS Inode Numerical Formula Card */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              GATE CS Classic Numerical: Maximum File Size with Multi-Level Inodes
            </h5>
            
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-blue-300 space-y-2">
              <div>Given: Block Size = B bytes, Disk Block Pointer = P bytes</div>
              <div>Pointers per Indirect Block = (B / P) = K pointers</div>
              <div className="pt-2 text-white font-bold border-t border-slate-800">
                Max File Size = [DirectPtrs + 1*K + 1*K^2 + 1*K^3] × BlockSize
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-500/30 text-xs text-slate-300 leading-relaxed font-sans">
              <strong>Example:</strong> Suppose Block Size = 4 KB, Pointer Size = 4 Bytes. Then K = 4096 / 4 = 1,024 pointers per indirect block.<br/>
              A double indirect block can address 1,024 × 1,024 × 4 KB = 4 GB of data alone!
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
