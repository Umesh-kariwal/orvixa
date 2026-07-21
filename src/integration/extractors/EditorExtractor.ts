import type { ExtractedSnippet } from '../core/types';

export class EditorExtractor {
  public static extract(doc: Document): ExtractedSnippet | null {
    // 1. Monaco Editor Signature
    const monacoLines = doc.querySelectorAll('.monaco-editor .view-line');
    if (monacoLines.length > 0) {
      const codeText = Array.from(monacoLines)
        .map((el) => el.textContent || '')
        .join('\n');

      if (codeText.trim()) {
        return {
          type: 'code',
          content: codeText,
          location: 'monaco_editor',
        };
      }
    }

    // 2. CodeMirror Signature
    const cmLines = doc.querySelectorAll('.CodeMirror-line, .cm-line');
    if (cmLines.length > 0) {
      const codeText = Array.from(cmLines)
        .map((el) => el.textContent || '')
        .join('\n');

      if (codeText.trim()) {
        return {
          type: 'code',
          content: codeText,
          location: 'codemirror_editor',
        };
      }
    }

    // 3. Fallback Code Blocks
    const codeBlock = doc.querySelector('pre code, article pre');
    if (codeBlock && codeBlock.textContent?.trim()) {
      return {
        type: 'code',
        content: codeBlock.textContent.trim(),
        location: 'pre_code_block',
      };
    }

    return null;
  }
}
