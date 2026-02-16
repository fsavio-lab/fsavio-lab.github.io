import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function 
SwissPolyhedra() {
  const groupRef = useRef<THREE.Group>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Pause when tab inactive
  useEffect(() => {
    const handleVisibility = () => setIsVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current && isVisible) {
      groupRef.current.rotation.y += delta * 0.08;
      groupRef.current.rotation.x += delta * 0.02;
    }
  });

  const silverMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('hsl(0, 0%, 78%)'),
        metalness: 0.85,
        roughness: 0.25,
      }),
    []
  );

  const shapes = useMemo(() => {
    const items: { position: [number, number, number]; geometry: THREE.BufferGeometry; scale: number; rotation: [number, number, number] }[] = [
      { position: [0, 0, 0], geometry: new THREE.IcosahedronGeometry(1, 0), scale: 1.2, rotation: [0.3, 0.5, 0] },
      { position: [2.5, 1.2, -1], geometry: new THREE.OctahedronGeometry(0.7, 0), scale: 1, rotation: [0.8, 0.2, 0.4] },
      { position: [-2.2, -0.8, -0.5], geometry: new THREE.TetrahedronGeometry(0.6, 0), scale: 1, rotation: [0.1, 0.9, 0.3] },
      { position: [1.5, -1.5, 0.5], geometry: new THREE.DodecahedronGeometry(0.5, 0), scale: 1, rotation: [0.6, 0.3, 0.7] },
      { position: [-1.8, 1.5, -1.2], geometry: new THREE.BoxGeometry(0.8, 0.8, 0.8), scale: 1, rotation: [0.4, 0.4, 0] },
    ];
    return items;
  }, []);

  return (
    <group ref={groupRef}>
      {shapes.map((shape, i) => (
        <mesh
          key={i}
          position={shape.position}
          scale={shape.scale}
          rotation={shape.rotation}
          material={silverMaterial}
          geometry={shape.geometry}
        />
      ))}
    </group>
  );
}

const Scene3D: React.FC = () => {
  return (
    <Canvas
      frameloop="always"
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 7], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-3, 2, 2]} intensity={0.3} color="hsl(0, 85%, 46%)" />
      <SwissPolyhedra />
    </Canvas>
  );
};

export default Scene3D;
