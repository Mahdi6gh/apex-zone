import { Weapon } from '@/types/game';

export const GAME_WIDTH = 2000;
export const GAME_HEIGHT = 2000;
export const PLAYER_SIZE = 20;
export const ENEMY_SIZE = 20;
export const BULLET_SIZE = 5;
export const LOOT_SIZE = 15;

export const PLAYER_SPEED = 320;
export const ENEMY_SPEED = 120;
export const ENEMY_FAST_SPEED = 200;
export const ENEMY_TANK_SPEED = 70;

export const INITIAL_SAFE_ZONE_RADIUS = 900;
export const MIN_SAFE_ZONE_RADIUS = 100;
export const ZONE_SHRINK_INTERVAL = 30000; // 30 seconds
export const ZONE_SHRINK_SPEED = 25; // pixels per second
export const ZONE_DAMAGE = 5;

export const INITIAL_ENEMIES = 30;
export const LOOT_SPAWN_COUNT = 40;

export const WEAPONS: Record<string, Weapon> = {
  pistol: {
    name: 'Pistol',
    damage: 18,
    fireRate: 280,
    ammo: 15,
    maxAmmo: 15,
    bulletSpeed: 700,
    spread: 0.03,
    rarity: 'common',
    pellets: 1,
  },
  smg: {
    name: 'SMG',
    damage: 12,
    fireRate: 70,
    ammo: 35,
    maxAmmo: 35,
    bulletSpeed: 650,
    spread: 0.12,
    rarity: 'common',
    pellets: 1,
  },
  rifle: {
    name: 'Assault Rifle',
    damage: 25,
    fireRate: 100,
    ammo: 30,
    maxAmmo: 30,
    bulletSpeed: 850,
    spread: 0.05,
    rarity: 'rare',
    pellets: 1,
  },
  shotgun: {
    name: 'Shotgun',
    damage: 18,
    fireRate: 600,
    ammo: 8,
    maxAmmo: 8,
    bulletSpeed: 500,
    spread: 0.35,
    rarity: 'rare',
    pellets: 8,
  },
  sniper: {
    name: 'Sniper',
    damage: 150,
    fireRate: 1200,
    ammo: 5,
    maxAmmo: 5,
    bulletSpeed: 1500,
    spread: 0.005,
    rarity: 'epic',
    pellets: 1,
  },
  minigun: {
    name: 'Minigun',
    damage: 10,
    fireRate: 40,
    ammo: 150,
    maxAmmo: 150,
    bulletSpeed: 750,
    spread: 0.18,
    rarity: 'legendary',
    pellets: 1,
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
