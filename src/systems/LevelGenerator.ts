import { Enemy, Position, EnemyType, AIBehavior } from '../types/game';

export interface LevelConfig {
  id: number;
  difficulty: number;
  enemyCount: number;
  terrain: TerrainType;
  specialFeatures?: SpecialFeature[];
}

export interface TerrainType {
  type: 'grassland' | 'forest' | 'dungeon' | 'mountain' | 'desert';
  obstacles: Position[];
  spawnPoints: Position[];
}

export interface SpecialFeature {
  type: 'treasure' | 'trap' | 'portal' | 'boss_area';
  position: Position;
  properties: Record<string, any>;
}

export class LevelGenerator {
  private static instance: LevelGenerator;
  private readonly mapWidth = 800;
  private readonly mapHeight = 600;

  public static getInstance(): LevelGenerator {
    if (!LevelGenerator.instance) {
      LevelGenerator.instance = new LevelGenerator();
    }
    return LevelGenerator.instance;
  }

  generateLevel(levelNumber: number): LevelConfig {
    const difficulty = this.calculateDifficulty(levelNumber);
    const enemyCount = this.calculateEnemyCount(levelNumber, difficulty);
    const terrain = this.generateTerrain(levelNumber);
    const specialFeatures = this.generateSpecialFeatures(levelNumber, difficulty);

    return {
      id: levelNumber,
      difficulty,
      enemyCount,
      terrain,
      specialFeatures
    };
  }

  generateEnemies(config: LevelConfig): Enemy[] {
    const enemies: Enemy[] = [];
    const { enemyCount, difficulty, terrain } = config;

    for (let i = 0; i < enemyCount; i++) {
      const enemy = this.createEnemy(i, difficulty, terrain.spawnPoints);
      enemies.push(enemy);
    }

    return enemies;
  }

  private calculateDifficulty(levelNumber: number): number {
    // Exponential difficulty scaling with some randomness
    const baseDifficulty = Math.floor(levelNumber / 5) + 1;
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2 multiplier
    return Math.max(1, Math.floor(baseDifficulty * randomFactor));
  }

  private calculateEnemyCount(levelNumber: number, difficulty: number): number {
    const baseCount = 3 + Math.floor(levelNumber / 3);
    const difficultyMultiplier = 1 + (difficulty - 1) * 0.3;
    return Math.min(12, Math.floor(baseCount * difficultyMultiplier));
  }

  private generateTerrain(levelNumber: number): TerrainType {
    const terrainTypes = ['grassland', 'forest', 'dungeon', 'mountain', 'desert'] as const;
    const terrainIndex = Math.floor((levelNumber - 1) / 10) % terrainTypes.length;
    const terrainType = terrainTypes[terrainIndex];

    const obstacles = this.generateObstacles(terrainType);
    const spawnPoints = this.generateSpawnPoints(obstacles);

    return {
      type: terrainType,
      obstacles,
      spawnPoints
    };
  }

  private generateObstacles(terrainType: string): Position[] {
    const obstacles: Position[] = [];
    const obstacleCount = 3 + Math.floor(Math.random() * 5);

    for (let i = 0; i < obstacleCount; i++) {
      const position: Position = {
        x: 100 + Math.random() * (this.mapWidth - 200),
        y: 100 + Math.random() * (this.mapHeight - 200)
      };

      // Ensure obstacles don't overlap
      const minDistance = 80;
      const tooClose = obstacles.some(obs => 
        Math.sqrt((obs.x - position.x) ** 2 + (obs.y - position.y) ** 2) < minDistance
      );

      if (!tooClose) {
        obstacles.push(position);
      }
    }

    return obstacles;
  }

  private generateSpawnPoints(obstacles: Position[]): Position[] {
    const spawnPoints: Position[] = [];
    const maxAttempts = 50;

    for (let i = 0; i < 8; i++) {
      let attempts = 0;
      let validPosition = false;

      while (!validPosition && attempts < maxAttempts) {
        const position: Position = {
          x: 50 + Math.random() * (this.mapWidth - 100),
          y: 50 + Math.random() * (this.mapHeight - 100)
        };

        // Check distance from obstacles and other spawn points
        const minDistanceFromObstacles = 60;
        const minDistanceFromSpawns = 100;

        const tooCloseToObstacle = obstacles.some(obs =>
          Math.sqrt((obs.x - position.x) ** 2 + (obs.y - position.y) ** 2) < minDistanceFromObstacles
        );

        const tooCloseToSpawn = spawnPoints.some(spawn =>
          Math.sqrt((spawn.x - position.x) ** 2 + (spawn.y - position.y) ** 2) < minDistanceFromSpawns
        );

        if (!tooCloseToObstacle && !tooCloseToSpawn) {
          spawnPoints.push(position);
          validPosition = true;
        }

        attempts++;
      }
    }

    return spawnPoints;
  }

  private generateSpecialFeatures(levelNumber: number, difficulty: number): SpecialFeature[] {
    const features: SpecialFeature[] = [];

    // Boss area every 10 levels
    if (levelNumber % 10 === 0) {
      features.push({
        type: 'boss_area',
        position: { x: this.mapWidth - 100, y: this.mapHeight / 2 },
        properties: { bossType: this.getBossType(levelNumber) }
      });
    }

    // Treasure based on difficulty
    if (Math.random() < 0.3 + difficulty * 0.1) {
      features.push({
        type: 'treasure',
        position: {
          x: 100 + Math.random() * (this.mapWidth - 200),
          y: 100 + Math.random() * (this.mapHeight - 200)
        },
        properties: { 
          lootQuality: difficulty,
          goldValue: 50 * difficulty + Math.random() * 100
        }
      });
    }

    return features;
  }

  private createEnemy(id: number, difficulty: number, spawnPoints: Position[]): Enemy {
    const enemyTypes: EnemyType[] = ['Goblin', 'Orc', 'Dragon', 'Aggressive', 'Defensive', 'Ranged'];
    const aiBehaviors: AIBehavior[] = ['Aggressive', 'Defensive', 'Neutral'];

    // Select enemy type based on difficulty
    let enemyType: EnemyType;
    if (difficulty <= 2) {
      enemyType = enemyTypes[Math.floor(Math.random() * 2)]; // Goblin or Orc
    } else if (difficulty <= 4) {
      enemyType = enemyTypes[Math.floor(Math.random() * 4)]; // Goblin to Aggressive
    } else {
      enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)]; // Any type
    }

    const spawnPoint = spawnPoints[id % spawnPoints.length] || { x: 400, y: 300 };
    const baseHealth = this.getBaseHealth(enemyType);
    const scaledHealth = Math.floor(baseHealth * (1 + difficulty * 0.3));

    return {
      id,
      type: enemyType,
      health: scaledHealth,
      position: { ...spawnPoint },
      ai: aiBehaviors[Math.floor(Math.random() * aiBehaviors.length)]
    };
  }

  private getBaseHealth(enemyType: EnemyType): number {
    const healthMap: Record<EnemyType, number> = {
      'Goblin': 50,
      'Orc': 80,
      'Dragon': 200,
      'Aggressive': 60,
      'Defensive': 120,
      'Ranged': 40
    };
    return healthMap[enemyType] || 50;
  }

  private getBossType(levelNumber: number): string {
    const bossTypes = ['Giant Goblin', 'Orc Warlord', 'Ancient Dragon', 'Shadow Lord'];
    return bossTypes[Math.floor((levelNumber - 1) / 10) % bossTypes.length];
  }
}