// Interactive 3D Computer Architecture Pipeline (Three.js WebGL & 2D Canvas Fallback)
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useAppStore, type VisualLabTab } from '../../core/store/useStore';
import { Activity, Pause, Play, RotateCcw, ArrowRight } from 'lucide-react';

interface ComponentData {
  name: string;
  type: string;
  latency: string;
  bandwidth: string;
  role: string;
  tab?: VisualLabTab;
}

export const ComputerSystem3D: React.FC = () => {
  const { renderMode, setSection } = useAppStore();
  const mountRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const [selectedComponent, setSelectedComponent] = useState<ComponentData>({
    name: 'Multi-Core CPU',
    type: 'ALU & Control Unit',
    latency: '< 1 ns (0.3 ns L1)',
    bandwidth: '2.5 TB/s',
    role: 'Fetches, decodes, and executes user and kernel instructions at gigahertz clock rates.',
    tab: 'cpu_scheduler'
  });

  // 3D Three.js implementation
  useEffect(() => {
    if (renderMode !== '3d' || !mountRef.current) return;

    // Clean previous children in case of re-render
    mountRef.current.innerHTML = '';

    const width = mountRef.current.clientWidth || 800;
    const height = mountRef.current.clientHeight || 440;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0A0F1D); // Clean dark canvas

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 14, 22);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Subtle, balanced lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLightBlue = new THREE.PointLight(0x3B82F6, 3, 50);
    pointLightBlue.position.set(-6, 8, 5);
    scene.add(pointLightBlue);

    const pointLightWarm = new THREE.PointLight(0xF59E0B, 2, 50);
    pointLightWarm.position.set(6, 8, -5);
    scene.add(pointLightWarm);

    // Motherboard PCB Base (Slate 900)
    const boardGeo = new THREE.BoxGeometry(22, 0.4, 16);
    const boardMat = new THREE.MeshStandardMaterial({
      color: 0x0F172A,
      roughness: 0.6,
      metalness: 0.2
    });
    const motherboard = new THREE.Mesh(boardGeo, boardMat);
    motherboard.position.y = -0.5;
    scene.add(motherboard);

    // Subtle grid traces
    const gridHelper = new THREE.GridHelper(20, 20, 0x334155, 0x1E293B);
    gridHelper.position.y = -0.28;
    scene.add(gridHelper);

    // Hardware Components Creation Helper
    const components: { mesh: THREE.Mesh; data: ComponentData }[] = [];

    const createBlock = (
      _name: string,
      geo: THREE.BufferGeometry,
      color: number,
      pos: [number, number, number],
      data: ComponentData
    ) => {
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.35,
        metalness: 0.5,
        emissive: color,
        emissiveIntensity: 0.15
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...pos);
      scene.add(mesh);
      components.push({ mesh, data });
      return mesh;
    };

    // 1. CPU Core (Primary Blue #3B82F6)
    const cpuMesh = createBlock(
      'Multi-Core CPU',
      new THREE.BoxGeometry(4, 0.8, 4),
      0x3B82F6,
      [-5, 0.2, 0],
      {
        name: 'Multi-Core CPU',
        type: 'Instruction Execution Engine',
        latency: '< 1 ns (0.3 ns cycle)',
        bandwidth: '2.5 TB/s Register Bus',
        role: 'Executes instructions, coordinates context switches, and handles hardware interrupts.',
        tab: 'cpu_scheduler'
      }
    );

    // CPU Frame
    const cpuFrameGeo = new THREE.BoxGeometry(4.4, 0.3, 4.4);
    const cpuFrameMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.7, roughness: 0.3 });
    const cpuFrame = new THREE.Mesh(cpuFrameGeo, cpuFrameMat);
    cpuFrame.position.set(-5, 0.05, 0);
    scene.add(cpuFrame);

    // 2. L1 / L2 / L3 Cache (Amber #F59E0B)
    createBlock(
      'L1 Cache',
      new THREE.BoxGeometry(1.6, 0.6, 1.6),
      0xF59E0B,
      [-1.5, 0.2, -1.5],
      {
        name: 'L1 & L2 SRAM Cache',
        type: 'On-Die Static RAM',
        latency: '0.8 ns - 3 ns',
        bandwidth: '1.2 TB/s',
        role: 'Caches hot instructions and variables to avoid slow memory bus transactions.',
        tab: 'cache_hierarchy'
      }
    );

    createBlock(
      'L3 Shared Cache',
      new THREE.BoxGeometry(1.6, 0.6, 2.5),
      0xF59E0B,
      [-1.5, 0.2, 1.2],
      {
        name: 'L3 Unified Cache',
        type: 'Shared Die Cache',
        latency: '10 - 15 ns',
        bandwidth: '600 GB/s',
        role: 'Shared last-level cache minimizing trips across the external DDR5 bus.',
        tab: 'cache_hierarchy'
      }
    );

    // 3. RAM Memory DIMMs (Light Blue #60A5FA)
    for (let i = 0; i < 4; i++) {
      createBlock(
        `RAM Channel ${i}`,
        new THREE.BoxGeometry(0.4, 1.2, 5.5),
        0x60A5FA,
        [2 + i * 0.9, 0.4, 0],
        {
          name: `DDR5 RAM (Channel ${i})`,
          type: 'Synchronous Dynamic RAM',
          latency: '60 - 80 ns',
          bandwidth: '84 GB/s per channel',
          role: 'Stores active operating system kernel frames, process page tables, and stacks.',
          tab: 'paging_tlb'
        }
      );
    }

    // 4. NVMe PCIe SSD / Storage (Navy Blue #2563EB)
    createBlock(
      'PCIe Gen5 NVMe Storage',
      new THREE.BoxGeometry(3.5, 0.4, 1.8),
      0x2563EB,
      [6.5, 0.1, -4.5],
      {
        name: 'High-Speed NVMe Storage',
        type: 'Non-Volatile NAND Flash',
        latency: '10 - 20 μs',
        bandwidth: '14 GB/s PCIe 5.0',
        role: 'Persistent block storage holding executables, swap files, and journaled filesystems.',
        tab: 'disk_scheduling'
      }
    );

    // 5. I/O Controller & DMA Engine (Emerald #10B981)
    createBlock(
      'DMA & I/O Controller',
      new THREE.BoxGeometry(2.5, 0.5, 2),
      0x10B981,
      [0, 0.2, -4.5],
      {
        name: 'Direct Memory Access (DMA)',
        type: 'Peripheral Controller',
        latency: '50 - 150 ns',
        bandwidth: '32 GB/s',
        role: 'Transfers packets directly between network/disk and RAM without wasting CPU cycles.',
        tab: 'dma_interrupt'
      }
    );

    // Subtle data bus lines
    const traceMat = new THREE.LineBasicMaterial({ color: 0x60A5FA, transparent: true, opacity: 0.4 });

    const createTrace = (points: [number, number, number][]) => {
      const geo = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(...p)));
      const line = new THREE.Line(geo, traceMat);
      scene.add(line);
    };

    createTrace([[-3, 0.05, 0], [-2.3, 0.05, 0]]);
    createTrace([[-0.7, 0.05, 0], [1.8, 0.05, 0]]);
    createTrace([[0, 0.05, 0], [0, 0.05, -3.5]]);
    createTrace([[1.2, 0.05, -4.5], [4.7, 0.05, -4.5]]);

    // Animated traveling packets
    const packetCount = 10;
    const packetGeo = new THREE.SphereGeometry(0.1, 10, 10);
    const packetMat = new THREE.MeshBasicMaterial({ color: 0x93C5FD });
    const packets: { mesh: THREE.Mesh; t: number; speed: number; path: [number, number, number][] }[] = [];

    for (let p = 0; p < packetCount; p++) {
      const mesh = new THREE.Mesh(packetGeo, packetMat);
      scene.add(mesh);
      packets.push({
        mesh,
        t: Math.random(),
        speed: 0.004 + Math.random() * 0.006,
        path: [
          [-5, 0.2, 0],
          [-1.5, 0.2, 0],
          [3.5, 0.2, 0],
          [0, 0.2, -4.5],
          [6.5, 0.2, -4.5]
        ]
      });
    }

    // Raycaster for mouse click selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let dragDistance = 0;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      dragDistance = 0;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;
      dragDistance += Math.abs(deltaX) + Math.abs(deltaY);

      scene.rotation.y += deltaX * 0.007;
      scene.rotation.x = Math.max(-0.35, Math.min(0.5, scene.rotation.x + deltaY * 0.007));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = (event: MouseEvent) => {
      isDragging = false;
      if (dragDistance < 8 && renderer.domElement) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(components.map(c => c.mesh));

        if (intersects.length > 0) {
          const found = components.find(c => c.mesh === intersects[0].object);
          if (found) {
            setSelectedComponent(found.data);
            (intersects[0].object as THREE.Mesh).scale.set(1.12, 1.12, 1.12);
            setTimeout(() => {
              if (intersects[0] && intersects[0].object) {
                (intersects[0].object as THREE.Mesh).scale.set(1, 1, 1);
              }
            }, 250);
          }
        }
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 440;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      clock += 0.02;

      // Soft pulse on CPU
      if (cpuMesh.material) {
        (cpuMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.15 + Math.sin(clock * 2.5) * 0.08;
      }

      // Smooth auto-orbit
      if (isPlayingRef.current && !isDragging) {
        scene.rotation.y += 0.0015;
      }

      // Move data packets
      packets.forEach(p => {
        p.t = (p.t + p.speed) % 1;
        const segmentCount = p.path.length - 1;
        const scaledT = p.t * segmentCount;
        const segIdx = Math.floor(scaledT);
        const subT = scaledT - segIdx;

        const p1 = p.path[segIdx];
        const p2 = p.path[Math.min(segIdx + 1, segmentCount)];

        p.mesh.position.set(
          p1[0] + (p2[0] - p1[0]) * subT,
          p1[1] + (p2[1] - p1[1]) * subT + Math.sin(clock * 4 + segIdx) * 0.03,
          p1[2] + (p2[2] - p1[2]) * subT
        );
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && domEl) {
        mountRef.current.removeChild(domEl);
      }
      renderer.dispose();
    };
  }, [renderMode]);

  return (
    <div className="relative w-full h-[440px] rounded-2xl overflow-hidden border border-slate-800 bg-[#0A0F1D] shadow-xl select-none">
      
      {/* 3D WebGL Canvas or 2D Low-Resource Fallback */}
      {renderMode === '3d' ? (
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      ) : (
        /* 2D Schematic Fallback */
        <div className="w-full h-full p-6 flex flex-col justify-between bg-slate-900/90">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-2 text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              2D High-Performance Architecture Map
            </span>
            <span>Bus: 6400 MT/s</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-auto items-center max-w-2xl mx-auto w-full">
            
            {/* CPU */}
            <div 
              onClick={() => setSelectedComponent({
                name: 'Multi-Core CPU',
                type: 'ALU & Control Unit',
                latency: '< 1 ns',
                bandwidth: '2.5 TB/s',
                role: 'High-speed execution engine with registers and hardware execution units.',
                tab: 'cpu_scheduler'
              })}
              className="p-4 rounded-xl bg-slate-800/80 border border-blue-500/40 text-center hover:border-blue-400 transition-all cursor-pointer"
            >
              <div className="text-sm font-semibold text-white">CPU Core</div>
              <div className="text-xs text-slate-400 mt-1">Registers &amp; ALU</div>
              <div className="mt-2 text-xs font-mono text-blue-400 font-semibold">&lt; 1 ns</div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSection('VISUAL_LAB', 'cpu_scheduler');
                }}
                className="mt-3 w-full py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                Launch Simulator
              </button>
            </div>

            {/* Cache */}
            <div 
              onClick={() => setSelectedComponent({
                name: 'L1 / L2 / L3 Cache',
                type: 'SRAM Cache Hierarchy',
                latency: '0.8 ns - 15 ns',
                bandwidth: '600 GB/s',
                role: 'Minimizes memory latency via temporal and spatial locality caching.',
                tab: 'cache_hierarchy'
              })}
              className="p-4 rounded-xl bg-slate-800/80 border border-amber-500/40 text-center hover:border-amber-400 transition-all cursor-pointer"
            >
              <div className="text-sm font-semibold text-white">SRAM Cache</div>
              <div className="text-xs text-slate-400 mt-1">L1 / L2 / L3 Hierarchy</div>
              <div className="mt-2 text-xs font-mono text-amber-400 font-semibold">~ 4 ns</div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSection('VISUAL_LAB', 'cache_hierarchy');
                }}
                className="mt-3 w-full py-1.5 text-xs font-medium rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition-colors"
              >
                Launch Simulator
              </button>
            </div>

            {/* RAM */}
            <div 
              onClick={() => setSelectedComponent({
                name: 'Main Memory (RAM)',
                type: 'DDR5 SDRAM',
                latency: '60 - 80 ns',
                bandwidth: '84 GB/s',
                role: 'Stores active program pages, kernel page tables, and process stacks.',
                tab: 'paging_tlb'
              })}
              className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-center hover:border-slate-600 transition-all cursor-pointer"
            >
              <div className="text-sm font-semibold text-white">DDR5 RAM</div>
              <div className="text-xs text-slate-400 mt-1">Physical Frames</div>
              <div className="mt-2 text-xs font-mono text-blue-400 font-semibold">~ 70 ns</div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSection('VISUAL_LAB', 'paging_tlb');
                }}
                className="mt-3 w-full py-1.5 text-xs font-medium rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
              >
                Launch Simulator
              </button>
            </div>

          </div>

          <div className="text-center text-xs text-slate-500 font-normal">
            Click any hardware component to inspect latency and operating system interaction.
          </div>
        </div>
      )}

      {/* Floating Minimalist Info HUD */}
      <div className="absolute top-4 left-4 max-w-xs p-3.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-xs shadow-xl pointer-events-auto">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="font-semibold text-white flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            {selectedComponent.name}
          </span>
          <span className="text-[10px] font-mono text-slate-400">{selectedComponent.type}</span>
        </div>

        <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
          {selectedComponent.role}
        </p>

        <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-slate-800 font-mono text-[10px]">
          <div>
            <span className="text-slate-500">Latency: </span>
            <span className="text-blue-400 font-semibold">{selectedComponent.latency}</span>
          </div>
          <div>
            <span className="text-slate-500">Bandwidth: </span>
            <span className="text-slate-200 font-semibold">{selectedComponent.bandwidth}</span>
          </div>
        </div>

        {selectedComponent.tab && (
          <button
            onClick={() => setSection('VISUAL_LAB', selectedComponent.tab)}
            className="w-full mt-3 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Open {selectedComponent.name} Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-800 text-xs shadow-lg pointer-events-auto">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
          title={isPlaying ? 'Pause auto-rotation' : 'Resume auto-rotation'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => setIsPlaying(true)}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
          title="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <span className="text-[10px] text-slate-500 px-1.5 hidden sm:inline">
          Drag to rotate • Click blocks
        </span>
      </div>

    </div>
  );
};
