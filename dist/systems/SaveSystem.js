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
exports.SaveSystem = void 0;
class SaveSystem {
    constructor() {
        this.SAVE_VERSION = '1.0.0';
        this.LOCAL_SAVE_KEY = 'stick_ranger_save';
        this.CLOUD_SAVE_KEY = 'stick_ranger_cloud_saves';
        this.MAX_CLOUD_SAVES = 5;
    }
    static getInstance() {
        if (!SaveSystem.instance) {
            SaveSystem.instance = new SaveSystem();
        }
        return SaveSystem.instance;
    }
    saveGame(gameData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const saveData = Object.assign({ version: this.SAVE_VERSION, timestamp: Date.now() }, gameData);
                // Save locally first
                const localSuccess = this.saveLocally(saveData);
                // Attempt cloud backup
                const cloudResult = yield this.saveToCloud(saveData);
                // Return true if either save succeeded
                return localSuccess || cloudResult.success;
            }
            catch (error) {
                console.error('Save failed:', error);
                return false;
            }
        });
    }
    loadGame() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Try to load from local storage first
                let saveData = this.loadLocally();
                // If no local save or cloud save is newer, try cloud
                const cloudSaves = yield this.getCloudSaves();
                if (cloudSaves.length > 0) {
                    const latestCloudSave = cloudSaves[0];
                    if (!saveData || latestCloudSave.timestamp > saveData.timestamp) {
                        saveData = latestCloudSave;
                        // Update local save with cloud data
                        this.saveLocally(saveData);
                    }
                }
                return saveData ? this.migrateSave(saveData) : null;
            }
            catch (error) {
                console.error('Load failed:', error);
                return null;
            }
        });
    }
    getCloudSaves() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cloudSavesJson = localStorage.getItem(this.CLOUD_SAVE_KEY);
                if (!cloudSavesJson)
                    return [];
                const cloudSaves = JSON.parse(cloudSavesJson);
                return cloudSaves
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, this.MAX_CLOUD_SAVES);
            }
            catch (error) {
                console.error('Failed to get cloud saves:', error);
                return [];
            }
        });
    }
    deleteCloudSave(timestamp) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cloudSaves = yield this.getCloudSaves();
                const filteredSaves = cloudSaves.filter(save => save.timestamp !== timestamp);
                localStorage.setItem(this.CLOUD_SAVE_KEY, JSON.stringify(filteredSaves));
                return true;
            }
            catch (error) {
                console.error('Failed to delete cloud save:', error);
                return false;
            }
        });
    }
    exportSave() {
        try {
            const saveData = this.loadLocally();
            if (!saveData)
                return null;
            return btoa(JSON.stringify(saveData));
        }
        catch (error) {
            console.error('Export failed:', error);
            return null;
        }
    }
    importSave(encodedSave) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const saveData = JSON.parse(atob(encodedSave));
                // Validate save structure
                if (!this.validateSave(saveData)) {
                    throw new Error('Invalid save file format');
                }
                // Migrate if needed
                const migratedSave = this.migrateSave(saveData);
                // Save the imported data
                return yield this.saveGame(migratedSave);
            }
            catch (error) {
                console.error('Import failed:', error);
                return false;
            }
        });
    }
    clearAllSaves() {
        try {
            localStorage.removeItem(this.LOCAL_SAVE_KEY);
            localStorage.removeItem(this.CLOUD_SAVE_KEY);
            return true;
        }
        catch (error) {
            console.error('Failed to clear saves:', error);
            return false;
        }
    }
    saveLocally(saveData) {
        try {
            localStorage.setItem(this.LOCAL_SAVE_KEY, JSON.stringify(saveData));
            return true;
        }
        catch (error) {
            console.error('Local save failed:', error);
            return false;
        }
    }
    loadLocally() {
        try {
            const saveJson = localStorage.getItem(this.LOCAL_SAVE_KEY);
            return saveJson ? JSON.parse(saveJson) : null;
        }
        catch (error) {
            console.error('Local load failed:', error);
            return null;
        }
    }
    saveToCloud(saveData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Simulate cloud save with localStorage (in real implementation, this would be an API call)
                const cloudSaves = yield this.getCloudSaves();
                // Add new save and maintain max limit
                cloudSaves.unshift(saveData);
                const limitedSaves = cloudSaves.slice(0, this.MAX_CLOUD_SAVES);
                localStorage.setItem(this.CLOUD_SAVE_KEY, JSON.stringify(limitedSaves));
                return {
                    success: true,
                    saveId: saveData.timestamp.toString()
                };
            }
            catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown cloud save error'
                };
            }
        });
    }
    validateSave(saveData) {
        return (saveData &&
            typeof saveData.version === 'string' &&
            typeof saveData.timestamp === 'number' &&
            Array.isArray(saveData.playerData) &&
            saveData.gameState &&
            typeof saveData.gameState.currentLevel === 'number' &&
            Array.isArray(saveData.gameState.completedLevels) &&
            saveData.statistics &&
            typeof saveData.statistics.totalKills === 'number');
    }
    migrateSave(saveData) {
        // Handle version migrations
        const currentVersion = this.SAVE_VERSION;
        if (saveData.version === currentVersion) {
            return saveData;
        }
        // Example migration from older versions
        let migratedData = Object.assign({}, saveData);
        // Migration logic would go here
        // For example, if upgrading from 0.9.0 to 1.0.0:
        if (saveData.version === '0.9.0') {
            // Add new fields with default values
            migratedData.statistics = Object.assign(Object.assign({}, migratedData.statistics), { playtimeSeconds: migratedData.statistics.playtimeSeconds || 0 });
        }
        // Update version
        migratedData.version = currentVersion;
        migratedData.timestamp = Date.now(); // Update timestamp for migration
        return migratedData;
    }
    // Utility methods for creating default data structures
    createDefaultGameSave(players) {
        return {
            version: this.SAVE_VERSION,
            timestamp: Date.now(),
            playerData: players,
            gameState: {
                currentLevel: 1,
                completedLevels: [],
                totalPlayTime: 0,
                settings: this.createDefaultSettings()
            },
            statistics: this.createDefaultStatistics()
        };
    }
    createDefaultSettings() {
        return {
            autoAttackEnabled: false,
            soundEnabled: true,
            musicVolume: 0.7,
            effectsVolume: 0.8,
            graphicsQuality: 'medium'
        };
    }
    createDefaultStatistics() {
        return {
            totalKills: 0,
            totalDamageDealt: 0,
            totalDamageTaken: 0,
            levelsCompleted: 0,
            itemsCollected: 0,
            playtimeSeconds: 0
        };
    }
}
exports.SaveSystem = SaveSystem;
