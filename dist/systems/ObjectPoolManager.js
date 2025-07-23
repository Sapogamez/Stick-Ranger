"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectPoolManager = exports.PooledDamageNumber = exports.PooledEffect = exports.PooledProjectile = exports.ObjectPool = void 0;
class ObjectPool {
    constructor(config) {
        this.available = [];
        this.inUse = new Set();
        this.totalCreated = 0;
        this.config = config;
        this.initialize();
    }
    acquire() {
        let item;
        if (this.available.length > 0) {
            item = this.available.pop();
        }
        else if (this.totalCreated < this.config.maxSize) {
            item = this.config.factory();
            this.totalCreated++;
        }
        else {
            // Pool is at max capacity and no items available
            return null;
        }
        item.setActive(true);
        this.inUse.add(item);
        return item;
    }
    release(item) {
        if (!this.inUse.has(item)) {
            console.warn('Attempting to release an item that is not in use');
            return;
        }
        item.reset();
        item.setActive(false);
        this.inUse.delete(item);
        this.available.push(item);
    }
    releaseAll() {
        for (const item of this.inUse) {
            item.reset();
            item.setActive(false);
            this.available.push(item);
        }
        this.inUse.clear();
    }
    getStats() {
        return {
            available: this.available.length,
            inUse: this.inUse.size,
            totalCreated: this.totalCreated,
            maxSize: this.config.maxSize,
            utilizationRate: this.inUse.size / this.totalCreated
        };
    }
    initialize() {
        for (let i = 0; i < this.config.initialSize; i++) {
            const item = this.config.factory();
            item.setActive(false);
            this.available.push(item);
            this.totalCreated++;
        }
    }
}
exports.ObjectPool = ObjectPool;
// Specific poolable objects for the game
class PooledProjectile {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.damage = 0;
        this.type = '';
        this.ownerId = 0;
        this.active = false;
    }
    reset() {
        this.x = 0;
        this.y = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.damage = 0;
        this.type = '';
        this.ownerId = 0;
        this.active = false;
    }
    isActive() {
        return this.active;
    }
    setActive(active) {
        this.active = active;
    }
    update(deltaTime) {
        if (!this.active)
            return;
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
    }
    initialize(x, y, velocityX, velocityY, damage, type, ownerId) {
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
exports.PooledProjectile = PooledProjectile;
class PooledEffect {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.type = '';
        this.duration = 0;
        this.maxDuration = 0;
        this.scale = 1;
        this.opacity = 1;
        this.active = false;
    }
    reset() {
        this.x = 0;
        this.y = 0;
        this.type = '';
        this.duration = 0;
        this.maxDuration = 0;
        this.scale = 1;
        this.opacity = 1;
        this.active = false;
    }
    isActive() {
        return this.active;
    }
    setActive(active) {
        this.active = active;
    }
    update(deltaTime) {
        if (!this.active)
            return;
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
    initialize(x, y, type, duration) {
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
exports.PooledEffect = PooledEffect;
class PooledDamageNumber {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.text = '';
        this.color = '#ffffff';
        this.velocity = 0;
        this.duration = 0;
        this.maxDuration = 0;
        this.active = false;
    }
    reset() {
        this.x = 0;
        this.y = 0;
        this.text = '';
        this.color = '#ffffff';
        this.velocity = 0;
        this.duration = 0;
        this.maxDuration = 0;
        this.active = false;
    }
    isActive() {
        return this.active;
    }
    setActive(active) {
        this.active = active;
    }
    update(deltaTime) {
        if (!this.active)
            return;
        this.duration -= deltaTime;
        if (this.duration <= 0) {
            this.active = false;
            return;
        }
        this.y -= this.velocity * deltaTime;
    }
    initialize(x, y, damage, isCritical = false) {
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
exports.PooledDamageNumber = PooledDamageNumber;
class ObjectPoolManager {
    static getInstance() {
        if (!ObjectPoolManager.instance) {
            ObjectPoolManager.instance = new ObjectPoolManager();
        }
        return ObjectPoolManager.instance;
    }
    constructor() {
        this.pools = new Map();
        this.initializePools();
    }
    getProjectile() {
        var _a;
        return ((_a = this.pools.get('projectiles')) === null || _a === void 0 ? void 0 : _a.acquire()) || null;
    }
    releaseProjectile(projectile) {
        var _a;
        (_a = this.pools.get('projectiles')) === null || _a === void 0 ? void 0 : _a.release(projectile);
    }
    getEffect() {
        var _a;
        return ((_a = this.pools.get('effects')) === null || _a === void 0 ? void 0 : _a.acquire()) || null;
    }
    releaseEffect(effect) {
        var _a;
        (_a = this.pools.get('effects')) === null || _a === void 0 ? void 0 : _a.release(effect);
    }
    getDamageNumber() {
        var _a;
        return ((_a = this.pools.get('damageNumbers')) === null || _a === void 0 ? void 0 : _a.acquire()) || null;
    }
    releaseDamageNumber(damageNumber) {
        var _a;
        (_a = this.pools.get('damageNumbers')) === null || _a === void 0 ? void 0 : _a.release(damageNumber);
    }
    updateAll(deltaTime) {
        // Update all active objects
        this.updateProjectiles(deltaTime);
        this.updateEffects(deltaTime);
        this.updateDamageNumbers(deltaTime);
    }
    getPoolStats() {
        const stats = {};
        for (const [name, pool] of this.pools) {
            stats[name] = pool.getStats();
        }
        return stats;
    }
    releaseAllInactivePools() {
        for (const pool of this.pools.values()) {
            pool.releaseAll();
        }
    }
    initializePools() {
        // Projectile pool
        this.pools.set('projectiles', new ObjectPool({
            initialSize: 50,
            maxSize: 200,
            factory: () => new PooledProjectile()
        }));
        // Effect pool
        this.pools.set('effects', new ObjectPool({
            initialSize: 30,
            maxSize: 100,
            factory: () => new PooledEffect()
        }));
        // Damage number pool
        this.pools.set('damageNumbers', new ObjectPool({
            initialSize: 20,
            maxSize: 50,
            factory: () => new PooledDamageNumber()
        }));
    }
    updateProjectiles(deltaTime) {
        const projectilePool = this.pools.get('projectiles');
        if (!projectilePool)
            return;
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
    updateEffects(deltaTime) {
        const effectPool = this.pools.get('effects');
        if (!effectPool)
            return;
        for (const effect of effectPool['inUse']) {
            effect.update(deltaTime);
            if (!effect.isActive()) {
                this.releaseEffect(effect);
            }
        }
    }
    updateDamageNumbers(deltaTime) {
        const damagePool = this.pools.get('damageNumbers');
        if (!damagePool)
            return;
        for (const damageNumber of damagePool['inUse']) {
            damageNumber.update(deltaTime);
            if (!damageNumber.isActive()) {
                this.releaseDamageNumber(damageNumber);
            }
        }
    }
}
exports.ObjectPoolManager = ObjectPoolManager;
