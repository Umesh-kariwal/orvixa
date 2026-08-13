/**
 * Orvixa Automation Engine — Zero-Friction Web & Desktop App Automation
 * Native OS Protocol Launchers (Spotify, WhatsApp, Email), Hardware Media Keys,
 * and Instant Search & Navigation Agents without any manual extension setup.
 */

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

  setTimeout(async () => {
    await openUrl(webFallbackUrl);
  }, 350);
}

export async function openUrl(url: string): Promise<void> {
  try {
    const win = window.open(url, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = url;
    }
  } catch {
    window.location.href = url;
  }
}

export async function getCurrentPageContent(): Promise<{ title: string; url: string; content: string }> {
  return {
    title: document.title,
    url: window.location.href,
    content: document.body?.innerText?.slice(0, 8000) || '',
  };
}

export async function scrollPage(direction: 'down' | 'up'): Promise<void> {
  window.scrollBy({ top: direction === 'down' ? 500 : -500, behavior: 'smooth' });
}

export async function focusOrOpenSite(_pattern: string, url: string): Promise<void> {
  await openUrl(url);
}

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

export async function autoPlayYouTubeVideo(songQuery: string): Promise<void> {
  const cleanQ = songQuery
    .replace(/\b(youtube|yt|open|kholo|aur|pe|par|me|mein|search|dhundo|dhoondo|karo|bhejo|bhej|play|bajao|chalao|sunao|lagao|gao|gaao|song|gaana|gana|music|video|i|want|to|listen|for|find|look)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim() || songQuery.trim();

  if (!cleanQ) return;

  // 1. Try Invidious Public Video ID Resolver API
  try {
    const res = await fetch(`https://inv.tux.pizza/api/v1/search?q=${encodeURIComponent(cleanQ)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.videoId) {
        // Direct YouTube Watch Video Page with Autoplay enabled
        await openUrl(`https://www.youtube.com/watch?v=${data[0].videoId}&autoplay=1`);
        return;
      }
    }
  } catch {
    // fallback
  }

  // 2. Try Piped Music API Resolver
  try {
    const res2 = await fetch(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(cleanQ)}&filter=music_songs`);
    if (res2.ok) {
      const data2 = await res2.json();
      const item = data2?.items?.[0];
      if (item && item.url) {
        const vidId = item.url.replace('/watch?v=', '');
        await openUrl(`https://www.youtube.com/watch?v=${vidId}&autoplay=1`);
        return;
      }
    }
  } catch {
    // fallback
  }

  // 3. Fallback: Search URL with Video Filter
  await openUrl(`https://www.youtube.com/results?search_query=${encodeURIComponent(cleanQ)}&sp=EgIQAQ%253D%253D`);
}

export async function autoClickElementByText(text: string): Promise<any> {
  const lower = text.toLowerCase();
  const clickable = Array.from(document.querySelectorAll('button, a, input[type="submit"], [role="button"]'));
  const match = clickable.find(el => (el as HTMLElement).innerText?.toLowerCase().includes(lower)) as HTMLElement;
  if (match) {
    match.click();
    return { clicked: true, text: match.innerText };
  }
  return { clicked: false };
}

export async function autoFillActiveInput(value: string): Promise<any> {
  const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]), textarea, [contenteditable="true"]')) as HTMLElement[];
  if (inputs.length > 0) {
    const target = inputs[0];
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      (target as HTMLInputElement).value = value;
      target.dispatchEvent(new Event('input', { bubbles: true }));
      target.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      target.innerText = value;
      target.dispatchEvent(new Event('input', { bubbles: true }));
    }
    return { filled: true };
  }
  return { filled: false };
}

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

  // ── 3. YOUTUBE SEARCH & PLAY ──────────────────────────────
  if (t.includes('youtube') || /\b(play|bajao|chalao|sunao|lagao|gao)\b/.test(t)) {
    const isYtExplicit = t.includes('youtube') || t.includes('yt');
    const isPlayCmd = /\b(play|bajao|chalao|sunao|lagao|gao|search|dhundo)\b/.test(t);

    if (isYtExplicit || isPlayCmd) {
      let query = t
        .replace(/\b(youtube|yt|open|kholo|aur|pe|par|me|mein|search|dhundo|dhoondo|karo|bhejo|bhej|play|bajao|chalao|sunao|lagao|gao|gaao|song|gaana|gana|music|video|i|want|to|listen|for|find|look)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!query || t === 'youtube' || t === 'open youtube' || t === 'youtube kholo' || t === 'youtube open') {
        if (!isPlayCmd && isYtExplicit) {
          return {
            type: 'open_site',
            site: 'YouTube',
            siteUrl: 'https://www.youtube.com',
            response: 'Opening YouTube!',
          };
        }
        query = 'best hindi songs 2024';
      }

      return {
        type: 'play_on_youtube',
        query,
        siteUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`,
        response: `Playing "${query}" on YouTube!`,
      };
    }
  }

  // ── 4. WHATSAPP MESSAGING ─────────────────────────────────
  if (t.includes('whatsapp')) {
    const phoneMatch = t.match(/\b(\+?\d{10,12})\b/);
    const phone = phoneMatch ? phoneMatch[1] : null;

    const recipientMatch = t.match(/(?:to|ko)\s+([a-zA-Z0-9_]+)\s+(?:message|msg|bhejo|karo)/i)
      || t.match(/whatsapp\s+(?:pe|par|me|mein)\s+([a-zA-Z0-9_]+)\s+(?:ko|message|msg)/i);
    const recipient = phone || (recipientMatch ? recipientMatch[1] : null);

    let msgBody = t
      .replace(/whatsapp|pe|par|me|mein|message|msg|bhejo|karo|bhej|send|to|ko/gi, '')
      .replace(recipient || '', '')
      .trim();

    if (!msgBody && !recipient) {
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

  // ── 5. EMAIL COMPOSE ──────────────────────────────────────
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

  // ── 6. SPOTIFY PLAY ───────────────────────────────────────
  if (t.includes('spotify')) {
    const cleanSong = t
      .replace(/spotify|play|song|on|pe|par|me|mein|bajao|chalao|laga|search|karo/gi, '')
      .trim();

    if (!cleanSong) {
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

  // ── 7. DOM CLICK BY TEXT ──────────────────────────────────
  const clickMatch = t.match(/(?:click|press|tap)\s+(?:on|the)?\s*(.+)/i);
  if (clickMatch && !t.includes('youtube') && !t.includes('song')) {
    const target = clickMatch[1].trim();
    return {
      type: 'click_text',
      query: target,
      response: `Clicking "${target}" on active page!`,
    };
  }

  // ── 8. DOM INPUT FILL ─────────────────────────────────────
  const fillMatch = t.match(/(?:fill|type|write|input)\s+(.+)/i);
  if (fillMatch && !t.includes('search')) {
    const value = fillMatch[1].trim();
    return {
      type: 'fill_input',
      query: value,
      response: `Typing "${value}" into active field!`,
    };
  }

  // ── 9. SCROLL CONTROL ─────────────────────────────────────
  if (/\b(scroll down|neeche jao|aage jao|neeche scroll)\b/.test(t)) {
    return { type: 'scroll_down', response: 'Scrolling down!' };
  }
  if (/\b(scroll up|upar jao|wapas jao|upar scroll)\b/.test(t)) {
    return { type: 'scroll_up', response: 'Scrolling up!' };
  }

  // ── 10. PAGE SUMMARIZATION ─────────────────────────────────
  if (/\b(is page ko summarize karo|summarize this|is page ki summary|page padho|read this page|explain this page)\b/.test(t)) {
    return { type: 'summarize_page', response: 'Analyzing page content...' };
  }

  // ── 11. GOOGLE MAPS SEARCH ────────────────────────────────
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

  // ── 12. SEARCH ON OTHER SPECIFIC SITES (NON-YOUTUBE) ──────
  for (const [siteName, siteInfo] of Object.entries(WEBSITES)) {
    if (siteName !== 'youtube' && t.includes(siteName) && siteInfo.searchUrl) {
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

  // ── 13. OPEN OTHER WEBSITES & APPS ────────────────────────
  for (const [siteName, siteInfo] of Object.entries(WEBSITES)) {
    if (siteName !== 'youtube' && t.includes(siteName) && /\b(open|kholo|jao|visit|chalao|pe jao|par jao|launch|start)\b/.test(t)) {
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
    if (siteName !== 'youtube' && (t === siteName || t === `open ${siteName}` || t === `${siteName} kholo` || t === `${siteName} open`)) {
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
        await openUrl(action.siteUrl);
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
        await openUrl(action.siteUrl);
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
        await openUrl(action.siteUrl);
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
