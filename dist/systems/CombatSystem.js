"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombatSystem = void 0;
class CombatSystem {
    constructor() {
        this.autoAttackEnabled = false;
        this.combos = new Map(); // playerId -> combo count
        this.lastAttackTime = new Map(); // playerId -> timestamp
        this.activeStatusEffects = new Map(); // entityId -> effects
    }
    toggleAutoAttack(enabled) {
        this.autoAttackEnabled = enabled;
    }
    calculateDamage(attacker, target, skill) {
        const isPlayer = 'class' in attacker;
        const baseAttack = isPlayer ? attacker.stats.atk : this.getEnemyAttack(attacker);
        const targetDef = 'class' in target ? target.stats.def : this.getEnemyDefense(target);
        // Base damage calculation
        let damage = Math.max(1, baseAttack - targetDef * 0.5);
        // Apply skill multiplier
        if (skill) {
            damage *= this.getSkillDamageMultiplier(skill);
        }
        // Apply combo multiplier for players
        if (isPlayer) {
            const combo = this.combos.get(attacker.id) || 0;
            if (combo > 0) {
                damage *= 1 + (combo * 0.1); // 10% per combo level
            }
        }
        // Critical hit calculation
        const critChance = isPlayer ? 0.15 + (attacker.stats.spd * 0.01) : 0.05;
        const isCritical = Math.random() < critChance;
        if (isCritical) {
            damage *= 2;
        }
        // Damage type resistance
        const damageType = skill ? this.getSkillDamageType(skill) : 'physical';
        damage *= this.getDamageTypeMultiplier(target, damageType);
        return {
            amount: Math.floor(damage),
            type: damageType,
            isCritical,
            combo: isPlayer ? this.combos.get(attacker.id) : undefined
        };
    }
    executeAttack(attacker, target, skill) {
        const damage = this.calculateDamage(attacker, target, skill);
        const statusEffects = this.calculateStatusEffects(attacker, target, skill);
        // Update combo system for players
        if ('class' in attacker) {
            this.updateCombo(attacker.id);
        }
        // Apply damage
        if ('class' in target) {
            target.stats.hp = Math.max(0, target.stats.hp - damage.amount);
        }
        else {
            target.health = Math.max(0, target.health - damage.amount);
        }
        // Apply status effects
        this.applyStatusEffects(target, statusEffects);
        return {
            damage,
            statusEffects,
            targetPosition: target.position,
            source: attacker
        };
    }
    updateEnemyAI(enemy, players, deltaTime) {
        // Find nearest player
        let nearestPlayer = null;
        let minDistance = Infinity;
        for (const player of players) {
            if (player.stats.hp <= 0)
                continue;
            const distance = this.calculateDistance(enemy.position, player.position);
            if (distance < minDistance) {
                minDistance = distance;
                nearestPlayer = player;
            }
        }
        if (!nearestPlayer)
            return;
        // AI behavior based on type
        switch (enemy.ai) {
            case 'Aggressive':
                this.moveTowards(enemy, nearestPlayer.position, deltaTime * 1.5);
                break;
            case 'Defensive':
                if (minDistance < 100) {
                    this.moveAway(enemy, nearestPlayer.position, deltaTime);
                }
                break;
            case 'Neutral':
                if (minDistance < 80) {
                    this.moveTowards(enemy, nearestPlayer.position, deltaTime);
                }
                break;
        }
        // Attack if in range
        const attackRange = this.getEnemyAttackRange(enemy);
        if (minDistance <= attackRange) {
            this.executeAttack(enemy, nearestPlayer);
        }
    }
    processAutoSkills(player, targets) {
        if (!this.autoAttackEnabled)
            return;
        // Find best target
        const validTargets = targets.filter(enemy => enemy.health > 0);
        if (validTargets.length === 0)
            return;
        // Select skill based on priority
        const availableSkills = player.skills.filter(skill => this.isSkillAvailable(player, skill));
        if (availableSkills.length === 0)
            return;
        const selectedSkill = this.selectBestSkill(player, availableSkills, validTargets);
        const target = this.selectBestTarget(player, validTargets, selectedSkill);
        if (selectedSkill && target) {
            this.executeAttack(player, target, selectedSkill);
        }
    }
    updateStatusEffects(entityId, deltaTime) {
        const effects = this.activeStatusEffects.get(entityId) || [];
        const updatedEffects = effects
            .map(effect => (Object.assign(Object.assign({}, effect), { duration: effect.duration - deltaTime })))
            .filter(effect => effect.duration > 0);
        this.activeStatusEffects.set(entityId, updatedEffects);
    }
    updateCombo(playerId) {
        const now = Date.now();
        const lastAttack = this.lastAttackTime.get(playerId) || 0;
        const timeDiff = now - lastAttack;
        if (timeDiff < 2000) { // Combo window of 2 seconds
            const currentCombo = this.combos.get(playerId) || 0;
            this.combos.set(playerId, currentCombo + 1);
        }
        else {
            this.combos.set(playerId, 1);
        }
        this.lastAttackTime.set(playerId, now);
    }
    calculateStatusEffects(attacker, target, skill) {
        const effects = [];
        if (!skill)
            return effects;
        // Example status effect logic based on skill
        if (skill.name.includes('Fire')) {
            effects.push({
                id: `burn_${Date.now()}`,
                type: 'burn',
                duration: 3000,
                value: 5,
                target: 'hp'
            });
        }
        if (skill.name.includes('Ice')) {
            effects.push({
                id: `freeze_${Date.now()}`,
                type: 'freeze',
                duration: 2000,
                value: 0.5,
                target: 'spd'
            });
        }
        return effects;
    }
    applyStatusEffects(target, effects) {
        const targetId = target.id;
        const existingEffects = this.activeStatusEffects.get(targetId) || [];
        this.activeStatusEffects.set(targetId, [...existingEffects, ...effects]);
    }
    getSkillDamageMultiplier(skill) {
        // This could be expanded with a skill database
        return 1.5; // Default skill multiplier
    }
    getSkillDamageType(skill) {
        if (skill.name.includes('Fire'))
            return 'fire';
        if (skill.name.includes('Ice'))
            return 'ice';
        if (skill.name.includes('Lightning'))
            return 'lightning';
        if (skill.name.includes('Magic'))
            return 'magical';
        return 'physical';
    }
    getDamageTypeMultiplier(target, damageType) {
        // Basic resistance system - could be expanded
        if ('class' in target) {
            if (target.class === 'Mage' && damageType === 'magical')
                return 0.7;
            if (target.class === 'Warrior' && damageType === 'physical')
                return 0.8;
        }
        return 1.0;
    }
    getEnemyAttack(enemy) {
        const attackMap = {
            'Goblin': 15, 'Orc': 25, 'Dragon': 50,
            'Aggressive': 20, 'Defensive': 10, 'Ranged': 18
        };
        return attackMap[enemy.type] || 15;
    }
    getEnemyDefense(enemy) {
        const defenseMap = {
            'Goblin': 5, 'Orc': 10, 'Dragon': 20,
            'Aggressive': 8, 'Defensive': 15, 'Ranged': 3
        };
        return defenseMap[enemy.type] || 5;
    }
    getEnemyAttackRange(enemy) {
        const rangeMap = {
            'Goblin': 30, 'Orc': 35, 'Dragon': 80,
            'Aggressive': 25, 'Defensive': 40, 'Ranged': 120
        };
        return rangeMap[enemy.type] || 30;
    }
    calculateDistance(pos1, pos2) {
        return Math.sqrt(Math.pow((pos1.x - pos2.x), 2) + Math.pow((pos1.y - pos2.y), 2));
    }
    moveTowards(enemy, targetPos, speed) {
        const distance = this.calculateDistance(enemy.position, targetPos);
        if (distance > 0) {
            const moveX = ((targetPos.x - enemy.position.x) / distance) * speed;
            const moveY = ((targetPos.y - enemy.position.y) / distance) * speed;
            enemy.position.x += moveX;
            enemy.position.y += moveY;
        }
    }
    moveAway(enemy, targetPos, speed) {
        const distance = this.calculateDistance(enemy.position, targetPos);
        if (distance > 0) {
            const moveX = ((enemy.position.x - targetPos.x) / distance) * speed;
            const moveY = ((enemy.position.y - targetPos.y) / distance) * speed;
            enemy.position.x += moveX;
            enemy.position.y += moveY;
        }
    }
    isSkillAvailable(player, skill) {
        // Check mana cost and cooldown
        return player.stats.mana >= skill.manaCost;
    }
    selectBestSkill(player, skills, targets) {
        // Simple priority: highest damage skills first
        return skills[0] || null;
    }
    selectBestTarget(player, targets, skill) {
        // Select nearest enemy with lowest health
        return targets.reduce((best, current) => {
            if (!best)
                return current;
            if (current.health < best.health)
                return current;
            const bestDist = this.calculateDistance(player.position, best.position);
            const currentDist = this.calculateDistance(player.position, current.position);
            return currentDist < bestDist ? current : best;
        }, null);
    }
}
exports.CombatSystem = CombatSystem;
