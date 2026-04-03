import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Group } from 'three';

interface UpgradeCenterProps {
  position: { x: number; z: number };
}

export function UpgradeCenter({ position }: UpgradeCenterProps) {
  const groupRef = useRef<Group>(null);
  const hologramRef = useRef<Group>(null);

  useFrame((state) => {
    if (hologramRef.current) {
      // Rotate hologram
      hologramRef.current.rotation.y += 0.02;
      
      // Pulse effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      hologramRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={groupRef} position={[position.x, 0, position.z]}>
      {/* Main platform */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[3, 3.2, 0.2, 6]} />
        <meshStandardMaterial color="#2a2a4a" />
      </mesh>

      {/* Platform glow ring */}
      <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 3, 32]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.5} />
      </mesh>

      {/* Interaction zone marker */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.1, 3.55, 40]} />
        <meshBasicMaterial color="#7df9ff" transparent opacity={0.3} />
      </mesh>

      {/* Central pillar */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.7, 2, 8]} />
        <meshStandardMaterial color="#4a4a6a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Pillar glow stripes */}
      <mesh position={[0, 0.5, 0.51]} castShadow>
        <boxGeometry args={[0.1, 0.8, 0.02]} />
        <meshBasicMaterial color="#00ffff" />
      </mesh>
      <mesh position={[0, 1.5, 0.51]} castShadow>
        <boxGeometry args={[0.1, 0.8, 0.02]} />
        <meshBasicMaterial color="#00ffff" />
      </mesh>

      {/* Side consoles */}
      <mesh position={[-1.5, 0.6, 0]} castShadow>
        <boxGeometry args={[0.8, 1.2, 0.5]} />
        <meshStandardMaterial color="#3a3a5a" />
      </mesh>
      <mesh position={[1.5, 0.6, 0]} castShadow>
        <boxGeometry args={[0.8, 1.2, 0.5]} />
        <meshStandardMaterial color="#3a3a5a" />
      </mesh>

      {/* Console screens */}
      <mesh position={[-1.5, 0.8, 0.26]} castShadow>
        <planeGeometry args={[0.6, 0.4]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>
      <mesh position={[1.5, 0.8, 0.26]} castShadow>
        <planeGeometry args={[0.6, 0.4]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>

      {/* Hologram base */}
      <mesh position={[0, 2.1, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.8} />
      </mesh>

      {/* Hologram */}
      <group ref={hologramRef} position={[0, 2.5, 0]}>
        {/* Holographic robot representation */}
        <mesh>
          <octahedronGeometry args={[0.4, 0]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.6} wireframe />
        </mesh>
        
        {/* Orbiting rings */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.6, 0.02, 8, 32]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.4} />
        </mesh>
        <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
          <torusGeometry args={[0.7, 0.02, 8, 32]} />
          <meshBasicMaterial color="#ff00ff" transparent opacity={0.4} />
        </mesh>
        <mesh rotation={[-Math.PI / 3, -Math.PI / 4, 0]}>
          <torusGeometry args={[0.5, 0.02, 8, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.4} />
        </mesh>

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <mesh 
            key={i} 
            position={[
              Math.cos(i * Math.PI / 3) * 0.8,
              Math.sin(i * Math.PI / 3) * 0.3,
              Math.sin(i * Math.PI / 3) * 0.8,
            ]}
          >
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>

      {/* Light beam */}
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.1, 0.4, 3, 8]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.1} />
      </mesh>

      {/* Corner pillars */}
      {[-1, 1].map((x) =>
        [-1, 1].map((z) => (
          <mesh key={`${x}-${z}`} position={[x * 2, 0.5, z * 2]} castShadow>
            <cylinderGeometry args={[0.15, 0.2, 1, 6]} />
            <meshStandardMaterial color="#4a4a6a" />
          </mesh>
        ))
      )}

      {/* Energy beams between pillars */}
      <mesh position={[0, 0.8, 2]}>
        <boxGeometry args={[4, 0.05, 0.05]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 0.8, -2]}>
        <boxGeometry args={[4, 0.05, 0.05]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.3} />
      </mesh>
      <mesh position={[2, 0.8, 0]}>
        <boxGeometry args={[0.05, 0.05, 4]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.3} />
      </mesh>
      <mesh position={[-2, 0.8, 0]}>
        <boxGeometry args={[0.05, 0.05, 4]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.3} />
      </mesh>

      {/* Label indicator */}
      <mesh position={[0, 3.5, 0]}>
        <planeGeometry args={[1.3, 0.36]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.85} />
      </mesh>

      <mesh position={[0, 3.5, 0.01]}>
        <planeGeometry args={[1.1, 0.18]} />
        <meshBasicMaterial color="#08263a" transparent opacity={0.9} />
      </mesh>

      <Html position={[0, 3.5, 0.03]} center transform sprite distanceFactor={12}>
        <div
          style={{
            padding: '6px 10px',
            borderRadius: '8px',
            border: '2px solid #58f6ff',
            background: 'rgba(5, 25, 35, 0.88)',
            color: '#c9fbff',
            fontFamily: '"Noto Sans", sans-serif',
            fontSize: '8px',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            boxShadow: '0 0 14px rgba(0, 255, 255, 0.35)',
          }}
        >
          UPGRADE
        </div>
      </Html>
    </group>
  );
}
