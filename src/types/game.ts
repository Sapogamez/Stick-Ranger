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
  maxMana?: number;
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

export type PlayerClass = 'Warrior' | 'Archer' | 'Mage' | 'Priest' | 'Boxer' | 'Gunner' | 'Sniper';
export type EnemyType = 'Goblin' | 'Orc' | 'Dragon' | 'Aggressive' | 'Defensive' | 'Ranged';
export type AIBehavior = 'Aggressive' | 'Defensive' | 'Neutral';

// Enhanced type definitions for advanced systems

// Vector2 utility type
export interface Vector2 {
  x: number;
  y: number;
}

// Rectangle utility type  
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Entity Component System types
export interface Component {
  entity: Entity;
  init(): void;
  update(deltaTime: number): void;
  destroy?(): void;
}

export interface Entity {
  id: string;
  components: Map<string, Component>;
  addComponent<T extends Component>(component: T): T;
  getComponent<T extends Component>(componentType: new(...args: any[]) => T): T | undefined;
  removeComponent<T extends Component>(componentType: new(...args: any[]) => T): void;
  update(deltaTime: number): void;
}

// Enhanced weapon system types
export interface Weapon {
  id: string;
  name: string;
  type: WeaponType;
  stats: WeaponStats;
  properties: WeaponProperties;
  effects: WeaponEffect[];
}

export interface WeaponStats {
  baseDamage: number;
  criticalChance: number;
  criticalMultiplier: number;
  fireRate: number;
  range: number;
  accuracy: number;
  recoil: number;
  magazineSize: number;
  reloadTime: number;
}

export interface WeaponProperties {
  isAutomatic: boolean;
  penetration: number;
  explosive: boolean;
  explosionRadius?: number;
  multiShot?: number;
  spread?: number;
}

export interface WeaponEffect {
  type: 'onHit' | 'onKill' | 'onReload' | 'passive';
  effect: any; // Could be StatusEffect or function
  chance: number;
}

export enum WeaponType {
  AssaultRifle,
  SniperRifle,
  Shotgun,
  Pistol,
  MachineGun,
  RocketLauncher,
  Bow,
  Staff,
  Sword,
  Fist,
  Hammer,
  Mace
}

// Status effect system types
export interface StatusEffect {
  id: string;
  name: string;
  duration: number;
  remainingTime: number;
  stackable: boolean;
  maxStacks: number;
  currentStacks: number;
  
  onApply(target: Entity): void;
  onUpdate(target: Entity, deltaTime: number): void;
  onRemove(target: Entity): void;
  canStack(other: StatusEffect): boolean;
}

// Resource types for abilities
export enum ResourceType {
  Mana,
  Stamina,
  Rage,
  Energy,
  Health
}

export interface Resource {
  type: ResourceType;
  current: number;
  maximum: number;
  regenerationRate: number;
}

// Ability system types
export interface Ability {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  costs: Map<ResourceType, number>;
  castTime: number;
  range: number;
  targets: TargetType;
  effects: AbilityEffect[];
  
  canUse(user: Entity): boolean;
  execute(user: Entity, target?: Entity | Vector2): boolean;
}

export enum TargetType {
  Self,
  Enemy,
  Ally,
  Ground,
  Direction,
  Area
}

export interface AbilityEffect {
  type: 'damage' | 'heal' | 'statusEffect' | 'teleport' | 'summon';
  value: number;
  statusEffect?: StatusEffect;
  duration?: number;
}

// AI Behavior system types
export interface AIBehaviorInterface {
  update(agent: AIAgent, deltaTime: number): void;
  onEnter?(agent: AIAgent): void;
  onExit?(agent: AIAgent): void;
}

export interface AIAgent {
  entity: Entity;
  position: Vector2;
  target: Entity | null;
  blackboard: Map<string, any>;
  currentBehavior: AIBehaviorInterface | null;
}

// Networking types
export enum MessageType {
  STATE_UPDATE = 'STATE_UPDATE',
  PLAYER_ACTION = 'PLAYER_ACTION',
  SPAWN_ENTITY = 'SPAWN_ENTITY',
  DESTROY_ENTITY = 'DESTROY_ENTITY',
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  PLAYER_CONNECT = 'PLAYER_CONNECT',
  PLAYER_DISCONNECT = 'PLAYER_DISCONNECT'
}

export interface NetworkMessage {
  type: MessageType;
  timestamp: number;
  playerId: string;
  data: any;
}

export interface EntityState {
  id: string;
  position: Vector2;
  rotation: number;
  velocity: Vector2;
  health: number;
  animation: string;
  timestamp: number;
}

// Input system types
export interface InputAction {
  name: string;
  keys: string[];
  mouseButtons?: number[];
  gamepadButtons?: number[];
  description: string;
}

export interface InputState {
  pressed: boolean;
  held: boolean;
  released: boolean;
  duration: number;
}

export interface MouseState {
  position: Vector2;
  deltaPosition: Vector2;
  wheel: number;
  buttons: boolean[];
}

export interface GamepadState {
  connected: boolean;
  buttons: boolean[];
  axes: number[];
  vibration: { left: number; right: number; };
}

export interface InputEvent {
  action: string;
  type: 'pressed' | 'held' | 'released';
  timestamp: number;
  modifiers: {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
  };
}
