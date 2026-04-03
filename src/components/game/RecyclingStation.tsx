import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';

interface RecyclingStationProps {
  position: { x: number; z: number };
}

export function RecyclingStation({ position }: RecyclingStationProps) {
  const groupRef = useRef<Group>(null);
  const smokeRef = useRef<Group>(null);

  useFrame((state) => {
    if (smokeRef.current) {
      // Animate smoke particles
      smokeRef.current.children.forEach((child, i) => {
        child.position.y += 0.01;
        child.position.x += Math.sin(state.clock.elapsedTime * 2 + i) * 0.002;
        (child as any).rotation.z += 0.01;
        
        // Reset when too high
        if (child.position.y > 3) {
          child.position.y = 2;
          child.position.x = (i - 2) * 0.2;
        }
      });
    }
  });

  return (
    <group ref={groupRef} position={[position.x, 0, position.z]}>
      {/* Main platform */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[4, 4.2, 0.2, 8]} />
        <meshStandardMaterial color="#555" />
      </mesh>

      {/* Main building */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[3, 3, 3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Building details - metal panels */}
      <mesh position={[0, 1.5, 1.51]} castShadow>
        <boxGeometry args={[2.5, 2.5, 0.1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Door/Input */}
      <mesh position={[0, 0.8, 1.6]} castShadow>
        <boxGeometry args={[1.2, 1.5, 0.1]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Door frame */}
      <mesh position={[0, 0.8, 1.55]} castShadow>
        <boxGeometry args={[1.4, 1.7, 0.05]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
      </mesh>

      {/* Side structures */}
      <mesh position={[-2, 1, 0]} castShadow>
        <boxGeometry args={[1, 2, 1.5]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      <mesh position={[2, 1.2, 0]} castShadow>
        <boxGeometry args={[1, 2.4, 1.5]} />
        <meshStandardMaterial color="#666" />
      </mesh>

      {/* Pipes */}
      <mesh position={[-1.5, 2, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 2, 8]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[1.5, 2.2, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 2.4, 8]} />
        <meshStandardMaterial color="#444" />
      </mesh>

      {/* Horizontal pipes */}
      <mesh position={[0, 2.8, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
        <meshStandardMaterial color="#444" />
      </mesh>

      {/* Smokestack */}
      <mesh position={[1.5, 3.5, -1]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 2, 8]} />
        <meshStandardMaterial color="#444" />
      </mesh>

      {/* Smoke particles */}
      <group ref={smokeRef} position={[1.5, 4.5, -1]}>
        {[...Array(5)].map((_, i) => (
          <mesh key={i} position={[(i - 2) * 0.2, i * 0.3, 0]}>
            <sphereGeometry args={[0.15 + i * 0.05, 8, 8]} />
            <meshBasicMaterial color="#888" transparent opacity={0.4 - i * 0.05} />
          </mesh>
        ))}
      </group>

      {/* Conveyor belt */}
      <mesh position={[0, 0.3, 2.5]} castShadow>
        <boxGeometry args={[1.5, 0.1, 2]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Conveyor belt rollers */}
      <mesh position={[-0.6, 0.2, 2]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 1.4, 8]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      <mesh position={[0.6, 0.2, 2]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 1.4, 8]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      <mesh position={[-0.6, 0.2, 3]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 1.4, 8]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      <mesh position={[0.6, 0.2, 3]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 1.4, 8]} />
        <meshStandardMaterial color="#666" />
      </mesh>

      {/* Lights */}
      <mesh position={[-1, 2.5, 1.6]} castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      <mesh position={[1, 2.5, 1.6]} castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>

      {/* Sign */}
      <mesh position={[0, 3.2, 1.6]} castShadow>
        <boxGeometry args={[1.5, 0.4, 0.1]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>

      {/* Label indicator */}
      <mesh position={[0, 4, 0]}>
        <planeGeometry args={[0.8, 0.3]} />
        <meshBasicMaterial color="#00ff00" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}
