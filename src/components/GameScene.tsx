import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useGameStore } from '@/store/gameStore';
import { Robot } from './game/Robot';
import { TrashPile } from './game/TrashPile';
import { RecyclingStation } from './game/RecyclingStation';
import { UpgradeCenter } from './game/UpgradeCenter';
import { DUNE_OBSTACLES, Wasteland } from './game/Wasteland';
import { HUD } from './HUD';
import { UpgradeMenu } from './UpgradeMenu';
import { TouchControls } from './TouchControls';
import type { TrashPile as TrashPileType } from '@/types/game';
import type { Dispatch, SetStateAction } from 'react';

const TRASH_INTERACTION_RADIUS = 2.5;
const RECYCLING_INTERACTION_RADIUS = 6;
const UPGRADE_INTERACTION_RADIUS = 12;
const ROBOT_COLLISION_RADIUS = 0.8;
const BASE_LEVEL_TARGET = 30;
const LEVEL_TRASH_BUFFER = 10;

function getLevelTarget(level: number) {
  return BASE_LEVEL_TARGET + (level - 1) * 15;
}

function createTrashPiles(targetAmount: number): TrashPileType[] {
  const totalTrash = targetAmount + LEVEL_TRASH_BUFFER;
  const pileCount = Math.max(15, Math.ceil(totalTrash / 5));
  const piles = Array.from({ length: pileCount }, (_, i) => ({
    id: `pile-${i}`,
    position: {
      x: (Math.random() - 0.5) * 50,
      z: (Math.random() - 0.5) * 50,
    },
    items: 3,
    maxItems: 5,
  }));

  let remainingTrash = totalTrash - pileCount * 3;
  let pileIndex = 0;

  while (remainingTrash > 0) {
    const pile = piles[pileIndex % piles.length];
    if (pile.items < pile.maxItems) {
      pile.items += 1;
      remainingTrash -= 1;
    }
    pileIndex += 1;
  }

  return piles;
}

function getDistance2D(a: { x: number; z: number }, b: { x: number; z: number }) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function isNearUpgradeCenter(center: { x: number; z: number }, point: { x: number; z: number }) {
  const dx = Math.abs(center.x - point.x);
  const dz = Math.abs(center.z - point.z);
  return getDistance2D(center, point) < UPGRADE_INTERACTION_RADIUS || (dx < 7 && dz < 7);
}

function canMoveToPoint(from: { x: number; z: number }, to: { x: number; z: number }) {
  if (Math.abs(to.x) >= 45 || Math.abs(to.z) >= 45) {
    return false;
  }

  return DUNE_OBSTACLES.some((obstacle) => {
    const limit = obstacle.collisionRadius + ROBOT_COLLISION_RADIUS;
    const currentDistance = Math.hypot(obstacle.position[0] - from.x, obstacle.position[2] - from.z);
    const nextDistance = Math.hypot(obstacle.position[0] - to.x, obstacle.position[2] - to.z);

    if (currentDistance < limit) {
      return nextDistance < currentDistance;
    }

    return nextDistance < limit;
  }) === false;
}

// Camera controller that follows the robot
function CameraController({ target }: { target: Vector3 }) {
  const { camera } = useThree();
  const smoothTarget = useRef(new Vector3());

  useFrame(() => {
    // Smoothly interpolate camera target
    smoothTarget.current.lerp(target, 0.08);
    
    // Position camera above and behind the robot
    const idealOffset = new Vector3(0, 15, 12);
    const idealPosition = smoothTarget.current.clone().add(idealOffset);
    
    camera.position.lerp(idealPosition, 0.08);
    camera.lookAt(smoothTarget.current);
  });

  return null;
}

// Ground click handler
function GroundClickHandler({ onMove }: { onMove: (point: Vector3) => void }) {
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const mouse = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );

      raycaster.current.setFromCamera(mouse, camera);
      const target = new THREE.Vector3();
      raycaster.current.ray.intersectPlane(plane.current, target);
      
      if (target) {
        onMove(target);
      }
    };

    const canvasElement = gl.domElement;
    canvasElement.addEventListener('click', handleClick);
    return () => canvasElement.removeEventListener('click', handleClick);
  }, [camera, gl, onMove]);

  return null;
}

// Import THREE
import * as THREE from 'three';

interface GameWorldProps {
  setHint: Dispatch<SetStateAction<string>>;
  setNearRecycling: Dispatch<SetStateAction<boolean>>;
  setNearUpgrade: Dispatch<SetStateAction<boolean>>;
  joystickInput: { x: number; y: number };
  trashPiles: TrashPileType[];
  setTrashPiles: Dispatch<SetStateAction<TrashPileType[]>>;
  setCollectedForLevel: Dispatch<SetStateAction<number>>;
  targetForLevel: number;
  isLevelComplete: boolean;
  setIsLevelComplete: Dispatch<SetStateAction<boolean>>;
}

// Game world component
function GameWorld({
  setHint,
  setNearRecycling,
  setNearUpgrade,
  joystickInput,
  trashPiles,
  setTrashPiles,
  setCollectedForLevel,
  targetForLevel,
  isLevelComplete,
  setIsLevelComplete,
}: GameWorldProps) {
  const robotPosition = useRef(new Vector3(0, 0, 0));
  const targetPosition = useRef(new Vector3(0, 0, 0));
  const hintTimeoutRef = useRef<number | null>(null);
  const lastHintRef = useRef('');
  const lastNearRecyclingRef = useRef(false);
  const lastNearUpgradeRef = useRef(false);
  
  const {
    inventory,
    maxCapacity,
    addToInventory,
    addMoney,
    clearInventory,
    isUpgradeMenuOpen,
    setUpgradeMenuOpen,
    collectAmount,
    robotSpeed,
  } = useGameStore();

  // Base positions
  const recyclingStationPos = useMemo(() => ({ x: 20, z: 20 }), []);
  const upgradeCenterPos = useMemo(() => ({ x: -20, z: -20 }), []);

  const updateHint = useCallback((nextHint: string) => {
    if (lastHintRef.current !== nextHint) {
      lastHintRef.current = nextHint;
      setHint(nextHint);
    }
  }, []);

  const showTimedHint = useCallback((nextHint: string, duration: number) => {
    updateHint(nextHint);

    if (hintTimeoutRef.current !== null) {
      window.clearTimeout(hintTimeoutRef.current);
    }

    hintTimeoutRef.current = window.setTimeout(() => {
      updateHint('');
      hintTimeoutRef.current = null;
    }, duration);
  }, [updateHint]);

  const updateNearRecycling = useCallback((value: boolean) => {
    if (lastNearRecyclingRef.current !== value) {
      lastNearRecyclingRef.current = value;
      setNearRecycling(value);
    }
  }, []);

  const updateNearUpgrade = useCallback((value: boolean) => {
    if (lastNearUpgradeRef.current !== value) {
      lastNearUpgradeRef.current = value;
      setNearUpgrade(value);
    }
  }, []);

  // Handle trash collection
  const handleTrashCollect = useCallback((pileId: string, amount: number) => {
    const success = addToInventory(amount);
    if (success) {
      setTrashPiles((prev) =>
        prev.map((pile) =>
          pile.id === pileId ? { ...pile, items: pile.items - amount } : pile
        )
      );

      setCollectedForLevel((prev) => {
        const nextValue = prev + amount;
        if (nextValue >= targetForLevel) {
          setIsLevelComplete(true);
        }
        return nextValue;
      });
    }
  }, [addToInventory, targetForLevel]);

  // Handle recycling
  const handleRecycle = useCallback(() => {
    if (inventory > 0) {
      const earnings = inventory * 10;
      addMoney(earnings);
      clearInventory();
      showTimedHint(`Переработано! +$${earnings}`, 2000);
    }
  }, [inventory, addMoney, clearInventory, showTimedHint]);

  // Handle action button
  const handleAction = useCallback(() => {
    if (isUpgradeMenuOpen) {
      setUpgradeMenuOpen(false);
      return;
    }

    const robotPos = { x: robotPosition.current.x, z: robotPosition.current.z };
    
    // Check trash piles
    let collected = false;
    trashPiles.forEach((pile) => {
      const distance = getDistance2D(pile.position, robotPos);
      if (distance < TRASH_INTERACTION_RADIUS && pile.items > 0 && !collected) {
        const canCollect = Math.min(
          collectAmount,
          pile.items,
          maxCapacity - inventory
        );
        if (canCollect > 0 && inventory < maxCapacity) {
          handleTrashCollect(pile.id, canCollect);
          showTimedHint(`+${canCollect} мусора`, 1000);
          collected = true;
        } else if (inventory >= maxCapacity) {
          showTimedHint('Тележка полна! Отвезите на базу.', 2000);
        }
      }
    });

    if (collected) return;

    // Check recycling station
    const recycleDistance = getDistance2D(recyclingStationPos, robotPos);
    if (recycleDistance < RECYCLING_INTERACTION_RADIUS) {
      handleRecycle();
      return;
    }

    // Check upgrade center
    if (isNearUpgradeCenter(upgradeCenterPos, robotPos)) {
      setUpgradeMenuOpen(true);
      showTimedHint('Центр улучшений открыт', 1200);
    }
  }, [isUpgradeMenuOpen, trashPiles, inventory, maxCapacity, collectAmount, handleTrashCollect, handleRecycle, setUpgradeMenuOpen, showTimedHint]);

  // Handle keyboard input and movement
  useEffect(() => {
    const keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isUpgradeMenuOpen || isLevelComplete) {
        if (e.code === 'Escape') {
          setUpgradeMenuOpen(false);
        }
        return;
      }

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handleAction();
        return;
      }

      if (keys.hasOwnProperty(e.key)) {
        keys[e.key as keyof typeof keys] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (keys.hasOwnProperty(e.key)) {
        keys[e.key as keyof typeof keys] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Movement loop
    const moveInterval = setInterval(() => {
      if (isUpgradeMenuOpen || isLevelComplete) return;

      const speed = robotSpeed * 0.03;
      let dx = 0;
      let dz = 0;

      // Keyboard input
      if (keys.w || keys.ArrowUp) dz -= 1;
      if (keys.s || keys.ArrowDown) dz += 1;
      if (keys.a || keys.ArrowLeft) dx -= 1;
      if (keys.d || keys.ArrowRight) dx += 1;

      // Joystick input (mobile)
      if (joystickInput.x !== 0 || joystickInput.y !== 0) {
        dx = joystickInput.x;
        dz = -joystickInput.y;
      }

      const robotPos = { x: robotPosition.current.x, z: robotPosition.current.z };

      if (dx !== 0 || dz !== 0) {
        // Normalize diagonal movement
        const length = Math.sqrt(dx * dx + dz * dz);
        if (length > 1) {
          dx /= length;
          dz /= length;
        }

        const newX = robotPosition.current.x + dx * speed;
        const newZ = robotPosition.current.z + dz * speed;
        const nextPoint = { x: newX, z: newZ };

        // Keep within bounds
        if (canMoveToPoint(robotPos, nextPoint)) {
          targetPosition.current.set(newX, 0, newZ);
        }
      }

      // Check distances for hints
      // Check trash piles
      let nearTrash = false;
      trashPiles.forEach((pile) => {
        const distance = getDistance2D(pile.position, robotPos);
        if (distance < TRASH_INTERACTION_RADIUS && pile.items > 0) {
          nearTrash = true;
          if (inventory < maxCapacity) {
            updateHint('Нажмите ПРОБЕЛ или кнопку ДЕЙСТВИЕ');
          }
        }
      });

      // Check recycling station
      const recycleDistance = getDistance2D(recyclingStationPos, robotPos);
      updateNearRecycling(recycleDistance < RECYCLING_INTERACTION_RADIUS);
      if (recycleDistance < RECYCLING_INTERACTION_RADIUS && inventory > 0) {
        updateHint('Нажмите ПРОБЕЛ или кнопку ДЕЙСТВИЕ для переработки');
      }

      // Check upgrade center
      const nearUpgradeCenter = isNearUpgradeCenter(upgradeCenterPos, robotPos);
      updateNearUpgrade(nearUpgradeCenter);
      if (nearUpgradeCenter) {
        updateHint('Нажмите ПРОБЕЛ или кнопку ДЕЙСТВИЕ для улучшений');
      }

      if (
        !nearTrash &&
        recycleDistance >= RECYCLING_INTERACTION_RADIUS &&
        !nearUpgradeCenter
      ) {
        updateHint('');
      }
    }, 16);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(moveInterval);
      if (hintTimeoutRef.current !== null) {
        window.clearTimeout(hintTimeoutRef.current);
      }
    };
  }, [isLevelComplete, isUpgradeMenuOpen, trashPiles, inventory, maxCapacity, handleAction, joystickInput, robotSpeed, recyclingStationPos, updateHint, updateNearRecycling, updateNearUpgrade, upgradeCenterPos]);

  // Handle click to move
  const handleGroundClick = useCallback((point: Vector3) => {
    if (isUpgradeMenuOpen) return;
    // Limit click range
    const currentPoint = { x: robotPosition.current.x, z: robotPosition.current.z };
    if (canMoveToPoint(currentPoint, { x: point.x, z: point.z })) {
      targetPosition.current.copy(point);
    }
  }, [isUpgradeMenuOpen]);

  return (
    <>
      <CameraController target={robotPosition.current} />
      <GroundClickHandler onMove={handleGroundClick} />
      
      {/* Lighting */}
      <ambientLight intensity={0.65} color="#dff1cf" />
      <directionalLight
        position={[30, 50, 20]}
        intensity={1.1}
        color="#fff4d6"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={110}
        shadow-camera-left={-48}
        shadow-camera-right={48}
        shadow-camera-top={48}
        shadow-camera-bottom={-48}
      />
      <pointLight position={[20, 8, 20]} intensity={0.35} color="#ffe3a8" distance={28} />
      <pointLight position={[-20, 8, -20]} intensity={0.28} color="#a6d8a8" distance={28} />

      {/* Environment */}
      <Wasteland />

      {/* Robot */}
      <Robot 
        positionRef={robotPosition} 
        targetRef={targetPosition}
      />

      {/* Trash piles */}
      {trashPiles.map((pile) => (
        <TrashPile
          key={pile.id}
          position={pile.position}
          items={pile.items}
        />
      ))}

      {/* Recycling Station */}
      <RecyclingStation position={recyclingStationPos} />

      {/* Upgrade Center */}
      <UpgradeCenter position={upgradeCenterPos} />
    </>
  );
}

export function GameScene() {
  const isUpgradeMenuOpen = useGameStore((state) => state.isUpgradeMenuOpen);
  const setUpgradeMenuOpen = useGameStore((state) => state.setUpgradeMenuOpen);
  const clearInventory = useGameStore((state) => state.clearInventory);
  const [hint, setHint] = useState('');
  const [nearRecycling, setNearRecycling] = useState(false);
  const [nearUpgrade, setNearUpgrade] = useState(false);
  const [joystickInput, setJoystickInput] = useState({ x: 0, y: 0 });
  const [currentLevel, setCurrentLevel] = useState(1);
  const [collectedForLevel, setCollectedForLevel] = useState(0);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const targetForLevel = useMemo(() => getLevelTarget(currentLevel), [currentLevel]);
  const [trashPiles, setTrashPiles] = useState<TrashPileType[]>(() => createTrashPiles(getLevelTarget(1)));

  const handleNextLevel = useCallback(() => {
    const nextLevel = currentLevel + 1;
    setCurrentLevel(nextLevel);
    setCollectedForLevel(0);
    setIsLevelComplete(false);
    setTrashPiles(createTrashPiles(getLevelTarget(nextLevel)));
    clearInventory();
    setHint('');
  }, [clearInventory, currentLevel]);

  return (
    <div className="game-canvas">
      <Canvas
        shadows
        camera={{ position: [0, 15, 12], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        style={{ background: '#b7d6ee' }}
      >
        <GameWorld
          setHint={setHint}
          setNearRecycling={setNearRecycling}
          setNearUpgrade={setNearUpgrade}
          joystickInput={joystickInput}
          trashPiles={trashPiles}
          setTrashPiles={setTrashPiles}
          setCollectedForLevel={setCollectedForLevel}
          targetForLevel={targetForLevel}
          isLevelComplete={isLevelComplete}
          setIsLevelComplete={setIsLevelComplete}
        />
      </Canvas>

      <HUD
        hint={hint}
        nearRecycling={nearRecycling}
        nearUpgrade={nearUpgrade}
        currentLevel={currentLevel}
        collectedForLevel={collectedForLevel}
        targetForLevel={targetForLevel}
      />

      <TouchControls
        onJoystickMove={setJoystickInput}
        onAction={() => {
          const event = new KeyboardEvent('keydown', { key: ' ', code: 'Space' });
          window.dispatchEvent(event);
        }}
      />

      {isLevelComplete && (
        <div className="level-complete-overlay">
          <div className="level-complete-card">
            <div className="level-complete-title">Уровень {currentLevel} закончился</div>
            <div className="level-complete-text">
              Собрано {Math.min(collectedForLevel, targetForLevel)} из {targetForLevel} мусора
            </div>
            <button className="level-next-button" onClick={handleNextLevel}>
              Дальше
            </button>
          </div>
        </div>
      )}

      {isUpgradeMenuOpen && (
        <UpgradeMenu onClose={() => setUpgradeMenuOpen(false)} />
      )}
    </div>
  );
}
