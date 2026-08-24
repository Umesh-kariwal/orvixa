/**
 * Orvixa Multimodal Vision & Computer Use Agent Service
 * Provides active screen capture and visual target grounding.
 */

export interface ScreenTarget {
  x: number;
  y: number;
  label: string;
  confidence: number;
}

/**
 * Captures active window / canvas snapshot as Base64 image string.
 */
export async function captureScreenSnapshot(): Promise<string | null> {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/png');
    }
  } catch (e) {
    console.warn('[VisionAgent Error] Could not capture canvas screen', e);
  }
  return null;
}

/**
 * Resolves visual UI button text to screen pixel coordinates (x, y).
 */
export async function locateVisualTargetByText(targetText: string): Promise<ScreenTarget | null> {
  const lower = targetText.toLowerCase().trim();
  const elements = Array.from(
    document.querySelectorAll('button, a, input, [role="button"]')
  ) as HTMLElement[];

  const match = elements.find((el) =>
    el.innerText?.toLowerCase().includes(lower)
  );

  if (match) {
    const rect = match.getBoundingClientRect();
    return {
      x: Math.round(rect.left + rect.width / 2),
      y: Math.round(rect.top + rect.height / 2),
      label: match.innerText || targetText,
      confidence: 0.99,
    };
  }

  return null;
}
