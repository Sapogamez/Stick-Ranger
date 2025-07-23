import { Player, Enemy, Entity, Vector2 } from '../../types/game';
import { 
  CombatAction, 
  ActionType, 
  DamageResult, 
  DamageType, 
  CombatStats, 
  CombatState,
  TargetingInfo 
} from '../../types/combat';
import { DamageCalculator } from './DamageCalculator';
import { StatusEffectManager } from './StatusEffect';
import { BattleManager } from './BattleManager';

/**
 * Main combat system that integrates all combat components
 * Handles real-time combat mechanics and interfaces with turn-based battle manager
 */
export class CombatSystem {
  protected autoAttackEnabled: boolean = false;
  private damageCalculator: DamageCalculator;
  private statusEffectManager: StatusEffectManager;
  private battleManager: BattleManager;
  private entities: Map<string, Entity> = new Map();

  constructor() {
    this.damageCalculator = new DamageCalculator();
    this.statusEffectManager = new StatusEffectManager();
    this.battleManager = new BattleManager();
  }

  /**
   * Initialize the combat system with entities
   */
  initialize(entities: Entity[]): void {
    this.entities.clear();
    entities.forEach(entity => {
      this.entities.set(entity.id, entity);
    });
  }

  /**
   * Update the combat system
   */
  update(deltaTime: number): void {
    try {
      // Update status effects
      this.statusEffectManager.update(deltaTime, this.entities);

      // Update battle manager if in combat
      if (this.battleManager.isInCombat()) {
        this.updateBattleSystem(deltaTime);
      }

      // Process auto-attacks if enabled
      if (this.autoAttackEnabled) {
        this.processAutoAttacks(deltaTime);
      }
    } catch (error) {
      console.error('Error updating combat system:', error);
    }
  }

  /**
   * Toggle auto-attack functionality
   */
  toggleAutoAttack(enabled: boolean): void {
    this.autoAttackEnabled = enabled;
    console.log(`Auto-attack ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Start a battle with given participants
   */
  startBattle(participants: Entity[]): void {
    this.battleManager.startBattle(participants);
  }

  /**
   * End the current battle
   */
  endBattle(result: 'victory' | 'defeat'): void {
    this.battleManager.endBattle(result);
  }

  /**
   * Execute an attack between two entities
   */
  executeAttack(
    attacker: Entity, 
    target: Entity, 
    baseDamage: number = 10, 
    damageType: DamageType = DamageType.Physical
  ): DamageResult | null {
    try {
      // Check if attack is valid
      const targetingInfo = this.getTargetingInfo(attacker, target);
      if (!targetingInfo.isValidTarget || !targetingInfo.inRange) {
        console.warn('Attack failed: invalid target or out of range');
        return null;
      }

      // Calculate damage
      const attackerStats = this.getEntityCombatStats(attacker);
      const targetStats = this.getEntityCombatStats(target);
      
      const damageResult = this.damageCalculator.calculateDamage(
        attacker,
        target,
        baseDamage,
        damageType,
        attackerStats,
        targetStats
      );

      // Apply damage to target
      this.applyDamage(target, damageResult);

      console.log(`${attacker.id} deals ${damageResult.amount} ${damageType} damage to ${target.id}${damageResult.isCritical ? ' (CRITICAL!)' : ''}`);

      return damageResult;
    } catch (error) {
      console.error('Error executing attack:', error);
      return null;
    }
  }

  /**
   * Apply a status effect to an entity
   */
  applyStatusEffect(target: Entity, effectId: string, ...args: any[]): boolean {
    try {
      const effect = this.statusEffectManager.createEffect(effectId, ...args);
      if (effect) {
        this.statusEffectManager.applyEffect(target, effect);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error applying status effect:', error);
      return false;
    }
  }

  /**
   * Remove a status effect from an entity
   */
  removeStatusEffect(target: Entity, effectId: string): void {
    this.statusEffectManager.removeEffect(target, effectId);
  }

  /**
   * Queue an action in the battle system
   */
  queueAction(action: CombatAction): boolean {
    return this.battleManager.queueAction(action);
  }

  /**
   * Execute all queued actions
   */
  executeQueuedActions(): void {
    this.battleManager.executeActions();
  }

  /**
   * Update enemy AI behavior
   */
  updateEnemyAI(enemy: Enemy, players: Player[], deltaTime: number): void {
    try {
      if (!this.battleManager.isInCombat()) {
        // Handle real-time AI behavior
        this.processRealtimeEnemyAI(enemy, players, deltaTime);
      } else {
        // Handle turn-based AI behavior
        this.processTurnBasedEnemyAI(enemy, players);
      }
    } catch (error) {
      console.error('Error updating enemy AI:', error);
    }
  }

  /**
   * Process auto-skills for a player
   */
  processAutoSkills(player: Player, targets: Enemy[]): void {
    try {
      if (!this.autoAttackEnabled || !targets.length) return;

      // Convert to entities for internal processing
      const playerEntity = this.convertToEntity(player);
      const targetEntities = targets.map(t => this.convertToEntity(t));

      // Find nearest target
      const nearestTarget = this.findNearestTarget(playerEntity, targetEntities);
      if (!nearestTarget) return;

      // Check if any skills are available and should be auto-cast
      const availableSkills = this.getAvailableSkills(player);
      const skillToUse = this.selectBestSkill(player, nearestTarget, availableSkills);

      if (skillToUse) {
        this.executeSkill(playerEntity, nearestTarget, skillToUse);
      }
    } catch (error) {
      console.error('Error processing auto skills:', error);
    }
  }

  /**
   * Get targeting information between two entities
   */
  getTargetingInfo(source: Entity, target: Entity): TargetingInfo {
    return this.battleManager.getTargetingInfo(source, target);
  }

  /**
   * Get combat statistics for an entity
   */
  getEntityCombatStats(entity: Entity): CombatStats {
    // In a real implementation, this would extract stats from entity components
    // For now, return default stats
    return {
      health: 100,
      maxHealth: 100,
      attack: 15,
      defense: 5,
      speed: 10,
      criticalChance: 0.1,
      criticalMultiplier: 1.5,
      accuracy: 0.85,
      evasion: 0.15
    };
  }

  /**
   * Convert Player/Enemy to Entity format for internal processing
   */
  private convertToEntity(playerOrEnemy: Player | Enemy): Entity {
    // Create a mock entity for compatibility
    return {
      id: typeof playerOrEnemy.id === 'number' ? `entity_${playerOrEnemy.id}` : playerOrEnemy.id,
      components: new Map(),
      addComponent: function<T extends any>(component: T): T { return component; },
      getComponent: function<T extends any>(componentType: new(...args: any[]) => T): T | undefined { return undefined; },
      removeComponent: function<T extends any>(componentType: new(...args: any[]) => T): void { },
      update: function(deltaTime: number): void { }
    };
  }

  /**
   * Private helper methods
   */
  private updateBattleSystem(deltaTime: number): void {
    // Handle battle-specific updates
    const currentTurn = this.battleManager.getCurrentTurn();
    if (currentTurn && !currentTurn.hasActed) {
      // Auto-execute actions for AI entities
      if (!this.isPlayerEntity(currentTurn.entity)) {
        this.processAITurn(currentTurn.entity);
      }
    }
  }

  private processAutoAttacks(deltaTime: number): void {
    // Handle auto-attack logic for real-time combat
    const players = Array.from(this.entities.values()).filter(e => this.isPlayerEntity(e));
    const enemies = Array.from(this.entities.values()).filter(e => !this.isPlayerEntity(e));

    players.forEach(player => {
      const nearestEnemy = this.findNearestTarget(player, enemies);
      if (nearestEnemy) {
        const targetingInfo = this.getTargetingInfo(player, nearestEnemy);
        if (targetingInfo.inRange && this.canAutoAttack(player)) {
          this.executeAttack(player, nearestEnemy);
        }
      }
    });
  }

  private processRealtimeEnemyAI(enemy: Enemy, players: Player[], deltaTime: number): void {
    // Real-time enemy AI logic
    const enemyEntity = this.convertToEntity(enemy);
    const playerEntities = players.map(p => this.convertToEntity(p));
    const nearestPlayer = this.findNearestTarget(enemyEntity, playerEntities);
    
    if (nearestPlayer) {
      // Move towards player or attack if in range
      const targetingInfo = this.getTargetingInfo(enemyEntity, nearestPlayer);
      if (targetingInfo.inRange) {
        this.executeAttack(enemyEntity, nearestPlayer);
      } else {
        // Move towards player (simplified)
        this.moveEntityTowards(enemyEntity, nearestPlayer, deltaTime);
      }
    }
  }

  private processTurnBasedEnemyAI(enemy: Enemy, players: Player[]): void {
    // Turn-based enemy AI logic
    const enemyEntity = this.convertToEntity(enemy);
    const playerEntities = players.map(p => this.convertToEntity(p));
    const nearestPlayer = this.findNearestTarget(enemyEntity, playerEntities);
    
    if (nearestPlayer) {
      const action: CombatAction = {
        id: `attack_${Date.now()}`,
        type: ActionType.Attack,
        executor: enemyEntity,
        target: nearestPlayer,
        priority: 5,
        castTime: 0,
        data: { damage: 10 }
      };

      this.queueAction(action);
      this.executeQueuedActions();
    }
  }

  private processAITurn(entity: Entity): void {
    // Auto-execute turn for AI entities
    setTimeout(() => {
      this.battleManager.endCurrentTurn();
    }, 1000); // 1 second delay for AI turns
  }

  private applyDamage(target: Entity, damageResult: DamageResult): void {
    // In a real implementation, this would apply damage to the entity's health component
    console.log(`Applied ${damageResult.amount} damage to ${target.id}`);
  }

  private findNearestTarget(source: Entity, targets: Entity[]): Entity | null {
    if (!targets.length) return null;
    
    // Simplified - return first target
    // In real implementation, would calculate actual distances
    return targets[0];
  }

  private getAvailableSkills(player: Player): any[] {
    // Return available skills for the player
    return player.skills || [];
  }

  private selectBestSkill(player: Player, target: Entity, skills: any[]): any | null {
    // Select the best skill to use based on situation
    return skills.length > 0 ? skills[0] : null;
  }

  private executeSkill(user: Entity, target: Entity, skill: any): void {
    console.log(`${user.id} uses skill ${skill.name || 'unknown'} on ${target.id}`);
  }

  private canAutoAttack(entity: Entity): boolean {
    // Check if entity can perform auto-attack (cooldowns, etc.)
    return true; // Simplified
  }

  private moveEntityTowards(entity: Entity, target: Entity, deltaTime: number): void {
    // Move entity towards target (simplified)
    console.log(`${entity.id} moves towards ${target.id}`);
  }

  private isPlayerEntity(entity: Entity): boolean {
    return entity.id.startsWith('player') || entity.id.startsWith('entity_');
  }

  // Public getters
  getCombatState(): CombatState {
    return this.battleManager.getCombatState();
  }

  getBattleManager(): BattleManager {
    return this.battleManager;
  }

  getStatusEffectManager(): StatusEffectManager {
    return this.statusEffectManager;
  }

  getDamageCalculator(): DamageCalculator {
    return this.damageCalculator;
  }

  isInCombat(): boolean {
    return this.battleManager.isInCombat();
  }

  getAutoAttackEnabled(): boolean {
    return this.autoAttackEnabled;
  }
}
