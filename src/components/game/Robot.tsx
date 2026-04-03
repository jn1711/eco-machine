import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import { useGameStore } from '@/store/gameStore';

interface RobotProps {
  positionRef: MutableRefObject<Vector3>;
  targetRef: MutableRefObject<Vector3>;
}

export function Robot({ positionRef, targetRef }: RobotProps) {
  const groupRef = useRef<Group>(null);
  const moveVector = useRef(new Vector3());
  const robotSpeed = useGameStore((state) => state.robotSpeed);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(positionRef.current);
    }
  }, [positionRef]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    moveVector.current.set(
      targetRef.current.x - groupRef.current.position.x,
      0,
      targetRef.current.z - groupRef.current.position.z
    );
    const distance = moveVector.current.length();

    if (distance > 0.05) {
      const direction = moveVector.current.normalize();
      const moveSpeed = robotSpeed * delta * 3;
      const moveDistance = Math.min(moveSpeed, distance);
      
      groupRef.current.position.add(direction.multiplyScalar(moveDistance));
      
      // Rotate towards target
      const targetRotation = Math.atan2(direction.x, direction.z);
      const currentRotation = groupRef.current.rotation.y;
      let diff = targetRotation - currentRotation;
      
      // Normalize angle to -PI to PI
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      
      groupRef.current.rotation.y += diff * delta * 8;
    }

    // Idle animation - slight bobbing
    groupRef.current.position.y = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.015;
    positionRef.current.copy(groupRef.current.position);
  });

  return (
    <group ref={groupRef}>
      <group scale={[0.95, 0.95, 0.95]}>
        {/* Main chassis */}
        <mesh position={[0, 0.34, -0.2]} castShadow receiveShadow>
          <boxGeometry args={[1.45, 0.22, 2.45]} />
          <meshStandardMaterial color="#2f3338" roughness={0.65} metalness={0.3} />
        </mesh>

        {/* Rear compactor body */}
        <mesh position={[0, 0.98, -0.15]} castShadow>
          <boxGeometry args={[1.5, 1.05, 1.85]} />
          <meshStandardMaterial color="#46a856" roughness={0.62} metalness={0.18} />
        </mesh>
        <mesh position={[0.78, 0.98, -0.15]} castShadow>
          <boxGeometry args={[0.04, 0.92, 1.74]} />
          <meshStandardMaterial color="#6fd27a" roughness={0.55} />
        </mesh>
        <mesh position={[0.68, 0.98, 0.15]} rotation={[0, 0, -0.7]} castShadow>
          <boxGeometry args={[0.12, 0.72, 0.04]} />
          <meshStandardMaterial color="#f2f5ee" roughness={0.45} />
        </mesh>
        <mesh position={[0.47, 0.98, -0.03]} rotation={[0, 0, -0.7]} castShadow>
          <boxGeometry args={[0.12, 0.72, 0.04]} />
          <meshStandardMaterial color="#f2f5ee" roughness={0.45} />
        </mesh>

        {/* Cab */}
        <mesh position={[0, 0.96, 1.02]} rotation={[-0.16, 0, 0]} castShadow>
          <boxGeometry args={[1.02, 0.72, 0.86]} />
          <meshStandardMaterial color="#3b9a4e" roughness={0.6} metalness={0.16} />
        </mesh>
        <mesh position={[0, 1.02, 1.46]} castShadow>
          <boxGeometry args={[0.8, 0.42, 0.08]} />
          <meshStandardMaterial color="#20252b" roughness={0.35} metalness={0.35} />
        </mesh>
        <mesh position={[-0.23, 1.06, 1.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 0.08, 14]} />
          <meshStandardMaterial color="#0f1419" roughness={0.28} metalness={0.65} />
        </mesh>
        <mesh position={[0.23, 1.06, 1.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 0.08, 14]} />
          <meshStandardMaterial color="#0f1419" roughness={0.28} metalness={0.65} />
        </mesh>
        <mesh position={[-0.23, 1.06, 1.55]} castShadow>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color="#8fe7ff" />
        </mesh>
        <mesh position={[0.23, 1.06, 1.55]} castShadow>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color="#8fe7ff" />
        </mesh>
        <mesh position={[-0.48, 1.26, 1.32]} castShadow>
          <boxGeometry args={[0.12, 0.08, 0.12]} />
          <meshBasicMaterial color="#fff4bf" />
        </mesh>
        <mesh position={[0.48, 1.26, 1.32]} castShadow>
          <boxGeometry args={[0.12, 0.08, 0.12]} />
          <meshBasicMaterial color="#fff4bf" />
        </mesh>

        {/* Top conveyor and lifted rear bin */}
        <group position={[0, 1.62, 0.15]} rotation={[0.45, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.12, 1.75]} />
            <meshStandardMaterial color="#2d3135" roughness={0.55} metalness={0.25} />
          </mesh>
          <mesh position={[0, 0.08, 0]} castShadow>
            <boxGeometry args={[0.18, 0.05, 1.8]} />
            <meshStandardMaterial color="#585d62" roughness={0.7} />
          </mesh>
        </group>
        <group position={[0.18, 1.95, -0.9]} rotation={[0.35, 0, 0.1]}>
          <mesh castShadow>
            <boxGeometry args={[0.82, 0.58, 0.5]} />
            <meshStandardMaterial color="#4b88d9" roughness={0.55} metalness={0.12} />
          </mesh>
          <mesh position={[0, 0.22, -0.02]} castShadow>
            <boxGeometry args={[0.86, 0.06, 0.56]} />
            <meshStandardMaterial color="#a6caef" roughness={0.45} />
          </mesh>
        </group>

        {/* Rear trailer */}
        <mesh position={[0, 0.46, -2.12]} castShadow>
          <boxGeometry args={[1.08, 0.16, 1.38]} />
          <meshStandardMaterial color="#495a43" roughness={0.7} metalness={0.15} />
        </mesh>
        <mesh position={[-0.5, 0.68, -2.12]} castShadow>
          <boxGeometry args={[0.08, 0.44, 1.38]} />
          <meshStandardMaterial color="#6f8468" roughness={0.8} />
        </mesh>
        <mesh position={[0.5, 0.68, -2.12]} castShadow>
          <boxGeometry args={[0.08, 0.44, 1.38]} />
          <meshStandardMaterial color="#6f8468" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.68, -2.76]} castShadow>
          <boxGeometry args={[1.08, 0.44, 0.08]} />
          <meshStandardMaterial color="#6f8468" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.3, -1.5]} castShadow>
          <boxGeometry args={[0.08, 0.08, 0.82]} />
          <meshStandardMaterial color="#4b4f53" roughness={0.6} metalness={0.2} />
        </mesh>

        {/* Trash load */}
        <TrashInContainer />

        {/* Front arms */}
        <RobotArm side={-1} />
        <RobotArm side={1} />

        {/* Bin being collected */}
        <CollectedBin />

        {/* Wheels */}
        <group>
          <TruckWheel position={[-0.78, 0.28, 0.78]} scale={1} />
          <TruckWheel position={[0.78, 0.28, 0.78]} scale={1} />
          <TruckWheel position={[-0.78, 0.28, -0.72]} scale={1} />
          <TruckWheel position={[0.78, 0.28, -0.72]} scale={1} />
          <TruckWheel position={[-0.44, 0.22, -2.08]} scale={0.72} />
          <TruckWheel position={[0.44, 0.22, -2.08]} scale={0.72} />
        </group>
      </group>
    </group>
  );
}

function RobotArm({ side }: { side: -1 | 1 }) {
  const x = 0.72 * side;
  const elbowX = 0.98 * side;
  const clawX = 0.78 * side;

  return (
    <group>
      <mesh position={[x, 0.88, 0.68]} rotation={[0, 0, -0.6 * side]} castShadow>
        <boxGeometry args={[0.16, 0.62, 0.16]} />
        <meshStandardMaterial color="#9aa0a6" roughness={0.45} metalness={0.5} />
      </mesh>
      <mesh position={[elbowX, 0.62, 1.07]} rotation={[0.15, 0, 0.35 * side]} castShadow>
        <boxGeometry args={[0.14, 0.56, 0.14]} />
        <meshStandardMaterial color="#b7bcc1" roughness={0.38} metalness={0.62} />
      </mesh>
      <mesh position={[clawX, 0.36, 1.42]} rotation={[0, 0, 0.45 * side]} castShadow>
        <boxGeometry args={[0.08, 0.3, 0.12]} />
        <meshStandardMaterial color="#35393d" roughness={0.55} metalness={0.35} />
      </mesh>
      <mesh position={[clawX + 0.08 * side, 0.28, 1.52]} rotation={[0.2, 0, -0.7 * side]} castShadow>
        <boxGeometry args={[0.06, 0.18, 0.08]} />
        <meshStandardMaterial color="#35393d" roughness={0.55} metalness={0.35} />
      </mesh>
    </group>
  );
}

function CollectedBin() {
  return (
    <group position={[0, 0.42, 1.7]}>
      <mesh castShadow>
        <boxGeometry args={[0.62, 0.56, 0.5]} />
        <meshStandardMaterial color="#2f73c8" roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.68, 0.05, 0.56]} />
        <meshStandardMaterial color="#a3c5f4" roughness={0.45} />
      </mesh>
      {[-0.22, 0.22].map((x) => (
        <mesh key={x} position={[x, -0.3, -0.18]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.06, 10]} />
          <meshStandardMaterial color="#202020" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function TruckWheel({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.22, 14]} />
        <meshStandardMaterial color="#242424" roughness={0.95} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.24, 12]} />
        <meshStandardMaterial color="#868b90" roughness={0.4} metalness={0.55} />
      </mesh>
    </group>
  );
}

function TrashInContainer() {
  const inventory = useGameStore((state) => state.inventory);
  
  // Show trash items based on inventory
  const trashItems = [];
  const itemCount = Math.min(inventory, 4);
  
  for (let i = 0; i < itemCount; i++) {
    const x = ((i % 2) - 0.5) * 0.42;
    const y = 1.35 + (i % 2) * 0.05;
    const z = -0.5 - Math.floor(i / 2) * 0.22;
    const color = ['#8B7355', '#4A90D9', '#9B59B6', '#d06f4a'][i % 4];
    
    trashItems.push(
      <mesh key={i} position={[x, y, z]} castShadow>
        <boxGeometry args={[0.14, 0.12, 0.12]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
    );
  }
  
  return <>{trashItems}</>;
}
