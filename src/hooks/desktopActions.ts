/**
 * Orvixa Desktop Actions — Real Autonomous Browser Agent Engine (Bugatti Engine)
 * Translates natural voice intent into true DOM actions, script injection, and web app automation.
 */

declare const chrome: any;

const IS_EXTENSION = typeof chrome !== 'undefined' && !!chrome?.runtime?.sendMessage;

function bgMessage(msg: object): Promise<any> {
  return new Promise((resolve) => {
    if (!IS_EXTENSION) { resolve(null); return; }
    try {
      chrome.runtime.sendMessage(msg, (response: any) => {
        chrome.runtime.lastError; // consume error safely
        resolve(response);
      });
    } catch {
      resolve(null);
    }
  });
}

export async function openUrl(url: string): Promise<void> {
  if (IS_EXTENSION) {
    await bgMessage({ type: 'ORVIXA_OPEN_URL', url });
  } else {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 300);
  }
}

export async function getCurrentPageContent(): Promise<{ title: string; url: string; content: string }> {
  if (IS_EXTENSION) {
    const res = await bgMessage({ type: 'ORVIXA_GET_PAGE_CONTENT' });
    return res || { title: '', url: '', content: '' };
  }
  return {
    title: document.title,
    url: window.location.href,
    content: document.body?.innerText?.slice(0, 8000) || '',
  };
}

export async function scrollPage(direction: 'down' | 'up'): Promise<void> {
  if (IS_EXTENSION) {
    await bgMessage({ type: 'ORVIXA_SCROLL', direction });
  } else {
    window.scrollBy({ top: direction === 'down' ? 500 : -500, behavior: 'smooth' });
  }
}

export async function focusOrOpenSite(pattern: string, url: string): Promise<void> {
  if (IS_EXTENSION) {
    await bgMessage({ type: 'ORVIXA_FOCUS_TAB', pattern, fallbackUrl: url });
  } else {
    await openUrl(url);
  }
}

// ─────────────────────────────────────────────────────────────
// AUTONOMOUS AGENT DOM ACTION CALLS
// ─────────────────────────────────────────────────────────────
export async function autoPlayYouTubeVideo(songQuery: string): Promise<void> {
  if (IS_EXTENSION) {
    await bgMessage({ type: 'ORVIXA_AUTONOMOUS_YOUTUBE_PLAY', query: songQuery });
  } else {
    // Web fallback: search page
    await openUrl(`https://www.youtube.com/results?search_query=${encodeURIComponent(songQuery)}`);
  }
}

export async function autoClickElementByText(text: string): Promise<any> {
  if (IS_EXTENSION) {
    return await bgMessage({ type: 'ORVIXA_AUTO_CLICK_TEXT', text });
  }
  return { clicked: false };
}

export async function autoFillActiveInput(value: string): Promise<any> {
  if (IS_EXTENSION) {
    return await bgMessage({ type: 'ORVIXA_AUTO_FILL_INPUT', value });
  }
  return { filled: false };
}

// ─────────────────────────────────────────────────────────────
// WEBSITE DIRECTORY
// ─────────────────────────────────────────────────────────────
export const WEBSITES: Record<string, { url: string; searchUrl?: string; label: string }> = {
  youtube: { url: 'https://www.youtube.com', searchUrl: 'https://www.youtube.com/results?search_query=', label: 'YouTube' },
  spotify: { url: 'https://open.spotify.com', searchUrl: 'https://open.spotify.com/search/', label: 'Spotify' },
  whatsapp: { url: 'https://web.whatsapp.com', label: 'WhatsApp Web' },
  gmail: { url: 'https://mail.google.com', label: 'Gmail' },
  google: { url: 'https://www.google.com', searchUrl: 'https://www.google.com/search?q=', label: 'Google' },
  maps: { url: 'https://maps.google.com', searchUrl: 'https://www.google.com/maps/search/', label: 'Google Maps' },
  'google drive': { url: 'https://drive.google.com', label: 'Google Drive' },
  'google docs': { url: 'https://docs.google.com', label: 'Google Docs' },
  facebook: { url: 'https://www.facebook.com', label: 'Facebook' },
  instagram: { url: 'https://www.instagram.com', label: 'Instagram' },
  twitter: { url: 'https://www.twitter.com', label: 'Twitter/X' },
  'x.com': { url: 'https://x.com', label: 'X' },
  github: { url: 'https://www.github.com', searchUrl: 'https://github.com/search?q=', label: 'GitHub' },
  wikipedia: { url: 'https://www.wikipedia.org', searchUrl: 'https://en.wikipedia.org/wiki/Special:Search?search=', label: 'Wikipedia' },
  netflix: { url: 'https://www.netflix.com', label: 'Netflix' },
  amazon: { url: 'https://www.amazon.in', searchUrl: 'https://www.amazon.in/s?k=', label: 'Amazon' },
  flipkart: { url: 'https://www.flipkart.com', searchUrl: 'https://www.flipkart.com/search?q=', label: 'Flipkart' },
  'youtube music': { url: 'https://music.youtube.com', searchUrl: 'https://music.youtube.com/search?q=', label: 'YouTube Music' },
  chatgpt: { url: 'https://chat.openai.com', label: 'ChatGPT' },
  gemini: { url: 'https://gemini.google.com', label: 'Gemini' },
  linkedin: { url: 'https://www.linkedin.com', label: 'LinkedIn' },
  reddit: { url: 'https://www.reddit.com', searchUrl: 'https://www.reddit.com/search/?q=', label: 'Reddit' },
  stackoverflow: { url: 'https://stackoverflow.com', searchUrl: 'https://stackoverflow.com/search?q=', label: 'Stack Overflow' },
};

// ─────────────────────────────────────────────────────────────
// EXTREME ADVANCED ACTION PARSER
// ─────────────────────────────────────────────────────────────
export type ActionType =
  | 'open_site' | 'search_on_site' | 'play_on_youtube' | 'play_on_spotify'
  | 'whatsapp_msg' | 'email_compose' | 'maps_search'
  | 'google_search' | 'scroll_down' | 'scroll_up'
  | 'click_text' | 'fill_input'
  | 'summarize_page' | 'read_page' | 'close_voice' | 'ai_chat';

export interface VoiceAction {
  type: ActionType;
  site?: string;
  siteUrl?: string;
  query?: string;
  response?: string;
}

export function parseVoiceCommand(text: string): VoiceAction {
  const t = text.toLowerCase().trim();

  // ── 1. CLOSE ──────────────────────────────────────────────
  if (/\b(close|band karo|band kr|exit|bye|goodbye|stop|chup|rukja)\b/.test(t)) {
    return { type: 'close_voice' };
  }

  // ── 2. DOM CLICK BY TEXT ("click on login", "click search") ───────
  const clickMatch = t.match(/(?:click|press|tap)\s+(?:on|the)?\s*(.+)/);
  if (clickMatch && !t.includes('youtube') && !t.includes('spotify')) {
    const target = clickMatch[1].trim();
    return {
      type: 'click_text',
      query: target,
      response: `Clicking "${target}" on active page!`,
    };
  }

  // ── 3. DOM INPUT FILL ("fill hello world", "type hello") ──────────
  const fillMatch = t.match(/(?:fill|type|write|input)\s+(.+)/);
  if (fillMatch && !t.includes('whatsapp') && !t.includes('email') && !t.includes('search')) {
    const value = fillMatch[1].trim();
    return {
      type: 'fill_input',
      query: value,
      response: `Typing "${value}" into active field!`,
    };
  }

  // ── 4. SCROLL CONTROL ─────────────────────────────────────
  if (/\b(scroll down|neeche jao|aage jao|neeche scroll)\b/.test(t)) {
    return { type: 'scroll_down', response: 'Scrolling down!' };
  }
  if (/\b(scroll up|upar jao|wapas jao|upar scroll)\b/.test(t)) {
    return { type: 'scroll_up', response: 'Scrolling up!' };
  }

  // ── 5. PAGE SUMMARIZATION ──────────────────────────────────
  if (/\b(is page ko summarize karo|summarize this|is page ki summary|page padho|read this page|explain this page)\b/.test(t)) {
    return { type: 'summarize_page', response: 'Analyzing page content...' };
  }

  // ── 6. WHATSAPP DIRECT MESSAGE ────────────────────────────
  const waMatch = t.match(/whatsapp\s+(?:pe|par|me|mein)\s+(?:message|msg)\s+(?:bhejo|karo|bhej)\s+(.+)/);
  if (waMatch) {
    const msg = waMatch[1].trim();
    return {
      type: 'whatsapp_msg',
      siteUrl: `https://web.whatsapp.com/send?text=${encodeURIComponent(msg)}`,
      query: msg,
      response: `WhatsApp message compose kar raha hoon: "${msg}"`,
    };
  }

  // ── 7. EMAIL COMPOSE ──────────────────────────────────────
  const mailMatch = t.match(/(?:email|mail)\s+(?:bhejo|compose karo|karo|bhej)\s+(.+)/);
  if (mailMatch) {
    const body = mailMatch[1].trim();
    return {
      type: 'email_compose',
      siteUrl: `https://mail.google.com/mail/?view=cm&fs=1&body=${encodeURIComponent(body)}`,
      query: body,
      response: `Gmail draft compose kar raha hoon: "${body}"`,
    };
  }

  // ── 8. SPOTIFY PLAY / SEARCH ──────────────────────────────
  const spotifyMatch = t.match(/spotify\s+(?:pe|par|me|mein)\s+(.+?)(?:\s+(?:play|bajao|chalao|search|laga))?$/);
  if (spotifyMatch) {
    const query = spotifyMatch[1].replace(/\b(play|bajao|chalao|search|laga)\b/g, '').trim();
    if (query) {
      return {
        type: 'play_on_spotify',
        siteUrl: `https://open.spotify.com/search/${encodeURIComponent(query)}`,
        query,
        response: `"${query}" Spotify par search aur play kar raha hoon!`,
      };
    }
  }

  // ── 9. GOOGLE MAPS SEARCH ─────────────────────────────────
  const mapsMatch = t.match(/(?:maps|map|location)\s+(?:pe|par|me|mein)?\s*(.+?)\s*(?:dhundo|dhoondo|dikhao|search)?$/);
  if (mapsMatch && (t.includes('map') || t.includes('location'))) {
    const place = mapsMatch[1].replace(/\b(dhundo|dhoondo|dikhao|search)\b/g, '').trim();
    if (place) {
      return {
        type: 'maps_search',
        siteUrl: `https://www.google.com/maps/search/${encodeURIComponent(place)}`,
        query: place,
        response: `Google Maps par "${place}" dhoondh raha hoon!`,
      };
    }
  }

  // ── 10. YOUTUBE AUTONOMOUS VIDEO PLAY ──────────────────────
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
          response: `"${song}" YouTube par search aur auto-play kar raha hoon!`,
        };
      }
    }
  }

  // Generic "gaana bajao"
  if (/\b(gaana|song|music|gana|playlist)\b/.test(t) && /\b(baja|chala|suna|play|laga|gao)\b/.test(t)) {
    return {
      type: 'play_on_youtube',
      query: 'hindi songs 2024',
      response: 'Aapke liye Hindi songs auto-play kar raha hoon!',
    };
  }

  // ── 11. SEARCH ON SPECIFIC SITES ───────────────────────────
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

  // ── 12. OPEN WEBSITES ────────────────────────────────────
  for (const [siteName, siteInfo] of Object.entries(WEBSITES)) {
    if (t.includes(siteName) && /\b(open|kholo|jao|visit|chalao|pe jao|par jao|launch|start)\b/.test(t)) {
      return {
        type: 'open_site',
        site: siteInfo.label,
        siteUrl: siteInfo.url,
        response: `${siteInfo.label} khol raha hoon!`,
      };
    }
  }

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

  // ── 13. GOOGLE SEARCH ─────────────────────────────────────
  const googleSearchPatterns = [
    /(?:google\s+(?:pe|par|mein|me)\s+|google\s+karo\s+|search\s+for\s+|search\s+)(.+)/,
    /(.+?)\s+(?:google\s+(?:pe|par)|google\s+karo|search\s+karo)\b/,
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

export async function executeVoiceAction(action: VoiceAction): Promise<string | null> {
  switch (action.type) {
    case 'play_on_youtube':
      if (action.query) {
        await autoPlayYouTubeVideo(action.query);
      }
      return action.response || null;

    case 'click_text':
      if (action.query) {
        await autoClickElementByText(action.query);
      }
      return action.response || null;

    case 'fill_input':
      if (action.query) {
        await autoFillActiveInput(action.query);
      }
      return action.response || null;

    case 'open_site':
    case 'play_on_spotify':
    case 'whatsapp_msg':
    case 'email_compose':
    case 'maps_search':
    case 'search_on_site':
    case 'google_search':
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
      return null;

    default:
      return null;
  }
}
