import { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '@/game/GameEngine';
import { GameState, InputState } from '@/types/game';
import { GameCanvas } from './GameCanvas';
import { HUD } from './HUD';
import { Minimap } from './Minimap';
import { GameOverScreen } from './GameOverScreen';
import { MobileControls } from './MobileControls';
import { GAME_WIDTH, GAME_HEIGHT } from '@/game/constants';
import { SoundManager } from '@/game/SoundManager';

export function Game() {
  const engineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const inputRef = useRef<InputState>({
    up: false,
    down: false,
    left: false,
    right: false,
    mouseX: GAME_WIDTH / 2,
    mouseY: GAME_HEIGHT / 2,
    shooting: false,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const prevStateRef = useRef<GameState | null>(null);

  // Initialize game
  useEffect(() => {
    engineRef.current = new GameEngine();
    setGameState(engineRef.current.getState());
    
    // Resume audio context on first interaction
    const resumeAudio = () => {
      SoundManager.setEnabled(true);
      document.removeEventListener('click', resumeAudio);
      document.removeEventListener('touchstart', resumeAudio);
    };
    document.addEventListener('click', resumeAudio);
    document.addEventListener('touchstart', resumeAudio);
    
    return () => {
      document.removeEventListener('click', resumeAudio);
      document.removeEventListener('touchstart', resumeAudio);
    };
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setCanvasSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sound effects based on state changes
  useEffect(() => {
    if (!gameState || !prevStateRef.current) {
      prevStateRef.current = gameState;
      return;
    }

    const prev = prevStateRef.current;
    const curr = gameState;

    // Check for player shooting
    if (curr.bullets.length > prev.bullets.length) {
      const newBullets = curr.bullets.filter(b => !prev.bullets.find(pb => pb.id === b.id));
      for (const bullet of newBullets) {
        if (bullet.isPlayerBullet) {
          SoundManager.playShoot(curr.player.weapon.name);
        } else {
          SoundManager.playEnemyShoot();
        }
      }
    }

    // Check for kills
    if (curr.killFeed.length > prev.killFeed.length) {
      const newKill = curr.killFeed[0];
      if (newKill.killer === 'You') {
        SoundManager.playKill();
      }
    }

    // Check for player damage
    if (curr.player.health < prev.player.health) {
      SoundManager.playDamage();
    }

    // Check for game over
    if (curr.isGameOver && !prev.isGameOver) {
      if (curr.isVictory) {
        SoundManager.playVictory();
      } else {
        SoundManager.playGameOver();
      }
    }

    prevStateRef.current = gameState;
  }, [gameState]);

  // Game loop
  useEffect(() => {
    const gameLoop = (timestamp: number) => {
      if (!engineRef.current) return;

      const deltaTime = lastTimeRef.current ? timestamp - lastTimeRef.current : 16;
      lastTimeRef.current = timestamp;

      const newState = engineRef.current.update(deltaTime, inputRef.current);
      setGameState({ ...newState });

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  // Input handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || e.key === 'ArrowUp') {
        inputRef.current.up = true;
      }
      if (key === 's' || e.key === 'ArrowDown') {
        inputRef.current.down = true;
      }
      if (key === 'a' || e.key === 'ArrowLeft') {
        inputRef.current.left = true;
      }
      if (key === 'd' || e.key === 'ArrowRight') {
        inputRef.current.right = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || e.key === 'ArrowUp') {
        inputRef.current.up = false;
      }
      if (key === 's' || e.key === 'ArrowDown') {
        inputRef.current.down = false;
      }
      if (key === 'a' || e.key === 'ArrowLeft') {
        inputRef.current.left = false;
      }
      if (key === 'd' || e.key === 'ArrowRight') {
        inputRef.current.right = false;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !gameState) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mouseCanvasX = e.clientX - rect.left;
      const mouseCanvasY = e.clientY - rect.top;

      // Convert to game world coordinates
      const cameraX = gameState.player.position.x - canvasSize.width / 2;
      const cameraY = gameState.player.position.y - canvasSize.height / 2;
      inputRef.current.mouseX = mouseCanvasX + cameraX;
      inputRef.current.mouseY = mouseCanvasY + cameraY;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        inputRef.current.shooting = true;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        inputRef.current.shooting = false;
      }
    };

    // Touch aim handling
    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current || !gameState) return;
      
      // Use first touch for aiming on the game canvas (not on controls)
      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;

      // Convert to game world coordinates
      const cameraX = gameState.player.position.x - canvasSize.width / 2;
      const cameraY = gameState.player.position.y - canvasSize.height / 2;
      inputRef.current.mouseX = touchX + cameraX;
      inputRef.current.mouseY = touchY + cameraY;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [gameState, canvasSize]);

  const handleRestart = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.reset();
      setGameState(engineRef.current.getState());
      lastTimeRef.current = 0;
    }
  }, []);

  if (!gameState) return null;

  return (
    <div
      ref={containerRef}
      className="w-full h-screen game-container relative cursor-crosshair select-none overflow-hidden"
    >
      <GameCanvas
        gameState={gameState}
        canvasWidth={canvasSize.width}
        canvasHeight={canvasSize.height}
      />
      <HUD gameState={gameState} />
      <Minimap gameState={gameState} />
      <MobileControls inputRef={inputRef} />
      {gameState.isGameOver && (
        <GameOverScreen gameState={gameState} onRestart={handleRestart} />
      )}
    </div>
  );
}
