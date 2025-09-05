// Utility Functions for Block History Extension
console.log('Utils module loaded');

class BlockHistoryUtils {
  // Validate URL format
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Validate keyword format
  static isValidKeyword(keyword) {
    if (!keyword || typeof keyword !== 'string') {
      return false;
    }
    
    const trimmed = keyword.trim();
    
    // Check length
    if (trimmed.length < 1 || trimmed.length > 100) {
      return false;
    }
    
    // Check for dangerous characters
    const dangerousChars = /[<>'"&]/;
    if (dangerousChars.test(trimmed)) {
      return false;
    }
    
    return true;
  }

  // Sanitize keyword
  static sanitizeKeyword(keyword) {
    if (!keyword || typeof keyword !== 'string') {
      return '';
    }
    
    return keyword
      .trim()
      .toLowerCase()
      .replace(/[<>'"&]/g, '') // Remove dangerous characters
      .substring(0, 100); // Limit length
  }

  // Check if keyword already exists (case-insensitive)
  static isKeywordDuplicate(keyword, existingKeywords) {
    if (!keyword || !existingKeywords || !Array.isArray(existingKeywords)) {
      return false;
    }
    
    const keywordLower = keyword.toLowerCase().trim();
    return existingKeywords.some(existing => 
      existing.toLowerCase().trim() === keywordLower
    );
  }

  // Check if URL matches keyword
  static urlMatchesKeyword(url, keyword) {
    if (!url || !keyword) {
      return false;
    }
    
    const urlLower = url.toLowerCase();
    const keywordLower = keyword.toLowerCase();
    
    // Exact matching - only match if the keyword appears as a complete word in the URL
    // This prevents partial matches like "chrome" matching "chrome.google.com"
    const exactPattern = new RegExp(`(^|\\/|\\?|&|#|\\.)${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\/|\\?|&|#|\\.|$)`, 'i');
    return exactPattern.test(urlLower);
  }

  // Check if URL matches any keywords
  static urlMatchesAnyKeyword(url, keywords) {
    if (!url || !keywords || !Array.isArray(keywords)) {
      return false;
    }
    
    return keywords.some(keyword => this.urlMatchesKeyword(url, keyword));
  }

  // Format date for display
  static formatDate(timestamp) {
    if (!timestamp || typeof timestamp !== 'number') {
      return 'Unknown';
    }
    
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  // Format relative time
  static formatRelativeTime(timestamp) {
    if (!timestamp || typeof timestamp !== 'number') {
      return 'Unknown';
    }
    
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  // Debounce function
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle function
  static throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Generate unique ID
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Deep clone object
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item));
    }
    
    if (typeof obj === 'object') {
      const cloned = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key]);
        }
      }
      return cloned;
    }
  }

  // Merge objects deeply
  static deepMerge(target, source) {
    const result = this.deepClone(target);
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          result[key] = this.deepMerge(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    
    return result;
  }

  // Escape HTML
  static escapeHtml(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Unescape HTML
  static unescapeHtml(html) {
    if (!html || typeof html !== 'string') {
      return '';
    }
    
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  // Format number with commas
  static formatNumber(num) {
    if (typeof num !== 'number') {
      return '0';
    }
    
    return num.toLocaleString();
  }

  // Get file size in human readable format
  static formatFileSize(bytes) {
    if (typeof bytes !== 'number' || bytes < 0) {
      return '0 B';
    }
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  // Check if string is empty or whitespace
  static isEmpty(str) {
    return !str || str.trim().length === 0;
  }

  // Capitalize first letter
  static capitalize(str) {
    if (!str || typeof str !== 'string') {
      return '';
    }
    
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // Generate random string
  static randomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  // Check if running in Chrome extension context
  static isChromeExtension() {
    return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
  }

  // Get Chrome extension info
  static getExtensionInfo() {
    if (!this.isChromeExtension()) {
      return null;
    }
    
    try {
      return {
        id: chrome.runtime.id,
        version: chrome.runtime.getManifest().version,
        name: chrome.runtime.getManifest().name
      };
    } catch (error) {
      console.error('Error getting extension info:', error);
      return null;
    }
  }

  // Log with timestamp
  static log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    switch (level) {
      case 'error':
        console.error(prefix, message);
        break;
      case 'warn':
        console.warn(prefix, message);
        break;
      case 'debug':
        console.debug(prefix, message);
        break;
      default:
        console.log(prefix, message);
    }
  }

  // Error handler
  static handleError(error, context = 'Unknown') {
    const errorInfo = {
      message: error.message || 'Unknown error',
      stack: error.stack || 'No stack trace',
      context: context,
      timestamp: Date.now()
    };
    
    this.log(`Error in ${context}: ${errorInfo.message}`, 'error');
    console.error('Error details:', errorInfo);
    
    return errorInfo;
  }
}

// Export for use in other modules
export { BlockHistoryUtils };

console.log('Utils module ready');
