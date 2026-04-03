import { useRef, useState, useEffect, useCallback } from 'react';

interface TouchControlsProps {
  onJoystickMove: (input: { x: number; y: number }) => void;
  onAction: () => void;
}

export function TouchControls({ onJoystickMove, onAction }: TouchControlsProps) {
  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const isTouchDevice = useRef(false);

  // Detect if touch device
  useEffect(() => {
    isTouchDevice.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  const handleJoystickStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    touchStartRef.current = { x: clientX, y: clientY };
  }, []);

  const handleJoystickMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - touchStartRef.current.x;
    const deltaY = clientY - touchStartRef.current.y;
    
    // Calculate distance and angle
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = 35;
    
    let normalizedX = deltaX / maxDistance;
    let normalizedY = deltaY / maxDistance;
    
    // Clamp to max distance
    if (distance > maxDistance) {
      const scale = maxDistance / distance;
      normalizedX = (deltaX * scale) / maxDistance;
      normalizedY = (deltaY * scale) / maxDistance;
    }
    
    // Update knob position
    if (knobRef.current) {
      const knobX = normalizedX * maxDistance;
      const knobY = normalizedY * maxDistance;
      knobRef.current.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
    }
    
    onJoystickMove({ x: normalizedX, y: normalizedY });
  }, [isDragging, onJoystickMove]);

  const handleJoystickEnd = useCallback(() => {
    setIsDragging(false);
    
    // Reset knob position
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(-50%, -50%)';
    }
    
    onJoystickMove({ x: 0, y: 0 });
  }, [onJoystickMove]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleJoystickMove);
      window.addEventListener('mouseup', handleJoystickEnd);
      window.addEventListener('touchmove', handleJoystickMove);
      window.addEventListener('touchend', handleJoystickEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleJoystickMove);
      window.removeEventListener('mouseup', handleJoystickEnd);
      window.removeEventListener('touchmove', handleJoystickMove);
      window.removeEventListener('touchend', handleJoystickEnd);
    };
  }, [isDragging, handleJoystickMove, handleJoystickEnd]);

  // Don't show on desktop
  if (!isTouchDevice.current && window.innerWidth > 768) {
    return (
      <div className="controls-help">
        WASD / Стрелки - Движение | ПРОБЕЛ - Действие | Клик мыши - Идти
      </div>
    );
  }

  return (
    <>
      {/* Joystick */}
      <div className="touch-controls">
        <div 
          ref={joystickRef}
          className="joystick-area"
          onMouseDown={handleJoystickStart}
          onTouchStart={handleJoystickStart}
        >
          <div ref={knobRef} className="joystick-knob" />
        </div>
      </div>

      {/* Action Button */}
      <div 
        className="action-button"
        onClick={onAction}
        onTouchStart={(e) => {
          e.preventDefault();
          onAction();
        }}
      >
        ДЕЙСТВИЕ
      </div>
    </>
  );
}
