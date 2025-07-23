import { StatusEffectManager, PoisonEffect, StunEffect } from '../systems/combat/StatusEffect';
import { Entity } from '../types/game';

describe('StatusEffectManager', () => {
  let statusManager: StatusEffectManager;
  let mockEntity: Entity;
  let entities: Map<string, Entity>;

  beforeEach(() => {
    statusManager = new StatusEffectManager();
    
    mockEntity = {
      id: 'test_entity',
      components: new Map(),
      addComponent: jest.fn(),
      getComponent: jest.fn(),
      removeComponent: jest.fn(),
      update: jest.fn()
    };

    entities = new Map();
    entities.set('test_entity', mockEntity);
  });

  test('should create status effects by ID', () => {
    const poisonEffect = statusManager.createEffect('poison', 5, 10);
    expect(poisonEffect).toBeTruthy();
    expect(poisonEffect?.id).toBe('poison');

    const stunEffect = statusManager.createEffect('stun', 3);
    expect(stunEffect).toBeTruthy();
    expect(stunEffect?.id).toBe('stun');
  });

  test('should apply status effect to entity', () => {
    const poisonEffect = new PoisonEffect(5, 10);
    statusManager.applyEffect(mockEntity, poisonEffect);

    const effects = statusManager.getEffects(mockEntity);
    expect(effects).toHaveLength(1);
    expect(effects[0].id).toBe('poison');
  });

  test('should stack stackable effects', () => {
    const poison1 = new PoisonEffect(5, 10);
    const poison2 = new PoisonEffect(5, 10);

    statusManager.applyEffect(mockEntity, poison1);
    statusManager.applyEffect(mockEntity, poison2);

    const effects = statusManager.getEffects(mockEntity);
    expect(effects).toHaveLength(1);
    expect(effects[0].currentStacks).toBe(2);
  });

  test('should not stack non-stackable effects', () => {
    const stun1 = new StunEffect(3);
    const stun2 = new StunEffect(3);

    statusManager.applyEffect(mockEntity, stun1);
    statusManager.applyEffect(mockEntity, stun2);

    const effects = statusManager.getEffects(mockEntity);
    expect(effects).toHaveLength(1);
    expect(effects[0].currentStacks).toBe(1);
  });

  test('should remove specific status effect', () => {
    const poisonEffect = new PoisonEffect(5, 10);
    statusManager.applyEffect(mockEntity, poisonEffect);

    expect(statusManager.hasEffect(mockEntity, 'poison')).toBe(true);

    statusManager.removeEffect(mockEntity, 'poison');
    expect(statusManager.hasEffect(mockEntity, 'poison')).toBe(false);
  });

  test('should update status effects over time', () => {
    const poisonEffect = new PoisonEffect(2, 10);
    statusManager.applyEffect(mockEntity, poisonEffect);

    // Update for 1 second
    statusManager.update(1, entities);
    
    const effects = statusManager.getEffects(mockEntity);
    expect(effects).toHaveLength(1);
    expect(effects[0].remainingTime).toBeLessThan(2);

    // Update for 2 more seconds (should expire)
    statusManager.update(2, entities);
    
    const effectsAfterExpiry = statusManager.getEffects(mockEntity);
    expect(effectsAfterExpiry).toHaveLength(0);
  });

  test('should clear all effects from entity', () => {
    const poisonEffect = new PoisonEffect(5, 10);
    const stunEffect = new StunEffect(3);

    statusManager.applyEffect(mockEntity, poisonEffect);
    statusManager.applyEffect(mockEntity, stunEffect);

    expect(statusManager.getEffectCount(mockEntity)).toBe(2);

    statusManager.clearEffects(mockEntity);
    expect(statusManager.getEffectCount(mockEntity)).toBe(0);
  });

  test('should get specific effect from entity', () => {
    const poisonEffect = new PoisonEffect(5, 10);
    statusManager.applyEffect(mockEntity, poisonEffect);

    const retrievedEffect = statusManager.getEffect(mockEntity, 'poison');
    expect(retrievedEffect).toBeTruthy();
    expect(retrievedEffect?.id).toBe('poison');

    const nonExistentEffect = statusManager.getEffect(mockEntity, 'freeze');
    expect(nonExistentEffect).toBeUndefined();
  });
});