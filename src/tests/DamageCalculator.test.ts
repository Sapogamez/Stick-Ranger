import { DamageCalculator } from '../systems/combat/DamageCalculator';
import { DamageType } from '../types/combat';
import { Entity } from '../types/game';

describe('DamageCalculator', () => {
  let damageCalculator: DamageCalculator;
  let mockAttacker: Entity;
  let mockTarget: Entity;

  beforeEach(() => {
    damageCalculator = new DamageCalculator();
    
    mockAttacker = {
      id: 'attacker',
      components: new Map(),
      addComponent: jest.fn(),
      getComponent: jest.fn(),
      removeComponent: jest.fn(),
      update: jest.fn()
    };

    mockTarget = {
      id: 'target',
      components: new Map(),
      addComponent: jest.fn(),
      getComponent: jest.fn(),
      removeComponent: jest.fn(),
      update: jest.fn()
    };
  });

  test('should calculate basic physical damage', () => {
    const result = damageCalculator.calculateDamage(
      mockAttacker,
      mockTarget,
      50,
      DamageType.Physical
    );

    expect(result.amount).toBeGreaterThan(0);
    expect(result.damageType).toBe(DamageType.Physical);
    expect(result.source).toBe(mockAttacker);
    expect(typeof result.isCritical).toBe('boolean');
  });

  test('should handle healing calculation', () => {
    const result = damageCalculator.calculateHealing(
      mockAttacker,
      mockTarget,
      30
    );

    expect(result.amount).toBeGreaterThan(0);
    expect(result.damageType).toBe(DamageType.Healing);
    expect(result.source).toBe(mockAttacker);
  });

  test('should calculate hit chance', () => {
    const attackerStats = {
      health: 100,
      maxHealth: 100,
      attack: 15,
      defense: 5,
      speed: 10,
      criticalChance: 0.1,
      criticalMultiplier: 1.5,
      accuracy: 0.8,
      evasion: 0.1
    };

    const targetStats = {
      health: 100,
      maxHealth: 100,
      attack: 10,
      defense: 8,
      speed: 12,
      criticalChance: 0.05,
      criticalMultiplier: 1.3,
      accuracy: 0.7,
      evasion: 0.2
    };

    const hitChance = damageCalculator.calculateHitChance(attackerStats, targetStats);
    expect(typeof hitChance).toBe('boolean');
  });

  test('should calculate DoT damage', () => {
    const damage = damageCalculator.calculateDoTDamage(
      10,
      3,
      DamageType.Poison
    );

    expect(damage).toBe(30); // 10 * 3 stacks
  });

  test('should handle errors gracefully', () => {
    // Test with null entities (should not throw)
    const result = damageCalculator.calculateDamage(
      null as any,
      null as any,
      50
    );

    expect(result.amount).toBeGreaterThanOrEqual(1); // Should return some damage even on error
    expect(result.damageType).toBe(DamageType.Physical); // Should have default damage type
  });
});