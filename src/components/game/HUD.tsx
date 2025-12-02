import { GameState } from '@/types/game';
import { Heart, Shield, Crosshair, Users, Clock, Skull } from 'lucide-react';

interface HUDProps {
  gameState: GameState;
}

export function HUD({ gameState }: HUDProps) {
  const { player, safeZone, playersAlive, gameTime, killFeed } = gameState;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timeToNextZone = Math.max(0, safeZone.nextShrinkTime - gameTime);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top center - Players alive & Time */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-6">
        <div className="hud-panel px-4 py-2 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <span className="font-orbitron text-lg text-foreground">{playersAlive}</span>
          <span className="text-muted-foreground text-sm">alive</span>
        </div>
        <div className="hud-panel px-4 py-2 flex items-center gap-2">
          <Clock className="w-5 h-5 text-secondary" />
          <span className="font-orbitron text-lg text-foreground">{formatTime(gameTime)}</span>
        </div>
      </div>

      {/* Top right - Kill feed */}
      <div className="absolute top-4 right-4 flex flex-col gap-1 w-64">
        {killFeed.map((kill) => (
          <div
            key={kill.id}
            className="kill-feed-item hud-panel px-3 py-1.5 text-sm flex items-center gap-2"
          >
            <span className="text-primary font-medium">{kill.killer}</span>
            <Skull className="w-3 h-3 text-accent" />
            <span className="text-muted-foreground">{kill.victim}</span>
            <span className="text-xs text-muted-foreground ml-auto">[{kill.weapon}]</span>
          </div>
        ))}
      </div>

      {/* Bottom left - Health & Shield */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2">
        {/* Health */}
        <div className="hud-panel p-3 w-64">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-5 h-5 text-health" />
            <span className="text-sm font-medium">{Math.ceil(player.health)}</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full health-bar transition-all duration-200"
              style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
            />
          </div>
        </div>

        {/* Shield */}
        <div className="hud-panel p-3 w-64">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-shield" />
            <span className="text-sm font-medium">{Math.ceil(player.shield)}</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full shield-bar transition-all duration-200"
              style={{ width: `${(player.shield / player.maxShield) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom center - Weapon & Ammo */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="hud-panel px-6 py-3 flex items-center gap-4">
          <Crosshair className="w-6 h-6 text-primary" />
          <div className="flex flex-col">
            <span className={`font-orbitron text-lg ${
              player.weapon.rarity === 'legendary' ? 'text-loot-legendary' :
              player.weapon.rarity === 'epic' ? 'text-loot-epic' :
              player.weapon.rarity === 'rare' ? 'text-loot-rare' :
              'text-loot-common'
            }`}>
              {player.weapon.name}
            </span>
            <div className="flex items-center gap-1">
              <span className="font-orbitron text-2xl text-ammo">{player.weapon.ammo}</span>
              <span className="text-muted-foreground">/ {player.weapon.maxAmmo}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom right - Zone timer */}
      <div className="absolute bottom-4 right-4">
        <div className="hud-panel px-4 py-3">
          <div className="text-xs text-muted-foreground mb-1">ZONE SHRINKS IN</div>
          <div className={`font-orbitron text-2xl ${
            timeToNextZone < 10000 ? 'zone-timer text-accent' : 'text-zone-safe'
          }`}>
            {formatTime(timeToNextZone)}
          </div>
        </div>
      </div>

      {/* Top left - Kills */}
      <div className="absolute top-4 left-4">
        <div className="hud-panel px-4 py-2 flex items-center gap-2">
          <Skull className="w-5 h-5 text-accent" />
          <span className="font-orbitron text-xl text-foreground">{player.kills}</span>
          <span className="text-muted-foreground text-sm">kills</span>
        </div>
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-4 right-4 mt-16 translate-y-16">
        <div className="text-xs text-muted-foreground/50 text-right">
          <div>WASD - Move</div>
          <div>Mouse - Aim</div>
          <div>Click - Shoot</div>
        </div>
      </div>
    </div>
  );
}
