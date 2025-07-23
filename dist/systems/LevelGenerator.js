"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LevelGenerator = void 0;
class LevelGenerator {
    constructor() {
        this.mapWidth = 800;
        this.mapHeight = 600;
    }
    static getInstance() {
        if (!LevelGenerator.instance) {
            LevelGenerator.instance = new LevelGenerator();
        }
        return LevelGenerator.instance;
    }
    generateLevel(levelNumber) {
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
    generateEnemies(config) {
        const enemies = [];
        const { enemyCount, difficulty, terrain } = config;
        for (let i = 0; i < enemyCount; i++) {
            const enemy = this.createEnemy(i, difficulty, terrain.spawnPoints);
            enemies.push(enemy);
        }
        return enemies;
    }
    calculateDifficulty(levelNumber) {
        // Exponential difficulty scaling with some randomness
        const baseDifficulty = Math.floor(levelNumber / 5) + 1;
        const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2 multiplier
        return Math.max(1, Math.floor(baseDifficulty * randomFactor));
    }
    calculateEnemyCount(levelNumber, difficulty) {
        const baseCount = 3 + Math.floor(levelNumber / 3);
        const difficultyMultiplier = 1 + (difficulty - 1) * 0.3;
        return Math.min(12, Math.floor(baseCount * difficultyMultiplier));
    }
    generateTerrain(levelNumber) {
        const terrainTypes = ['grassland', 'forest', 'dungeon', 'mountain', 'desert'];
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
    generateObstacles(terrainType) {
        const obstacles = [];
        const obstacleCount = 3 + Math.floor(Math.random() * 5);
        for (let i = 0; i < obstacleCount; i++) {
            const position = {
                x: 100 + Math.random() * (this.mapWidth - 200),
                y: 100 + Math.random() * (this.mapHeight - 200)
            };
            // Ensure obstacles don't overlap
            const minDistance = 80;
            const tooClose = obstacles.some(obs => Math.sqrt(Math.pow((obs.x - position.x), 2) + Math.pow((obs.y - position.y), 2)) < minDistance);
            if (!tooClose) {
                obstacles.push(position);
            }
        }
        return obstacles;
    }
    generateSpawnPoints(obstacles) {
        const spawnPoints = [];
        const maxAttempts = 50;
        for (let i = 0; i < 8; i++) {
            let attempts = 0;
            let validPosition = false;
            while (!validPosition && attempts < maxAttempts) {
                const position = {
                    x: 50 + Math.random() * (this.mapWidth - 100),
                    y: 50 + Math.random() * (this.mapHeight - 100)
                };
                // Check distance from obstacles and other spawn points
                const minDistanceFromObstacles = 60;
                const minDistanceFromSpawns = 100;
                const tooCloseToObstacle = obstacles.some(obs => Math.sqrt(Math.pow((obs.x - position.x), 2) + Math.pow((obs.y - position.y), 2)) < minDistanceFromObstacles);
                const tooCloseToSpawn = spawnPoints.some(spawn => Math.sqrt(Math.pow((spawn.x - position.x), 2) + Math.pow((spawn.y - position.y), 2)) < minDistanceFromSpawns);
                if (!tooCloseToObstacle && !tooCloseToSpawn) {
                    spawnPoints.push(position);
                    validPosition = true;
                }
                attempts++;
            }
        }
        return spawnPoints;
    }
    generateSpecialFeatures(levelNumber, difficulty) {
        const features = [];
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
    createEnemy(id, difficulty, spawnPoints) {
        const enemyTypes = ['Goblin', 'Orc', 'Dragon', 'Aggressive', 'Defensive', 'Ranged'];
        const aiBehaviors = ['Aggressive', 'Defensive', 'Neutral'];
        // Select enemy type based on difficulty
        let enemyType;
        if (difficulty <= 2) {
            enemyType = enemyTypes[Math.floor(Math.random() * 2)]; // Goblin or Orc
        }
        else if (difficulty <= 4) {
            enemyType = enemyTypes[Math.floor(Math.random() * 4)]; // Goblin to Aggressive
        }
        else {
            enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)]; // Any type
        }
        const spawnPoint = spawnPoints[id % spawnPoints.length] || { x: 400, y: 300 };
        const baseHealth = this.getBaseHealth(enemyType);
        const scaledHealth = Math.floor(baseHealth * (1 + difficulty * 0.3));
        return {
            id,
            type: enemyType,
            health: scaledHealth,
            position: Object.assign({}, spawnPoint),
            ai: aiBehaviors[Math.floor(Math.random() * aiBehaviors.length)]
        };
    }
    getBaseHealth(enemyType) {
        const healthMap = {
            'Goblin': 50,
            'Orc': 80,
            'Dragon': 200,
            'Aggressive': 60,
            'Defensive': 120,
            'Ranged': 40
        };
        return healthMap[enemyType] || 50;
    }
    getBossType(levelNumber) {
        const bossTypes = ['Giant Goblin', 'Orc Warlord', 'Ancient Dragon', 'Shadow Lord'];
        return bossTypes[Math.floor((levelNumber - 1) / 10) % bossTypes.length];
    }
}
exports.LevelGenerator = LevelGenerator;
