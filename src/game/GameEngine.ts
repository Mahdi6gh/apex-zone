import {
  GameState,
  Player,
  Enemy,
  Bullet,
  LootItem,
  SafeZone,
  InputState,
  Weapon,
  KillFeedItem,
} from '@/types/game';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_SIZE,
  ENEMY_SIZE,
  BULLET_SIZE,
  LOOT_SIZE,
  PLAYER_SPEED,
  ENEMY_SPEED,
  ENEMY_FAST_SPEED,
  ENEMY_TANK_SPEED,
  INITIAL_SAFE_ZONE_RADIUS,
  MIN_SAFE_ZONE_RADIUS,
  ZONE_SHRINK_INTERVAL,
  ZONE_SHRINK_SPEED,
  ZONE_DAMAGE,
  INITIAL_ENEMIES,
  LOOT_SPAWN_COUNT,
  WEAPONS,
} from './constants';
import {
  distance,
  normalize,
  add,
  subtract,
  multiply,
  angle,
  randomInRange,
  randomPosition,
  clamp,
  generateId,
  isInsideCircle,
} from './utils';

export class GameEngine {
  private state: GameState;
  private lastShootTime: number = 0;
  private lastUpdateTime: number = 0;

  constructor() {
    this.state = this.initializeGame();
  }

  private initializeGame(): GameState {
    const player = this.createPlayer();
    const enemies = this.spawnEnemies();
    const lootItems = this.spawnLoot();
    const safeZone = this.createSafeZone();

    return {
      player,
      enemies,
      bullets: [],
      lootItems,
      safeZone,
      playersAlive: enemies.length + 1,
      gameTime: 0,
      isGameOver: false,
      isVictory: false,
      killFeed: [],
    };
  }

  private createPlayer(): Player {
    return {
      id: 'player',
      position: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 },
      velocity: { x: 0, y: 0 },
      rotation: 0,
      health: 100,
      maxHealth: 100,
      shield: 0,
      maxShield: 100,
      weapon: { ...WEAPONS.pistol },
      isAlive: true,
      kills: 0,
    };
  }

  private spawnEnemies(): Enemy[] {
    const enemies: Enemy[] = [];
    for (let i = 0; i < INITIAL_ENEMIES; i++) {
      const type = Math.random() < 0.6 ? 'normal' : Math.random() < 0.7 ? 'fast' : 'tank';
      enemies.push({
        id: generateId(),
        position: randomPosition(GAME_WIDTH, GAME_HEIGHT, 100),
        velocity: { x: 0, y: 0 },
        rotation: 0,
        health: type === 'tank' ? 150 : type === 'fast' ? 60 : 80,
        maxHealth: type === 'tank' ? 150 : type === 'fast' ? 60 : 80,
        isAlive: true,
        targetPosition: null,
        lastShootTime: 0,
        type,
      });
    }
    return enemies;
  }

  private spawnLoot(): LootItem[] {
    const items: LootItem[] = [];
    const weaponKeys = Object.keys(WEAPONS);
    
    for (let i = 0; i < LOOT_SPAWN_COUNT; i++) {
      const rand = Math.random();
      let type: LootItem['type'];
      let rarity: LootItem['rarity'] = 'common';
      let weapon: Weapon | undefined;
      let amount: number | undefined;

      if (rand < 0.3) {
        type = 'weapon';
        const rarityRand = Math.random();
        if (rarityRand < 0.5) {
          weapon = { ...WEAPONS.pistol };
          rarity = 'common';
        } else if (rarityRand < 0.75) {
          weapon = { ...WEAPONS[Math.random() < 0.5 ? 'smg' : 'rifle'] };
          rarity = weapon.rarity;
        } else if (rarityRand < 0.9) {
          weapon = { ...WEAPONS[Math.random() < 0.5 ? 'shotgun' : 'sniper'] };
          rarity = weapon.rarity;
        } else {
          weapon = { ...WEAPONS.minigun };
          rarity = 'legendary';
        }
      } else if (rand < 0.5) {
        type = 'health';
        amount = 25;
        rarity = Math.random() < 0.7 ? 'common' : 'rare';
        if (rarity === 'rare') amount = 50;
      } else if (rand < 0.7) {
        type = 'shield';
        amount = 25;
        rarity = Math.random() < 0.6 ? 'common' : Math.random() < 0.8 ? 'rare' : 'epic';
        if (rarity === 'rare') amount = 50;
        if (rarity === 'epic') amount = 100;
      } else {
        type = 'ammo';
        amount = 30;
        rarity = 'common';
      }

      items.push({
        id: generateId(),
        position: randomPosition(GAME_WIDTH, GAME_HEIGHT, 50),
        type,
        weapon,
        amount,
        rarity,
      });
    }
    return items;
  }

  private createSafeZone(): SafeZone {
    return {
      center: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 },
      currentRadius: INITIAL_SAFE_ZONE_RADIUS,
      targetRadius: INITIAL_SAFE_ZONE_RADIUS,
      shrinkSpeed: ZONE_SHRINK_SPEED,
      damage: ZONE_DAMAGE,
      nextShrinkTime: ZONE_SHRINK_INTERVAL,
    };
  }

  public update(deltaTime: number, input: InputState): GameState {
    if (this.state.isGameOver) return this.state;

    const dt = deltaTime / 1000;
    this.state.gameTime += deltaTime;

    // Update player
    this.updatePlayer(dt, input);

    // Update enemies
    this.updateEnemies(dt);

    // Update bullets
    this.updateBullets(dt);

    // Check collisions
    this.checkCollisions();

    // Update safe zone
    this.updateSafeZone(dt);

    // Clean up kill feed (remove old entries)
    this.state.killFeed = this.state.killFeed.filter(
      (item) => Date.now() - item.timestamp < 5000
    );

    // Check win/lose conditions
    this.checkGameOver();

    return this.state;
  }

  private updatePlayer(dt: number, input: InputState): void {
    const player = this.state.player;
    if (!player.isAlive) return;

    // Movement
    let vx = 0;
    let vy = 0;
    if (input.up) vy -= 1;
    if (input.down) vy += 1;
    if (input.left) vx -= 1;
    if (input.right) vx += 1;

    const dir = normalize({ x: vx, y: vy });
    player.velocity = multiply(dir, PLAYER_SPEED);
    player.position = add(player.position, multiply(player.velocity, dt));

    // Clamp to bounds
    player.position.x = clamp(player.position.x, PLAYER_SIZE, GAME_WIDTH - PLAYER_SIZE);
    player.position.y = clamp(player.position.y, PLAYER_SIZE, GAME_HEIGHT - PLAYER_SIZE);

    // Rotation towards mouse
    player.rotation = Math.atan2(
      input.mouseY - player.position.y,
      input.mouseX - player.position.x
    );

    // Shooting
    if (input.shooting && player.weapon.ammo > 0) {
      const now = Date.now();
      if (now - this.lastShootTime >= player.weapon.fireRate) {
        this.shoot(player);
        this.lastShootTime = now;
      }
    }
  }

  private shoot(shooter: Player | Enemy, isPlayer: boolean = true): void {
    const weapon = isPlayer ? (shooter as Player).weapon : WEAPONS.pistol;
    if (isPlayer && weapon.ammo <= 0) return;

    const spread = (Math.random() - 0.5) * weapon.spread;
    const bulletDir = {
      x: Math.cos(shooter.rotation + spread),
      y: Math.sin(shooter.rotation + spread),
    };

    this.state.bullets.push({
      id: generateId(),
      position: { ...shooter.position },
      velocity: multiply(bulletDir, weapon.bulletSpeed),
      damage: weapon.damage,
      ownerId: shooter.id,
      isPlayerBullet: isPlayer,
    });

    if (isPlayer) {
      (shooter as Player).weapon.ammo--;
    }
  }

  private updateEnemies(dt: number): void {
    const player = this.state.player;
    const aliveEnemies = this.state.enemies.filter(e => e.isAlive);

    for (const enemy of this.state.enemies) {
      if (!enemy.isAlive) continue;

      const speed =
        enemy.type === 'fast'
          ? ENEMY_FAST_SPEED
          : enemy.type === 'tank'
          ? ENEMY_TANK_SPEED
          : ENEMY_SPEED;

      // Find nearest target (player or other enemies)
      let nearestTarget: { position: { x: number; y: number }; id: string; isPlayer: boolean } | null = null;
      let nearestDist = Infinity;

      // Check distance to player
      if (player.isAlive) {
        const distToPlayer = distance(enemy.position, player.position);
        if (distToPlayer < nearestDist) {
          nearestDist = distToPlayer;
          nearestTarget = { position: player.position, id: 'player', isPlayer: true };
        }
      }

      // Check distance to other enemies
      for (const otherEnemy of aliveEnemies) {
        if (otherEnemy.id === enemy.id) continue;
        const distToEnemy = distance(enemy.position, otherEnemy.position);
        if (distToEnemy < nearestDist) {
          nearestDist = distToEnemy;
          nearestTarget = { position: otherEnemy.position, id: otherEnemy.id, isPlayer: false };
        }
      }

      const detectionRange = 350;

      if (nearestTarget && nearestDist < detectionRange) {
        // Chase nearest target
        const dir = normalize(subtract(nearestTarget.position, enemy.position));
        enemy.velocity = multiply(dir, speed);
        enemy.rotation = angle(enemy.position, nearestTarget.position);

        // Shoot at target
        const now = Date.now();
        const fireRate = enemy.type === 'tank' ? 1500 : enemy.type === 'fast' ? 800 : 1000;
        if (now - enemy.lastShootTime >= fireRate && nearestDist < 280) {
          this.shootEnemy(enemy, nearestTarget.id);
          enemy.lastShootTime = now;
        }
      } else {
        // Wander
        if (!enemy.targetPosition || distance(enemy.position, enemy.targetPosition) < 20) {
          enemy.targetPosition = randomPosition(GAME_WIDTH, GAME_HEIGHT, 100);
        }
        const dir = normalize(subtract(enemy.targetPosition, enemy.position));
        enemy.velocity = multiply(dir, speed * 0.5);
        enemy.rotation = angle(enemy.position, enemy.targetPosition);
      }

      enemy.position = add(enemy.position, multiply(enemy.velocity, dt));
      enemy.position.x = clamp(enemy.position.x, ENEMY_SIZE, GAME_WIDTH - ENEMY_SIZE);
      enemy.position.y = clamp(enemy.position.y, ENEMY_SIZE, GAME_HEIGHT - ENEMY_SIZE);

      // Zone damage
      if (!isInsideCircle(enemy.position, this.state.safeZone.center, this.state.safeZone.currentRadius)) {
        enemy.health -= ZONE_DAMAGE * dt;
        if (enemy.health <= 0) {
          enemy.isAlive = false;
          this.state.playersAlive--;
          this.addKillFeed('Zone', `Enemy ${enemy.type}`, 'Storm');
        }
      }
    }
  }

  private shootEnemy(enemy: Enemy, targetId?: string): void {
    const bulletDir = {
      x: Math.cos(enemy.rotation),
      y: Math.sin(enemy.rotation),
    };

    this.state.bullets.push({
      id: generateId(),
      position: { ...enemy.position },
      velocity: multiply(bulletDir, 350),
      damage: enemy.type === 'tank' ? 20 : 10,
      ownerId: enemy.id,
      isPlayerBullet: false,
      targetId,
    });
  }

  private updateBullets(dt: number): void {
    for (const bullet of this.state.bullets) {
      bullet.position = add(bullet.position, multiply(bullet.velocity, dt));
    }

    // Remove out of bounds bullets
    this.state.bullets = this.state.bullets.filter(
      (b) =>
        b.position.x >= 0 &&
        b.position.x <= GAME_WIDTH &&
        b.position.y >= 0 &&
        b.position.y <= GAME_HEIGHT
    );
  }

  private checkCollisions(): void {
    const player = this.state.player;

    // Player bullets vs enemies
    for (const bullet of this.state.bullets) {
      if (bullet.isPlayerBullet) {
        for (const enemy of this.state.enemies) {
          if (!enemy.isAlive) continue;
          if (distance(bullet.position, enemy.position) < ENEMY_SIZE + BULLET_SIZE) {
            enemy.health -= bullet.damage;
            bullet.position = { x: -100, y: -100 }; // Mark for removal
            
            if (enemy.health <= 0) {
              enemy.isAlive = false;
              player.kills++;
              this.state.playersAlive--;
              this.addKillFeed('You', `Enemy ${enemy.type}`, player.weapon.name);
            }
          }
        }
      } else {
        // Enemy bullets vs player
        if (player.isAlive && distance(bullet.position, player.position) < PLAYER_SIZE + BULLET_SIZE) {
          const damage = bullet.damage;
          if (player.shield > 0) {
            const shieldDamage = Math.min(player.shield, damage);
            player.shield -= shieldDamage;
            player.health -= damage - shieldDamage;
          } else {
            player.health -= damage;
          }
          bullet.position = { x: -100, y: -100 };

          if (player.health <= 0) {
            player.isAlive = false;
            player.health = 0;
          }
        }

        // Enemy bullets vs other enemies
        for (const enemy of this.state.enemies) {
          if (!enemy.isAlive || enemy.id === bullet.ownerId) continue;
          if (distance(bullet.position, enemy.position) < ENEMY_SIZE + BULLET_SIZE) {
            enemy.health -= bullet.damage;
            bullet.position = { x: -100, y: -100 };
            
            if (enemy.health <= 0) {
              enemy.isAlive = false;
              this.state.playersAlive--;
              // Find killer name
              const killer = this.state.enemies.find(e => e.id === bullet.ownerId);
              this.addKillFeed(
                killer ? `Enemy ${killer.type}` : 'Enemy',
                `Enemy ${enemy.type}`,
                'Pistol'
              );
            }
          }
        }
      }
    }

    // Remove used bullets
    this.state.bullets = this.state.bullets.filter((b) => b.position.x >= 0);

    // Player vs loot
    if (player.isAlive) {
      for (let i = this.state.lootItems.length - 1; i >= 0; i--) {
        const loot = this.state.lootItems[i];
        if (distance(player.position, loot.position) < PLAYER_SIZE + LOOT_SIZE) {
          this.collectLoot(loot);
          this.state.lootItems.splice(i, 1);
        }
      }
    }

    // Zone damage to player
    if (player.isAlive && !isInsideCircle(player.position, this.state.safeZone.center, this.state.safeZone.currentRadius)) {
      player.health -= ZONE_DAMAGE * 0.016; // Approximate 60fps
      if (player.health <= 0) {
        player.isAlive = false;
        player.health = 0;
      }
    }
  }

  private collectLoot(loot: LootItem): void {
    const player = this.state.player;
    
    switch (loot.type) {
      case 'weapon':
        if (loot.weapon) {
          player.weapon = { ...loot.weapon };
        }
        break;
      case 'health':
        player.health = Math.min(player.maxHealth, player.health + (loot.amount || 25));
        break;
      case 'shield':
        player.shield = Math.min(player.maxShield, player.shield + (loot.amount || 25));
        break;
      case 'ammo':
        player.weapon.ammo = Math.min(player.weapon.maxAmmo, player.weapon.ammo + (loot.amount || 30));
        break;
    }
  }

  private updateSafeZone(dt: number): void {
    const zone = this.state.safeZone;

    // Check if it's time to shrink
    if (this.state.gameTime >= zone.nextShrinkTime && zone.currentRadius > MIN_SAFE_ZONE_RADIUS) {
      zone.targetRadius = Math.max(MIN_SAFE_ZONE_RADIUS, zone.currentRadius * 0.7);
      zone.nextShrinkTime = this.state.gameTime + ZONE_SHRINK_INTERVAL;
      
      // Move center slightly
      zone.center.x += randomInRange(-100, 100);
      zone.center.y += randomInRange(-100, 100);
      zone.center.x = clamp(zone.center.x, zone.targetRadius, GAME_WIDTH - zone.targetRadius);
      zone.center.y = clamp(zone.center.y, zone.targetRadius, GAME_HEIGHT - zone.targetRadius);
    }

    // Shrink zone
    if (zone.currentRadius > zone.targetRadius) {
      zone.currentRadius -= zone.shrinkSpeed * dt;
      zone.currentRadius = Math.max(zone.targetRadius, zone.currentRadius);
    }
  }

  private addKillFeed(killer: string, victim: string, weapon: string): void {
    this.state.killFeed.unshift({
      id: generateId(),
      killer,
      victim,
      weapon,
      timestamp: Date.now(),
    });
    if (this.state.killFeed.length > 5) {
      this.state.killFeed.pop();
    }
  }

  private checkGameOver(): void {
    if (!this.state.player.isAlive) {
      this.state.isGameOver = true;
      this.state.isVictory = false;
    } else if (this.state.playersAlive <= 1 && this.state.player.isAlive) {
      this.state.isGameOver = true;
      this.state.isVictory = true;
    }
  }

  public getState(): GameState {
    return this.state;
  }

  public reset(): void {
    this.state = this.initializeGame();
    this.lastShootTime = 0;
  }
}
