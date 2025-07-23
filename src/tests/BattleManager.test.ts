import { BattleManager } from '../systems/combat/BattleManager';
import { CombatState, ActionType } from '../types/combat';
import { Entity } from '../types/game';

describe('BattleManager', () => {
  let battleManager: BattleManager;
  let mockPlayer: Entity;
  let mockEnemy: Entity;

  beforeEach(() => {
    battleManager = new BattleManager();
    
    mockPlayer = {
      id: 'player_1',
      components: new Map(),
      addComponent: jest.fn(),
      getComponent: jest.fn(),
      removeComponent: jest.fn(),
      update: jest.fn()
    };

    mockEnemy = {
      id: 'enemy_1',
      components: new Map(),
      addComponent: jest.fn(),
      getComponent: jest.fn(),
      removeComponent: jest.fn(),
      update: jest.fn()
    };
  });

  test('should start battle with participants', () => {
    const participants = [mockPlayer, mockEnemy];
    
    battleManager.startBattle(participants);
    
    expect(battleManager.isInCombat()).toBe(true);
    expect(battleManager.getParticipants()).toHaveLength(2);
    expect(battleManager.getTurnNumber()).toBe(1);
  });

  test('should initialize turn order', () => {
    const participants = [mockPlayer, mockEnemy];
    
    battleManager.startBattle(participants);
    
    const turnOrder = battleManager.getTurnOrder();
    expect(turnOrder).toHaveLength(2);
    expect(turnOrder.every(turn => turn.initiative >= 0)).toBe(true);
  });

  test('should track current turn', () => {
    const participants = [mockPlayer, mockEnemy];
    
    battleManager.startBattle(participants);
    
    const currentTurn = battleManager.getCurrentTurn();
    expect(currentTurn).toBeTruthy();
    expect(currentTurn?.actionsRemaining).toBe(1);
    expect(currentTurn?.hasActed).toBe(false);
  });

  test('should queue valid actions', () => {
    const participants = [mockPlayer, mockEnemy];
    battleManager.startBattle(participants);
    
    // Combat should be active (either PlayerTurn or EnemyTurn)
    const combatState = battleManager.getCombatState();
    expect([CombatState.PlayerTurn, CombatState.EnemyTurn]).toContain(combatState);
    
    const currentEntity = battleManager.getCurrentTurnEntity();
    
    if (currentEntity) {
      const action = {
        id: 'test_action',
        type: ActionType.Attack,
        executor: currentEntity,
        target: mockEnemy,
        priority: 5,
        castTime: 0
      };

      // Actions should queue successfully for the current turn entity
      const success = battleManager.queueAction(action);
      expect(success).toBe(true);
      expect(battleManager.getActionQueue()).toHaveLength(1);
    }
  });

  test('should reject invalid actions', () => {
    const participants = [mockPlayer, mockEnemy];
    battleManager.startBattle(participants);
    
    const currentEntity = battleManager.getCurrentTurnEntity();
    const notCurrentEntity = currentEntity?.id === mockPlayer.id ? mockEnemy : mockPlayer;
    
    // Try to queue action for entity that's not current turn
    const action = {
      id: 'invalid_action',
      type: ActionType.Attack,
      executor: notCurrentEntity,
      target: mockPlayer,
      priority: 5,
      castTime: 0
    };

    const success = battleManager.queueAction(action);
    expect(success).toBe(false);
  });

  test('should end battle with victory', () => {
    const participants = [mockPlayer, mockEnemy];
    battleManager.startBattle(participants);
    
    battleManager.endBattle('victory');
    
    expect(battleManager.getCombatState()).toBe(CombatState.Victory);
    expect(battleManager.isInCombat()).toBe(false);
  });

  test('should end battle with defeat', () => {
    const participants = [mockPlayer, mockEnemy];
    battleManager.startBattle(participants);
    
    battleManager.endBattle('defeat');
    
    expect(battleManager.getCombatState()).toBe(CombatState.Defeat);
    expect(battleManager.isInCombat()).toBe(false);
  });

  test('should pause and resume battle', () => {
    const participants = [mockPlayer, mockEnemy];
    battleManager.startBattle(participants);
    
    battleManager.pause();
    expect(battleManager.getCombatState()).toBe(CombatState.Paused);
    
    battleManager.resume();
    expect(battleManager.getCombatState()).toBe(CombatState.InCombat);
  });

  test('should provide targeting information', () => {
    const participants = [mockPlayer, mockEnemy];
    battleManager.startBattle(participants);
    
    const targetInfo = battleManager.getTargetingInfo(mockPlayer, mockEnemy);
    
    expect(targetInfo).toHaveProperty('isValidTarget');
    expect(targetInfo).toHaveProperty('inRange');
    expect(targetInfo).toHaveProperty('lineOfSight');
    expect(targetInfo).toHaveProperty('distance');
    expect(typeof targetInfo.distance).toBe('number');
  });

  test('should track battle events', () => {
    const participants = [mockPlayer, mockEnemy];
    battleManager.startBattle(participants);
    
    const events = battleManager.getBattleEvents();
    expect(events.length).toBeGreaterThan(0);
    
    // Should have a combat start event
    const startEvent = events.find(e => e.type === 'combat_start');
    expect(startEvent).toBeTruthy();
  });
});