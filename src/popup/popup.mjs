// Block History Popup - Complete Redesign
import { BlockHistoryUtils } from '../lib/utils.mjs';
import { CONFIG } from '../config/settings.mjs';

class BlockHistoryPopup {
  constructor() {
    this.settings = CONFIG.DEFAULT_SETTINGS;
    this.searchTerm = '';
    this.init();
  }

  async init() {
    try {
      // Show skeleton loading
      this.showSkeleton();
      
      // Load settings
      await this.loadSettings();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Setup storage change listener
      this.setupStorageListener();
      
      // Update UI with real data
      this.updateUI();
      
      // Hide skeleton and show content
      this.hideSkeleton();
      
      console.log('Block History Popup initialized');
    } catch (error) {
      console.error('Error initializing popup:', error);
      this.hideSkeleton();
      this.showNotification('Failed to initialize popup', 'error');
    }
  }

  async loadSettings() {
    try {
      console.log('Loading settings...');
      const response = await chrome.runtime.sendMessage({ action: 'GET_SETTINGS' });
      console.log('Settings response:', response);
      
      if (response && response.success) {
        this.settings = response.settings;
        console.log('Settings loaded successfully:', this.settings);
      } else {
        console.error('Failed to load settings:', response?.error);
        // Use default settings as fallback
        this.settings = CONFIG.DEFAULT_SETTINGS;
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Use default settings as fallback
      this.settings = CONFIG.DEFAULT_SETTINGS;
    }
  }

  setupEventListeners() {
    // History blocking toggle (separate from keywords)
    const historyToggle = document.getElementById('historyToggle');
    historyToggle.addEventListener('change', (e) => {
      this.toggleHistoryBlocking(e.target.checked);
    });

    // Add keyword
    const addBtn = document.getElementById('addKeywordBtn');
    const keywordInput = document.getElementById('keywordInput');
    
    addBtn.addEventListener('click', () => {
      this.addKeyword();
    });
    
    keywordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.addKeyword();
      }
    });

    // Clear all keywords
    const clearAllBtn = document.getElementById('clearAllBtn');
    clearAllBtn.addEventListener('click', () => {
      this.clearAllKeywords();
    });

    // Search keywords
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
      this.searchTerm = e.target.value.toLowerCase();
      this.updateKeywordsList();
    });

    // Modal functionality
    this.setupModals();
  }

  setupModals() {
    // No modals needed - all links now go to external pages
  }

  setupStorageListener() {
    // Listen for storage changes
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync' && changes.settings) {
        console.log('Settings changed in storage:', changes.settings);
        this.settings = changes.settings.newValue;
        this.updateUI();
      }
    });
  }

  showSkeleton() {
    const skeletonContainer = document.getElementById('skeletonContainer');
    const contentContainer = document.getElementById('contentContainer');
    
    if (skeletonContainer) {
      skeletonContainer.style.display = 'flex';
    }
    if (contentContainer) {
      contentContainer.style.display = 'none';
    }
  }

  hideSkeleton() {
    const skeletonContainer = document.getElementById('skeletonContainer');
    const contentContainer = document.getElementById('contentContainer');
    
    if (skeletonContainer) {
      skeletonContainer.style.display = 'none';
    }
    if (contentContainer) {
      contentContainer.style.display = 'flex';
    }
  }

  async toggleHistoryBlocking(isEnabled) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'TOGGLE_HISTORY_BLOCKING',
        data: { isEnabled }
      });

      if (response.success) {
        this.settings = response.settings;
        this.updateUI();
        this.showNotification(
          `History blocking ${isEnabled ? 'enabled' : 'disabled'}`,
          isEnabled ? 'success' : 'error'
        );
      } else {
        this.showNotification(response.error || 'Failed to toggle history blocking', 'error');
      }
    } catch (error) {
      console.error('Error toggling history blocking:', error);
      this.showNotification('Failed to toggle history blocking', 'error');
    }
  }

  async addKeyword() {
    const input = document.getElementById('keywordInput');
    const keyword = input.value.trim();

    if (!keyword) {
      this.showNotification('Please enter a filter keyword', 'error');
      return;
    }

    if (!BlockHistoryUtils.isValidKeyword(keyword)) {
      this.showNotification(CONFIG.ERRORS.INVALID_KEYWORD, 'error');
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'ADD_KEYWORD',
        data: { keyword }
      });

      if (response.success) {
        this.settings = response.settings;
        input.value = '';
        this.updateUI();
        this.showNotification(`Filter "${keyword}" added`, 'success');
      } else {
        const errorMessage = response.error || 'Failed to add keyword';
        this.showNotification(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Error adding keyword:', error);
      this.showNotification('Failed to add keyword', 'error');
    }
  }

  async removeKeyword(keyword) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'REMOVE_KEYWORD',
        data: { keyword }
      });

      if (response.success) {
        this.settings = response.settings;
        this.updateUI();
        this.showNotification(`Filter "${keyword}" removed`, 'error');
      } else {
        this.showNotification(response.error || 'Failed to remove keyword', 'error');
      }
    } catch (error) {
      console.error('Error removing keyword:', error);
      this.showNotification('Failed to remove keyword', 'error');
    }
  }

  async clearAllKeywords() {
    if (!this.settings.keywords || this.settings.keywords.length === 0) {
      this.showNotification('No filters to clear', 'info');
      return;
    }

    // Show confirmation notification instead of browser confirm
    this.showNotification('Click "Clear All Filters" again to confirm', 'info');
    
    // Set up double-click confirmation
    const clearBtn = document.getElementById('clearAllBtn');
    if (clearBtn) {
      clearBtn.textContent = 'Click again to confirm';
      clearBtn.style.backgroundColor = '#ef4444';
      
      // Reset after 3 seconds
      setTimeout(() => {
        clearBtn.textContent = 'Clear All Filters';
        clearBtn.style.backgroundColor = '';
      }, 3000);
      
      // Handle actual clearing
      const handleClear = async () => {
        try {
          const response = await chrome.runtime.sendMessage({
            action: 'CLEAR_ALL_KEYWORDS'
          });

          if (response.success) {
            this.settings = response.settings;
            this.updateUI();
            this.showNotification('All filters cleared', 'error');
          } else {
            this.showNotification(response.error || 'Failed to clear keywords', 'error');
          }
        } catch (error) {
          console.error('Error clearing keywords:', error);
          this.showNotification('Failed to clear keywords', 'error');
        }
        
        // Remove the event listener
        clearBtn.removeEventListener('click', handleClear);
      };
      
      // Add event listener for confirmation
      clearBtn.addEventListener('click', handleClear);
    }
  }

  updateUI() {
    // Update history blocking status
    const historyToggle = document.getElementById('historyToggle');
    const historyStatus = document.getElementById('historyStatus');
    
    historyToggle.checked = this.settings.isEnabled;
    
    if (this.settings.isEnabled) {
      historyStatus.classList.add('enabled');
      historyStatus.querySelector('.status-text').textContent = 'Enabled';
    } else {
      historyStatus.classList.remove('enabled');
      historyStatus.querySelector('.status-text').textContent = 'Disabled';
    }

    // Update keyword count
    const keywordCount = document.getElementById('keywordCount');
          const count = this.settings.keywords ? this.settings.keywords.length : 0;
      keywordCount.textContent = `${count} filter${count !== 1 ? 's' : ''}`;

    // Update keywords list
    this.updateKeywordsList();
  }

  updateKeywordsList() {
    const keywordsList = document.getElementById('keywordsList');
    const keywords = this.settings.keywords || [];

    // Filter keywords based on search term
    let filteredKeywords = keywords;
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      filteredKeywords = keywords.filter(keyword => 
        keyword.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (keywords.length === 0) {
      keywordsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <div class="empty-text">No filters added</div>
        </div>
      `;
      return;
    }

    if (filteredKeywords.length === 0) {
      keywordsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <div class="empty-text">No filters match "${this.searchTerm}"</div>
        </div>
      `;
      return;
    }

    keywordsList.innerHTML = filteredKeywords.map(keyword => `
      <div class="keyword-item">
        <span class="keyword-text">${this.escapeHtml(keyword)}</span>
        <button class="keyword-remove" data-keyword="${this.escapeHtml(keyword)}">×</button>
      </div>
    `).join('');

    // Add remove event listeners
    keywordsList.querySelectorAll('.keyword-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const keyword = e.target.dataset.keyword;
        this.removeKeyword(keyword);
      });
    });
  }

  showNotification(message, type = 'info') {
    // Get notification container
    const container = document.getElementById('notificationContainer');
    if (!container) {
      // Fallback to browser alert if container not found
      alert(message);
      return;
    }

    // Remove existing notifications
    const existing = container.querySelector('.notification');
    if (existing) {
      existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add to container
    container.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  escapeHtml(text) {
    return BlockHistoryUtils.escapeHtml(text);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new BlockHistoryPopup();
});