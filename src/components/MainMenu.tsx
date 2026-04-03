import { useGameStore } from '@/store/gameStore';

export function MainMenu() {
  const setScreen = useGameStore((state) => state.setScreen);
  const resetGame = useGameStore((state) => state.resetGame);

  const handlePlay = () => {
    setScreen('loading');
    // Simulate loading then go to game
    setTimeout(() => {
      setScreen('game');
    }, 1500);
  };

  const handleResetProgress = () => {
    const shouldReset = window.confirm(
      'Сбросить прогресс до стартовых значений?'
    );

    if (!shouldReset) {
      return;
    }

    resetGame();
  };

  const handleExit = () => {
    window.close();
    // Fallback
    alert('Спасибо за игру! Закройте вкладку чтобы выйти.');
  };

  return (
    <div className="menu-overlay">
      <h1 className="game-title">ECO MACHINE</h1>
      <div className="flex flex-col gap-4">
        <button 
          className="menu-button play-button"
          onClick={handlePlay}
        >
          🎮 ИГРАТЬ
        </button>
        <button
          className="menu-button reset-button"
          onClick={handleResetProgress}
        >
          🔄 СБРОС ПРОГРЕССА
        </button>
        <button 
          className="menu-button exit-button"
          onClick={handleExit}
        >
          🚪 ВЫЙТИ
        </button>
      </div>
      <div className="absolute bottom-10 text-white/60 text-sm minecraft-font text-center px-4">
        v1.0 - Очисти планету! ♻️
      </div>
    </div>
  );
}
