import { useEffect, useRef, useCallback } from 'react';
import { GameState } from '@/types/game';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_SIZE,
  ENEMY_SIZE,
  BULLET_SIZE,
  LOOT_SIZE,
  COLORS,
} from '@/game/constants';

interface GameCanvasProps {
  gameState: GameState;
  canvasWidth: number;
  canvasHeight: number;
}

export function GameCanvas({ gameState, canvasWidth, canvasHeight }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { player, enemies, bullets, lootItems, safeZone } = gameState;

      // Calculate camera offset to center on player
      const cameraX = player.position.x - canvasWidth / 2;
      const cameraY = player.position.y - canvasHeight / 2;

      // Clear canvas
      ctx.fillStyle = COLORS.ground;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      ctx.save();
      ctx.translate(-cameraX, -cameraY);

      // Draw grid
      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 1;
      const gridSize = 100;
      for (let x = 0; x <= GAME_WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, GAME_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y <= GAME_HEIGHT; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(GAME_WIDTH, y);
        ctx.stroke();
      }

      // Draw danger zone (outside safe zone)
      ctx.fillStyle = COLORS.dangerZone;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Draw safe zone
      ctx.save();
      ctx.beginPath();
      ctx.arc(safeZone.center.x, safeZone.center.y, safeZone.currentRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = COLORS.ground;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      ctx.restore();

      // Draw safe zone border
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.arc(safeZone.center.x, safeZone.center.y, safeZone.currentRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw target zone (if shrinking)
      if (safeZone.targetRadius < safeZone.currentRadius) {
        ctx.strokeStyle = '#FFEB3B';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(safeZone.center.x, safeZone.center.y, safeZone.targetRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw loot
      for (const loot of lootItems) {
        ctx.save();
        ctx.translate(loot.position.x, loot.position.y);

        let color = COLORS.lootCommon;
        if (loot.rarity === 'rare') color = COLORS.lootRare;
        if (loot.rarity === 'epic') color = COLORS.lootEpic;
        if (loot.rarity === 'legendary') color = COLORS.lootLegendary;

        // Glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = loot.rarity === 'legendary' ? 20 : 10;

        ctx.fillStyle = color;
        ctx.beginPath();

        if (loot.type === 'weapon') {
          // Diamond shape for weapons
          ctx.moveTo(0, -LOOT_SIZE);
          ctx.lineTo(LOOT_SIZE, 0);
          ctx.lineTo(0, LOOT_SIZE);
          ctx.lineTo(-LOOT_SIZE, 0);
        } else if (loot.type === 'health') {
          // Cross for health
          ctx.fillRect(-LOOT_SIZE / 3, -LOOT_SIZE, LOOT_SIZE * 0.66, LOOT_SIZE * 2);
          ctx.fillRect(-LOOT_SIZE, -LOOT_SIZE / 3, LOOT_SIZE * 2, LOOT_SIZE * 0.66);
        } else if (loot.type === 'shield') {
          // Shield shape
          ctx.arc(0, 0, LOOT_SIZE, 0, Math.PI * 2);
        } else {
          // Square for ammo
          ctx.rect(-LOOT_SIZE / 2, -LOOT_SIZE / 2, LOOT_SIZE, LOOT_SIZE);
        }
        ctx.fill();
        ctx.restore();
      }

      // Draw enemies
      for (const enemy of enemies) {
        if (!enemy.isAlive) continue;

        ctx.save();
        ctx.translate(enemy.position.x, enemy.position.y);
        ctx.rotate(enemy.rotation);

        let color = COLORS.enemy;
        let size = ENEMY_SIZE;
        if (enemy.type === 'fast') {
          color = COLORS.enemyFast;
          size = ENEMY_SIZE * 0.8;
        }
        if (enemy.type === 'tank') {
          color = COLORS.enemyTank;
          size = ENEMY_SIZE * 1.3;
        }

        // Body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();

        // Direction indicator
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(size, 0);
        ctx.lineTo(size * 0.5, -size * 0.3);
        ctx.lineTo(size * 0.5, size * 0.3);
        ctx.fill();

        ctx.restore();

        // Health bar
        const healthPercent = enemy.health / enemy.maxHealth;
        const barWidth = size * 2;
        ctx.fillStyle = '#333';
        ctx.fillRect(enemy.position.x - barWidth / 2, enemy.position.y - size - 12, barWidth, 6);
        ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FF9800' : '#F44336';
        ctx.fillRect(enemy.position.x - barWidth / 2, enemy.position.y - size - 12, barWidth * healthPercent, 6);
      }

      // Draw bullets
      for (const bullet of bullets) {
        ctx.fillStyle = bullet.isPlayerBullet ? COLORS.bullet : COLORS.enemyBullet;
        ctx.shadowColor = bullet.isPlayerBullet ? COLORS.bullet : COLORS.enemyBullet;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(bullet.position.x, bullet.position.y, BULLET_SIZE, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw player
      if (player.isAlive) {
        ctx.save();
        ctx.translate(player.position.x, player.position.y);
        ctx.rotate(player.rotation);

        // Glow
        ctx.shadowColor = COLORS.player;
        ctx.shadowBlur = 15;

        // Body
        ctx.fillStyle = COLORS.player;
        ctx.beginPath();
        ctx.arc(0, 0, PLAYER_SIZE, 0, Math.PI * 2);
        ctx.fill();

        // Direction indicator / gun
        ctx.fillStyle = '#FFF';
        ctx.fillRect(PLAYER_SIZE * 0.5, -3, PLAYER_SIZE, 6);

        ctx.restore();
      }

      ctx.restore();

      // Draw map boundaries indicator
      const padding = 10;
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        padding - cameraX,
        padding - cameraY,
        GAME_WIDTH - padding * 2,
        GAME_HEIGHT - padding * 2
      );
    },
    [gameState, canvasWidth, canvasHeight]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    draw(ctx);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      className="block"
    />
  );
}
