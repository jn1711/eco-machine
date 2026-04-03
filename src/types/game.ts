// Game State Types
export type GameScreen = 'menu' | 'game' | 'loading';

export interface RobotStats {
  capacity: number;
  speed: number;
  collectAmount: number;
}

export interface UpgradeLevels {
  capacity: number;
  speed: number;
  collectAmount: number;
}

export interface GameState {
  screen: GameScreen;
  money: number;
  inventory: number;
  maxCapacity: number;
  robotSpeed: number;
  collectAmount: number;
  upgradeLevels: UpgradeLevels;
  isUpgradeMenuOpen: boolean;
}

export interface TrashPile {
  id: string;
  position: { x: number; z: number };
  items: number;
  maxItems: number;
}

export interface TrashItem {
  id: string;
  type: 'common' | 'rare' | 'epic';
  value: number;
  color: string;
}

export const TRASH_TYPES: Record<string, TrashItem> = {
  common: { id: 'common', type: 'common', value: 10, color: '#8B7355' },
  rare: { id: 'rare', type: 'rare', value: 25, color: '#4A90D9' },
  epic: { id: 'epic', type: 'epic', value: 50, color: '#9B59B6' },
};

export const UPGRADE_COSTS = {
  capacity: (level: number) => level * 100,
  speed: (level: number) => level * 150,
  collectAmount: (level: number) => level * 200,
};

export const UPGRADE_MAX_LEVELS = {
  capacity: 5, // Max 20 items
  speed: 5,    // Max speed 15
  collectAmount: 5, // Max 5 items per collect
};

export const INITIAL_STATS = {
  capacity: 4,
  speed: 5,
  collectAmount: 1,
};
