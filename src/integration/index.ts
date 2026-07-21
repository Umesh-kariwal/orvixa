import { AdapterRegistry } from './core/AdapterRegistry';
import { GitHubAdapter } from './adapters/GitHubAdapter';
import { LeetCodeAdapter } from './adapters/LeetCodeAdapter';
import { NotionAdapter } from './adapters/NotionAdapter';
import { GenericWebAdapter } from './adapters/GenericWebAdapter';

// Auto-register production platform adapters
AdapterRegistry.register(new GitHubAdapter());
AdapterRegistry.register(new LeetCodeAdapter());
AdapterRegistry.register(new NotionAdapter());
AdapterRegistry.register(new GenericWebAdapter());

export { AdapterRegistry } from './core/AdapterRegistry';
export { BasePlatformAdapter } from './core/BasePlatformAdapter';
export { ContextObserverManager } from './manager/ContextObserverManager';
export type { NormalizedPlatformContext, PlatformInfo, ExtractedSnippet, PlatformCapability } from './core/types';
