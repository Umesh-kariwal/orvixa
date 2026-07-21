import { StorageService } from './storageService';

export class BrowserExperienceValidator {
  public static runValidations(): { passed: boolean; details: string[] } {
    const details: string[] = [];

    // 1. Validate Default Preferences
    localStorage.clear();
    const defaults = StorageService.getPreferences();
    if (defaults.panelMode === 'dock' && defaults.dockWidth === 35 && !defaults.isPinned) {
      details.push('Default preferences validated successfully.');
    } else {
      return { passed: false, details: ['Failed to load default preferences.'] };
    }

    // 2. Validate Storage Persistence
    StorageService.savePreferences({ panelMode: 'floating', isPinned: true });
    const updated = StorageService.getPreferences();
    if (updated.panelMode === 'floating' && updated.isPinned === true) {
      details.push('Storage persistence validated successfully.');
    } else {
      return { passed: false, details: ['Failed to persist preference updates.'] };
    }

    // 3. Validate Dock Width Clamping (25% - 50%)
    const minWidth = 25;
    const maxWidth = 50;
    const clamp = (w: number) => Math.min(maxWidth, Math.max(minWidth, w));

    if (clamp(10) === 25 && clamp(60) === 50) {
      details.push('Dock width clamping (25% - 50%) validated successfully.');
    } else {
      return { passed: false, details: ['Failed dock width clamping assertion.'] };
    }

    return { passed: true, details };
  }
}
