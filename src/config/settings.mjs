// Configuration settings for Block History Extension
console.log('Settings config loaded');

export const CONFIG = {
  // Extension info
  EXTENSION: {
    NAME: 'Block History',
    VERSION: '1.0.0',
    AUTHOR: 'SQ Tech',
    HOMEPAGE: 'https://sqtech.dev'
  },

  // Storage keys
  STORAGE_KEYS: {
    SETTINGS: 'settings',
    KEYWORDS: 'keywords',
    LAST_UPDATED: 'lastUpdated'
  },

  // Default settings
  DEFAULT_SETTINGS: {
    isEnabled: false,
    keywords: [],
    lastUpdated: Date.now()
  },

  // UI settings
  UI: {
    POPUP_WIDTH: 380,
    POPUP_HEIGHT: 500,
    MAX_KEYWORDS: 100,
    MAX_KEYWORD_LENGTH: 100,
    ANIMATION_DURATION: 200
  },

  // History settings
  HISTORY: {
    MAX_SEARCH_RESULTS: 1000,
    SEARCH_TIMEOUT: 5000
  },

  // Notification settings
  NOTIFICATIONS: {
    DURATION: 3000,
    POSITION: {
      top: '10px',
      right: '10px'
    }
  },

  // Validation rules
  VALIDATION: {
    KEYWORD: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 100,
      ALLOWED_CHARS: /^[a-zA-Z0-9\s\-_\.]+$/,
      FORBIDDEN_CHARS: /[<>'"&]/
    },
    URL: {
      MAX_LENGTH: 2048
    }
  },

  // Error messages
  ERRORS: {
    INVALID_KEYWORD: 'Invalid keyword format',
    KEYWORD_TOO_LONG: 'Keyword is too long (max 100 characters)',
    KEYWORD_ALREADY_EXISTS: 'Keyword already exists',
    KEYWORD_NOT_FOUND: 'Keyword not found',
    STORAGE_ERROR: 'Storage operation failed',
    HISTORY_ERROR: 'History operation failed',
    NETWORK_ERROR: 'Network operation failed',
    UNKNOWN_ERROR: 'An unknown error occurred'
  },

  // Success messages
  SUCCESS: {
    KEYWORD_ADDED: 'Keyword added successfully',
    KEYWORD_REMOVED: 'Keyword removed successfully',
    KEYWORDS_CLEARED: 'All keywords cleared',
    HISTORY_CLEARED: 'Matching history cleared',
    SETTINGS_SAVED: 'Settings saved successfully',
    BLOCKING_ENABLED: 'History blocking enabled',
    BLOCKING_DISABLED: 'History blocking disabled'
  },

  // Chrome extension permissions
  PERMISSIONS: {
    STORAGE: 'storage',
    HISTORY: 'history'
  },

  // API endpoints (if any)
  API: {
    BASE_URL: '',
    TIMEOUT: 10000
  },

  // Feature flags
  FEATURES: {
    ENABLE_NOTIFICATIONS: true,
    ENABLE_ANIMATIONS: true,
    ENABLE_LOGGING: true,
    ENABLE_DEBUG: false
  },

  // Development settings
  DEV: {
    LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
    ENABLE_CONSOLE_LOGS: true,
    ENABLE_PERFORMANCE_LOGS: false
  }
};

// Export individual configs for easier imports
export const EXTENSION_CONFIG = CONFIG.EXTENSION;
export const STORAGE_CONFIG = CONFIG.STORAGE_KEYS;
export const UI_CONFIG = CONFIG.UI;
export const HISTORY_CONFIG = CONFIG.HISTORY;
export const VALIDATION_CONFIG = CONFIG.VALIDATION;
export const ERROR_MESSAGES = CONFIG.ERRORS;
export const SUCCESS_MESSAGES = CONFIG.SUCCESS;

console.log('Settings config ready');
