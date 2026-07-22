export interface OrvixaBrowserPreferences {
  panelMode: 'dock' | 'floating';
  dockWidth: number;
  floatingPosition: { x: number; y: number };
  floatingSize: { width: number; height: number };
  isPinned: boolean;
  shortcut: string;
  onboardingCompleted: boolean;
  customApiKey: string;
}

const STORAGE_KEY = 'orvixa_browser_preferences_v1';

const DEFAULT_PREFERENCES: OrvixaBrowserPreferences = {
  panelMode: 'dock',
  dockWidth: 35,
  floatingPosition: { x: 100, y: 100 },
  floatingSize: { width: 420, height: 600 },
  isPinned: false,
  shortcut: 'Ctrl+Shift+K',
  onboardingCompleted: false,
  customApiKey: '',
};

declare const chrome: any;

export class StorageService {
  private static inMemoryPrefs: OrvixaBrowserPreferences = { ...DEFAULT_PREFERENCES };
  private static initialized = false;

  public static getPreferences(): OrvixaBrowserPreferences {
    if (!this.initialized) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.inMemoryPrefs = { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
        }
      } catch {
        // Fallback silently if localStorage is blocked
      }
      this.initialized = true;
    }
    return this.inMemoryPrefs;
  }

  public static savePreferences(prefs: Partial<OrvixaBrowserPreferences>): OrvixaBrowserPreferences {
    const current = this.getPreferences();
    const updated = { ...current, ...prefs };
    this.inMemoryPrefs = updated;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignored if blocked
    }

    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ [STORAGE_KEY]: updated });
    }

    return updated;
  }

  public static async loadAsyncPreferences(): Promise<OrvixaBrowserPreferences> {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.get([STORAGE_KEY], (result: any) => {
          if (result && result[STORAGE_KEY]) {
            this.inMemoryPrefs = { ...DEFAULT_PREFERENCES, ...result[STORAGE_KEY] };
            this.initialized = true;
          }
          resolve(this.inMemoryPrefs);
        });
      } else {
        resolve(this.getPreferences());
      }
    });
  }
}
