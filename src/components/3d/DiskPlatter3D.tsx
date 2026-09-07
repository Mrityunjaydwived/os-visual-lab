// Interactive 3D Magnetic Disk Platter with Actuator Arm & Track Seek Animation
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useAppStore } from '../../core/store/useStore';

interface DiskPlatter3DProps {
  currentTrack: number;
  maxTrack?: number;
  isMoving?: boolean;
}

export const DiskPlatter3D: React.FC<DiskPlatter3DProps> = ({
  currentTrack,
  maxTrack = 199,
  isMoving = false
}) => {
  const { renderMode } = useAppStore();
  const mountRef = useRef<HTMLDivElement>(null);
  const armRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (renderMode !== '3d' || !mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 300;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0A0F1D);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 10, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLightBlue = new THREE.PointLight(0x3B82F6, 3, 30);
    pointLightBlue.position.set(5, 8, 5);
    scene.add(pointLightBlue);

    const pointLightWarm = new THREE.PointLight(0xF59E0B, 2, 30);
    pointLightWarm.position.set(-5, 6, -3);
    scene.add(pointLightWarm);

    // Disk Drive Chassis Base
    const baseGeo = new THREE.BoxGeometry(11, 0.4, 11);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.6, metalness: 0.2 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -0.3;
    scene.add(base);

    // Spinning Magnetic Platter
    const platterGroup = new THREE.Group();
    scene.add(platterGroup);

    const platterGeo = new THREE.CylinderGeometry(4.2, 4.2, 0.12, 64);
    const platterMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.95,
      roughness: 0.15
    });
    const platter = new THREE.Mesh(platterGeo, platterMat);
    platterGroup.add(platter);

    // Concentric Cylinder Track Rings on platter
    for (let r = 1.2; r <= 4.0; r += 0.5) {
      const ringGeo = new THREE.RingGeometry(r, r + 0.03, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.07;
      platterGroup.add(ring);
    }

    // Center Spindle Hub
    const spindleGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.4, 32);
    const spindleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });
    const spindle = new THREE.Mesh(spindleGeo, spindleMat);
    spindle.position.y = 0.15;
    scene.add(spindle);

    // Read/Write Actuator Arm Pivot Assembly (Base corner)
    const armGroup = new THREE.Group();
    armGroup.position.set(-4.2, 0.2, 4.2);
    scene.add(armGroup);
    armRef.current = armGroup;

    // Actuator Pivot Bearing
    const pivotGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.5, 24);
    const pivotMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
    const pivot = new THREE.Mesh(pivotGeo, pivotMat);
    armGroup.add(pivot);

    // Actuator Arm Needle
    const needleGeo = new THREE.BoxGeometry(0.2, 0.08, 4.8);
    const needleMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, metalness: 0.8, roughness: 0.2 });
    const needle = new THREE.Mesh(needleGeo, needleMat);
    needle.position.set(0, 0.2, -2.4);
    armGroup.add(needle);

    // Read/Write Head Sensor (Electric Blue)
    const headGeo = new THREE.BoxGeometry(0.3, 0.1, 0.3);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x3B82F6, emissive: 0x3B82F6, emissiveIntensity: 0.6 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 0.18, -4.7);
    armGroup.add(head);

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 300;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Spin platter continuously (simulating 7200 RPM)
      platterGroup.rotation.y += 0.04;

      // Animate actuator arm angle based on currentTrack fraction
      if (armRef.current) {
        const trackFraction = Math.min(1, Math.max(0, currentTrack / maxTrack));
        const targetAngle = -0.15 + trackFraction * 0.45;
        armRef.current.rotation.y += (targetAngle - armRef.current.rotation.y) * 0.1;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [renderMode, currentTrack, maxTrack]);

  return (
    <div className="relative w-full h-[280px] bg-[#0A0F1D] rounded-xl overflow-hidden border border-slate-800 shadow-lg">
      {renderMode === '3d' ? (
        <div ref={mountRef} className="w-full h-full" />
      ) : (
        /* 2D Canvas Track Fallback */
        <div className="w-full h-full flex items-center justify-center p-4">
          <div className="relative w-52 h-52 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center">
            {/* Concentric rings */}
            <div className="absolute w-44 h-44 rounded-full border border-slate-800" />
            <div className="absolute w-36 h-36 rounded-full border border-slate-800" />
            <div className="absolute w-28 h-28 rounded-full border border-slate-800" />
            <div className="absolute w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-mono text-slate-300 font-medium">
              Spindle
            </div>
            {/* Active Track Highlight */}
            <div 
              className="absolute rounded-full border-2 border-blue-500"
              style={{
                width: `${40 + (currentTrack / maxTrack) * 150}px`,
                height: `${40 + (currentTrack / maxTrack) * 150}px`
              }}
            />
          </div>
        </div>
      )}

      {/* Floating Track Status Telemetry */}
      <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono flex items-center gap-3 shadow-md">
        <span className="text-slate-400">Head Cylinder:</span>
        <span className="text-blue-400 font-semibold text-sm">#{currentTrack}</span>
        {isMoving && <span className="text-amber-400 text-xs font-medium">Seeking...</span>}
      </div>
    </div>
  );
};
