import { Weapon } from '@/types/game';

export const GAME_WIDTH = 2000;
export const GAME_HEIGHT = 2000;
export const PLAYER_SIZE = 20;
export const ENEMY_SIZE = 20;
export const BULLET_SIZE = 5;
export const LOOT_SIZE = 15;

export const PLAYER_SPEED = 200;
export const ENEMY_SPEED = 80;
export const ENEMY_FAST_SPEED = 140;
export const ENEMY_TANK_SPEED = 50;

export const INITIAL_SAFE_ZONE_RADIUS = 900;
export const MIN_SAFE_ZONE_RADIUS = 100;
export const ZONE_SHRINK_INTERVAL = 30000; // 30 seconds
export const ZONE_SHRINK_SPEED = 20; // pixels per second
export const ZONE_DAMAGE = 5;

export const INITIAL_ENEMIES = 30;
export const LOOT_SPAWN_COUNT = 40;

export const WEAPONS: Record<string, Weapon> = {
  pistol: {
    name: 'Pistol',
    damage: 15,
    fireRate: 400,
    ammo: 12,
    maxAmmo: 12,
    bulletSpeed: 500,
    spread: 0.05,
    rarity: 'common',
  },
  smg: {
    name: 'SMG',
    damage: 10,
    fireRate: 100,
    ammo: 30,
    maxAmmo: 30,
    bulletSpeed: 450,
    spread: 0.15,
    rarity: 'common',
  },
  rifle: {
    name: 'Assault Rifle',
    damage: 20,
    fireRate: 150,
    ammo: 25,
    maxAmmo: 25,
    bulletSpeed: 600,
    spread: 0.08,
    rarity: 'rare',
  },
  shotgun: {
    name: 'Shotgun',
    damage: 80,
    fireRate: 800,
    ammo: 6,
    maxAmmo: 6,
    bulletSpeed: 400,
    spread: 0.3,
    rarity: 'rare',
  },
  sniper: {
    name: 'Sniper',
    damage: 100,
    fireRate: 1500,
    ammo: 5,
    maxAmmo: 5,
    bulletSpeed: 1000,
    spread: 0.01,
    rarity: 'epic',
  },
  minigun: {
    name: 'Minigun',
    damage: 8,
    fireRate: 50,
    ammo: 100,
    maxAmmo: 100,
    bulletSpeed: 550,
    spread: 0.2,
    rarity: 'legendary',
  },
};

export const COLORS = {
  player: '#FFD700',
  enemy: '#FF4444',
  enemyFast: '#FF8844',
  enemyTank: '#AA2222',
  bullet: '#FFFF00',
  enemyBullet: '#FF6666',
  safeZone: 'rgba(76, 175, 80, 0.2)',
  dangerZone: 'rgba(244, 67, 54, 0.3)',
  ground: '#1a1f2e',
  grid: '#252b3d',
  lootCommon: '#888888',
  lootRare: '#4488FF',
  lootEpic: '#AA44FF',
  lootLegendary: '#FFD700',
};
