import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';

interface HUDProps {
  hint?: string;
  nearRecycling?: boolean;
  nearUpgrade?: boolean;
  currentLevel: number;
  collectedForLevel: number;
  targetForLevel: number;
}

export function HUD({
  hint,
  nearRecycling,
  nearUpgrade,
  currentLevel,
  collectedForLevel,
  targetForLevel,
}: HUDProps) {
  const [isHidden, setIsHidden] = useState(false);
  const { money, inventory, maxCapacity, upgradeLevels } = useGameStore();

  const safeCollected = Math.min(collectedForLevel, targetForLevel);

  return (
    <div className={`hud ${isHidden ? 'hud-hidden' : ''}`}>
      <button
        type="button"
        className="hud-toggle"
        onClick={() => setIsHidden((prev) => !prev)}
      >
        {isHidden ? 'HUD ON' : 'HUD OFF'}
      </button>

      {!isHidden && (
        <>
          <div className="hud-panel hud-money-panel">
            <div className="hud-panel-label">ДЕНЬГИ</div>
            <div className="hud-panel-value hud-money-value">${money}</div>
          </div>

          <div className="hud-panel hud-trash-panel">
            <div className="hud-panel-label">МУСОР</div>
            <div className="hud-panel-value">{inventory}/{maxCapacity}</div>
          </div>

          <div className="hud-panel hud-level-panel">
            <div className="hud-panel-label">УРОВЕНЬ</div>
            <div className="hud-panel-value">{currentLevel}</div>
            <div className="hud-panel-meta">ЦЕЛЬ {safeCollected}/{targetForLevel}</div>
          </div>

          <div className="hud-panel hud-upgrades-panel">
            <div className="hud-panel-title">УЛУЧШЕНИЯ</div>
            <div className="hud-upgrade-item">
              <span>ВМЕСТ.</span>
              <strong>{upgradeLevels.capacity}</strong>
            </div>
            <div className="hud-upgrade-item">
              <span>СКОР.</span>
              <strong>{upgradeLevels.speed}</strong>
            </div>
            <div className="hud-upgrade-item">
              <span>СБОР</span>
              <strong>{upgradeLevels.collectAmount}</strong>
            </div>
          </div>

          {(nearRecycling || nearUpgrade || hint) && (
            <div className="hud-panel hud-status-panel">
              {nearRecycling && (
                <div className="hud-status-line">СТАНЦИЯ ПЕРЕРАБОТКИ РЯДОМ</div>
              )}
              {nearUpgrade && (
                <div className="hud-status-line">ЦЕНТР УЛУЧШЕНИЙ РЯДОМ</div>
              )}
              {hint && (
                <div className="hud-status-hint">{hint}</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
