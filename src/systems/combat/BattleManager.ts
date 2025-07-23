import { Entity } from '../../types/game';
import { 
  CombatAction, 
  ActionType, 
  TurnData, 
  CombatState, 
  BattleEvent, 
  BattleEventType,
  TargetingInfo 
} from '../../types/combat';

/**
 * Manages turn-based battle flow, action queuing, and combat state
 */
export class BattleManager {
  private combatState: CombatState = CombatState.Idle;
  private participants: Map<string, Entity> = new Map();
  private turnOrder: TurnData[] = [];
  private currentTurnIndex: number = 0;
  private actionQueue: CombatAction[] = [];
  private battleEvents: BattleEvent[] = [];
  private turnNumber: number = 0;
  private battleStartTime: number = 0;

  constructor() {
    this.combatState = CombatState.Idle;
  }

  /**
   * Start a new battle with the given participants
   */
  startBattle(participants: Entity[]): void {
    try {
      console.log('Starting battle with', participants.length, 'participants');
      
      this.combatState = CombatState.InCombat;
      this.participants.clear();
      this.turnOrder = [];
      this.actionQueue = [];
      this.currentTurnIndex = 0;
      this.turnNumber = 1;
      this.battleStartTime = Date.now();

      // Register participants
      participants.forEach(entity => {
        this.participants.set(entity.id, entity);
      });

      // Initialize turn order
      this.calculateTurnOrder();
      
      // Emit battle start event
      this.emitEvent(BattleEventType.CombatStart, {
        participants: participants.map(p => p.id),
        turnOrder: this.turnOrder.map(t => t.entity.id)
      });

      // Start first turn
      this.startNextTurn();
    } catch (error) {
      console.error('Error starting battle:', error);
      this.combatState = CombatState.Idle;
    }
  }

  /**
   * End the current battle
   */
  endBattle(result: 'victory' | 'defeat'): void {
    try {
      this.combatState = result === 'victory' ? CombatState.Victory : CombatState.Defeat;
      
      this.emitEvent(BattleEventType.CombatEnd, {
        result,
        duration: Date.now() - this.battleStartTime,
        turns: this.turnNumber
      });

      console.log(`Battle ended with ${result} after ${this.turnNumber} turns`);
      
      // Clean up
      this.participants.clear();
      this.turnOrder = [];
      this.actionQueue = [];
    } catch (error) {
      console.error('Error ending battle:', error);
    }
  }

  /**
   * Calculate turn order based on speed/initiative
   */
  private calculateTurnOrder(): void {
    const entities = Array.from(this.participants.values());
    
    // Calculate initiative for each entity
    const turnData: TurnData[] = entities.map(entity => ({
      entity,
      initiative: this.calculateInitiative(entity),
      actionsRemaining: 1,
      hasActed: false
    }));

    // Sort by initiative (higher goes first)
    this.turnOrder = turnData.sort((a, b) => b.initiative - a.initiative);
  }

  /**
   * Calculate initiative for an entity (speed + random factor)
   */
  private calculateInitiative(entity: Entity): number {
    // Base initiative from speed stat (would get from stats component)
    const baseSpeed = 10; // Default, would get from entity's stats
    const randomFactor = Math.random() * 10;
    return baseSpeed + randomFactor;
  }

  /**
   * Start the next turn in the battle
   */
  private startNextTurn(): void {
    try {
      if (this.combatState !== CombatState.InCombat) {
        return;
      }

      // Check victory conditions
      if (this.checkVictoryConditions()) {
        return;
      }

      // Get current turn data
      const currentTurn = this.getCurrentTurn();
      if (!currentTurn) {
        this.endRound();
        return;
      }

      // Reset turn data
      currentTurn.hasActed = false;
      currentTurn.actionsRemaining = 1;

      // Set appropriate combat state
      this.combatState = this.isPlayerTurn(currentTurn.entity) ? 
        CombatState.PlayerTurn : CombatState.EnemyTurn;

      this.emitEvent(BattleEventType.TurnStart, {
        entity: currentTurn.entity.id,
        turnNumber: this.turnNumber,
        initiative: currentTurn.initiative
      });

      console.log(`Turn ${this.turnNumber}: ${currentTurn.entity.id}'s turn`);
    } catch (error) {
      console.error('Error starting next turn:', error);
    }
  }

  /**
   * End the current turn and advance to next
   */
  endCurrentTurn(): void {
    try {
      const currentTurn = this.getCurrentTurn();
      if (!currentTurn) return;

      currentTurn.hasActed = true;
      
      this.emitEvent(BattleEventType.TurnEnd, {
        entity: currentTurn.entity.id,
        actionsUsed: 1 - currentTurn.actionsRemaining
      });

      // Advance to next turn
      this.currentTurnIndex++;
      
      if (this.currentTurnIndex >= this.turnOrder.length) {
        this.endRound();
      } else {
        this.startNextTurn();
      }
    } catch (error) {
      console.error('Error ending current turn:', error);
    }
  }

  /**
   * End the current round and start a new one
   */
  private endRound(): void {
    this.currentTurnIndex = 0;
    this.turnNumber++;
    
    // Recalculate turn order for new round
    this.calculateTurnOrder();
    
    console.log(`Starting round ${this.turnNumber}`);
    this.startNextTurn();
  }

  /**
   * Queue an action to be executed
   */
  queueAction(action: CombatAction): boolean {
    try {
      if (!this.isInCombat()) {
        console.warn('Cannot queue action: not in combat');
        return false;
      }

      const currentTurn = this.getCurrentTurn();
      if (!currentTurn || currentTurn.entity.id !== action.executor.id) {
        console.warn('Cannot queue action: not entity\'s turn');
        return false;
      }

      if (currentTurn.actionsRemaining <= 0) {
        console.warn('Cannot queue action: no actions remaining');
        return false;
      }

      // Validate action
      if (!this.validateAction(action)) {
        console.warn('Cannot queue action: validation failed');
        return false;
      }

      // Add to queue
      this.actionQueue.push(action);
      currentTurn.actionsRemaining--;

      console.log(`Queued ${action.type} action for ${action.executor.id}`);
      return true;
    } catch (error) {
      console.error('Error queueing action:', error);
      return false;
    }
  }

  /**
   * Execute all queued actions
   */
  executeActions(): void {
    try {
      // Sort actions by priority (higher priority first)
      this.actionQueue.sort((a, b) => b.priority - a.priority);

      while (this.actionQueue.length > 0) {
        const action = this.actionQueue.shift()!;
        this.executeAction(action);
      }

      // Check if turn should end
      const currentTurn = this.getCurrentTurn();
      if (currentTurn && currentTurn.actionsRemaining <= 0) {
        this.endCurrentTurn();
      }
    } catch (error) {
      console.error('Error executing actions:', error);
    }
  }

  /**
   * Execute a single action
   */
  private executeAction(action: CombatAction): void {
    try {
      this.emitEvent(BattleEventType.ActionExecuted, {
        action: action.type,
        executor: action.executor.id,
        target: action.target && 'id' in action.target ? action.target.id : 'position',
        data: action.data
      });

      // Execute based on action type
      switch (action.type) {
        case ActionType.Attack:
          this.executeAttackAction(action);
          break;
        case ActionType.Skill:
          this.executeSkillAction(action);
          break;
        case ActionType.Item:
          this.executeItemAction(action);
          break;
        case ActionType.Move:
          this.executeMoveAction(action);
          break;
        case ActionType.Defend:
          this.executeDefendAction(action);
          break;
        case ActionType.Wait:
          // Wait action does nothing
          break;
        default:
          console.warn(`Unknown action type: ${action.type}`);
      }

      console.log(`Executed ${action.type} action by ${action.executor.id}`);
    } catch (error) {
      console.error('Error executing action:', error);
    }
  }

  /**
   * Execute an attack action
   */
  private executeAttackAction(action: CombatAction): void {
    if (!action.target || !('id' in action.target)) {
      console.warn('Attack action requires an entity target');
      return;
    }

    const target = action.target as Entity;
    console.log(`${action.executor.id} attacks ${target.id}`);
    
    // This would integrate with the actual combat system to deal damage
    // For now, just log the action
  }

  /**
   * Execute a skill action
   */
  private executeSkillAction(action: CombatAction): void {
    console.log(`${action.executor.id} uses skill: ${action.data?.skillId || 'unknown'}`);
    // Skill execution would be handled by the ability system
  }

  /**
   * Execute an item action
   */
  private executeItemAction(action: CombatAction): void {
    console.log(`${action.executor.id} uses item: ${action.data?.itemId || 'unknown'}`);
    // Item usage would be handled by the inventory/item system
  }

  /**
   * Execute a move action
   */
  private executeMoveAction(action: CombatAction): void {
    console.log(`${action.executor.id} moves to position`);
    // Movement would update the entity's position component
  }

  /**
   * Execute a defend action
   */
  private executeDefendAction(action: CombatAction): void {
    console.log(`${action.executor.id} defends`);
    // Defend would apply defensive modifiers
  }

  /**
   * Validate if an action is legal
   */
  private validateAction(action: CombatAction): boolean {
    // Basic validation
    if (!action.executor || !this.participants.has(action.executor.id)) {
      return false;
    }

    // Type-specific validation
    switch (action.type) {
      case ActionType.Attack:
        return this.validateAttackAction(action);
      case ActionType.Skill:
        return this.validateSkillAction(action);
      default:
        return true; // Other actions are generally valid
    }
  }

  /**
   * Validate attack action
   */
  private validateAttackAction(action: CombatAction): boolean {
    if (!action.target || !('id' in action.target)) {
      return false;
    }

    const target = action.target as Entity;
    
    // Check if target exists and is valid
    if (!this.participants.has(target.id)) {
      return false;
    }

    // Check if target is in range (simplified)
    const targetingInfo = this.getTargetingInfo(action.executor, target);
    return targetingInfo.isValidTarget && targetingInfo.inRange;
  }

  /**
   * Validate skill action
   */
  private validateSkillAction(action: CombatAction): boolean {
    // Check if skill exists and can be used
    // This would integrate with the ability system
    return true; // Simplified validation
  }

  /**
   * Get targeting information between two entities
   */
  getTargetingInfo(source: Entity, target: Entity): TargetingInfo {
    // Simplified targeting logic
    const distance = this.calculateDistance(source, target);
    const maxRange = 100; // Default attack range
    
    return {
      isValidTarget: this.participants.has(target.id),
      inRange: distance <= maxRange,
      lineOfSight: true, // Simplified
      distance
    };
  }

  /**
   * Calculate distance between two entities
   */
  private calculateDistance(entity1: Entity, entity2: Entity): number {
    // Simplified distance calculation
    // In a real implementation, this would use position components
    return Math.random() * 50; // Mock distance
  }

  /**
   * Check victory/defeat conditions
   */
  private checkVictoryConditions(): boolean {
    const alivePlayers = Array.from(this.participants.values()).filter(e => this.isPlayerEntity(e) && this.isAlive(e));
    const aliveEnemies = Array.from(this.participants.values()).filter(e => !this.isPlayerEntity(e) && this.isAlive(e));

    if (alivePlayers.length === 0) {
      this.endBattle('defeat');
      return true;
    }

    if (aliveEnemies.length === 0) {
      this.endBattle('victory');
      return true;
    }

    return false;
  }

  /**
   * Check if an entity is a player
   */
  private isPlayerEntity(entity: Entity): boolean {
    // Simplified check - in real implementation would check entity components
    return entity.id.startsWith('player');
  }

  /**
   * Check if a turn belongs to a player
   */
  private isPlayerTurn(entity: Entity): boolean {
    return this.isPlayerEntity(entity);
  }

  /**
   * Check if an entity is alive
   */
  private isAlive(entity: Entity): boolean {
    // Simplified check - would check health component
    return true; // Mock - all entities are alive
  }

  /**
   * Get current turn data
   */
  getCurrentTurn(): TurnData | null {
    if (this.currentTurnIndex >= 0 && this.currentTurnIndex < this.turnOrder.length) {
      return this.turnOrder[this.currentTurnIndex];
    }
    return null;
  }

  /**
   * Emit a battle event
   */
  private emitEvent(type: BattleEventType, data: any): void {
    const event: BattleEvent = {
      type,
      timestamp: Date.now(),
      data
    };
    
    this.battleEvents.push(event);
    
    // Keep only last 100 events to prevent memory leaks
    if (this.battleEvents.length > 100) {
      this.battleEvents.shift();
    }
  }

  // Public getters
  getCombatState(): CombatState {
    return this.combatState;
  }

  getParticipants(): Entity[] {
    return Array.from(this.participants.values());
  }

  getTurnOrder(): TurnData[] {
    return [...this.turnOrder];
  }

  getCurrentTurnEntity(): Entity | null {
    const turn = this.getCurrentTurn();
    return turn ? turn.entity : null;
  }

  getTurnNumber(): number {
    return this.turnNumber;
  }

  getActionQueue(): CombatAction[] {
    return [...this.actionQueue];
  }

  getBattleEvents(): BattleEvent[] {
    return [...this.battleEvents];
  }

  isInCombat(): boolean {
    return this.combatState === CombatState.InCombat || 
           this.combatState === CombatState.PlayerTurn || 
           this.combatState === CombatState.EnemyTurn;
  }

  pause(): void {
    if (this.isInCombat()) {
      this.combatState = CombatState.Paused;
    }
  }

  resume(): void {
    if (this.combatState === CombatState.Paused) {
      this.combatState = CombatState.InCombat;
    }
  }
}