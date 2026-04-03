import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  GameScreen, 
  GameState, 
  UpgradeLevels
} from '@/types/game';
import { 
  INITIAL_STATS,
  UPGRADE_MAX_LEVELS 
} from '@/types/game';

interface GameStore extends GameState {
  // Actions
  setScreen: (screen: GameScreen) => void;
  addMoney: (amount: number) => void;
  spendMoney: (amount: number) => boolean;
  addToInventory: (amount: number) => boolean;
  removeFromInventory: (amount: number) => void;
  clearInventory: () => void;
  upgradeCapacity: () => boolean;
  upgradeSpeed: () => boolean;
  upgradeCollectAmount: () => boolean;
  toggleUpgradeMenu: () => void;
  setUpgradeMenuOpen: (open: boolean) => void;
  resetGame: () => void;
  // Getters
  getUpgradeCost: (type: keyof UpgradeLevels) => number;
  canUpgrade: (type: keyof UpgradeLevels) => boolean;
}

const initialState: GameState = {
  screen: 'menu',
  money: 0,
  inventory: 0,
  maxCapacity: INITIAL_STATS.capacity,
  robotSpeed: INITIAL_STATS.speed,
  collectAmount: INITIAL_STATS.collectAmount,
  upgradeLevels: {
    capacity: 1,
    speed: 1,
    collectAmount: 1,
  },
  isUpgradeMenuOpen: false,
};

const initialPersistedState = {
  money: initialState.money,
  maxCapacity: initialState.maxCapacity,
  robotSpeed: initialState.robotSpeed,
  collectAmount: initialState.collectAmount,
  upgradeLevels: initialState.upgradeLevels,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setScreen: (screen) => set({ screen }),

      addMoney: (amount) => set((state) => ({ 
        money: state.money + amount 
      })),

      spendMoney: (amount) => {
        const state = get();
        if (state.money >= amount) {
          set({ money: state.money - amount });
          return true;
        }
        return false;
      },

      addToInventory: (amount) => {
        const state = get();
        const newAmount = state.inventory + amount;
        if (newAmount <= state.maxCapacity) {
          set({ inventory: newAmount });
          return true;
        }
        return false;
      },

      removeFromInventory: (amount) => set((state) => ({
        inventory: Math.max(0, state.inventory - amount)
      })),

      clearInventory: () => set({ inventory: 0 }),

      upgradeCapacity: () => {
        const state = get();
        const cost = state.upgradeLevels.capacity * 100;
        if (state.money >= cost && state.upgradeLevels.capacity < UPGRADE_MAX_LEVELS.capacity) {
          set({
            money: state.money - cost,
            maxCapacity: state.maxCapacity + 4,
            upgradeLevels: {
              ...state.upgradeLevels,
              capacity: state.upgradeLevels.capacity + 1
            }
          });
          return true;
        }
        return false;
      },

      upgradeSpeed: () => {
        const state = get();
        const cost = state.upgradeLevels.speed * 150;
        if (state.money >= cost && state.upgradeLevels.speed < UPGRADE_MAX_LEVELS.speed) {
          set({
            money: state.money - cost,
            robotSpeed: state.robotSpeed + 2,
            upgradeLevels: {
              ...state.upgradeLevels,
              speed: state.upgradeLevels.speed + 1
            }
          });
          return true;
        }
        return false;
      },

      upgradeCollectAmount: () => {
        const state = get();
        const cost = state.upgradeLevels.collectAmount * 200;
        if (state.money >= cost && state.upgradeLevels.collectAmount < UPGRADE_MAX_LEVELS.collectAmount) {
          set({
            money: state.money - cost,
            collectAmount: state.collectAmount + 1,
            upgradeLevels: {
              ...state.upgradeLevels,
              collectAmount: state.upgradeLevels.collectAmount + 1
            }
          });
          return true;
        }
        return false;
      },

      toggleUpgradeMenu: () => set((state) => ({ 
        isUpgradeMenuOpen: !state.isUpgradeMenuOpen 
      })),

      setUpgradeMenuOpen: (open) => set({ isUpgradeMenuOpen: open }),

      resetGame: () => set(initialState),

      getUpgradeCost: (type) => {
        const state = get();
        switch (type) {
          case 'capacity':
            return state.upgradeLevels.capacity * 100;
          case 'speed':
            return state.upgradeLevels.speed * 150;
          case 'collectAmount':
            return state.upgradeLevels.collectAmount * 200;
          default:
            return 0;
        }
      },

      canUpgrade: (type) => {
        const state = get();
        const cost = get().getUpgradeCost(type);
        return state.money >= cost && state.upgradeLevels[type] < UPGRADE_MAX_LEVELS[type];
      },
    }),
    {
      name: 'eco-machine-save',
      version: 2,
      migrate: () => initialPersistedState,
      partialize: (state) => ({
        money: state.money,
        maxCapacity: state.maxCapacity,
        robotSpeed: state.robotSpeed,
        collectAmount: state.collectAmount,
        upgradeLevels: state.upgradeLevels,
      }),
    }
  )
);
