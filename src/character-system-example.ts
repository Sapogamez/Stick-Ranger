/**
 * Example usage of the Character System
 * This file demonstrates how to use the character classes and systems
 */

import { Warrior } from './systems/character/classes/Warrior';
import { Archer } from './systems/character/classes/Archer';
import { Mage } from './systems/character/classes/Mage';
import { Priest } from './systems/character/classes/Priest';
import { Boxer } from './systems/character/classes/Boxer';
import { EquipmentManager } from './systems/equipment/Equipment';
import { EquipmentSlot, EquipmentType, EquipmentRarity } from './types/equipment';

// Create equipment manager
const equipmentManager = new EquipmentManager();

// Create characters
const warrior = new Warrior('warrior1', 'Brave Warrior', equipmentManager);
const archer = new Archer('archer1', 'Swift Archer', equipmentManager);
const mage = new Mage('mage1', 'Wise Mage', equipmentManager);
const priest = new Priest('priest1', 'Holy Priest', equipmentManager);
const boxer = new Boxer('boxer1', 'Fast Boxer', equipmentManager);

console.log('=== Character System Demo ===\n');

// Display initial stats
console.log('Initial Character Stats:');
console.log(`Warrior - HP: ${warrior.stats.health}/${warrior.stats.maxHealth}, ATK: ${warrior.stats.attackPower}, DEF: ${warrior.stats.defense}, SPD: ${warrior.stats.speed}`);
console.log(`Archer - HP: ${archer.stats.health}/${archer.stats.maxHealth}, ATK: ${archer.stats.attackPower}, DEF: ${archer.stats.defense}, SPD: ${archer.stats.speed}, CRIT: ${archer.stats.criticalChance}`);
console.log(`Mage - HP: ${mage.stats.health}/${mage.stats.maxHealth}, ATK: ${mage.stats.attackPower}, MANA: ${mage.stats.mana}/${mage.stats.maxMana}`);
console.log(`Priest - HP: ${priest.stats.health}/${priest.stats.maxHealth}, MANA: ${priest.stats.mana}/${priest.stats.maxMana}`);
console.log(`Boxer - HP: ${boxer.stats.health}/${boxer.stats.maxHealth}, ATK: ${boxer.stats.attackPower}, SPD: ${boxer.stats.speed}, Combo: ${boxer.getComboCount()}/${boxer.getMaxCombo()}\n`);

// Create some equipment
const ironSword = EquipmentManager.createEquipment({
  id: 'iron_sword',
  name: 'Iron Sword',
  description: 'A sturdy iron sword',
  type: EquipmentType.SWORD,
  slot: EquipmentSlot.WEAPON,
  rarity: EquipmentRarity.COMMON,
  level: 1,
  requiredLevel: 1,
  stats: { attackPower: 15, criticalChance: 0.02 },
  value: 200
});

const leatherArmor = EquipmentManager.createEquipment({
  id: 'leather_armor',
  name: 'Leather Armor',
  description: 'Basic leather protection',
  type: EquipmentType.LIGHT_ARMOR,
  slot: EquipmentSlot.ARMOR,
  rarity: EquipmentRarity.COMMON,
  level: 1,
  requiredLevel: 1,
  stats: { defense: 8, maxHealth: 25 },
  value: 150
});

// Equip items
console.log('Equipping items...');
equipmentManager.equipItem(warrior.id, ironSword);
equipmentManager.equipItem(warrior.id, leatherArmor);
warrior.updateStats(); // Update stats to include equipment

console.log(`Warrior after equipment - HP: ${warrior.stats.health}/${warrior.stats.maxHealth}, ATK: ${warrior.stats.attackPower}, DEF: ${warrior.stats.defense}\n`);

// Demonstrate combat
console.log('=== Combat Demo ===');
console.log('Warrior attacks Archer:');
const initialArcherHealth = archer.stats.health;
const damage = warrior.attack(archer);
console.log(`Damage dealt: ${damage}, Archer health: ${archer.stats.health}/${archer.stats.maxHealth}\n`);

// Demonstrate healing
console.log('Priest heals Archer:');
const healSuccess = priest.useAbility('priest_heal', archer);
console.log(`Heal success: ${healSuccess}, Archer health: ${archer.stats.health}/${archer.stats.maxHealth}\n`);

// Demonstrate magic
console.log('Mage casts fireball on Warrior:');
const fireballSuccess = mage.useAbility('mage_fireball', warrior);
console.log(`Fireball success: ${fireballSuccess}, Warrior health: ${warrior.stats.health}/${warrior.stats.maxHealth}\n`);

// Demonstrate boxer combos
console.log('=== Boxer Combo Demo ===');
console.log('Boxer builds combo by attacking:');
for (let i = 0; i < 3; i++) {
  boxer.attack(warrior);
  console.log(`Attack ${i + 1}: Combo count = ${boxer.getComboCount()}`);
}

// Use combo finisher
console.log('\nUsing combo finisher:');
const finisherSuccess = boxer.useAbility('boxer_combo_finisher', warrior);
console.log(`Finisher success: ${finisherSuccess}, Combo count after: ${boxer.getComboCount()}\n`);

// Level up demonstration
console.log('=== Level Up Demo ===');
console.log('Leveling up characters...');
const beforeLevel = warrior.progression.level;
const beforeStats = { ...warrior.stats };

warrior.levelUp();

console.log(`Warrior leveled from ${beforeLevel} to ${warrior.progression.level}`);
console.log(`HP: ${beforeStats.maxHealth} → ${warrior.stats.maxHealth}`);
console.log(`ATK: ${beforeStats.attackPower} → ${warrior.stats.attackPower}`);
console.log(`DEF: ${beforeStats.defense} → ${warrior.stats.defense}\n`);

console.log('=== Character System Demo Complete ===');