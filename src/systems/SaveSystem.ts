import { Player } from '../types/game';

export interface GameSave {
  version: string;
  timestamp: number;
  playerData: Player[];
  gameState: {
    currentLevel: number;
    completedLevels: number[];
    totalPlayTime: number;
    settings: GameSettings;
  };
  statistics: PlayerStatistics;
}

export interface GameSettings {
  autoAttackEnabled: boolean;
  soundEnabled: boolean;
  musicVolume: number;
  effectsVolume: number;
  graphicsQuality: 'low' | 'medium' | 'high';
}

export interface PlayerStatistics {
  totalKills: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  levelsCompleted: number;
  itemsCollected: number;
  playtimeSeconds: number;
}

export interface CloudSaveResult {
  success: boolean;
  error?: string;
  saveId?: string;
}

export class SaveSystem {
  private static instance: SaveSystem;
  private readonly SAVE_VERSION = '1.0.0';
  private readonly LOCAL_SAVE_KEY = 'stick_ranger_save';
  private readonly CLOUD_SAVE_KEY = 'stick_ranger_cloud_saves';
  private readonly MAX_CLOUD_SAVES = 5;

  public static getInstance(): SaveSystem {
    if (!SaveSystem.instance) {
      SaveSystem.instance = new SaveSystem();
    }
    return SaveSystem.instance;
  }

  async saveGame(gameData: Omit<GameSave, 'version' | 'timestamp'>): Promise<boolean> {
    try {
      const saveData: GameSave = {
        version: this.SAVE_VERSION,
        timestamp: Date.now(),
        ...gameData
      };

      // Save locally first
      const localSuccess = this.saveLocally(saveData);
      
      // Attempt cloud backup
      const cloudResult = await this.saveToCloud(saveData);
      
      // Return true if either save succeeded
      return localSuccess || cloudResult.success;
    } catch (error) {
      console.error('Save failed:', error);
      return false;
    }
  }

  async loadGame(): Promise<GameSave | null> {
    try {
      // Try to load from local storage first
      let saveData = this.loadLocally();
      
      // If no local save or cloud save is newer, try cloud
      const cloudSaves = await this.getCloudSaves();
      if (cloudSaves.length > 0) {
        const latestCloudSave = cloudSaves[0];
        if (!saveData || latestCloudSave.timestamp > saveData.timestamp) {
          saveData = latestCloudSave;
          // Update local save with cloud data
          this.saveLocally(saveData);
        }
      }

      return saveData ? this.migrateSave(saveData) : null;
    } catch (error) {
      console.error('Load failed:', error);
      return null;
    }
  }

  async getCloudSaves(): Promise<GameSave[]> {
    try {
      const cloudSavesJson = localStorage.getItem(this.CLOUD_SAVE_KEY);
      if (!cloudSavesJson) return [];
      
      const cloudSaves: GameSave[] = JSON.parse(cloudSavesJson);
      return cloudSaves
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, this.MAX_CLOUD_SAVES);
    } catch (error) {
      console.error('Failed to get cloud saves:', error);
      return [];
    }
  }

  async deleteCloudSave(timestamp: number): Promise<boolean> {
    try {
      const cloudSaves = await this.getCloudSaves();
      const filteredSaves = cloudSaves.filter(save => save.timestamp !== timestamp);
      
      localStorage.setItem(this.CLOUD_SAVE_KEY, JSON.stringify(filteredSaves));
      return true;
    } catch (error) {
      console.error('Failed to delete cloud save:', error);
      return false;
    }
  }

  exportSave(): string | null {
    try {
      const saveData = this.loadLocally();
      if (!saveData) return null;
      
      return btoa(JSON.stringify(saveData));
    } catch (error) {
      console.error('Export failed:', error);
      return null;
    }
  }

  async importSave(encodedSave: string): Promise<boolean> {
    try {
      const saveData: GameSave = JSON.parse(atob(encodedSave));
      
      // Validate save structure
      if (!this.validateSave(saveData)) {
        throw new Error('Invalid save file format');
      }
      
      // Migrate if needed
      const migratedSave = this.migrateSave(saveData);
      
      // Save the imported data
      return await this.saveGame(migratedSave);
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }

  clearAllSaves(): boolean {
    try {
      localStorage.removeItem(this.LOCAL_SAVE_KEY);
      localStorage.removeItem(this.CLOUD_SAVE_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear saves:', error);
      return false;
    }
  }

  private saveLocally(saveData: GameSave): boolean {
    try {
      localStorage.setItem(this.LOCAL_SAVE_KEY, JSON.stringify(saveData));
      return true;
    } catch (error) {
      console.error('Local save failed:', error);
      return false;
    }
  }

  private loadLocally(): GameSave | null {
    try {
      const saveJson = localStorage.getItem(this.LOCAL_SAVE_KEY);
      return saveJson ? JSON.parse(saveJson) : null;
    } catch (error) {
      console.error('Local load failed:', error);
      return null;
    }
  }

  private async saveToCloud(saveData: GameSave): Promise<CloudSaveResult> {
    try {
      // Simulate cloud save with localStorage (in real implementation, this would be an API call)
      const cloudSaves = await this.getCloudSaves();
      
      // Add new save and maintain max limit
      cloudSaves.unshift(saveData);
      const limitedSaves = cloudSaves.slice(0, this.MAX_CLOUD_SAVES);
      
      localStorage.setItem(this.CLOUD_SAVE_KEY, JSON.stringify(limitedSaves));
      
      return {
        success: true,
        saveId: saveData.timestamp.toString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown cloud save error'
      };
    }
  }

  private validateSave(saveData: any): saveData is GameSave {
    return (
      saveData &&
      typeof saveData.version === 'string' &&
      typeof saveData.timestamp === 'number' &&
      Array.isArray(saveData.playerData) &&
      saveData.gameState &&
      typeof saveData.gameState.currentLevel === 'number' &&
      Array.isArray(saveData.gameState.completedLevels) &&
      saveData.statistics &&
      typeof saveData.statistics.totalKills === 'number'
    );
  }

  private migrateSave(saveData: GameSave): GameSave {
    // Handle version migrations
    const currentVersion = this.SAVE_VERSION;
    
    if (saveData.version === currentVersion) {
      return saveData;
    }

    // Example migration from older versions
    let migratedData = { ...saveData };

    // Migration logic would go here
    // For example, if upgrading from 0.9.0 to 1.0.0:
    if (saveData.version === '0.9.0') {
      // Add new fields with default values
      migratedData.statistics = {
        ...migratedData.statistics,
        playtimeSeconds: migratedData.statistics.playtimeSeconds || 0
      };
    }

    // Update version
    migratedData.version = currentVersion;
    migratedData.timestamp = Date.now(); // Update timestamp for migration

    return migratedData;
  }

  // Utility methods for creating default data structures
  createDefaultGameSave(players: Player[]): GameSave {
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

  private createDefaultSettings(): GameSettings {
    return {
      autoAttackEnabled: false,
      soundEnabled: true,
      musicVolume: 0.7,
      effectsVolume: 0.8,
      graphicsQuality: 'medium'
    };
  }

  private createDefaultStatistics(): PlayerStatistics {
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