import { EquipmentManager } from '../systems/equipment/Equipment';
import { Equipment, EquipmentSlot, EquipmentType, EquipmentRarity } from '../types/equipment';

describe('EquipmentManager', () => {
  let equipmentManager: EquipmentManager;
  let testEquipment: Equipment;

  beforeEach(() => {
    equipmentManager = new EquipmentManager();
    testEquipment = EquipmentManager.createEquipment({
      id: 'test_sword',
      name: 'Test Sword',
      description: 'A basic test sword',
      type: EquipmentType.SWORD,
      slot: EquipmentSlot.WEAPON,
      rarity: EquipmentRarity.COMMON,
      level: 1,
      requiredLevel: 1,
      stats: {
        attackPower: 10,
        criticalChance: 0.05
      },
      value: 100
    });
  });

  describe('equipItem', () => {
    test('should equip item successfully', () => {
      const result = equipmentManager.equipItem('char1', testEquipment);
      expect(result).toBe(true);

      const equippedItems = equipmentManager.getEquippedItems('char1');
      expect(equippedItems[EquipmentSlot.WEAPON]).toEqual(testEquipment);
    });

    test('should not equip broken items', () => {
      const brokenEquipment = { ...testEquipment, durability: 0 };
      const result = equipmentManager.equipItem('char1', brokenEquipment);
      expect(result).toBe(false);
    });
  });

  describe('unequipItem', () => {
    test('should unequip item and return it', () => {
      equipmentManager.equipItem('char1', testEquipment);
      const unequippedItem = equipmentManager.unequipItem('char1', EquipmentSlot.WEAPON);
      
      expect(unequippedItem).toEqual(testEquipment);
      
      const equippedItems = equipmentManager.getEquippedItems('char1');
      expect(equippedItems[EquipmentSlot.WEAPON]).toBeUndefined();
    });

    test('should return null when unequipping empty slot', () => {
      const unequippedItem = equipmentManager.unequipItem('char1', EquipmentSlot.WEAPON);
      expect(unequippedItem).toBeNull();
    });
  });

  describe('calculateTotalStats', () => {
    test('should calculate total stats from equipment', () => {
      const armor = EquipmentManager.createEquipment({
        id: 'test_armor',
        name: 'Test Armor',
        description: 'A basic test armor',
        type: EquipmentType.HEAVY_ARMOR,
        slot: EquipmentSlot.ARMOR,
        rarity: EquipmentRarity.COMMON,
        level: 1,
        requiredLevel: 1,
        stats: {
          defense: 8,
          maxHealth: 20
        },
        value: 150
      });

      const equipment = {
        [EquipmentSlot.WEAPON]: testEquipment,
        [EquipmentSlot.ARMOR]: armor
      };

      const totalStats = equipmentManager.calculateTotalStats(equipment);

      expect(totalStats.attackPower).toBe(10);
      expect(totalStats.defense).toBe(8);
      expect(totalStats.maxHealth).toBe(20);
      expect(totalStats.criticalChance).toBe(0.05);
    });

    test('should handle empty equipment', () => {
      const totalStats = equipmentManager.calculateTotalStats({});
      
      expect(totalStats.attackPower).toBe(0);
      expect(totalStats.defense).toBe(0);
    });
  });

  describe('canEquip', () => {
    test('should allow equipping valid items', () => {
      const canEquip = equipmentManager.canEquip('char1', testEquipment);
      expect(canEquip).toBe(true);
    });

    test('should prevent equipping broken items', () => {
      const brokenEquipment = { ...testEquipment, durability: 0 };
      const canEquip = equipmentManager.canEquip('char1', brokenEquipment);
      expect(canEquip).toBe(false);
    });
  });

  describe('createEquipment', () => {
    test('should create equipment with default durability', () => {
      const equipment = EquipmentManager.createEquipment({
        id: 'new_item',
        name: 'New Item',
        description: 'A new item',
        type: EquipmentType.SWORD,
        slot: EquipmentSlot.WEAPON,
        rarity: EquipmentRarity.RARE,
        level: 5,
        requiredLevel: 5,
        stats: { attackPower: 25 },
        value: 500
      });

      expect(equipment.durability).toBe(100);
      expect(equipment.maxDurability).toBe(100);
      expect(equipment.effects).toEqual([]);
    });
  });

  describe('getEquippedItems', () => {
    test('should return copy of equipped items', () => {
      equipmentManager.equipItem('char1', testEquipment);
      const equippedItems = equipmentManager.getEquippedItems('char1');
      
      // Should be a copy, not the original reference
      expect(equippedItems).not.toBe(equipmentManager.getEquippedItems('char1'));
      expect(equippedItems[EquipmentSlot.WEAPON]).toEqual(testEquipment);
    });

    test('should return empty object for new character', () => {
      const equippedItems = equipmentManager.getEquippedItems('new_char');
      expect(equippedItems).toEqual({});
    });
  });
});