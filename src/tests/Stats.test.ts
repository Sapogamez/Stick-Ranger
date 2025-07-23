import { StatsManager } from '../systems/stats/Stats';
import { CharacterStats } from '../types/character';
import { EquipmentStats } from '../types/equipment';

describe('StatsManager', () => {
  const baseStats: CharacterStats = {
    health: 100,
    maxHealth: 100,
    attackPower: 20,
    defense: 10,
    speed: 15,
    mana: 50,
    maxMana: 50,
    criticalChance: 0.1,
    criticalMultiplier: 1.5
  };

  describe('cloneStats', () => {
    test('should create a deep copy of stats', () => {
      const cloned = StatsManager.cloneStats(baseStats);
      
      expect(cloned).toEqual(baseStats);
      expect(cloned).not.toBe(baseStats);
      
      // Modify original to ensure it's a deep copy
      baseStats.health = 50;
      expect(cloned.health).toBe(100);
    });
  });

  describe('applyEquipmentStats', () => {
    test('should apply equipment stat bonuses', () => {
      const equipmentStats: EquipmentStats = {
        attackPower: 10,
        defense: 5,
        maxHealth: 20,
        criticalChance: 0.05
      };

      const modifiedStats = StatsManager.applyEquipmentStats(baseStats, equipmentStats);

      expect(modifiedStats.attackPower).toBe(30); // 20 + 10
      expect(modifiedStats.defense).toBe(15); // 10 + 5
      expect(modifiedStats.maxHealth).toBe(120); // 100 + 20
      expect(modifiedStats.criticalChance).toBeCloseTo(0.15); // 0.1 + 0.05
    });

    test('should ensure health does not exceed maxHealth', () => {
      const equipmentStats: EquipmentStats = {
        maxHealth: -50 // Reducing max health
      };

      const modifiedStats = StatsManager.applyEquipmentStats(baseStats, equipmentStats);

      expect(modifiedStats.maxHealth).toBe(50);
      expect(modifiedStats.health).toBe(50); // Should be capped to maxHealth
    });
  });

  describe('calculateLevelStats', () => {
    test('should calculate stats based on level', () => {
      const growthStats: Partial<CharacterStats> = {
        maxHealth: 10,
        attackPower: 2,
        defense: 1
      };

      const leveledStats = StatsManager.calculateLevelStats(baseStats, growthStats, 5);

      expect(leveledStats.maxHealth).toBe(140); // 100 + (10 * 4)
      expect(leveledStats.attackPower).toBe(28); // 20 + (2 * 4)
      expect(leveledStats.defense).toBe(14); // 10 + (1 * 4)
      expect(leveledStats.health).toBe(140); // Should be full health
    });

    test('should not apply growth at level 1', () => {
      const growthStats: Partial<CharacterStats> = {
        maxHealth: 10,
        attackPower: 2
      };

      const leveledStats = StatsManager.calculateLevelStats(baseStats, growthStats, 1);

      expect(leveledStats.maxHealth).toBe(100); // No growth at level 1
      expect(leveledStats.attackPower).toBe(20);
    });
  });

  describe('calculateDamageReduction', () => {
    test('should reduce damage based on defense', () => {
      const reducedDamage = StatsManager.calculateDamageReduction(100, 50);
      
      // Formula: damage * (1 - defense / (defense + 100))
      // 100 * (1 - 50 / 150) = 100 * (1 - 0.333) = 66.67 -> 66
      expect(reducedDamage).toBe(66);
    });

    test('should always deal at least 1 damage', () => {
      const reducedDamage = StatsManager.calculateDamageReduction(1, 1000);
      expect(reducedDamage).toBe(1);
    });
  });

  describe('calculateCriticalHit', () => {
    test('should return normal damage when not critical', () => {
      // Mock Math.random to return > criticalChance
      jest.spyOn(Math, 'random').mockReturnValue(0.9);
      
      const result = StatsManager.calculateCriticalHit(100, 0.5, 2.0);
      
      expect(result.damage).toBe(100);
      expect(result.isCritical).toBe(false);
      
      jest.restoreAllMocks();
    });

    test('should return critical damage when critical hits', () => {
      // Mock Math.random to return < criticalChance
      jest.spyOn(Math, 'random').mockReturnValue(0.1);
      
      const result = StatsManager.calculateCriticalHit(100, 0.5, 2.0);
      
      expect(result.damage).toBe(200); // 100 * 2.0
      expect(result.isCritical).toBe(true);
      
      jest.restoreAllMocks();
    });
  });

  describe('validateStats', () => {
    test('should validate correct stats', () => {
      const validStats: CharacterStats = {
        health: 80,
        maxHealth: 100,
        attackPower: 20,
        defense: 10,
        speed: 15,
        mana: 30,
        maxMana: 50
      };

      expect(StatsManager.validateStats(validStats)).toBe(true);
    });

    test('should reject invalid stats', () => {
      const invalidStats: CharacterStats = {
        health: 120, // Exceeds maxHealth
        maxHealth: 100,
        attackPower: -5, // Negative value
        defense: 10,
        speed: 15
      };

      expect(StatsManager.validateStats(invalidStats)).toBe(false);
    });
  });
});