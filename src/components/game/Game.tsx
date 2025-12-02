import { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '@/game/GameEngine';
import { GameState, InputState } from '@/types/game';
import { GameCanvas } from './GameCanvas';
import { HUD } from './HUD';
import { Minimap } from './Minimap';
import { GameOverScreen } from './GameOverScreen';
import { GAME_WIDTH, GAME_HEIGHT } from '@/game/constants';

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

  // Initialize game
  useEffect(() => {
    engineRef.current = new GameEngine();
    setGameState(engineRef.current.getState());
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
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          inputRef.current.up = true;
          break;
        case 's':
        case 'arrowdown':
          inputRef.current.down = true;
          break;
        case 'a':
        case 'arrowleft':
          inputRef.current.left = true;
          break;
        case 'd':
        case 'arrowright':
          inputRef.current.right = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          inputRef.current.up = false;
          break;
        case 's':
        case 'arrowdown':
          inputRef.current.down = false;
          break;
        case 'a':
        case 'arrowleft':
          inputRef.current.left = false;
          break;
        case 'd':
        case 'arrowright':
          inputRef.current.right = false;
          break;
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

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
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
      className="w-full h-screen game-container relative cursor-crosshair select-none"
    >
      <GameCanvas
        gameState={gameState}
        canvasWidth={canvasSize.width}
        canvasHeight={canvasSize.height}
      />
      <HUD gameState={gameState} />
      <Minimap gameState={gameState} />
      {gameState.isGameOver && (
        <GameOverScreen gameState={gameState} onRestart={handleRestart} />
      )}
    </div>
  );
}
