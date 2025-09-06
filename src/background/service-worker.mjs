// Block History Service Worker
import { StorageManager } from '../lib/storage.mjs';
import { BlockHistoryUtils } from '../lib/utils.mjs';
import { CONFIG } from '../config/settings.mjs';

console.log('Block History Service Worker loaded');

// Initialize storage manager
const storageManager = new StorageManager();

// Extension installation
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Block History extension installed/updated:', details.reason);
  
  // Open project page on install, reload, or update
  try {
    await chrome.tabs.create({
      url: 'https://www.sqtech.dev/projects/historyguard-pro',
      active: true
    });
    console.log('Project page opened successfully');
  } catch (error) {
    console.error('Error opening project page:', error);
  }
  
  // Only initialize defaults for fresh installs, preserve existing data for updates
  if (details.reason === 'install') {
    try {
      // Check if settings already exist
      const existingSettings = await storageManager.getSettings();
      
      // Only initialize defaults if no settings exist
      if (!existingSettings || Object.keys(existingSettings).length === 0) {
        await storageManager.saveSettings(CONFIG.DEFAULT_SETTINGS);
        console.log('Default settings initialized for fresh install');
      } else {
        console.log('Existing settings found, preserving user data:', existingSettings);
      }
    } catch (error) {
      console.error('Error checking existing settings:', error);
      // Only initialize defaults if we can't check existing settings
      await storageManager.saveSettings(CONFIG.DEFAULT_SETTINGS);
      console.log('Default settings initialized due to error');
    }
  } else if (details.reason === 'update') {
    console.log('Extension updated, preserving existing user settings');
    
    // Validate existing settings and fix any missing fields
    try {
      const existingSettings = await storageManager.getSettings();
      if (existingSettings) {
        // Merge with defaults to ensure all required fields exist
        const mergedSettings = {
          ...CONFIG.DEFAULT_SETTINGS,
          ...existingSettings,
          // Preserve user's actual data
          isEnabled: existingSettings.isEnabled !== undefined ? existingSettings.isEnabled : CONFIG.DEFAULT_SETTINGS.isEnabled,
          keywords: existingSettings.keywords || CONFIG.DEFAULT_SETTINGS.keywords,
          lastUpdated: existingSettings.lastUpdated || Date.now()
        };
        
        // Only save if there were changes
        if (JSON.stringify(mergedSettings) !== JSON.stringify(existingSettings)) {
          await storageManager.saveSettings(mergedSettings);
          console.log('Settings updated with new fields while preserving user data');
        } else {
          console.log('User settings are valid, no changes needed');
        }
      }
    } catch (error) {
      console.error('Error validating existing settings during update:', error);
    }
  }
});

// Initialize settings on startup
(async () => {
  try {
    const settings = await storageManager.getSettings();
    console.log('Extension started with settings:', settings);
    
    // Only validate and fix settings, don't overwrite user data
    if (settings && Object.keys(settings).length > 0) {
      // Check if settings need migration
      const migratedSettings = await storageManager.migrateSettings(settings);
      
      // Check if settings are valid after migration
      if (!storageManager.validateSettings(migratedSettings)) {
        console.log('Settings validation failed after migration, attempting to fix while preserving user data');
        
        // Merge with defaults to fix missing fields while preserving user data
        const fixedSettings = {
          ...CONFIG.DEFAULT_SETTINGS,
          ...migratedSettings,
          // Preserve user's actual data
          isEnabled: migratedSettings.isEnabled !== undefined ? migratedSettings.isEnabled : CONFIG.DEFAULT_SETTINGS.isEnabled,
          keywords: migratedSettings.keywords || CONFIG.DEFAULT_SETTINGS.keywords,
          lastUpdated: migratedSettings.lastUpdated || Date.now()
        };
        
        await storageManager.saveSettings(fixedSettings);
        console.log('Settings fixed while preserving user data');
      } else {
        console.log('User settings are valid, no changes needed');
      }
    } else {
      // Only initialize defaults if no settings exist at all
      console.log('No settings found, initializing defaults');
      await storageManager.saveSettings(CONFIG.DEFAULT_SETTINGS);
    }
  } catch (error) {
    console.error('Error initializing extension on startup:', error);
    // Only try to initialize defaults if we can't access existing settings
    try {
      const existingSettings = await storageManager.getSettings();
      if (!existingSettings || Object.keys(existingSettings).length === 0) {
        await storageManager.saveSettings(CONFIG.DEFAULT_SETTINGS);
        console.log('Default settings initialized due to error');
      } else {
        console.log('Existing settings found, not overwriting due to error');
      }
    } catch (initError) {
      console.error('Failed to initialize with defaults:', initError);
    }
  }
})();

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);
  
  switch (request.action) {
    case 'TOGGLE_HISTORY_BLOCKING':
      handleToggleHistoryBlocking(request.data).then(sendResponse);
      return true;
      
    case 'ADD_KEYWORD':
      handleAddKeyword(request.data).then(sendResponse);
      return true;
      
    case 'REMOVE_KEYWORD':
      handleRemoveKeyword(request.data).then(sendResponse);
      return true;
      
    case 'CLEAR_ALL_KEYWORDS':
      handleClearAllKeywords().then(sendResponse);
      return true;
      
    case 'GET_SETTINGS':
      handleGetSettings().then(sendResponse);
      return true;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Toggle history blocking (separate from keywords)
async function handleToggleHistoryBlocking(data) {
  try {
    const { isEnabled } = data;
    const settings = await storageManager.toggleBlocking(isEnabled);
    
    console.log(`History blocking ${isEnabled ? 'enabled' : 'disabled'}`);
    return { success: true, settings };
  } catch (error) {
    console.error('Error toggling history blocking:', error);
    return { success: false, error: error.message };
  }
}

// Add keyword to block list
async function handleAddKeyword(data) {
  try {
    const { keyword } = data;
    
    // Validate keyword using utils
    if (!BlockHistoryUtils.isValidKeyword(keyword)) {
      return { success: false, error: CONFIG.ERRORS.INVALID_KEYWORD };
    }
    
    // Get current settings to check for duplicates
    const currentSettings = await storageManager.getSettings();
    
    // Check for duplicate keywords (case-insensitive)
    if (BlockHistoryUtils.isKeywordDuplicate(keyword, currentSettings.keywords)) {
      return { success: false, error: 'Keyword already exists' };
    }
    
    const settings = await storageManager.addKeyword(keyword);
    
    // Clear ALL existing history with this keyword (old and new)
    await clearHistoryWithKeyword(keyword);
    
    console.log(`Keyword added: ${keyword}`);
    return { success: true, settings };
  } catch (error) {
    console.error('Error adding keyword:', error);
    return { success: false, error: error.message };
  }
}

// Remove keyword from block list
async function handleRemoveKeyword(data) {
  try {
    const { keyword } = data;
    const settings = await storageManager.removeKeyword(keyword);
    
    console.log(`Keyword removed: ${keyword}`);
    return { success: true, settings };
  } catch (error) {
    console.error('Error removing keyword:', error);
    return { success: false, error: error.message };
  }
}

// Clear all keywords
async function handleClearAllKeywords() {
  try {
    const settings = await storageManager.clearAllKeywords();
    
    console.log('All keywords cleared');
    return { success: true, settings };
  } catch (error) {
    console.error('Error clearing all keywords:', error);
    return { success: false, error: error.message };
  }
}

// Get current settings
async function handleGetSettings() {
  try {
    const settings = await storageManager.getSettings();
    return { success: true, settings };
  } catch (error) {
    console.error('Error getting settings:', error);
    return { success: false, error: error.message };
  }
}

// Clear history with specific keyword
async function handleClearHistory(data) {
  try {
    const { keyword } = data;
    await clearHistoryWithKeyword(keyword);
    
    console.log(`History cleared for keyword: ${keyword}`);
    return { success: true };
  } catch (error) {
    console.error('Error clearing history:', error);
    return { success: false, error: error.message };
  }
}

// Clean History Deletion - Only Working Methods
async function clearHistoryWithKeyword(keyword) {
  console.log(`🎯 CLEANING HISTORY: "${keyword}"`);
  
  const allMatchingUrls = new Set();
  
  // Find all matching URLs using time-based search
  await findAllMatchingUrls(keyword, allMatchingUrls);
  
  // Delete all found URLs
  const totalDeleted = await deleteAllFoundUrls(allMatchingUrls);
  
  console.log(`✅ CLEANUP COMPLETE: ${totalDeleted} URLs DELETED`);
}

// Find all URLs matching keyword (time-based search)
async function findAllMatchingUrls(keyword, urlSet) {
  console.log(`🔍 Finding all URLs containing: "${keyword}"`);
  
  const now = Date.now();
  const epoch = 0;
  const chunkSize = 30 * 24 * 60 * 60 * 1000; // 30 days chunks
  let totalProcessed = 0;
  let chunksProcessed = 0;
  const maxChunks = 500;
  
  for (let endTime = now; endTime > epoch && chunksProcessed < maxChunks; endTime -= chunkSize) {
    const startTime = Math.max(endTime - chunkSize, epoch);
    chunksProcessed++;
    
    console.log(`🔍 Chunk ${chunksProcessed}: ${new Date(startTime).toISOString()} to ${new Date(endTime).toISOString()}`);
    
    try {
      const allItems = await chrome.history.search({ 
        text: '', 
        startTime, 
        endTime, 
        maxResults: 10000 
      });
      
      console.log(`🔍 Chunk ${chunksProcessed}: Found ${allItems.length} total history items`);
      
      let chunkMatches = 0;
      for (const item of allItems) {
        if (item.url && item.url.toLowerCase().includes(keyword.toLowerCase())) {
          urlSet.add(item.url);
          console.log(`🎯 CAPTURED: ${item.url}`);
          chunkMatches++;
        }
      }
      
      console.log(`🔍 Chunk ${chunksProcessed}: Found ${chunkMatches} matching URLs`);
      totalProcessed += allItems.length;
      
      if (allItems.length === 0) {
        console.log(`🔍 No more history found at chunk ${chunksProcessed} - reached end`);
        break;
      }
      
      if (chunksProcessed % 10 === 0) {
        console.log(`🔍 Progress: ${chunksProcessed} chunks, ${totalProcessed} items checked, ${urlSet.size} targets found`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.log(`⚠️ Chunk ${chunksProcessed} failed: ${error.message}`);
    }
  }
  
  console.log(`🔍 Search complete: ${chunksProcessed} chunks, ${totalProcessed} items checked, ${urlSet.size} URLs found`);
}

// Delete all found URLs with visit tracking
async function deleteAllFoundUrls(urlSet) {
  console.log(`🗑️ Deleting ${urlSet.size} URLs...`);
  
  let totalDeleted = 0;
  const urlArray = Array.from(urlSet);
  
  // Process URLs in batches
  const batchSize = 5;
  for (let i = 0; i < urlArray.length; i += batchSize) {
    const batch = urlArray.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (url) => {
      try {
        // Get visit count for logging
        const visits = await chrome.history.getVisits({ url });
        console.log(`🎯 URL: ${url} has ${visits.length} visits`);
        
        // Delete the URL (this deletes ALL visits to the URL)
        await chrome.history.deleteUrl({ url });
        
        // Verify it's completely gone
        const remainingVisits = await chrome.history.getVisits({ url });
        
        if (remainingVisits.length === 0) {
          console.log(`✅ COMPLETE ANNIHILATION: ${url} (${visits.length} visits destroyed)`);
          totalDeleted++;
        } else {
          console.log(`⚠️ PARTIAL DESTRUCTION: ${url} (${remainingVisits.length}/${visits.length} visits remain)`);
          
          // Try deleting by time ranges for stubborn entries
          for (const visit of remainingVisits) {
            try {
              await chrome.history.deleteRange({
                startTime: visit.visitTime - 300000, // 5 minutes before
                endTime: visit.visitTime + 300000    // 5 minutes after
              });
            } catch (rangeError) {
              console.log(`💥 Range deletion failed: ${rangeError.message}`);
            }
          }
        }
        
      } catch (error) {
        console.log(`❌ Failed to delete ${url}: ${error.message}`);
      }
    }));
    
    // Progress logging
    console.log(`🗑️ Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(urlArray.length/batchSize)}`);
    
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`🗑️ Deletion complete: ${totalDeleted}/${urlArray.length} URLs deleted`);
  return totalDeleted;
}

// Monitor new history entries
chrome.history.onVisited.addListener(async (historyItem) => {
  try {
    const settings = await storageManager.getSettings();
    
    // 1. If history blocking is enabled, block ALL new history
    if (settings.isEnabled) {
      await chrome.history.deleteUrl({ url: historyItem.url });
      console.log(`Blocked new history: ${historyItem.url}`);
      return;
    }
    
    // 2. If keywords are set, check for keyword matches and delete
    if (settings.keywords && settings.keywords.length > 0) {
      const urlLower = historyItem.url.toLowerCase();
      
      // Check each keyword with simple string matching
      for (const keyword of settings.keywords) {
        const keywordLower = keyword.toLowerCase();
        
        if (urlLower.includes(keywordLower)) {
        await chrome.history.deleteUrl({ url: historyItem.url });
          console.log(`Blocked keyword match: ${historyItem.url} (keyword: ${keyword})`);
          return; // Exit after first match
        }
      }
    }
  } catch (error) {
    console.error('Error monitoring history:', error);
  }
});

console.log('Block History Service Worker ready');
