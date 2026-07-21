import type { ExtractedSnippet } from '../core/types';

export class SelectionExtractor {
  public static extract(): ExtractedSnippet | null {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return null;

    const selectedText = selection.toString().trim();
    if (!selectedText) return null;

    return {
      type: 'selection',
      content: selectedText,
      location: 'user_selection',
    };
  }
}
