import { useGameStore } from '@/store/gameStore';
import { UPGRADE_MAX_LEVELS } from '@/types/game';

interface UpgradeMenuProps {
  onClose: () => void;
}

export function UpgradeMenu({ onClose }: UpgradeMenuProps) {
  const { 
    money, 
    maxCapacity, 
    robotSpeed, 
    collectAmount,
    upgradeLevels,
    upgradeCapacity,
    upgradeSpeed,
    upgradeCollectAmount,
    getUpgradeCost,
    canUpgrade
  } = useGameStore();

  const handleUpgrade = (type: 'capacity' | 'speed' | 'collectAmount') => {
    switch (type) {
      case 'capacity':
        upgradeCapacity();
        break;
      case 'speed':
        upgradeSpeed();
        break;
      case 'collectAmount':
        upgradeCollectAmount();
        break;
    }
  };

  const upgrades = [
    {
      key: 'capacity' as const,
      name: '📦 Вместимость',
      current: maxCapacity,
      unit: 'предметов',
      level: upgradeLevels.capacity,
      maxLevel: UPGRADE_MAX_LEVELS.capacity,
      description: '+4 к вместимости',
    },
    {
      key: 'speed' as const,
      name: '⚡ Скорость',
      current: robotSpeed,
      unit: '',
      level: upgradeLevels.speed,
      maxLevel: UPGRADE_MAX_LEVELS.speed,
      description: '+2 к скорости',
    },
    {
      key: 'collectAmount' as const,
      name: '🔧 Сбор',
      current: collectAmount,
      unit: 'за раз',
      level: upgradeLevels.collectAmount,
      maxLevel: UPGRADE_MAX_LEVELS.collectAmount,
      description: '+1 к сбору',
    },
  ];

  return (
    <div className="upgrade-menu">
      <button className="close-button" onClick={onClose}>×</button>
      <h2 className="upgrade-title">⚙️ ЦЕНТР УЛУЧШЕНИЙ</h2>
      
      <div className="text-center mb-4 text-yellow-400 minecraft-font text-sm">
        💰 Доступно: ${money}
      </div>

      {upgrades.map((upgrade) => {
        const cost = getUpgradeCost(upgrade.key);
        const canBuy = canUpgrade(upgrade.key);
        const isMaxed = upgrade.level >= upgrade.maxLevel;

        return (
          <div key={upgrade.key} className="upgrade-item">
            <div className="flex flex-col">
              <span>{upgrade.name}</span>
              <span className="text-xs text-gray-400 mt-1">
                {upgrade.current} {upgrade.unit} (Ур. {upgrade.level}/{upgrade.maxLevel})
              </span>
              <span className="text-xs text-green-400">
                {upgrade.description}
              </span>
            </div>
            <button
              className="upgrade-button"
              onClick={() => handleUpgrade(upgrade.key)}
              disabled={!canBuy}
            >
              {isMaxed ? 'МАКС' : `$${cost}`}
            </button>
          </div>
        );
      })}

      <div className="text-center mt-4 text-xs text-gray-500 minecraft-font">
        Нажмите ESC чтобы закрыть
      </div>
    </div>
  );
}
