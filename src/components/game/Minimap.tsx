import { useEffect, useRef } from 'react';
import { GameState } from '@/types/game';
import { GAME_WIDTH, GAME_HEIGHT } from '@/game/constants';

interface MinimapProps {
  gameState: GameState;
  size?: number;
}

export function Minimap({ gameState, size = 150 }: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = size / GAME_WIDTH;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#0a0c10';
    ctx.fillRect(0, 0, size, size);

    // Draw safe zone
    const { safeZone, player, enemies, lootItems } = gameState;
    
    // Danger zone
    ctx.fillStyle = 'rgba(244, 67, 54, 0.3)';
    ctx.fillRect(0, 0, size, size);
    
    // Safe zone
    ctx.fillStyle = '#0a0c10';
    ctx.beginPath();
    ctx.arc(
      safeZone.center.x * scale,
      safeZone.center.y * scale,
      safeZone.currentRadius * scale,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Safe zone border
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw loot as small dots
    ctx.fillStyle = '#888888';
    for (const loot of lootItems) {
      ctx.fillRect(loot.position.x * scale - 1, loot.position.y * scale - 1, 2, 2);
    }

    // Draw enemies
    ctx.fillStyle = '#FF4444';
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        ctx.beginPath();
        ctx.arc(enemy.position.x * scale, enemy.position.y * scale, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw player
    if (player.isAlive) {
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(player.position.x * scale, player.position.y * scale, 3, 0, Math.PI * 2);
      ctx.fill();

      // Player direction
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(player.position.x * scale, player.position.y * scale);
      ctx.lineTo(
        player.position.x * scale + Math.cos(player.rotation) * 8,
        player.position.y * scale + Math.sin(player.rotation) * 8
      );
      ctx.stroke();
    }
  }, [gameState, size, scale]);

  return (
    <div className="absolute top-20 left-4">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="minimap"
      />
    </div>
  );
}
