export interface Vector2 {
  x: number;
  y: number;
}

export interface Player {
  id: string;
  position: Vector2;
  velocity: Vector2;
  rotation: number;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  weapon: Weapon;
  isAlive: boolean;
  kills: number;
}

export interface Enemy {
  id: string;
  position: Vector2;
  velocity: Vector2;
  rotation: number;
  health: number;
  maxHealth: number;
  isAlive: boolean;
  targetPosition: Vector2 | null;
  lastShootTime: number;
  type: 'normal' | 'fast' | 'tank';
}

export interface Bullet {
  id: string;
  position: Vector2;
  velocity: Vector2;
  damage: number;
  ownerId: string;
  isPlayerBullet: boolean;
}

export interface Weapon {
  name: string;
  damage: number;
  fireRate: number;
  ammo: number;
  maxAmmo: number;
  bulletSpeed: number;
  spread: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface LootItem {
  id: string;
  position: Vector2;
  type: 'weapon' | 'health' | 'shield' | 'ammo';
  weapon?: Weapon;
  amount?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface SafeZone {
  center: Vector2;
  currentRadius: number;
  targetRadius: number;
  shrinkSpeed: number;
  damage: number;
  nextShrinkTime: number;
}

export interface GameState {
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  lootItems: LootItem[];
  safeZone: SafeZone;
  playersAlive: number;
  gameTime: number;
  isGameOver: boolean;
  isVictory: boolean;
  killFeed: KillFeedItem[];
}

export interface KillFeedItem {
  id: string;
  killer: string;
  victim: string;
  weapon: string;
  timestamp: number;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  mouseX: number;
  mouseY: number;
  shooting: boolean;
}
