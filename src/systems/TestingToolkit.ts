export interface TestResult {
  testName: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
}

export interface PerformanceTestResult {
  testName: string;
  metrics: {
    avgFPS: number;
    minFPS: number;
    maxFPS: number;
    avgFrameTime: number;
    memoryUsage: number;
  };
  passed: boolean;
  thresholds: {
    minFPS: number;
    maxFrameTime: number;
    maxMemoryUsage: number;
  };
}

export interface GameStateSnapshot {
  timestamp: number;
  players: any[];
  enemies: any[];
  level: number;
  gameTime: number;
  checksum: string;
}

export class TestingToolkit {
  private static instance: TestingToolkit;
  private testResults: TestResult[] = [];
  private performanceResults: PerformanceTestResult[] = [];
  private gameStateHistory: GameStateSnapshot[] = [];
  private isRecording: boolean = false;

  public static getInstance(): TestingToolkit {
    if (!TestingToolkit.instance) {
      TestingToolkit.instance = new TestingToolkit();
    }
    return TestingToolkit.instance;
  }

  // Basic Testing Framework
  async runTest(testName: string, testFunction: () => Promise<void> | void): Promise<TestResult> {
    const startTime = performance.now();
    
    try {
      await testFunction();
      const duration = performance.now() - startTime;
      
      const result: TestResult = {
        testName,
        passed: true,
        duration
      };
      
      this.testResults.push(result);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      const result: TestResult = {
        testName,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : String(error)
      };
      
      this.testResults.push(result);
      return result;
    }
  }

  async runTestSuite(tests: Array<{ name: string; test: () => Promise<void> | void }>): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    for (const { name, test } of tests) {
      const result = await this.runTest(name, test);
      results.push(result);
    }
    
    return results;
  }

  // Game State Validation
  captureGameState(players: any[], enemies: any[], level: number, gameTime: number): GameStateSnapshot {
    const snapshot: GameStateSnapshot = {
      timestamp: Date.now(),
      players: JSON.parse(JSON.stringify(players)),
      enemies: JSON.parse(JSON.stringify(enemies)),
      level,
      gameTime,
      checksum: this.calculateChecksum({ players, enemies, level, gameTime })
    };

    if (this.isRecording) {
      this.gameStateHistory.push(snapshot);
      
      // Keep only last 100 snapshots to prevent memory issues
      if (this.gameStateHistory.length > 100) {
        this.gameStateHistory = this.gameStateHistory.slice(-100);
      }
    }

    return snapshot;
  }

  validateGameState(expected: Partial<GameStateSnapshot>, actual: GameStateSnapshot): TestResult {
    const testName = `Game State Validation - ${actual.timestamp}`;
    const startTime = performance.now();

    try {
      // Validate players
      if (expected.players) {
        this.assertEqual(expected.players.length, actual.players.length, 'Player count mismatch');
        
        for (let i = 0; i < expected.players.length; i++) {
          const expectedPlayer = expected.players[i];
          const actualPlayer = actual.players[i];
          
          if (expectedPlayer.stats) {
            this.assertPlayerStats(expectedPlayer.stats, actualPlayer.stats);
          }
        }
      }

      // Validate enemies
      if (expected.enemies) {
        this.assertEqual(expected.enemies.length, actual.enemies.length, 'Enemy count mismatch');
      }

      // Validate level
      if (expected.level !== undefined) {
        this.assertEqual(expected.level, actual.level, 'Level mismatch');
      }

      const duration = performance.now() - startTime;
      return {
        testName,
        passed: true,
        duration,
        details: { actual, expected }
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        testName,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : String(error),
        details: { actual, expected }
      };
    }
  }

  // Performance Testing
  async runPerformanceTest(
    testName: string,
    testFunction: () => void,
    thresholds: { minFPS: number; maxFrameTime: number; maxMemoryUsage: number },
    duration: number = 5000
  ): Promise<PerformanceTestResult> {
    const metrics = {
      fps: [] as number[],
      frameTimes: [] as number[],
      memoryUsage: [] as number[]
    };

    let lastTime = performance.now();
    let frameCount = 0;
    const startTime = performance.now();

    const measureFrame = () => {
      const currentTime = performance.now();
      const frameTime = currentTime - lastTime;
      const fps = 1000 / frameTime;

      metrics.fps.push(fps);
      metrics.frameTimes.push(frameTime);
      
      // Measure memory if available
      if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (window.performance as any)) {
        const memoryMB = (window.performance as any).memory.usedJSHeapSize / 1024 / 1024;
        metrics.memoryUsage.push(memoryMB);
      }

      frameCount++;
      lastTime = currentTime;

      // Run test function
      testFunction();

      // Continue if within duration
      if (currentTime - startTime < duration) {
        requestAnimationFrame(measureFrame);
      } else {
        // Finalize results
        this.finalizePerformanceTest(testName, metrics, thresholds);
      }
    };

    // Start performance test
    requestAnimationFrame(measureFrame);

    // Return a promise that resolves when test is complete
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = this.performanceResults[this.performanceResults.length - 1];
        resolve(result);
      }, duration + 100);
    });
  }

  // Automated Game Testing
  async runAutomatedGameTest(scenario: GameTestScenario): Promise<TestResult> {
    const testName = `Automated Game Test: ${scenario.name}`;
    const startTime = performance.now();

    try {
      // Initialize game state
      await this.initializeTestScenario(scenario);

      // Run test steps
      for (const step of scenario.steps) {
        await this.executeTestStep(step);
        
        // Validate state if required
        if (step.validation) {
          const currentState = this.captureGameState([], [], 1, 0); // Would get actual game state
          const validation = this.validateGameState(step.validation, currentState);
          
          if (!validation.passed) {
            throw new Error(`Step validation failed: ${validation.error}`);
          }
        }
      }

      const duration = performance.now() - startTime;
      return {
        testName,
        passed: true,
        duration,
        details: { scenario }
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        testName,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : String(error),
        details: { scenario }
      };
    }
  }

  // Stress Testing
  async runStressTest(config: StressTestConfig): Promise<TestResult> {
    const testName = `Stress Test: ${config.name}`;
    const startTime = performance.now();

    try {
      const results = [];

      for (let i = 0; i < config.iterations; i++) {
        const iterationStart = performance.now();
        
        // Run stress test iteration
        await config.testFunction();
        
        const iterationTime = performance.now() - iterationStart;
        results.push(iterationTime);

        // Check if we're exceeding time limits
        if (iterationTime > config.maxIterationTime) {
          throw new Error(`Iteration ${i} exceeded max time: ${iterationTime}ms > ${config.maxIterationTime}ms`);
        }
      }

      const duration = performance.now() - startTime;
      const avgIterationTime = results.reduce((a, b) => a + b, 0) / results.length;

      return {
        testName,
        passed: true,
        duration,
        details: {
          iterations: config.iterations,
          avgIterationTime,
          maxIterationTime: Math.max(...results),
          minIterationTime: Math.min(...results)
        }
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        testName,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // Reporting and Analysis
  generateTestReport(): {
    summary: {
      totalTests: number;
      passed: number;
      failed: number;
      successRate: number;
      totalDuration: number;
    };
    results: TestResult[];
    performanceResults: PerformanceTestResult[];
  } {
    const totalTests = this.testResults.length;
    const passed = this.testResults.filter(r => r.passed).length;
    const failed = totalTests - passed;
    const successRate = totalTests > 0 ? (passed / totalTests) * 100 : 0;
    const totalDuration = this.testResults.reduce((sum, r) => sum + r.duration, 0);

    return {
      summary: {
        totalTests,
        passed,
        failed,
        successRate: Math.round(successRate * 100) / 100,
        totalDuration: Math.round(totalDuration * 100) / 100
      },
      results: [...this.testResults],
      performanceResults: [...this.performanceResults]
    };
  }

  clearTestResults(): void {
    this.testResults = [];
    this.performanceResults = [];
    this.gameStateHistory = [];
  }

  startRecording(): void {
    this.isRecording = true;
    this.gameStateHistory = [];
  }

  stopRecording(): GameStateSnapshot[] {
    this.isRecording = false;
    return [...this.gameStateHistory];
  }

  exportTestData(): string {
    const data = {
      testResults: this.testResults,
      performanceResults: this.performanceResults,
      gameStateHistory: this.gameStateHistory,
      timestamp: Date.now()
    };
    
    return JSON.stringify(data, null, 2);
  }

  // Private helper methods
  private assertEqual(expected: any, actual: any, message: string): void {
    if (expected !== actual) {
      throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
  }

  private assertPlayerStats(expected: any, actual: any): void {
    const statsToCheck = ['hp', 'atk', 'def', 'spd'];
    
    for (const stat of statsToCheck) {
      if (expected[stat] !== undefined) {
        this.assertEqual(expected[stat], actual[stat], `Player ${stat} mismatch`);
      }
    }
  }

  private calculateChecksum(data: any): string {
    // Simple checksum calculation
    const str = JSON.stringify(data);
    let hash = 0;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString(16);
  }

  private finalizePerformanceTest(
    testName: string,
    metrics: { fps: number[]; frameTimes: number[]; memoryUsage: number[] },
    thresholds: { minFPS: number; maxFrameTime: number; maxMemoryUsage: number }
  ): void {
    const avgFPS = metrics.fps.reduce((a, b) => a + b, 0) / metrics.fps.length;
    const minFPS = Math.min(...metrics.fps);
    const maxFPS = Math.max(...metrics.fps);
    const avgFrameTime = metrics.frameTimes.reduce((a, b) => a + b, 0) / metrics.frameTimes.length;
    const avgMemoryUsage = metrics.memoryUsage.length > 0 
      ? metrics.memoryUsage.reduce((a, b) => a + b, 0) / metrics.memoryUsage.length 
      : 0;

    const passed = avgFPS >= thresholds.minFPS && 
                  avgFrameTime <= thresholds.maxFrameTime && 
                  avgMemoryUsage <= thresholds.maxMemoryUsage;

    const result: PerformanceTestResult = {
      testName,
      metrics: {
        avgFPS: Math.round(avgFPS * 100) / 100,
        minFPS: Math.round(minFPS * 100) / 100,
        maxFPS: Math.round(maxFPS * 100) / 100,
        avgFrameTime: Math.round(avgFrameTime * 100) / 100,
        memoryUsage: Math.round(avgMemoryUsage * 100) / 100
      },
      passed,
      thresholds
    };

    this.performanceResults.push(result);
  }

  private async initializeTestScenario(scenario: GameTestScenario): Promise<void> {
    // Initialize game state according to scenario
    // This would set up players, enemies, level, etc.
  }

  private async executeTestStep(step: TestStep): Promise<void> {
    // Execute a test step (player action, wait, etc.)
    switch (step.type) {
      case 'wait':
        await new Promise(resolve => setTimeout(resolve, step.duration || 1000));
        break;
      case 'click':
        // Simulate click at coordinates
        break;
      case 'keypress':
        // Simulate key press
        break;
      // Add more step types as needed
    }
  }
}

// Interface definitions for test scenarios
export interface GameTestScenario {
  name: string;
  description: string;
  initialState: Partial<GameStateSnapshot>;
  steps: TestStep[];
}

export interface TestStep {
  type: 'wait' | 'click' | 'keypress' | 'validate';
  duration?: number;
  coordinates?: { x: number; y: number };
  key?: string;
  validation?: Partial<GameStateSnapshot>;
}

export interface StressTestConfig {
  name: string;
  iterations: number;
  maxIterationTime: number;
  testFunction: () => Promise<void> | void;
}