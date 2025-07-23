// Type definitions for Stick Ranger

export interface Player {
  id: number;
  class: PlayerClass;
  stats: PlayerStats;
  position: Position;
  equipment: Equipment;
  skills: Skill[];
}

export interface Enemy {
  id: number;
  type: EnemyType;
  health: number;
  position: Position;
  ai: AIBehavior;
}

export interface PlayerStats {
  hp: number;
  maxHp: number; // Added maxHp
  atk: number;
  def: number;
  spd: number;
  range: number;
  mana: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Equipment {
  weapon: string;
  armor: string;
  accessory: string;
  boots: string;
}

export interface Skill {
  id: string;
  name: string;
  cooldown: number;
  manaCost: number;
}

export type PlayerClass = 'Warrior' | 'Archer' | 'Mage' | 'Priest' | 'Boxer';
export type EnemyType = 'Goblin' | 'Orc' | 'Dragon' | 'Aggressive' | 'Defensive' | 'Ranged';
export type AIBehavior = 'Aggressive' | 'Defensive' | 'Neutral';
