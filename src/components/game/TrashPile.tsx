import { useMemo } from 'react';

interface TrashPileProps {
  position: { x: number; z: number };
  items: number;
}

const TRASH_COLORS = ['#c96d3a', '#4ea7a1', '#6274c9', '#6a6a6a', '#8f5f2e', '#7d9b3b'];
const TRASH_SHAPES = ['monitor', 'canister', 'bundle', 'crate'] as const;

export function TrashPile({ position, items }: TrashPileProps) {
  const trashItems = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 0.8,
        0.08 + i * 0.12 + Math.random() * 0.08,
        (Math.random() - 0.5) * 0.8,
      ] as [number, number, number],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      ] as [number, number, number],
      scale: 0.1 + Math.random() * 0.15,
      color: TRASH_COLORS[Math.floor(Math.random() * TRASH_COLORS.length)],
      shape: TRASH_SHAPES[Math.floor(Math.random() * TRASH_SHAPES.length)],
    }));
  }, []);

  return (
    <group position={[position.x, 0, position.z]}>
      {/* Ground shadow */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.8, 16]} />
        <meshBasicMaterial color="#20160e" transparent opacity={0.25} />
      </mesh>

      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.45, 0.7, 18]} />
        <meshBasicMaterial color="#d29a4a" transparent opacity={0.35} />
      </mesh>

      {/* Trash items */}
      {trashItems.map((item, index) => (
        <TrashItem 
          key={item.id} 
          {...item} 
          visible={index < items}
        />
      ))}

      {/* Collection indicator (shows when player is near) */}
      {items > 0 && (
        <mesh position={[0, 1.2, 0]}>
          <planeGeometry args={[0.3, 0.3]} />
          <meshBasicMaterial 
            color="#FFD700" 
            transparent 
            opacity={0.8}
          />
        </mesh>
      )}
    </group>
  );
}

interface TrashItemProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color: string;
  shape: typeof TRASH_SHAPES[number];
  visible: boolean;
}

function TrashItem({ position, rotation, scale, color, shape, visible }: TrashItemProps) {
  if (!visible) return null;

  return (
    <group position={position} rotation={rotation}>
      {shape === 'monitor' && (
        <>
          <mesh castShadow>
            <boxGeometry args={[scale * 1.1, scale * 0.8, scale * 0.8]} />
            <meshStandardMaterial color="#3e4348" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0, scale * 0.41]} castShadow>
            <planeGeometry args={[scale * 0.76, scale * 0.5]} />
            <meshBasicMaterial color={color} />
          </mesh>
          <mesh position={[0, -scale * 0.33, 0]} castShadow>
            <boxGeometry args={[scale * 0.3, scale * 0.18, scale * 0.3]} />
            <meshStandardMaterial color="#7b7f84" roughness={0.7} />
          </mesh>
        </>
      )}

      {shape === 'canister' && (
        <>
          <mesh castShadow>
            <cylinderGeometry args={[scale * 0.34, scale * 0.34, scale * 1.2, 8]} />
            <meshStandardMaterial color={color} roughness={0.7} metalness={0.12} />
          </mesh>
          <mesh position={[0, scale * 0.22, scale * 0.25]} castShadow>
            <boxGeometry args={[scale * 0.22, scale * 0.18, scale * 0.1]} />
            <meshStandardMaterial color="#2f2f2f" roughness={0.5} />
          </mesh>
          <mesh position={[0, scale * 0.42, 0]} castShadow>
            <cylinderGeometry args={[scale * 0.12, scale * 0.12, scale * 0.18, 8]} />
            <meshStandardMaterial color="#d6d6d6" metalness={0.4} roughness={0.3} />
          </mesh>
        </>
      )}

      {shape === 'bundle' && (
        <>
          <mesh castShadow>
            <boxGeometry args={[scale * 1.05, scale * 0.62, scale * 0.75]} />
            <meshStandardMaterial color={color} roughness={0.95} />
          </mesh>
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[scale * 1.1, scale * 0.08, scale * 0.82]} />
            <meshStandardMaterial color="#d7c6a0" roughness={0.8} />
          </mesh>
          <mesh position={[0, scale * 0.2, 0]} castShadow>
            <boxGeometry args={[scale * 0.1, scale * 0.48, scale * 0.1]} />
            <meshStandardMaterial color="#d7c6a0" roughness={0.8} />
          </mesh>
        </>
      )}

      {shape === 'crate' && (
        <>
          <mesh castShadow>
            <boxGeometry args={[scale, scale * 0.78, scale]} />
            <meshStandardMaterial color="#765434" roughness={0.95} />
          </mesh>
          <mesh position={[0, 0, scale * 0.51]} castShadow>
            <boxGeometry args={[scale * 0.82, scale * 0.12, scale * 0.08]} />
            <meshStandardMaterial color="#c99857" roughness={0.75} />
          </mesh>
          <mesh position={[0, scale * 0.27, 0]} castShadow>
            <boxGeometry args={[scale * 0.82, scale * 0.1, scale * 0.82]} />
            <meshStandardMaterial color="#c99857" roughness={0.75} />
          </mesh>
        </>
      )}
    </group>
  );
}
