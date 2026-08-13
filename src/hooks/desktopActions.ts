/**
 * Orvixa Desktop Actions
 * Bridge between voice commands and Chrome Extension APIs.
 * Works in both extension mode (chrome.runtime) and web mode (window.open fallback).
 */

declare const chrome: any;

const IS_EXTENSION = typeof chrome !== 'undefined' && !!chrome?.runtime?.sendMessage;

// ─────────────────────────────────────────────────────────────
// Core: Send message to background worker (extension only)
// ─────────────────────────────────────────────────────────────
function bgMessage(msg: object): Promise<any> {
  return new Promise((resolve) => {
    if (!IS_EXTENSION) { resolve(null); return; }
    try {
      chrome.runtime.sendMessage(msg, (response: any) => {
        chrome.runtime.lastError; // consume
        resolve(response);
      });
    } catch {
      resolve(null);
    }
  });
}

// ─────────────────────────────────────────────────────────────
// Open URL — uses chrome.tabs.create (extension) or anchor (web)
// ─────────────────────────────────────────────────────────────
export async function openUrl(url: string): Promise<void> {
  if (IS_EXTENSION) {
    await bgMessage({ type: 'ORVIXA_OPEN_URL', url });
  } else {
    // Anchor click method — bypasses popup blockers
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 300);
  }
}

// ─────────────────────────────────────────────────────────────
// Get current page content (for "summarize this page" etc.)
// ─────────────────────────────────────────────────────────────
export async function getCurrentPageContent(): Promise<{ title: string; url: string; content: string }> {
  if (IS_EXTENSION) {
    const res = await bgMessage({ type: 'ORVIXA_GET_PAGE_CONTENT' });
    return res || { title: '', url: '', content: '' };
  }
  // Fallback: read the host page (works if Orvixa is opened in same tab)
  return {
    title: document.title,
    url: window.location.href,
    content: document.body?.innerText?.slice(0, 8000) || '',
  };
}

// ─────────────────────────────────────────────────────────────
// Scroll active tab
// ─────────────────────────────────────────────────────────────
export async function scrollPage(direction: 'down' | 'up'): Promise<void> {
  if (IS_EXTENSION) {
    await bgMessage({ type: 'ORVIXA_SCROLL', direction });
  } else {
    window.scrollBy({ top: direction === 'down' ? 400 : -400, behavior: 'smooth' });
  }
}

// ─────────────────────────────────────────────────────────────
// Focus or open a site
// ─────────────────────────────────────────────────────────────
export async function focusOrOpenSite(pattern: string, url: string): Promise<void> {
  if (IS_EXTENSION) {
    await bgMessage({ type: 'ORVIXA_FOCUS_TAB', pattern, fallbackUrl: url });
  } else {
    await openUrl(url);
  }
}

// ─────────────────────────────────────────────────────────────
// WEBSITE DIRECTORY
// ─────────────────────────────────────────────────────────────
export const WEBSITES: Record<string, { url: string; searchUrl?: string; label: string }> = {
  youtube: { url: 'https://www.youtube.com', searchUrl: 'https://www.youtube.com/results?search_query=', label: 'YouTube' },
  google: { url: 'https://www.google.com', searchUrl: 'https://www.google.com/search?q=', label: 'Google' },
  gmail: { url: 'https://mail.google.com', label: 'Gmail' },
  'google drive': { url: 'https://drive.google.com', label: 'Google Drive' },
  'google docs': { url: 'https://docs.google.com', label: 'Google Docs' },
  'google maps': { url: 'https://maps.google.com', label: 'Google Maps' },
  facebook: { url: 'https://www.facebook.com', label: 'Facebook' },
  instagram: { url: 'https://www.instagram.com', label: 'Instagram' },
  twitter: { url: 'https://www.twitter.com', label: 'Twitter/X' },
  'x.com': { url: 'https://x.com', label: 'X' },
  whatsapp: { url: 'https://web.whatsapp.com', label: 'WhatsApp Web' },
  github: { url: 'https://www.github.com', label: 'GitHub' },
  wikipedia: { url: 'https://www.wikipedia.org', searchUrl: 'https://en.wikipedia.org/wiki/Special:Search?search=', label: 'Wikipedia' },
  netflix: { url: 'https://www.netflix.com', label: 'Netflix' },
  amazon: { url: 'https://www.amazon.in', searchUrl: 'https://www.amazon.in/s?k=', label: 'Amazon' },
  flipkart: { url: 'https://www.flipkart.com', searchUrl: 'https://www.flipkart.com/search?q=', label: 'Flipkart' },
  spotify: { url: 'https://open.spotify.com', label: 'Spotify' },
  'youtube music': { url: 'https://music.youtube.com', label: 'YouTube Music' },
  chatgpt: { url: 'https://chat.openai.com', label: 'ChatGPT' },
  gemini: { url: 'https://gemini.google.com', label: 'Gemini' },
  linkedin: { url: 'https://www.linkedin.com', label: 'LinkedIn' },
  reddit: { url: 'https://www.reddit.com', searchUrl: 'https://www.reddit.com/search/?q=', label: 'Reddit' },
  stackoverflow: { url: 'https://stackoverflow.com', searchUrl: 'https://stackoverflow.com/search?q=', label: 'Stack Overflow' },
};

// ─────────────────────────────────────────────────────────────
// ADVANCED VOICE COMMAND PARSER
// ─────────────────────────────────────────────────────────────
export type ActionType =
  | 'open_site' | 'search_on_site' | 'play_on_youtube'
  | 'google_search' | 'amazon_search' | 'flipkart_search'
  | 'scroll_down' | 'scroll_up'
  | 'summarize_page' | 'read_page'
  | 'close_voice' | 'ai_chat';

export interface VoiceAction {
  type: ActionType;
  site?: string;
  siteUrl?: string;
  query?: string;
  response?: string; // what Orvixa should say
}

export function parseVoiceCommand(text: string): VoiceAction {
  const t = text.toLowerCase().trim();

  // ── CLOSE ─────────────────────────────────────────────────
  if (/\b(close|band karo|band kr|exit|bye|goodbye|stop|chup|rukja)\b/.test(t)) {
    return { type: 'close_voice' };
  }

  // ── SCROLL ────────────────────────────────────────────────
  if (/\b(scroll down|neeche jao|aage jao|neeche scroll)\b/.test(t)) {
    return { type: 'scroll_down', response: 'Scroll kar raha hoon!' };
  }
  if (/\b(scroll up|upar jao|wapas jao|upar scroll)\b/.test(t)) {
    return { type: 'scroll_up', response: 'Upar scroll kar raha hoon!' };
  }

  // ── SUMMARIZE / READ PAGE ─────────────────────────────────
  if (/\b(is page ko summarize karo|summarize this|is page ki summary|page padho|read this page|explain this page)\b/.test(t)) {
    return { type: 'summarize_page', response: 'Page padh raha hoon, ek second...' };
  }

  // ── YOUTUBE PLAY ──────────────────────────────────────────
  const playPatterns = [
    /(?:play|baja(?:o)?|suna(?:o)?|chala(?:o)?|laga(?:o)?|gao?)\s+(.+)/,
    /(.+?)\s+(?:play karo|bajao|sunao|chalao|lagao|gaao?)\b/,
    /(?:mujhe|muje|hame)\s+(.+?)\s+(?:sunao|bajao|sunana)\b/,
    /(?:youtube\s+(?:pe|par|mein)\s+)(.+)/,
  ];
  for (const p of playPatterns) {
    const m = t.match(p);
    if (m) {
      const raw = (m[1] || m[2] || '').trim();
      const song = raw.replace(/\b(youtube|yt|pe|par|mein|ko|bhi|ek|koi|please|plz)\b/g, '').trim();
      if (song.length > 1) {
        return {
          type: 'play_on_youtube',
          query: song,
          siteUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(song)}`,
          response: `"${song}" YouTube par laga raha hoon!`,
        };
      }
    }
  }

  // Generic "gaana bajao"
  if (/\b(gaana|song|music|gana|playlist)\b/.test(t) && /\b(baja|chala|suna|play|laga|gao)\b/.test(t)) {
    return {
      type: 'play_on_youtube',
      query: 'hindi songs',
      siteUrl: 'https://www.youtube.com/results?search_query=best+hindi+songs+2024',
      response: 'Aapke liye Hindi songs laga raha hoon!',
    };
  }

  // ── SEARCH ON SPECIFIC SITE ───────────────────────────────
  // "Amazon pe iPhone dhundo", "Flipkart mein laptop search karo"
  for (const [siteName, siteInfo] of Object.entries(WEBSITES)) {
    if (t.includes(siteName) && siteInfo.searchUrl) {
      const searchRegex = new RegExp(
        `(?:${siteName}\\s+(?:pe|par|mein|me)\\s+)(.+?)(?:\\s+(?:search|dhundo|dhoondo|dikhaao))?$|` +
        `(.+?)\\s+(?:${siteName}\\s+(?:pe|par|mein)|${siteName}\\s+(?:search|dhundo))`
      );
      const m = t.match(searchRegex);
      if (m) {
        const query = (m[1] || m[2] || '').replace(new RegExp(`\\b(${siteName}|pe|par|mein|me|search|dhundo|karo)\\b`, 'g'), '').trim();
        if (query.length > 1) {
          return {
            type: 'search_on_site',
            site: siteInfo.label,
            siteUrl: siteInfo.searchUrl + encodeURIComponent(query),
            query,
            response: `${siteInfo.label} par "${query}" search kar raha hoon!`,
          };
        }
      }
    }
  }

  // ── OPEN SPECIFIC WEBSITE ─────────────────────────────────
  for (const [siteName, siteInfo] of Object.entries(WEBSITES)) {
    if (t.includes(siteName) && /\b(open|kholo|jao|visit|chalao|pe jao|par jao|band karo|launch|start)\b/.test(t)) {
      return {
        type: 'open_site',
        site: siteInfo.label,
        siteUrl: siteInfo.url,
        response: `${siteInfo.label} khol raha hoon!`,
      };
    }
  }

  // Direct name only (e.g. "YouTube", "Instagram")
  for (const [siteName, siteInfo] of Object.entries(WEBSITES)) {
    if (t === siteName || t === `open ${siteName}` || t === `${siteName} kholo` || t === `${siteName} open`) {
      return {
        type: 'open_site',
        site: siteInfo.label,
        siteUrl: siteInfo.url,
        response: `${siteInfo.label} khol raha hoon!`,
      };
    }
  }

  // ── GOOGLE SEARCH ─────────────────────────────────────────
  const googleSearchPatterns = [
    /(?:google\s+(?:pe|par|mein|me)\s+|google\s+karo\s+|search\s+for\s+|search\s+)(.+)/,
    /(.+?)\s+(?:google\s+(?:pe|par)|google\s+karo|search\s+karo|search\s+karo)\b/,
  ];
  for (const p of googleSearchPatterns) {
    const m = t.match(p);
    if (m) {
      const query = (m[1] || m[2] || '').trim();
      if (query.length > 1) {
        return {
          type: 'google_search',
          query,
          siteUrl: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
          response: `Google par "${query}" search kar raha hoon!`,
        };
      }
    }
  }

  return { type: 'ai_chat', query: text };
}

// ─────────────────────────────────────────────────────────────
// EXECUTE ACTION — runs the parsed command
// ─────────────────────────────────────────────────────────────
export async function executeVoiceAction(action: VoiceAction): Promise<string | null> {
  switch (action.type) {
    case 'open_site':
    case 'play_on_youtube':
    case 'search_on_site':
    case 'google_search':
    case 'amazon_search':
    case 'flipkart_search':
      if (action.siteUrl) await focusOrOpenSite(action.siteUrl, action.siteUrl);
      return action.response || null;

    case 'scroll_down':
      await scrollPage('down');
      return action.response || 'Scroll kar diya!';

    case 'scroll_up':
      await scrollPage('up');
      return action.response || 'Upar scroll kar diya!';

    case 'summarize_page':
    case 'read_page':
      return null; // handled separately by VoiceOverlay (needs AI)

    default:
      return null;
  }
}
