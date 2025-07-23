import { BaseCharacter } from '../systems/character/BaseCharacter';
import { Warrior } from '../systems/character/classes/Warrior';
import { Archer } from '../systems/character/classes/Archer';
import { Mage } from '../systems/character/classes/Mage';
import { Priest } from '../systems/character/classes/Priest';
import { Boxer } from '../systems/character/classes/Boxer';
import { EquipmentManager } from '../systems/equipment/Equipment';
import { CharacterClass, ICharacter } from '../types/character';

describe('Character Classes', () => {
  let equipmentManager: EquipmentManager;

  beforeEach(() => {
    equipmentManager = new EquipmentManager();
  });

  describe('Warrior', () => {
    let warrior: Warrior;

    beforeEach(() => {
      warrior = new Warrior('warrior1', 'Test Warrior', equipmentManager);
    });

    test('should initialize with correct stats', () => {
      expect(warrior.class).toBe(CharacterClass.WARRIOR);
      expect(warrior.stats.maxHealth).toBe(120);
      expect(warrior.stats.attackPower).toBe(25);
      expect(warrior.stats.defense).toBe(15);
      expect(warrior.stats.speed).toBe(8);
    });

    test('should take damage correctly', () => {
      const initialHealth = warrior.stats.health;
      const damageDealt = warrior.takeDamage(50);
      
      expect(damageDealt).toBeGreaterThan(0);
      expect(warrior.stats.health).toBe(initialHealth - damageDealt);
    });

    test('should heal correctly', () => {
      warrior.takeDamage(50);
      const healthBeforeHeal = warrior.stats.health;
      const healingDone = warrior.heal(30);
      
      expect(healingDone).toBeGreaterThan(0);
      expect(warrior.stats.health).toBe(healthBeforeHeal + healingDone);
    });

    test('should not heal above max health', () => {
      const healingDone = warrior.heal(200);
      expect(warrior.stats.health).toBe(warrior.stats.maxHealth);
    });

    test('should level up correctly', () => {
      const initialLevel = warrior.progression.level;
      warrior.levelUp();
      
      expect(warrior.progression.level).toBe(initialLevel + 1);
      expect(warrior.progression.statPoints).toBe(5);
      expect(warrior.progression.skillPoints).toBe(1);
    });
  });

  describe('Archer', () => {
    let archer: Archer;

    beforeEach(() => {
      archer = new Archer('archer1', 'Test Archer', equipmentManager);
    });

    test('should initialize with correct stats', () => {
      expect(archer.class).toBe(CharacterClass.ARCHER);
      expect(archer.stats.maxHealth).toBe(80);
      expect(archer.stats.attackPower).toBe(30);
      expect(archer.stats.speed).toBe(15);
      expect(archer.stats.criticalChance).toBe(0.15);
    });

    test('should have higher critical chance than warrior', () => {
      const warrior = new Warrior('warrior1', 'Test Warrior', equipmentManager);
      expect(archer.stats.criticalChance).toBeGreaterThan(warrior.stats.criticalChance || 0);
    });

    test('should use abilities', () => {
      const targetWarrior = new Warrior('target', 'Target', equipmentManager);
      const success = archer.useAbility('archer_piercing_shot', targetWarrior);
      
      // Should succeed if mana is sufficient
      expect(typeof success).toBe('boolean');
    });
  });

  describe('Mage', () => {
    let mage: Mage;

    beforeEach(() => {
      mage = new Mage('mage1', 'Test Mage', equipmentManager);
    });

    test('should initialize with correct stats', () => {
      expect(mage.class).toBe(CharacterClass.MAGE);
      expect(mage.stats.maxHealth).toBe(60);
      expect(mage.stats.maxMana).toBe(100);
      expect(mage.stats.criticalMultiplier).toBe(2.5);
    });

    test('should have highest mana', () => {
      const warrior = new Warrior('warrior1', 'Test Warrior', equipmentManager);
      const archer = new Archer('archer1', 'Test Archer', equipmentManager);
      
      expect(mage.stats.maxMana).toBeGreaterThan(warrior.stats.maxMana || 0);
      expect(mage.stats.maxMana).toBeGreaterThan(archer.stats.maxMana || 0);
    });

    test('should regenerate mana', () => {
      mage.stats.mana = 50; // Reduce mana
      const initialMana = mage.stats.mana;
      
      mage.regenerateMana(2); // 2 seconds
      
      expect(mage.stats.mana).toBeGreaterThan(initialMana);
      expect(mage.stats.mana).toBeLessThanOrEqual(mage.stats.maxMana || 0);
    });
  });

  describe('Priest', () => {
    let priest: Priest;

    beforeEach(() => {
      priest = new Priest('priest1', 'Test Priest', equipmentManager);
    });

    test('should initialize with correct stats', () => {
      expect(priest.class).toBe(CharacterClass.PRIEST);
      expect(priest.stats.maxHealth).toBe(90);
      expect(priest.stats.maxMana).toBe(80);
    });

    test('should have healing abilities', () => {
      const healAbility = priest.abilities.find((a: any) => a.id === 'priest_heal');
      expect(healAbility).toBeDefined();
      expect(healAbility?.healAmount).toBeGreaterThan(0);
    });

    test('should calculate healing power', () => {
      const baseHealing = 50;
      const modifiedHealing = priest.calculateHealingPower(baseHealing);
      
      expect(modifiedHealing).toBeGreaterThanOrEqual(baseHealing);
    });
  });

  describe('Boxer', () => {
    let boxer: Boxer;

    beforeEach(() => {
      boxer = new Boxer('boxer1', 'Test Boxer', equipmentManager);
    });

    test('should initialize with correct stats', () => {
      expect(boxer.class).toBe(CharacterClass.BOXER);
      expect(boxer.stats.speed).toBe(18);
      expect(boxer.getComboCount()).toBe(0);
      expect(boxer.getMaxCombo()).toBe(5);
    });

    test('should build combo on successful attacks', () => {
      const target = new Warrior('target', 'Target', equipmentManager);
      const initialCombo = boxer.getComboCount();
      
      boxer.attack(target);
      
      expect(boxer.getComboCount()).toBeGreaterThan(initialCombo);
    });

    test('should reset combo over time', () => {
      const target = new Warrior('target', 'Target', equipmentManager);
      boxer.attack(target); // Build combo
      
      const comboAfterAttack = boxer.getComboCount();
      expect(comboAfterAttack).toBeGreaterThan(0);
      
      // Update with long time to trigger combo reset
      boxer.updateCombos(4); // 4 seconds (> 3 second timeout)
      
      expect(boxer.getComboCount()).toBe(0);
    });
  });

  describe('Cross-class interactions', () => {
    test('should handle combat between different classes', () => {
      const warrior = new Warrior('warrior1', 'Test Warrior', equipmentManager);
      const archer = new Archer('archer1', 'Test Archer', equipmentManager);
      
      const initialHealth = archer.stats.health;
      const damage = warrior.attack(archer);
      
      expect(damage).toBeGreaterThan(0);
      expect(archer.stats.health).toBe(initialHealth - damage);
      expect(archer.isAlive()).toBe(true);
    });

    test('should handle healing between classes', () => {
      const priest = new Priest('priest1', 'Test Priest', equipmentManager);
      const warrior = new Warrior('warrior1', 'Test Warrior', equipmentManager);
      
      // Damage the warrior first
      warrior.takeDamage(50);
      const healthBeforeHeal = warrior.stats.health;
      
      // Priest heals warrior
      const success = priest.useAbility('priest_heal', warrior);
      
      if (success) {
        expect(warrior.stats.health).toBeGreaterThan(healthBeforeHeal);
      }
    });
  });
});