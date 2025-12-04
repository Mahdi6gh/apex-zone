import { useEffect, useRef } from 'react';
import { InputState } from '@/types/game';

interface MobileControlsProps {
  inputRef: React.MutableRefObject<InputState>;
}

export function MobileControls({ inputRef }: MobileControlsProps) {
  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const joystick = joystickRef.current;
    const knob = knobRef.current;
    if (!joystick || !knob) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = joystick.getBoundingClientRect();
      touchStartRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!touchStartRef.current) return;
      
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      
      const maxDistance = 40;
      const distance = Math.min(Math.sqrt(dx * dx + dy * dy), maxDistance);
      const angle = Math.atan2(dy, dx);
      
      const moveX = Math.cos(angle) * distance;
      const moveY = Math.sin(angle) * distance;
      
      knob.style.transform = `translate(${moveX}px, ${moveY}px)`;
      
      // Update input based on joystick position
      const threshold = 15;
      inputRef.current.left = dx < -threshold;
      inputRef.current.right = dx > threshold;
      inputRef.current.up = dy < -threshold;
      inputRef.current.down = dy > threshold;
    };

    const handleTouchEnd = () => {
      touchStartRef.current = null;
      knob.style.transform = 'translate(0px, 0px)';
      inputRef.current.left = false;
      inputRef.current.right = false;
      inputRef.current.up = false;
      inputRef.current.down = false;
    };

    joystick.addEventListener('touchstart', handleTouchStart, { passive: false });
    joystick.addEventListener('touchmove', handleTouchMove, { passive: false });
    joystick.addEventListener('touchend', handleTouchEnd);
    joystick.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      joystick.removeEventListener('touchstart', handleTouchStart);
      joystick.removeEventListener('touchmove', handleTouchMove);
      joystick.removeEventListener('touchend', handleTouchEnd);
      joystick.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [inputRef]);

  const handleFireStart = (e: React.TouchEvent) => {
    e.preventDefault();
    inputRef.current.shooting = true;
  };

  const handleFireEnd = () => {
    inputRef.current.shooting = false;
  };

  return (
    <div className="md:hidden">
      {/* Movement Joystick */}
      <div
        ref={joystickRef}
        className="fixed bottom-8 left-8 w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center touch-none"
      >
        <div
          ref={knobRef}
          className="w-14 h-14 rounded-full bg-primary/80 border-2 border-white/50 shadow-lg transition-none"
        />
      </div>

      {/* Fire Button */}
      <button
        onTouchStart={handleFireStart}
        onTouchEnd={handleFireEnd}
        onTouchCancel={handleFireEnd}
        className="fixed bottom-8 right-8 w-24 h-24 rounded-full bg-destructive/80 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-white font-bold text-lg touch-none active:scale-95 transition-transform"
      >
        🔥
        <span className="absolute -bottom-6 text-xs text-white/70">FIRE</span>
      </button>
    </div>
  );
}
