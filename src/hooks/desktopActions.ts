/**
 * Orvixa Desktop Actions — Real Autonomous Browser & Native App Automation Engine
 * Real World Edge-Case Aware Intent Parsing & Protocol Execution.
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

// ─────────────────────────────────────────────────────────────
// NATIVE APP + WEB FALLBACK LAUNCHER
// ─────────────────────────────────────────────────────────────
export async function openNativeAppOrWeb(nativeUri: string, webFallbackUrl: string): Promise<void> {
  try {
    const link = document.createElement('a');
    link.href = nativeUri;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => document.body.removeChild(link), 400);
  } catch {
    // ignore
  }

  // Fallback to web app tab
  setTimeout(async () => {
    await openUrl(webFallbackUrl);
  }, 350);
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
// MEDIA CONTROL AUTOMATION (Next, Previous, Pause, Play)
// ─────────────────────────────────────────────────────────────
export function triggerMediaControl(action: 'next' | 'previous' | 'pause' | 'play'): void {
  if ('mediaSession' in navigator) {
    try {
      if (action === 'next') navigator.mediaSession.metadata = null;
      const keyMap: Record<string, string> = {
        next: 'MediaTrackNext',
        previous: 'MediaTrackPrevious',
        pause: 'MediaPlayPause',
        play: 'MediaPlayPause',
      };
      window.dispatchEvent(new KeyboardEvent('keydown', { key: keyMap[action] || 'MediaPlayPause', bubbles: true }));
    } catch {
      // ignore
    }
  }
}

// ─────────────────────────────────────────────────────────────
// AUTONOMOUS AGENT DOM ACTION CALLS
// ─────────────────────────────────────────────────────────────
export async function autoPlayYouTubeVideo(songQuery: string): Promise<void> {
  if (IS_EXTENSION) {
    await bgMessage({ type: 'ORVIXA_AUTONOMOUS_YOUTUBE_PLAY', query: songQuery });
  } else {
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
export const WEBSITES: Record<string, { url: string; searchUrl?: string; nativeUri?: string; label: string }> = {
  youtube: { url: 'https://www.youtube.com', searchUrl: 'https://www.youtube.com/results?search_query=', label: 'YouTube' },
  spotify: { url: 'https://open.spotify.com', searchUrl: 'https://open.spotify.com/search/', nativeUri: 'spotify:search:', label: 'Spotify' },
  whatsapp: { url: 'https://web.whatsapp.com', nativeUri: 'whatsapp://', label: 'WhatsApp' },
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
  zoom: { url: 'https://zoom.us', nativeUri: 'zoommtg://', label: 'Zoom' },
  notion: { url: 'https://www.notion.so', nativeUri: 'notion://', label: 'Notion' },
};

// ─────────────────────────────────────────────────────────────
// EXTREME ADVANCED ACTION PARSER (REAL WORLD EDGE CASE AWARE)
// ─────────────────────────────────────────────────────────────
export type ActionType =
  | 'open_site' | 'search_on_site' | 'play_on_youtube' | 'play_on_spotify'
  | 'media_next' | 'media_previous' | 'media_pause' | 'media_play'
  | 'whatsapp_msg' | 'email_compose' | 'maps_search'
  | 'google_search' | 'scroll_down' | 'scroll_up'
  | 'click_text' | 'fill_input'
  | 'summarize_page' | 'read_page' | 'close_voice' | 'ai_chat';

export interface VoiceAction {
  type: ActionType;
  site?: string;
  siteUrl?: string;
  nativeUri?: string;
  query?: string;
  recipient?: string;
  message?: string;
  response?: string;
}

export function parseVoiceCommand(text: string): VoiceAction {
  const t = text.toLowerCase().trim();

  // ── 1. CLOSE ──────────────────────────────────────────────
  if (/\b(close|band karo|band kr|exit|bye|goodbye|stop|chup|rukja)\b/.test(t) && !t.includes('song') && !t.includes('music')) {
    return { type: 'close_voice' };
  }

  // ── 2. MEDIA CONTROLS (Next, Prev, Pause, Resume) ─────────
  if (/\b(next song|song change|change song|aagla song|aagla gaana|next track|skip song|skip track)\b/.test(t)) {
    return { type: 'media_next', response: 'Playing next song!' };
  }
  if (/\b(previous song|purana song|peechhe karo|last song|previous track)\b/.test(t)) {
    return { type: 'media_previous', response: 'Playing previous song!' };
  }
  if (/\b(pause song|pause music|gaana roko|music roko|pause video)\b/.test(t)) {
    return { type: 'media_pause', response: 'Music paused!' };
  }
  if (/\b(resume song|resume music|gaana chalao|music chalao|play music)\b/.test(t) && !t.includes('spotify') && !t.includes('youtube')) {
    return { type: 'media_play', response: 'Music playing!' };
  }

  // ── 3. REAL-WORLD EDGE CASE: WHATSAPP MESSAGING ───────────
  // Handles:
  // "WhatsApp pe 9876543210 ko message karo Hello" (Phone number)
  // "WhatsApp pe Rahul ko message karo Hello meeting at 5" (Contact + Message)
  // "Rahul ko WhatsApp message bhejo Hi" (Contact + Message)
  if (t.includes('whatsapp')) {
    // Phone number regex
    const phoneMatch = t.match(/\b(\+?\d{10,12})\b/);
    const phone = phoneMatch ? phoneMatch[1] : null;

    // Recipient name regex ("Rahul ko", "to Rahul")
    const recipientMatch = t.match(/(?:to|ko)\s+([a-zA-Z0-9_]+)\s+(?:message|msg|bhejo|karo)/i)
      || t.match(/whatsapp\s+(?:pe|par|me|mein)\s+([a-zA-Z0-9_]+)\s+(?:ko|message|msg)/i);
    const recipient = phone || (recipientMatch ? recipientMatch[1] : null);

    // Extract message body text
    let msgBody = t
      .replace(/whatsapp|pe|par|me|mein|message|msg|bhejo|karo|bhej|send|to|ko/gi, '')
      .replace(recipient || '', '')
      .trim();

    if (!msgBody && !recipient) {
      // Missing info: route to AI chat to ask user for contact & text!
      return { type: 'ai_chat', query: text };
    }

    if (phone) {
      const formattedPhone = phone.startsWith('91') ? phone : `91${phone.replace(/^\+/, '')}`;
      return {
        type: 'whatsapp_msg',
        nativeUri: `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(msgBody || 'Hello')}`,
        siteUrl: `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(msgBody || 'Hello')}`,
        recipient: formattedPhone,
        message: msgBody || 'Hello',
        response: `WhatsApp message sending to ${formattedPhone}: "${msgBody || 'Hello'}"`,
      };
    } else {
      const contactName = recipient || 'Contact';
      return {
        type: 'whatsapp_msg',
        nativeUri: `whatsapp://`,
        siteUrl: `https://web.whatsapp.com/send?text=${encodeURIComponent(msgBody || 'Hello')}`,
        recipient: contactName,
        message: msgBody || 'Hello',
        response: `Opening WhatsApp for ${contactName} with message: "${msgBody || 'Hello'}"`,
      };
    }
  }

  // ── 4. REAL-WORLD EDGE CASE: EMAIL COMPOSE ─────────────────
  // Handles:
  // "Rahul ko email bhejo regarding Project Report message Hello"
  // "email compose karo Project status ready hai"
  if (t.includes('email') || t.includes('gmail') || t.includes('mail')) {
    const emailMatch = t.match(/\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/);
    const targetEmail = emailMatch ? emailMatch[1] : '';

    const subjectMatch = t.match(/(?:regarding|subject|about)\s+(.+?)(?:\s+(?:message|body|text)|$)/i);
    const subject = subjectMatch ? subjectMatch[1].trim() : 'Update';

    let bodyText = t
      .replace(/email|gmail|mail|bhejo|compose|karo|bhej|send|to|ko|regarding|subject|about/gi, '')
      .replace(targetEmail, '')
      .replace(subject, '')
      .trim();

    if (!bodyText) bodyText = 'Hello, please review the update.';

    return {
      type: 'email_compose',
      nativeUri: `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`,
      siteUrl: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(targetEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`,
      query: bodyText,
      response: targetEmail
        ? `Drafting email to ${targetEmail}: "${subject}"`
        : `Drafting Gmail: "${bodyText.slice(0, 30)}..."`,
    };
  }

  // ── 5. REAL-WORLD EDGE CASE: SPOTIFY TRACK & ARTIST ───────
  // Handles: "play All Black on spotify", "spotify pe All Black song bajao"
  if (t.includes('spotify')) {
    const cleanSong = t
      .replace(/spotify|play|song|on|pe|par|me|mein|bajao|chalao|laga|search|karo/gi, '')
      .trim();

    if (!cleanSong) {
      // If user just said "spotify pe song play karo" without name, ask AI / user
      return { type: 'ai_chat', query: text };
    }

    return {
      type: 'play_on_spotify',
      nativeUri: `spotify:search:${encodeURIComponent(cleanSong)}`,
      siteUrl: `https://open.spotify.com/search/${encodeURIComponent(cleanSong)}`,
      query: cleanSong,
      response: `Playing "${cleanSong}" on Spotify!`,
    };
  }

  // ── 6. DOM CLICK BY TEXT ──────────────────────────────────
  const clickMatch = t.match(/(?:click|press|tap)\s+(?:on|the)?\s*(.+)/i);
  if (clickMatch && !t.includes('youtube') && !t.includes('song')) {
    const target = clickMatch[1].trim();
    return {
      type: 'click_text',
      query: target,
      response: `Clicking "${target}" on active page!`,
    };
  }

  // ── 7. DOM INPUT FILL ─────────────────────────────────────
  const fillMatch = t.match(/(?:fill|type|write|input)\s+(.+)/i);
  if (fillMatch && !t.includes('search')) {
    const value = fillMatch[1].trim();
    return {
      type: 'fill_input',
      query: value,
      response: `Typing "${value}" into active field!`,
    };
  }

  // ── 8. SCROLL CONTROL ─────────────────────────────────────
  if (/\b(scroll down|neeche jao|aage jao|neeche scroll)\b/.test(t)) {
    return { type: 'scroll_down', response: 'Scrolling down!' };
  }
  if (/\b(scroll up|upar jao|wapas jao|upar scroll)\b/.test(t)) {
    return { type: 'scroll_up', response: 'Scrolling up!' };
  }

  // ── 9. PAGE SUMMARIZATION ──────────────────────────────────
  if (/\b(is page ko summarize karo|summarize this|is page ki summary|page padho|read this page|explain this page)\b/.test(t)) {
    return { type: 'summarize_page', response: 'Analyzing page content...' };
  }

  // ── 10. GOOGLE MAPS SEARCH ────────────────────────────────
  const mapsMatch = t.match(/(?:maps|map|location)\s+(?:pe|par|me|mein)?\s*(.+?)\s*(?:dhundo|dhoondo|dikhao|search)?$/i);
  if (mapsMatch && (t.includes('map') || t.includes('location'))) {
    const place = mapsMatch[1].replace(/\b(dhundo|dhoondo|dikhao|search)\b/g, '').trim();
    if (place) {
      return {
        type: 'maps_search',
        siteUrl: `https://www.google.com/maps/search/${encodeURIComponent(place)}`,
        query: place,
        response: `Searching Google Maps for "${place}"!`,
      };
    }
  }

  // ── 11. YOUTUBE AUTONOMOUS VIDEO PLAY ─────────────────────
  const playPatterns = [
    /(?:play|baja(?:o)?|suna(?:o)?|chala(?:o)?|laga(?:o)?|gao?)\s+(.+)/i,
    /(.+?)\s+(?:play karo|bajao|sunao|chalao|lagao|gaao?)\b/i,
    /(?:mujhe|muje|hame)\s+(.+?)\s+(?:sunao|bajao|sunana)\b/i,
    /(?:youtube\s+(?:pe|par|mein)\s+)(.+)/i,
  ];
  for (const p of playPatterns) {
    const m = t.match(p);
    if (m) {
      const raw = (m[1] || m[2] || '').trim();
      const song = raw.replace(/\b(youtube|yt|pe|par|mein|ko|bhi|ek|koi|please|plz)\b/gi, '').trim();
      if (song.length > 1) {
        return {
          type: 'play_on_youtube',
          query: song,
          response: `Playing "${song}" on YouTube!`,
        };
      }
    }
  }

  // Generic "gaana bajao"
  if (/\b(gaana|song|music|gana|playlist)\b/.test(t) && /\b(baja|chala|suna|play|laga|gao)\b/.test(t)) {
    return {
      type: 'play_on_youtube',
      query: 'hindi songs 2024',
      response: 'Playing Hindi songs for you!',
    };
  }

  // ── 12. SEARCH ON SPECIFIC SITES ───────────────────────────
  for (const [siteName, siteInfo] of Object.entries(WEBSITES)) {
    if (t.includes(siteName) && siteInfo.searchUrl) {
      const searchRegex = new RegExp(
        `(?:${siteName}\\s+(?:pe|par|mein|me)\\s+)(.+?)(?:\\s+(?:search|dhundo|dhoondo|dikhaao))?$|` +
        `(.+?)\\s+(?:${siteName}\\s+(?:pe|par|mein)|${siteName}\\s+(?:search|dhundo))`,
        'i'
      );
      const m = t.match(searchRegex);
      if (m) {
        const query = (m[1] || m[2] || '').replace(new RegExp(`\\b(${siteName}|pe|par|mein|me|search|dhundo|karo)\\b`, 'gi'), '').trim();
        if (query.length > 1) {
          return {
            type: 'search_on_site',
            site: siteInfo.label,
            siteUrl: siteInfo.searchUrl + encodeURIComponent(query),
            query,
            response: `Searching ${siteInfo.label} for "${query}"!`,
          };
        }
      }
    }
  }

  // ── 13. OPEN WEBSITES & APPS ─────────────────────────────
  for (const [siteName, siteInfo] of Object.entries(WEBSITES)) {
    if (t.includes(siteName) && /\b(open|kholo|jao|visit|chalao|pe jao|par jao|launch|start)\b/.test(t)) {
      return {
        type: 'open_site',
        site: siteInfo.label,
        siteUrl: siteInfo.url,
        nativeUri: siteInfo.nativeUri,
        response: `Opening ${siteInfo.label}!`,
      };
    }
  }

  for (const [siteName, siteInfo] of Object.entries(WEBSITES)) {
    if (t === siteName || t === `open ${siteName}` || t === `${siteName} kholo` || t === `${siteName} open`) {
      return {
        type: 'open_site',
        site: siteInfo.label,
        siteUrl: siteInfo.url,
        nativeUri: siteInfo.nativeUri,
        response: `Opening ${siteInfo.label}!`,
      };
    }
  }

  // ── 14. GOOGLE SEARCH ─────────────────────────────────────
  const googleSearchPatterns = [
    /(?:google\s+(?:pe|par|mein|me)\s+|google\s+karo\s+|search\s+for\s+|search\s+)(.+)/i,
    /(.+?)\s+(?:google\s+(?:pe|par)|google\s+karo|search\s+karo)\b/i,
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
          response: `Searching Google for "${query}"!`,
        };
      }
    }
  }

  return { type: 'ai_chat', query: text };
}

export async function executeVoiceAction(action: VoiceAction): Promise<string | null> {
  switch (action.type) {
    case 'media_next':
      triggerMediaControl('next');
      return action.response || 'Next song!';

    case 'media_previous':
      triggerMediaControl('previous');
      return action.response || 'Previous song!';

    case 'media_pause':
      triggerMediaControl('pause');
      return action.response || 'Music paused!';

    case 'media_play':
      triggerMediaControl('play');
      return action.response || 'Music playing!';

    case 'play_on_spotify':
      if (action.nativeUri && action.siteUrl) {
        await openNativeAppOrWeb(action.nativeUri, action.siteUrl);
      } else if (action.siteUrl) {
        await focusOrOpenSite(action.siteUrl, action.siteUrl);
      }
      return action.response || null;

    case 'play_on_youtube':
      if (action.query) {
        await autoPlayYouTubeVideo(action.query);
      }
      return action.response || null;

    case 'whatsapp_msg':
    case 'email_compose':
      if (action.nativeUri && action.siteUrl) {
        await openNativeAppOrWeb(action.nativeUri, action.siteUrl);
      } else if (action.siteUrl) {
        await focusOrOpenSite(action.siteUrl, action.siteUrl);
      }
      return action.response || null;

    case 'click_text':
      if (action.query) {
        const res = await autoClickElementByText(action.query);
        if (res && res.clicked === false) {
          return `Active page par "${action.query}" button nahi mila.`;
        }
      }
      return action.response || null;

    case 'fill_input':
      if (action.query) {
        const res = await autoFillActiveInput(action.query);
        if (res && res.filled === false) {
          return `Active page par input field nahi mila.`;
        }
      }
      return action.response || null;

    case 'open_site':
    case 'maps_search':
    case 'search_on_site':
    case 'google_search':
      if (action.nativeUri && action.siteUrl) {
        await openNativeAppOrWeb(action.nativeUri, action.siteUrl);
      } else if (action.siteUrl) {
        await focusOrOpenSite(action.siteUrl, action.siteUrl);
      }
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
