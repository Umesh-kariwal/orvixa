export interface OrvixaBrowserPreferences {
  panelMode: 'dock' | 'floating';
  dockWidth: number; // Percentage or px
  floatingPosition: { x: number; y: number };
  floatingSize: { width: number; height: number };
  isPinned: boolean;
  shortcut: string;
}

const STORAGE_KEY = 'orvixa_browser_preferences_v1';

const DEFAULT_PREFERENCES: OrvixaBrowserPreferences = {
  panelMode: 'dock',
  dockWidth: 35,
  floatingPosition: { x: 100, y: 100 },
  floatingSize: { width: 420, height: 600 },
  isPinned: false,
  shortcut: 'Ctrl+K',
};

export class StorageService {
  public static getPreferences(): OrvixaBrowserPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }

  public static savePreferences(prefs: Partial<OrvixaBrowserPreferences>): OrvixaBrowserPreferences {
    try {
      const current = this.getPreferences();
      const updated = { ...current, ...prefs };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }
}
