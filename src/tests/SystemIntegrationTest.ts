import { LevelGenerator } from '../systems/LevelGenerator';
import { CombatSystem } from '../systems/CombatSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { AnalyticsSystem } from '../systems/AnalyticsSystem';
import { ObjectPoolManager } from '../systems/ObjectPoolManager';
import { NetworkProtocol } from '../systems/NetworkProtocol';
import { TestingToolkit } from '../systems/TestingToolkit';
import { Player, Enemy, PlayerClass } from '../types/game';

// Comprehensive system integration test
async function runSystemIntegrationTests() {
  const testingToolkit = TestingToolkit.getInstance();
  console.log('Starting Advanced Game Systems Integration Tests...\n');

  // Test 1: Level Generation System
  await testingToolkit.runTest('Level Generation System', () => {
    const levelGenerator = LevelGenerator.getInstance();
    
    // Test basic level generation
    const level1 = levelGenerator.generateLevel(1);
    console.log('Generated Level 1:', {
      id: level1.id,
      difficulty: level1.difficulty,
      enemyCount: level1.enemyCount,
      terrainType: level1.terrain.type,
      obstacleCount: level1.terrain.obstacles.length,
      spawnPointCount: level1.terrain.spawnPoints.length,
      specialFeatureCount: level1.specialFeatures?.length || 0
    });

    // Test enemy generation
    const enemies = levelGenerator.generateEnemies(level1);
    console.log(`Generated ${enemies.length} enemies for level 1`);

    // Test higher level generation
    const level10 = levelGenerator.generateLevel(10);
    console.log('Generated Level 10 (Boss Level):', {
      id: level10.id,
      difficulty: level10.difficulty,
      enemyCount: level10.enemyCount,
      hasBoss: level10.specialFeatures?.some(f => f.type === 'boss_area') || false
    });

    // Verify level scaling
    if (level10.difficulty <= level1.difficulty) {
      throw new Error('Level difficulty should increase with level number');
    }
    if (level10.enemyCount <= level1.enemyCount) {
      throw new Error('Enemy count should increase with level number');
    }
  });

  // Test 2: Enhanced Combat System
  await testingToolkit.runTest('Enhanced Combat System', () => {
    const combatSystem = new CombatSystem();
    
    // Create test player and enemy
    const testPlayer: Player = {
      id: 1,
      class: 'Warrior' as PlayerClass,
      stats: { hp: 100, maxHp: 100, atk: 20, def: 10, spd: 5, range: 30, mana: 50 },
      position: { x: 100, y: 100 },
      equipment: { weapon: 'sword', armor: 'leather', accessory: 'ring', boots: 'boots' },
      skills: [{ id: 'slash', name: 'Slash', cooldown: 1000, manaCost: 10 }]
    };

    const testEnemy: Enemy = {
      id: 1,
      type: 'Goblin',
      health: 50,
      position: { x: 150, y: 100 },
      ai: 'Aggressive'
    };

    // Test damage calculation
    const damage = combatSystem.calculateDamage(testPlayer, testEnemy);
    console.log('Damage calculation:', damage);

    if (damage.amount <= 0) {
      throw new Error('Damage should be positive');
    }

    // Test combat execution
    const originalHealth = testEnemy.health;
    const result = combatSystem.executeAttack(testPlayer, testEnemy);
    console.log('Combat result:', {
      damageDealt: result.damage.amount,
      wasCritical: result.damage.isCritical,
      statusEffects: result.statusEffects.length,
      remainingHealth: testEnemy.health
    });

    if (testEnemy.health >= originalHealth) {
      throw new Error('Enemy health should decrease after attack');
    }

    // Test AI behavior
    const players = [testPlayer];
    combatSystem.updateEnemyAI(testEnemy, players, 16); // 60 FPS delta
    console.log('Enemy AI updated, new position:', testEnemy.position);
  });

  // Test 3: Save System with Cloud Backup
  await testingToolkit.runTest('Save System with Cloud Backup', async () => {
    const saveSystem = SaveSystem.getInstance();
    
    // Create test save data
    const testPlayers: Player[] = [{
      id: 1,
      class: 'Mage' as PlayerClass,
      stats: { hp: 80, maxHp: 80, atk: 25, def: 5, spd: 6, range: 50, mana: 100 },
      position: { x: 200, y: 200 },
      equipment: { weapon: 'staff', armor: 'robe', accessory: 'amulet', boots: 'sandals' },
      skills: []
    }];

    const gameData = {
      playerData: testPlayers,
      gameState: {
        currentLevel: 5,
        completedLevels: [1, 2, 3, 4],
        totalPlayTime: 12345,
        settings: {
          autoAttackEnabled: true,
          soundEnabled: true,
          musicVolume: 0.8,
          effectsVolume: 0.9,
          graphicsQuality: 'high' as const
        }
      },
      statistics: {
        totalKills: 150,
        totalDamageDealt: 5000,
        totalDamageTaken: 2000,
        levelsCompleted: 4,
        itemsCollected: 25,
        playtimeSeconds: 12345
      }
    };

    // Test save functionality
    const saveSuccess = await saveSystem.saveGame(gameData);
    console.log('Save result:', saveSuccess);

    if (!saveSuccess) {
      throw new Error('Save operation should succeed');
    }

    // Test load functionality
    const loadedData = await saveSystem.loadGame();
    console.log('Loaded save data:', {
      version: loadedData?.version,
      playerCount: loadedData?.playerData.length,
      currentLevel: loadedData?.gameState.currentLevel,
      totalKills: loadedData?.statistics.totalKills
    });

    if (!loadedData) {
      throw new Error('Should be able to load saved data');
    }

    // Test cloud save functionality
    const cloudSaves = await saveSystem.getCloudSaves();
    console.log(`Found ${cloudSaves.length} cloud saves`);

    // Test export/import
    const exportedSave = saveSystem.exportSave();
    if (!exportedSave) {
      throw new Error('Should be able to export save');
    }

    const importSuccess = await saveSystem.importSave(exportedSave);
    console.log('Import result:', importSuccess);

    if (!importSuccess) {
      throw new Error('Should be able to import save');
    }
  });

  // Test 4: Analytics and Metrics Tracking
  await testingToolkit.runTest('Analytics and Metrics Tracking', () => {
    const analytics = AnalyticsSystem.getInstance();
    
    // Test event tracking
    analytics.trackEvent('game_start', { timestamp: Date.now() });
    analytics.trackEvent('level_start', { level: 1 });
    analytics.trackEvent('enemy_kill', { enemyType: 'Goblin', damage: 25 });
    analytics.trackEvent('skill_use', { skillName: 'Fireball', manaCost: 20 });
    analytics.trackEvent('level_complete', { level: 1, time: 120000 });

    // Test performance tracking
    analytics.trackPerformance({
      fps: 60,
      frameTime: 16.67,
      memoryUsage: 45.2,
      renderTime: 8.3,
      updateTime: 4.1
    });

    // Test analytics reporting
    const report = analytics.getSessionReport();
    console.log('Analytics report:', {
      eventCount: report.events.length,
      performanceDataPoints: report.performance.length,
      sessionDuration: report.sessionInfo.duration,
      gameMetrics: {
        enemiesDefeated: report.gameMetrics.enemiesDefeated,
        skillsUsed: report.gameMetrics.skillsUsed
      }
    });

    if (report.events.length < 5) {
      throw new Error('Should have tracked multiple events');
    }

    // Test performance summary
    const perfSummary = analytics.getPerformanceSummary();
    console.log('Performance summary:', perfSummary);

    // Test player insights
    const insights = analytics.getPlayerInsights();
    console.log('Player insights:', insights);
  });

  // Test 5: Object Pooling System
  await testingToolkit.runTest('Object Pooling System', () => {
    const poolManager = ObjectPoolManager.getInstance();
    
    // Test projectile pooling
    const projectiles = [];
    for (let i = 0; i < 10; i++) {
      const projectile = poolManager.getProjectile();
      if (projectile) {
        projectile.initialize(100 + i * 10, 200, 5, 0, 10, 'arrow', 1);
        projectiles.push(projectile);
      }
    }
    
    console.log(`Acquired ${projectiles.length} projectiles from pool`);

    // Test object updates
    poolManager.updateAll(16.67); // One frame update

    // Test releasing objects
    for (const projectile of projectiles) {
      poolManager.releaseProjectile(projectile);
    }

    // Test effect pooling
    const effect = poolManager.getEffect();
    if (effect) {
      effect.initialize(300, 400, 'explosion', 1000);
      console.log('Created effect:', { type: effect.type, duration: effect.duration });
      poolManager.releaseEffect(effect);
    }

    // Test damage number pooling
    const damageNumber = poolManager.getDamageNumber();
    if (damageNumber) {
      damageNumber.initialize(250, 150, 42, true);
      console.log('Created damage number:', { text: damageNumber.text, color: damageNumber.color });
      poolManager.releaseDamageNumber(damageNumber);
    }

    // Test pool statistics
    const stats = poolManager.getPoolStats();
    console.log('Pool statistics:', stats);

    if (stats.projectiles.totalCreated === 0) {
      throw new Error('Should have created projectiles in pool');
    }
  });

  // Test 6: Networking Foundation
  await testingToolkit.runTest('Networking Foundation', async () => {
    const network = NetworkProtocol.getInstance();
    
    // Test room creation
    const roomId = await network.createRoom();
    console.log('Created room:', roomId);

    if (!roomId) {
      throw new Error('Should create a valid room ID');
    }

    // Test connection status
    console.log('Network stats:', network.getNetworkStats());
    console.log('Is host:', network.isHostPlayer());
    console.log('Local player ID:', network.getLocalPlayerId());

    // Test message handling
    let messageReceived = false;
    network.onMessage('game_event', (message) => {
      console.log('Received game event:', message);
      messageReceived = true;
    });

    // Send a test message
    network.sendMessage('game_event', { action: 'test', data: 'hello' });

    // Process messages
    network.processMessages();

    // Test player action synchronization
    network.sendPlayerAction('move', { x: 100, y: 200 });
    network.requestSync();

    console.log('Network connections:', network.getConnectionCount());
    console.log('Latency:', network.getLatency());

    // Note: In a real test environment, we might wait for actual network responses
    // For this test, we're validating the API structure and basic functionality
  });

  // Test 7: Testing Toolkit Itself
  await testingToolkit.runTest('Testing Toolkit Validation', async () => {
    const toolkit = TestingToolkit.getInstance();
    
    // Test basic test execution
    const simpleTest = await toolkit.runTest('Simple Test', () => {
      if (2 + 2 !== 4) {
        throw new Error('Math is broken!');
      }
    });

    console.log('Simple test result:', simpleTest);

    if (!simpleTest.passed) {
      throw new Error('Simple test should pass');
    }

    // Test game state capture and validation
    const mockPlayers = [{
      id: 1,
      class: 'Warrior' as PlayerClass,
      stats: { hp: 100, maxHp: 100, atk: 20, def: 10, spd: 5, range: 30, mana: 50 },
      position: { x: 100, y: 100 },
      equipment: { weapon: 'sword', armor: 'leather', accessory: 'ring', boots: 'boots' },
      skills: []
    }];

    const gameState = toolkit.captureGameState(mockPlayers, [], 1, 1000);
    console.log('Captured game state:', {
      timestamp: gameState.timestamp,
      playerCount: gameState.players.length,
      level: gameState.level,
      checksum: gameState.checksum
    });

    // Test state validation
    const validation = toolkit.validateGameState(
      { level: 1, players: [{ stats: { hp: 100 } }] },
      gameState
    );

    console.log('State validation result:', validation);

    if (!validation.passed) {
      throw new Error('State validation should pass for matching data');
    }

    // Test test suite execution
    const testSuite = [
      { name: 'Test A', test: () => {} },
      { name: 'Test B', test: () => {} },
      { name: 'Test C', test: () => { throw new Error('Intentional failure'); } }
    ];

    const suiteResults = await toolkit.runTestSuite(testSuite);
    console.log('Test suite results:', suiteResults.map(r => ({ name: r.testName, passed: r.passed })));

    if (suiteResults.length !== 3) {
      throw new Error('Should execute all tests in suite');
    }
  });

  // Generate final report
  const report = testingToolkit.generateTestReport();
  console.log('\n=== FINAL TEST REPORT ===');
  console.log('Summary:', report.summary);
  console.log('\nTest Results:');
  
  report.results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const duration = Math.round(result.duration * 100) / 100;
    console.log(`${status} - ${result.testName} (${duration}ms)`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log('\n=== SYSTEMS INTEGRATION COMPLETE ===');
  
  return report;
}

// Run the integration tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runSystemIntegrationTests };
} else {
  // Browser environment
  (window as any).runSystemIntegrationTests = runSystemIntegrationTests;
}

// Auto-run if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runSystemIntegrationTests().catch(console.error);
}