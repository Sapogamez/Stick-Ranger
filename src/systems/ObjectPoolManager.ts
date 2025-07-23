export interface Poolable {
  reset(): void;
  isActive(): boolean;
  setActive(active: boolean): void;
}

export interface PoolConfig {
  initialSize: number;
  maxSize: number;
  factory: () => Poolable;
}

export class ObjectPool<T extends Poolable> {
  private available: T[] = [];
  private inUse: Set<T> = new Set();
  private config: PoolConfig;
  private totalCreated: number = 0;

  constructor(config: PoolConfig) {
    this.config = config;
    this.initialize();
  }

  acquire(): T | null {
    let item: T;

    if (this.available.length > 0) {
      item = this.available.pop()!;
    } else if (this.totalCreated < this.config.maxSize) {
      item = this.config.factory() as T;
      this.totalCreated++;
    } else {
      // Pool is at max capacity and no items available
      return null;
    }

    item.setActive(true);
    this.inUse.add(item);
    return item;
  }

  release(item: T): void {
    if (!this.inUse.has(item)) {
      console.warn('Attempting to release an item that is not in use');
      return;
    }

    item.reset();
    item.setActive(false);
    this.inUse.delete(item);
    this.available.push(item);
  }

  releaseAll(): void {
    for (const item of this.inUse) {
      item.reset();
      item.setActive(false);
      this.available.push(item);
    }
    this.inUse.clear();
  }

  getStats(): {
    available: number;
    inUse: number;
    totalCreated: number;
    maxSize: number;
    utilizationRate: number;
  } {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      totalCreated: this.totalCreated,
      maxSize: this.config.maxSize,
      utilizationRate: this.inUse.size / this.totalCreated
    };
  }

  private initialize(): void {
    for (let i = 0; i < this.config.initialSize; i++) {
      const item = this.config.factory() as T;
      item.setActive(false);
      this.available.push(item);
      this.totalCreated++;
    }
  }
}

// Specific poolable objects for the game

export class PooledProjectile implements Poolable {
  public x: number = 0;
  public y: number = 0;
  public velocityX: number = 0;
  public velocityY: number = 0;
  public damage: number = 0;
  public type: string = '';
  public ownerId: number = 0;
  private active: boolean = false;

  reset(): void {
    this.x = 0;
    this.y = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.damage = 0;
    this.type = '';
    this.ownerId = 0;
    this.active = false;
  }

  isActive(): boolean {
    return this.active;
  }

  setActive(active: boolean): void {
    this.active = active;
  }

  update(deltaTime: number): void {
    if (!this.active) return;
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;
  }

  initialize(x: number, y: number, velocityX: number, velocityY: number, damage: number, type: string, ownerId: number): void {
    this.x = x;
    this.y = y;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.damage = damage;
    this.type = type;
    this.ownerId = ownerId;
    this.active = true;
  }
}

export class PooledEffect implements Poolable {
  public x: number = 0;
  public y: number = 0;
  public type: string = '';
  public duration: number = 0;
  public maxDuration: number = 0;
  public scale: number = 1;
  public opacity: number = 1;
  private active: boolean = false;

  reset(): void {
    this.x = 0;
    this.y = 0;
    this.type = '';
    this.duration = 0;
    this.maxDuration = 0;
    this.scale = 1;
    this.opacity = 1;
    this.active = false;
  }

  isActive(): boolean {
    return this.active;
  }

  setActive(active: boolean): void {
    this.active = active;
  }

  update(deltaTime: number): void {
    if (!this.active) return;
    
    this.duration -= deltaTime;
    if (this.duration <= 0) {
      this.active = false;
      return;
    }

    // Fade out effect
    const progress = 1 - (this.duration / this.maxDuration);
    this.opacity = 1 - progress;
    this.scale = 0.5 + progress * 0.5;
  }

  initialize(x: number, y: number, type: string, duration: number): void {
    this.x = x;
    this.y = y;
    this.type = type;
    this.duration = duration;
    this.maxDuration = duration;
    this.scale = 1;
    this.opacity = 1;
    this.active = true;
  }
}

export class PooledDamageNumber implements Poolable {
  public x: number = 0;
  public y: number = 0;
  public text: string = '';
  public color: string = '#ffffff';
  public velocity: number = 0;
  public duration: number = 0;
  public maxDuration: number = 0;
  private active: boolean = false;

  reset(): void {
    this.x = 0;
    this.y = 0;
    this.text = '';
    this.color = '#ffffff';
    this.velocity = 0;
    this.duration = 0;
    this.maxDuration = 0;
    this.active = false;
  }

  isActive(): boolean {
    return this.active;
  }

  setActive(active: boolean): void {
    this.active = active;
  }

  update(deltaTime: number): void {
    if (!this.active) return;
    
    this.duration -= deltaTime;
    if (this.duration <= 0) {
      this.active = false;
      return;
    }

    this.y -= this.velocity * deltaTime;
  }

  initialize(x: number, y: number, damage: number, isCritical: boolean = false): void {
    this.x = x;
    this.y = y;
    this.text = damage.toString();
    this.color = isCritical ? '#ff6b6b' : '#ffffff';
    this.velocity = 50;
    this.duration = 2000;
    this.maxDuration = 2000;
    this.active = true;
  }
}

export class ObjectPoolManager {
  private static instance: ObjectPoolManager;
  private pools: Map<string, ObjectPool<any>> = new Map();

  public static getInstance(): ObjectPoolManager {
    if (!ObjectPoolManager.instance) {
      ObjectPoolManager.instance = new ObjectPoolManager();
    }
    return ObjectPoolManager.instance;
  }

  private constructor() {
    this.initializePools();
  }

  getProjectile(): PooledProjectile | null {
    return this.pools.get('projectiles')?.acquire() || null;
  }

  releaseProjectile(projectile: PooledProjectile): void {
    this.pools.get('projectiles')?.release(projectile);
  }

  getEffect(): PooledEffect | null {
    return this.pools.get('effects')?.acquire() || null;
  }

  releaseEffect(effect: PooledEffect): void {
    this.pools.get('effects')?.release(effect);
  }

  getDamageNumber(): PooledDamageNumber | null {
    return this.pools.get('damageNumbers')?.acquire() || null;
  }

  releaseDamageNumber(damageNumber: PooledDamageNumber): void {
    this.pools.get('damageNumbers')?.release(damageNumber);
  }

  updateAll(deltaTime: number): void {
    // Update all active objects
    this.updateProjectiles(deltaTime);
    this.updateEffects(deltaTime);
    this.updateDamageNumbers(deltaTime);
  }

  getPoolStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    for (const [name, pool] of this.pools) {
      stats[name] = pool.getStats();
    }
    return stats;
  }

  releaseAllInactivePools(): void {
    for (const pool of this.pools.values()) {
      pool.releaseAll();
    }
  }

  private initializePools(): void {
    // Projectile pool
    this.pools.set('projectiles', new ObjectPool<PooledProjectile>({
      initialSize: 50,
      maxSize: 200,
      factory: () => new PooledProjectile()
    }));

    // Effect pool
    this.pools.set('effects', new ObjectPool<PooledEffect>({
      initialSize: 30,
      maxSize: 100,
      factory: () => new PooledEffect()
    }));

    // Damage number pool
    this.pools.set('damageNumbers', new ObjectPool<PooledDamageNumber>({
      initialSize: 20,
      maxSize: 50,
      factory: () => new PooledDamageNumber()
    }));
  }

  private updateProjectiles(deltaTime: number): void {
    const projectilePool = this.pools.get('projectiles');
    if (!projectilePool) return;

    // Update and auto-release expired projectiles
    for (const projectile of projectilePool['inUse']) {
      projectile.update(deltaTime);
      
      // Check if projectile is out of bounds
      if (projectile.x < -50 || projectile.x > 850 || 
          projectile.y < -50 || projectile.y > 650) {
        this.releaseProjectile(projectile);
      }
    }
  }

  private updateEffects(deltaTime: number): void {
    const effectPool = this.pools.get('effects');
    if (!effectPool) return;

    for (const effect of effectPool['inUse']) {
      effect.update(deltaTime);
      
      if (!effect.isActive()) {
        this.releaseEffect(effect);
      }
    }
  }

  private updateDamageNumbers(deltaTime: number): void {
    const damagePool = this.pools.get('damageNumbers');
    if (!damagePool) return;

    for (const damageNumber of damagePool['inUse']) {
      damageNumber.update(deltaTime);
      
      if (!damageNumber.isActive()) {
        this.releaseDamageNumber(damageNumber);
      }
    }
  }
}