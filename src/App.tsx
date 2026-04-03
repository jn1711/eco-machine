import { useGameStore } from '@/store/gameStore';
import { MainMenu } from '@/components/MainMenu';
import { LoadingScreen } from '@/components/LoadingScreen';
import { GameScene } from '@/components/GameScene';

function App() {
  const screen = useGameStore((state) => state.screen);

  return (
    <div className="w-full h-screen overflow-hidden bg-black">
      {screen === 'menu' && <MainMenu />}
      {screen === 'loading' && <LoadingScreen />}
      {screen === 'game' && <GameScene />}
    </div>
  );
}

export default App;
