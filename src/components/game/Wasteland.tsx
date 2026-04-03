import { useMemo } from 'react';

export interface DuneObstacle {
  position: [number, number, number];
  radius: number;
  collisionRadius: number;
  height: number;
  rotation: number;
}

// Пирамиды убраны, препятствий на карте больше нет.
export const DUNE_OBSTACLES: DuneObstacle[] = [];

export function Wasteland() {
  const meadowPatches = useMemo(() => {
    return Array.from({ length: 28 }, (_, index) => ({
      id: index,
      position: [
        (Math.random() - 0.5) * 78,
        -0.07 + index * 0.0006,
        (Math.random() - 0.5) * 78,
      ] as [number, number, number],
      rotation: Math.random() * Math.PI,
      scaleX: 2 + Math.random() * 7,
      scaleY: 1.2 + Math.random() * 5,
      color: index % 4 === 0 ? '#79a85d' : index % 4 === 1 ? '#6d9a52' : index % 4 === 2 ? '#8fb96d' : '#5d8444',
      opacity: 0.14 + Math.random() * 0.12,
    }));
  }, []);

  const terrainDetails = useMemo(() => {
    const details = [];

    for (let i = 0; i < 16; i++) {
      details.push({
        type: 'rock' as const,
        position: [
          (Math.random() - 0.5) * 82,
          0,
          (Math.random() - 0.5) * 82,
        ] as [number, number, number],
        scale: 0.45 + Math.random() * 1.2,
        rotation: Math.random() * Math.PI,
      });
    }

    for (let i = 0; i < 18; i++) {
      details.push({
        type: 'shrub' as const,
        position: [
          (Math.random() - 0.5) * 76,
          0,
          (Math.random() - 0.5) * 76,
        ] as [number, number, number],
        scale: 0.35 + Math.random() * 0.7,
        rotation: Math.random() * Math.PI,
      });
    }

    for (let i = 0; i < 24; i++) {
      details.push({
        type: 'humanTrash' as const,
        position: [
          (Math.random() - 0.5) * 72,
          0.02,
          (Math.random() - 0.5) * 72,
        ] as [number, number, number],
        scale: 0.22 + Math.random() * 0.28,
        rotation: Math.random() * Math.PI,
        variant: i % 4,
      });
    }

    return details;
  }, []);

  return (
    <group>
      <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#7c9a57" roughness={1} />
      </mesh>

      <mesh position={[0, -0.16, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#587348" roughness={1} />
      </mesh>

      {meadowPatches.map((patch) => (
        <mesh
          key={patch.id}
          position={patch.position}
          rotation={[-Math.PI / 2, 0, patch.rotation]}
        >
          <planeGeometry args={[patch.scaleX, patch.scaleY]} />
          <meshBasicMaterial color={patch.color} transparent opacity={patch.opacity} />
        </mesh>
      ))}

      <mesh position={[8, -0.04, 10]} rotation={[-Math.PI / 2, 0.3, 0]}>
        <planeGeometry args={[18, 44]} />
        <meshBasicMaterial color="#8f7a57" transparent opacity={0.28} />
      </mesh>

      <mesh position={[-18, -0.035, -4]} rotation={[-Math.PI / 2, -0.45, 0]}>
        <planeGeometry args={[9, 26]} />
        <meshBasicMaterial color="#927b59" transparent opacity={0.2} />
      </mesh>

      <mesh position={[24, -0.03, -20]} rotation={[-Math.PI / 2, 0.12, 0]}>
        <circleGeometry args={[9, 28]} />
        <meshBasicMaterial color="#93b870" transparent opacity={0.16} />
      </mesh>

      {terrainDetails.map((detail, index) => (
        <TerrainDetail key={index} {...detail} />
      ))}

      <SkyDome />
    </group>
  );
}

interface TerrainDetailProps {
  type: 'rock' | 'shrub' | 'humanTrash';
  position: [number, number, number];
  scale: number;
  rotation: number;
  variant?: number;
}

function TerrainDetail({ type, position, scale, rotation, variant = 0 }: TerrainDetailProps) {
  if (type === 'rock') {
    return (
      <group position={position} rotation={[0, rotation, 0]}>
        <mesh castShadow receiveShadow>
          <dodecahedronGeometry args={[scale * 0.55, 0]} />
          <meshStandardMaterial color="#62645b" roughness={0.95} />
        </mesh>
      </group>
    );
  }

  if (type === 'shrub') {
    return (
      <group position={position} rotation={[0, rotation, 0]}>
        <mesh>
          <sphereGeometry args={[scale * 0.55, 8, 8]} />
          <meshStandardMaterial color="#56763f" roughness={1} />
        </mesh>
        <mesh position={[0, -scale * 0.18, 0]}>
          <cylinderGeometry args={[scale * 0.08, scale * 0.1, scale * 0.4, 6]} />
          <meshStandardMaterial color="#5d4330" roughness={1} />
        </mesh>
      </group>
    );
  }

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {variant === 0 && (
        <>
          <mesh castShadow>
            <cylinderGeometry args={[scale * 0.14, scale * 0.14, scale * 0.9, 8]} />
            <meshStandardMaterial color="#d8e7ef" roughness={0.35} metalness={0.2} />
          </mesh>
          <mesh position={[0, scale * 0.2, 0]}>
            <cylinderGeometry args={[scale * 0.07, scale * 0.07, scale * 0.18, 8]} />
            <meshStandardMaterial color="#45a2d9" roughness={0.5} />
          </mesh>
        </>
      )}

      {variant === 1 && (
        <>
          <mesh castShadow rotation={[0.2, 0, 0.5]}>
            <boxGeometry args={[scale * 0.95, scale * 0.14, scale * 0.65]} />
            <meshStandardMaterial color="#e7d8c9" roughness={0.9} />
          </mesh>
          <mesh position={[0, scale * 0.06, 0]}>
            <planeGeometry args={[scale * 0.7, scale * 0.32]} />
            <meshBasicMaterial color="#d07c49" />
          </mesh>
        </>
      )}

      {variant === 2 && (
        <>
          <mesh castShadow>
            <torusGeometry args={[scale * 0.32, scale * 0.12, 6, 10]} />
            <meshStandardMaterial color="#2d2d2d" roughness={0.95} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <torusGeometry args={[scale * 0.16, scale * 0.06, 6, 10]} />
            <meshStandardMaterial color="#5b5b5b" roughness={0.9} />
          </mesh>
        </>
      )}

      {variant === 3 && (
        <>
          <mesh castShadow rotation={[0, 0.4, -0.2]}>
            <boxGeometry args={[scale * 0.45, scale * 0.9, scale * 0.18]} />
            <meshStandardMaterial color="#3f5b72" roughness={0.75} />
          </mesh>
          <mesh position={[0, scale * 0.06, scale * 0.11]}>
            <planeGeometry args={[scale * 0.24, scale * 0.46]} />
            <meshBasicMaterial color="#9fdcff" />
          </mesh>
        </>
      )}
    </group>
  );
}

function SkyDome() {
  return (
    <mesh>
      <sphereGeometry args={[200, 18, 18]} />
      <meshBasicMaterial color="#cfe6ff" side={1} transparent opacity={0.55} />
    </mesh>
  );
}
