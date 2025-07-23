import { Player, Enemy, Position, Skill } from '../types/game';

export interface DamageInfo {
  amount: number;
  type: DamageType;
  isCritical: boolean;
  combo?: number;
}

export interface StatusEffect {
  id: string;
  type: 'poison' | 'burn' | 'freeze' | 'stun' | 'buff' | 'debuff';
  duration: number;
  value: number;
  target: 'hp' | 'atk' | 'def' | 'spd';
}

export type DamageType = 'physical' | 'magical' | 'fire' | 'ice' | 'lightning';

export interface CombatResult {
  damage: DamageInfo;
  statusEffects: StatusEffect[];
  targetPosition: Position;
  source: Player | Enemy;
}

export class CombatSystem {
  protected autoAttackEnabled: boolean = false;
  private combos: Map<number, number> = new Map(); // playerId -> combo count
  private lastAttackTime: Map<number, number> = new Map(); // playerId -> timestamp
  private activeStatusEffects: Map<number, StatusEffect[]> = new Map(); // entityId -> effects

  toggleAutoAttack(enabled: boolean): void {
    this.autoAttackEnabled = enabled;
  }

  calculateDamage(attacker: Player | Enemy, target: Player | Enemy, skill?: Skill): DamageInfo {
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

  executeAttack(attacker: Player | Enemy, target: Player | Enemy, skill?: Skill): CombatResult {
    const damage = this.calculateDamage(attacker, target, skill);
    const statusEffects = this.calculateStatusEffects(attacker, target, skill);
    
    // Update combo system for players
    if ('class' in attacker) {
      this.updateCombo(attacker.id);
    }
    
    // Apply damage
    if ('class' in target) {
      target.stats.hp = Math.max(0, target.stats.hp - damage.amount);
    } else {
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

  updateEnemyAI(enemy: Enemy, players: Player[], deltaTime: number): void {
    // Find nearest player
    let nearestPlayer: Player | null = null;
    let minDistance = Infinity;
    
    for (const player of players) {
      if (player.stats.hp <= 0) continue;
      
      const distance = this.calculateDistance(enemy.position, player.position);
      if (distance < minDistance) {
        minDistance = distance;
        nearestPlayer = player;
      }
    }
    
    if (!nearestPlayer) return;
    
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

  processAutoSkills(player: Player, targets: Enemy[]): void {
    if (!this.autoAttackEnabled) return;
    
    // Find best target
    const validTargets = targets.filter(enemy => enemy.health > 0);
    if (validTargets.length === 0) return;
    
    // Select skill based on priority
    const availableSkills = player.skills.filter(skill => 
      this.isSkillAvailable(player, skill)
    );
    
    if (availableSkills.length === 0) return;
    
    const selectedSkill = this.selectBestSkill(player, availableSkills, validTargets);
    const target = this.selectBestTarget(player, validTargets, selectedSkill);
    
    if (selectedSkill && target) {
      this.executeAttack(player, target, selectedSkill);
    }
  }

  updateStatusEffects(entityId: number, deltaTime: number): void {
    const effects = this.activeStatusEffects.get(entityId) || [];
    const updatedEffects = effects
      .map(effect => ({ ...effect, duration: effect.duration - deltaTime }))
      .filter(effect => effect.duration > 0);
    
    this.activeStatusEffects.set(entityId, updatedEffects);
  }

  private updateCombo(playerId: number): void {
    const now = Date.now();
    const lastAttack = this.lastAttackTime.get(playerId) || 0;
    const timeDiff = now - lastAttack;
    
    if (timeDiff < 2000) { // Combo window of 2 seconds
      const currentCombo = this.combos.get(playerId) || 0;
      this.combos.set(playerId, currentCombo + 1);
    } else {
      this.combos.set(playerId, 1);
    }
    
    this.lastAttackTime.set(playerId, now);
  }

  private calculateStatusEffects(attacker: Player | Enemy, target: Player | Enemy, skill?: Skill): StatusEffect[] {
    const effects: StatusEffect[] = [];
    
    if (!skill) return effects;
    
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

  private applyStatusEffects(target: Player | Enemy, effects: StatusEffect[]): void {
    const targetId = target.id;
    const existingEffects = this.activeStatusEffects.get(targetId) || [];
    this.activeStatusEffects.set(targetId, [...existingEffects, ...effects]);
  }

  private getSkillDamageMultiplier(skill: Skill): number {
    // This could be expanded with a skill database
    return 1.5; // Default skill multiplier
  }

  private getSkillDamageType(skill: Skill): DamageType {
    if (skill.name.includes('Fire')) return 'fire';
    if (skill.name.includes('Ice')) return 'ice';
    if (skill.name.includes('Lightning')) return 'lightning';
    if (skill.name.includes('Magic')) return 'magical';
    return 'physical';
  }

  private getDamageTypeMultiplier(target: Player | Enemy, damageType: DamageType): number {
    // Basic resistance system - could be expanded
    if ('class' in target) {
      if (target.class === 'Mage' && damageType === 'magical') return 0.7;
      if (target.class === 'Warrior' && damageType === 'physical') return 0.8;
    }
    return 1.0;
  }

  private getEnemyAttack(enemy: Enemy): number {
    const attackMap: Record<string, number> = {
      'Goblin': 15, 'Orc': 25, 'Dragon': 50,
      'Aggressive': 20, 'Defensive': 10, 'Ranged': 18
    };
    return attackMap[enemy.type] || 15;
  }

  private getEnemyDefense(enemy: Enemy): number {
    const defenseMap: Record<string, number> = {
      'Goblin': 5, 'Orc': 10, 'Dragon': 20,
      'Aggressive': 8, 'Defensive': 15, 'Ranged': 3
    };
    return defenseMap[enemy.type] || 5;
  }

  private getEnemyAttackRange(enemy: Enemy): number {
    const rangeMap: Record<string, number> = {
      'Goblin': 30, 'Orc': 35, 'Dragon': 80,
      'Aggressive': 25, 'Defensive': 40, 'Ranged': 120
    };
    return rangeMap[enemy.type] || 30;
  }

  private calculateDistance(pos1: Position, pos2: Position): number {
    return Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2);
  }

  private moveTowards(enemy: Enemy, targetPos: Position, speed: number): void {
    const distance = this.calculateDistance(enemy.position, targetPos);
    if (distance > 0) {
      const moveX = ((targetPos.x - enemy.position.x) / distance) * speed;
      const moveY = ((targetPos.y - enemy.position.y) / distance) * speed;
      enemy.position.x += moveX;
      enemy.position.y += moveY;
    }
  }

  private moveAway(enemy: Enemy, targetPos: Position, speed: number): void {
    const distance = this.calculateDistance(enemy.position, targetPos);
    if (distance > 0) {
      const moveX = ((enemy.position.x - targetPos.x) / distance) * speed;
      const moveY = ((enemy.position.y - targetPos.y) / distance) * speed;
      enemy.position.x += moveX;
      enemy.position.y += moveY;
    }
  }

  private isSkillAvailable(player: Player, skill: Skill): boolean {
    // Check mana cost and cooldown
    return player.stats.mana >= skill.manaCost;
  }

  private selectBestSkill(player: Player, skills: Skill[], targets: Enemy[]): Skill | null {
    // Simple priority: highest damage skills first
    return skills[0] || null;
  }

  private selectBestTarget(player: Player, targets: Enemy[], skill: Skill | null): Enemy | null {
    // Select nearest enemy with lowest health
    return targets.reduce((best, current) => {
      if (!best) return current;
      if (current.health < best.health) return current;
      const bestDist = this.calculateDistance(player.position, best.position);
      const currentDist = this.calculateDistance(player.position, current.position);
      return currentDist < bestDist ? current : best;
    }, null as Enemy | null);
  }
}
