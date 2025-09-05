// Storage Management for Block History Extension
console.log('Storage module loaded');

class StorageManager {
  constructor() {
    this.defaultSettings = {
      isEnabled: false,
      keywords: [],
      lastUpdated: Date.now(),
      version: '1.0.0'
    };
  }

  // Get settings from storage
  async getSettings() {
    try {
      const result = await chrome.storage.sync.get(['settings']);
      return result.settings || this.defaultSettings;
    } catch (error) {
      console.error('Error getting settings:', error);
      return this.defaultSettings;
    }
  }

  // Save settings to storage
  async saveSettings(settings) {
    try {
      const settingsToSave = {
        ...settings,
        lastUpdated: Date.now()
      };
      
      await chrome.storage.sync.set({ settings: settingsToSave });
      console.log('Settings saved:', settingsToSave);
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  // Update specific setting
  async updateSetting(key, value) {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = {
        ...currentSettings,
        [key]: value,
        lastUpdated: Date.now()
      };
      
      await this.saveSettings(updatedSettings);
      return updatedSettings;
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  }

  // Add keyword to settings
  async addKeyword(keyword) {
    try {
      const currentSettings = await this.getSettings();
      
      if (!currentSettings.keywords) {
        currentSettings.keywords = [];
      }
      
      if (currentSettings.keywords.includes(keyword)) {
        throw new Error('Keyword already exists');
      }
      
      currentSettings.keywords.push(keyword);
      await this.saveSettings(currentSettings);
      
      return currentSettings;
    } catch (error) {
      console.error('Error adding keyword:', error);
      throw error;
    }
  }

  // Remove keyword from settings
  async removeKeyword(keyword) {
    try {
      const currentSettings = await this.getSettings();
      
      if (!currentSettings.keywords) {
        currentSettings.keywords = [];
      }
      
      currentSettings.keywords = currentSettings.keywords.filter(k => k !== keyword);
      await this.saveSettings(currentSettings);
      
      return currentSettings;
    } catch (error) {
      console.error('Error removing keyword:', error);
      throw error;
    }
  }

  // Clear all keywords
  async clearAllKeywords() {
    try {
      const currentSettings = await this.getSettings();
      currentSettings.keywords = [];
      await this.saveSettings(currentSettings);
      
      return currentSettings;
    } catch (error) {
      console.error('Error clearing keywords:', error);
      throw error;
    }
  }

  // Toggle blocking state
  async toggleBlocking(isEnabled) {
    try {
      return await this.updateSetting('isEnabled', isEnabled);
    } catch (error) {
      console.error('Error toggling blocking:', error);
      throw error;
    }
  }

  // Get storage usage info
  async getStorageInfo() {
    try {
      const usage = await chrome.storage.sync.getBytesInUse();
      const quota = chrome.storage.sync.QUOTA_BYTES;
      
      return {
        used: usage,
        quota: quota,
        percentage: (usage / quota) * 100
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return null;
    }
  }

  // Clear all storage data
  async clearAllData() {
    try {
      await chrome.storage.sync.clear();
      console.log('All storage data cleared');
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  // Export settings (for backup)
  async exportSettings() {
    try {
      const settings = await this.getSettings();
      const exportData = {
        version: '1.0.0',
        timestamp: Date.now(),
        settings: settings
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting settings:', error);
      throw error;
    }
  }

  // Import settings (from backup)
  async importSettings(jsonData) {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.settings) {
        throw new Error('Invalid import data');
      }
      
      await this.saveSettings(importData.settings);
      console.log('Settings imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing settings:', error);
      throw error;
    }
  }

  // Validate settings structure
  validateSettings(settings) {
    const requiredFields = ['isEnabled', 'keywords', 'lastUpdated'];
    
    for (const field of requiredFields) {
      if (!(field in settings)) {
        return false;
      }
    }
    
    if (typeof settings.isEnabled !== 'boolean') {
      return false;
    }
    
    if (!Array.isArray(settings.keywords)) {
      return false;
    }
    
    if (typeof settings.lastUpdated !== 'number') {
      return false;
    }
    
    return true;
  }

  // Migrate settings to current version
  async migrateSettings(settings) {
    try {
      const currentVersion = '1.0.0';
      const settingsVersion = settings.version || '0.0.0';
      
      // If versions match, no migration needed
      if (settingsVersion === currentVersion) {
        return settings;
      }
      
      console.log(`Migrating settings from version ${settingsVersion} to ${currentVersion}`);
      
      // Start with current defaults
      let migratedSettings = { ...this.defaultSettings };
      
      // Preserve user data from old version
      if (settings.isEnabled !== undefined) {
        migratedSettings.isEnabled = settings.isEnabled;
      }
      
      if (settings.keywords && Array.isArray(settings.keywords)) {
        migratedSettings.keywords = [...settings.keywords];
      }
      
      if (settings.lastUpdated) {
        migratedSettings.lastUpdated = settings.lastUpdated;
      }
      
      // Add version
      migratedSettings.version = currentVersion;
      
      // Save migrated settings
      await this.saveSettings(migratedSettings);
      console.log('Settings migrated successfully:', migratedSettings);
      
      return migratedSettings;
    } catch (error) {
      console.error('Error migrating settings:', error);
      return settings; // Return original if migration fails
    }
  }

  // Reset to default settings
  async resetToDefaults() {
    try {
      await this.saveSettings(this.defaultSettings);
      console.log('Settings reset to defaults');
      return this.defaultSettings;
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  }
}

// Export for use in other modules
export { StorageManager };

console.log('Storage module ready');
