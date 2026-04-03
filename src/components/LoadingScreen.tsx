import { useEffect, useState } from 'react';

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-screen">
      <div className="text-6xl mb-4">🤖</div>
      <div className="loading-text">ЗАГРУЗКА...</div>
      <div className="loading-bar">
        <div 
          className="loading-progress" 
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <div className="text-white/60 mt-4 minecraft-font text-xs">
        Генерация пустоши...
      </div>
    </div>
  );
}
