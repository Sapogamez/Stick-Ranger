// Combat-specific type definitions
// Extends the base types in ./game.ts

import { Entity, StatusEffect, Vector2 } from './game';

export interface CombatStats {
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  criticalChance: number;
  criticalMultiplier: number;
  accuracy: number;
  evasion: number;
}

export interface DamageResult {
  amount: number;
  isCritical: boolean;
  damageType: DamageType;
  source: Entity;
  effects: StatusEffect[];
}

export enum DamageType {
  Physical = 'physical',
  Magical = 'magical',
  Fire = 'fire',
  Ice = 'ice',
  Lightning = 'lightning',
  Poison = 'poison',
  Healing = 'healing'
}

export interface CombatAction {
  id: string;
  type: ActionType;
  executor: Entity;
  target?: Entity | Vector2;
  priority: number;
  castTime: number;
  data?: any;
}

export enum ActionType {
  Attack = 'attack',
  Skill = 'skill',
  Item = 'item',
  Move = 'move',
  Wait = 'wait',
  Defend = 'defend'
}

export interface TurnData {
  entity: Entity;
  initiative: number;
  actionsRemaining: number;
  hasActed: boolean;
}

export enum CombatState {
  Idle = 'idle',
  InCombat = 'in_combat',
  PlayerTurn = 'player_turn',
  EnemyTurn = 'enemy_turn',
  Victory = 'victory',
  Defeat = 'defeat',
  Paused = 'paused'
}

export interface BattleEvent {
  type: BattleEventType;
  timestamp: number;
  data: any;
}

export enum BattleEventType {
  CombatStart = 'combat_start',
  CombatEnd = 'combat_end',
  TurnStart = 'turn_start',
  TurnEnd = 'turn_end',
  ActionExecuted = 'action_executed',
  DamageDealt = 'damage_dealt',
  StatusApplied = 'status_applied',
  StatusRemoved = 'status_removed',
  EntityDefeated = 'entity_defeated'
}

export interface TargetingInfo {
  isValidTarget: boolean;
  inRange: boolean;
  lineOfSight: boolean;
  distance: number;
}

export interface CombatModifiers {
  damageMultiplier: number;
  defenseMultiplier: number;
  speedMultiplier: number;
  criticalBonus: number;
  accuracyBonus: number;
  resistances: Map<DamageType, number>;
}