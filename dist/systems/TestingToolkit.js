"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestingToolkit = void 0;
class TestingToolkit {
    constructor() {
        this.testResults = [];
        this.performanceResults = [];
        this.gameStateHistory = [];
        this.isRecording = false;
    }
    static getInstance() {
        if (!TestingToolkit.instance) {
            TestingToolkit.instance = new TestingToolkit();
        }
        return TestingToolkit.instance;
    }
    // Basic Testing Framework
    runTest(testName, testFunction) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = performance.now();
            try {
                yield testFunction();
                const duration = performance.now() - startTime;
                const result = {
                    testName,
                    passed: true,
                    duration
                };
                this.testResults.push(result);
                return result;
            }
            catch (error) {
                const duration = performance.now() - startTime;
                const result = {
                    testName,
                    passed: false,
                    duration,
                    error: error instanceof Error ? error.message : String(error)
                };
                this.testResults.push(result);
                return result;
            }
        });
    }
    runTestSuite(tests) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            for (const { name, test } of tests) {
                const result = yield this.runTest(name, test);
                results.push(result);
            }
            return results;
        });
    }
    // Game State Validation
    captureGameState(players, enemies, level, gameTime) {
        const snapshot = {
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
    validateGameState(expected, actual) {
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
        }
        catch (error) {
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
    runPerformanceTest(testName_1, testFunction_1, thresholds_1) {
        return __awaiter(this, arguments, void 0, function* (testName, testFunction, thresholds, duration = 5000) {
            const metrics = {
                fps: [],
                frameTimes: [],
                memoryUsage: []
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
                if (typeof window !== 'undefined' && 'performance' in window && 'memory' in window.performance) {
                    const memoryMB = window.performance.memory.usedJSHeapSize / 1024 / 1024;
                    metrics.memoryUsage.push(memoryMB);
                }
                frameCount++;
                lastTime = currentTime;
                // Run test function
                testFunction();
                // Continue if within duration
                if (currentTime - startTime < duration) {
                    requestAnimationFrame(measureFrame);
                }
                else {
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
        });
    }
    // Automated Game Testing
    runAutomatedGameTest(scenario) {
        return __awaiter(this, void 0, void 0, function* () {
            const testName = `Automated Game Test: ${scenario.name}`;
            const startTime = performance.now();
            try {
                // Initialize game state
                yield this.initializeTestScenario(scenario);
                // Run test steps
                for (const step of scenario.steps) {
                    yield this.executeTestStep(step);
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
            }
            catch (error) {
                const duration = performance.now() - startTime;
                return {
                    testName,
                    passed: false,
                    duration,
                    error: error instanceof Error ? error.message : String(error),
                    details: { scenario }
                };
            }
        });
    }
    // Stress Testing
    runStressTest(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const testName = `Stress Test: ${config.name}`;
            const startTime = performance.now();
            try {
                const results = [];
                for (let i = 0; i < config.iterations; i++) {
                    const iterationStart = performance.now();
                    // Run stress test iteration
                    yield config.testFunction();
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
            }
            catch (error) {
                const duration = performance.now() - startTime;
                return {
                    testName,
                    passed: false,
                    duration,
                    error: error instanceof Error ? error.message : String(error)
                };
            }
        });
    }
    // Reporting and Analysis
    generateTestReport() {
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
    clearTestResults() {
        this.testResults = [];
        this.performanceResults = [];
        this.gameStateHistory = [];
    }
    startRecording() {
        this.isRecording = true;
        this.gameStateHistory = [];
    }
    stopRecording() {
        this.isRecording = false;
        return [...this.gameStateHistory];
    }
    exportTestData() {
        const data = {
            testResults: this.testResults,
            performanceResults: this.performanceResults,
            gameStateHistory: this.gameStateHistory,
            timestamp: Date.now()
        };
        return JSON.stringify(data, null, 2);
    }
    // Private helper methods
    assertEqual(expected, actual, message) {
        if (expected !== actual) {
            throw new Error(`${message}: expected ${expected}, got ${actual}`);
        }
    }
    assertPlayerStats(expected, actual) {
        const statsToCheck = ['hp', 'atk', 'def', 'spd'];
        for (const stat of statsToCheck) {
            if (expected[stat] !== undefined) {
                this.assertEqual(expected[stat], actual[stat], `Player ${stat} mismatch`);
            }
        }
    }
    calculateChecksum(data) {
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
    finalizePerformanceTest(testName, metrics, thresholds) {
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
        const result = {
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
    initializeTestScenario(scenario) {
        return __awaiter(this, void 0, void 0, function* () {
            // Initialize game state according to scenario
            // This would set up players, enemies, level, etc.
        });
    }
    executeTestStep(step) {
        return __awaiter(this, void 0, void 0, function* () {
            // Execute a test step (player action, wait, etc.)
            switch (step.type) {
                case 'wait':
                    yield new Promise(resolve => setTimeout(resolve, step.duration || 1000));
                    break;
                case 'click':
                    // Simulate click at coordinates
                    break;
                case 'keypress':
                    // Simulate key press
                    break;
                // Add more step types as needed
            }
        });
    }
}
exports.TestingToolkit = TestingToolkit;
