"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsSystem = void 0;
class AnalyticsSystem {
    constructor() {
        this.events = [];
        this.performanceData = [];
        this.isEnabled = true;
        this.sessionId = this.generateSessionId();
        this.sessionStartTime = Date.now();
        this.playerBehavior = this.initializePlayerBehavior();
        this.gameMetrics = this.initializeGameMetrics();
        this.startPerformanceMonitoring();
    }
    static getInstance() {
        if (!AnalyticsSystem.instance) {
            AnalyticsSystem.instance = new AnalyticsSystem();
        }
        return AnalyticsSystem.instance;
    }
    setEnabled(enabled) {
        this.isEnabled = enabled;
    }
    trackEvent(type, data = {}) {
        if (!this.isEnabled)
            return;
        const event = {
            type,
            timestamp: Date.now(),
            data: Object.assign({}, data),
            sessionId: this.sessionId
        };
        this.events.push(event);
        this.updateMetrics(event);
        // Keep only last 1000 events to prevent memory issues
        if (this.events.length > 1000) {
            this.events = this.events.slice(-1000);
        }
    }
    trackPerformance(metrics) {
        if (!this.isEnabled)
            return;
        this.performanceData.push(Object.assign(Object.assign({}, metrics), { timestamp: Date.now() }));
        // Alert on performance issues
        if (metrics.fps < 30) {
            this.trackEvent('performance_warning', {
                issue: 'low_fps',
                fps: metrics.fps,
                frameTime: metrics.frameTime
            });
        }
        if (metrics.memoryUsage > 100) { // MB
            this.trackEvent('performance_warning', {
                issue: 'high_memory',
                memoryUsage: metrics.memoryUsage
            });
        }
        // Keep only last 100 performance samples
        if (this.performanceData.length > 100) {
            this.performanceData = this.performanceData.slice(-100);
        }
    }
    getSessionReport() {
        return {
            events: [...this.events],
            performance: [...this.performanceData],
            playerBehavior: Object.assign({}, this.playerBehavior),
            gameMetrics: Object.assign({}, this.gameMetrics),
            sessionInfo: {
                sessionId: this.sessionId,
                duration: Date.now() - this.sessionStartTime,
                startTime: this.sessionStartTime
            }
        };
    }
    exportAnalytics() {
        const report = this.getSessionReport();
        return JSON.stringify(report, null, 2);
    }
    getPerformanceSummary() {
        if (this.performanceData.length === 0) {
            return {
                averageFPS: 0,
                averageFrameTime: 0,
                averageMemoryUsage: 0,
                performanceIssues: 0
            };
        }
        const avgFPS = this.performanceData.reduce((sum, p) => sum + p.fps, 0) / this.performanceData.length;
        const avgFrameTime = this.performanceData.reduce((sum, p) => sum + p.frameTime, 0) / this.performanceData.length;
        const avgMemory = this.performanceData.reduce((sum, p) => sum + p.memoryUsage, 0) / this.performanceData.length;
        const performanceIssues = this.events.filter(e => e.type === 'performance_warning').length;
        return {
            averageFPS: Math.round(avgFPS * 100) / 100,
            averageFrameTime: Math.round(avgFrameTime * 100) / 100,
            averageMemoryUsage: Math.round(avgMemory * 100) / 100,
            performanceIssues
        };
    }
    getPlayerInsights() {
        const events = this.events;
        // Calculate most active hour
        const hourCounts = new Array(24).fill(0);
        events.forEach(event => {
            const hour = new Date(event.timestamp).getHours();
            hourCounts[hour]++;
        });
        const mostActiveHour = hourCounts.indexOf(Math.max(...hourCounts));
        // Calculate skill efficiency (skills used vs enemies killed)
        const skillsUsed = events.filter(e => e.type === 'skill_use').length;
        const enemiesKilled = events.filter(e => e.type === 'enemy_kill').length;
        const skillEfficiency = enemiesKilled > 0 ? skillsUsed / enemiesKilled : 0;
        // Calculate progression rate (levels completed per hour)
        const sessionHours = (Date.now() - this.sessionStartTime) / (1000 * 60 * 60);
        const progressionRate = sessionHours > 0 ? this.gameMetrics.levelsPlayed / sessionHours : 0;
        return {
            mostActiveHour,
            preferredDifficulty: 'normal', // Could be calculated based on level selection patterns
            skillEfficiency: Math.round(skillEfficiency * 100) / 100,
            progressionRate: Math.round(progressionRate * 100) / 100
        };
    }
    clearData() {
        this.events = [];
        this.performanceData = [];
        this.playerBehavior = this.initializePlayerBehavior();
        this.gameMetrics = this.initializeGameMetrics();
        this.sessionId = this.generateSessionId();
        this.sessionStartTime = Date.now();
    }
    updateMetrics(event) {
        switch (event.type) {
            case 'level_complete':
                this.gameMetrics.levelsPlayed++;
                break;
            case 'enemy_kill':
                this.gameMetrics.enemiesDefeated++;
                if (event.data.damage) {
                    this.gameMetrics.damageDealt += event.data.damage;
                }
                break;
            case 'skill_use':
                this.gameMetrics.skillsUsed++;
                const skillName = event.data.skillName;
                if (skillName) {
                    this.playerBehavior.skillUsageFrequency[skillName] =
                        (this.playerBehavior.skillUsageFrequency[skillName] || 0) + 1;
                }
                break;
            case 'item_collect':
                this.gameMetrics.itemsCollected++;
                break;
            case 'user_action':
                // Update actions per minute
                const sessionMinutes = (Date.now() - this.sessionStartTime) / 60000;
                const totalActions = this.events.filter(e => e.type === 'user_action').length;
                this.playerBehavior.actionsPerMinute = sessionMinutes > 0 ? totalActions / sessionMinutes : 0;
                break;
        }
        // Update session duration
        this.gameMetrics.sessionDuration = Date.now() - this.sessionStartTime;
    }
    startPerformanceMonitoring() {
        if (typeof window === 'undefined')
            return; // Node.js environment
        // Monitor FPS and frame time
        let lastTime = performance.now();
        let frameCount = 0;
        let lastFPSUpdate = lastTime;
        const monitorFrame = (currentTime) => {
            frameCount++;
            const deltaTime = currentTime - lastTime;
            if (currentTime - lastFPSUpdate >= 1000) {
                const fps = Math.round(frameCount * 1000 / (currentTime - lastFPSUpdate));
                this.trackPerformance({
                    fps,
                    frameTime: deltaTime,
                    memoryUsage: this.getMemoryUsage(),
                    renderTime: 0, // Would be set by render system
                    updateTime: 0 // Would be set by update system
                });
                frameCount = 0;
                lastFPSUpdate = currentTime;
            }
            lastTime = currentTime;
            requestAnimationFrame(monitorFrame);
        };
        requestAnimationFrame(monitorFrame);
    }
    getMemoryUsage() {
        if (typeof window !== 'undefined' && 'performance' in window && 'memory' in window.performance) {
            return window.performance.memory.usedJSHeapSize / 1024 / 1024; // MB
        }
        return 0;
    }
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    initializePlayerBehavior() {
        return {
            actionsPerMinute: 0,
            averageReactionTime: 0,
            preferredStrategies: [],
            skillUsageFrequency: {},
            mostUsedFeatures: []
        };
    }
    initializeGameMetrics() {
        return {
            sessionDuration: 0,
            levelsPlayed: 0,
            enemiesDefeated: 0,
            damageDealt: 0,
            damageTaken: 0,
            skillsUsed: 0,
            itemsCollected: 0
        };
    }
}
exports.AnalyticsSystem = AnalyticsSystem;
