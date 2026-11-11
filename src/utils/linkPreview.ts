import { LinkPreviewMetadata } from '../types/puzzle';

// Cache for fetched link previews to prevent redundant requests
const previewCache = new Map<string, LinkPreviewMetadata>();

// Regular expression to identify URLs in text
// Matches https://, http://, and www. links
const URL_REGEX = /(?:https?:\/\/|www\.)[^\s<>"'()[\]{}]+(?:\.[^\s<>"'()[\]{}]+)+(?:\/[^\s<>"'()[\]{}]*)?/gi;

/**
 * Extracts all unique URLs from a text string.
 */
export function extractLinksFromText(text: string): string[] {
  if (!text) return [];
  const matches = text.match(URL_REGEX);
  if (!matches) return [];

  const uniqueLinks: string[] = [];
  for (let match of matches) {
    // Clean trailing punctuation that might get attached (like ., ;, !)
    match = match.replace(/[.,;:!?)]+$/, '');
    if (!uniqueLinks.includes(match)) {
      uniqueLinks.push(match);
    }
  }
  return uniqueLinks;
}

/**
 * Performs client-side heuristic safety checks.
 */
export function evaluateUrlSafety(rawUrl: string): {
  isSuspicious: boolean;
  warningReason?: string;
  riskLevel: 'safe' | 'caution' | 'danger';
} {
  try {
    const normalized = rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
      ? rawUrl
      : `https://${rawUrl}`;
    const urlObj = new URL(normalized);
    const hostname = urlObj.hostname.toLowerCase();
    const full = urlObj.toString().toLowerCase();

    // IP address test
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
      return {
        isSuspicious: true,
        warningReason: 'Direct IP address destination detected. Legitimate websites usually use domain names.',
        riskLevel: 'danger',
      };
    }

    // Insecure HTTP
    if (urlObj.protocol === 'http:') {
      return {
        isSuspicious: true,
        warningReason: 'Connection is unencrypted (HTTP). Sensitive data could be intercepted.',
        riskLevel: 'caution',
      };
    }

    // High risk keywords
    const suspiciousKeywords = [
      'login-verify',
      'account-update',
      'claim-free-crypto',
      'bonus-airdrop',
      'security-alert-confirm',
      'gift-card-win',
    ];
    for (const kw of suspiciousKeywords) {
      if (full.includes(kw)) {
        return {
          isSuspicious: true,
          warningReason: `Potential deceptive pattern detected matching '${kw}'.`,
          riskLevel: 'danger',
        };
      }
    }

    // Spam TLDs
    const highRiskTlds = ['.xyz', '.top', '.buzz', '.click', '.cam', '.tk', '.cf', '.gq', '.rest'];
    if (highRiskTlds.some(tld => hostname.endsWith(tld))) {
      return {
        isSuspicious: true,
        warningReason: 'Top-level domain has a high historical rate of abusive or deceptive content.',
        riskLevel: 'caution',
      };
    }

    return { isSuspicious: false, riskLevel: 'safe' };
  } catch {
    return {
      isSuspicious: true,
      warningReason: 'Malformed URL structure.',
      riskLevel: 'caution',
    };
  }
}

/**
 * Fallback generator when offline or server unreachable.
 */
function getOfflineFallback(url: string): LinkPreviewMetadata {
  let hostname = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0];
  const safety = evaluateUrlSafety(url);
  const normalized = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;

  let title = `${hostname} – Knowledge Resource`;
  let description = `Explore interactive insights, habits, and community wisdom on ${hostname}.`;
  let image = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80';

  if (hostname.includes('ted.com')) {
    title = 'TED: Ideas Worth Spreading';
    description = 'Watch thought-provoking talks on psychology, habit building, and mental models.';
    image = 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80';
  } else if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
    title = 'YouTube Video – Master Life Skills';
    description = 'Watch in-depth explanations on mindset, focus, and emotional mastery.';
    image = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';
  } else if (hostname.includes('wikipedia.org')) {
    title = 'Wikipedia – Verified Encyclopedia';
    description = 'Read researched overviews of cognitive biases, philosophy, and neuroscience.';
    image = 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80';
  } else if (hostname.includes('coursera') || hostname.includes('khanacademy')) {
    title = 'Online Academy – Master High Value Skills';
    description = 'Courses on financial literacy, leadership, and emotional intelligence.';
    image = 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=1200&q=80';
  }

  return {
    url: normalized,
    originalUrl: url,
    title,
    description,
    image,
    siteName: hostname,
    domain: hostname,
    favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
    isSecure: normalized.startsWith('https://'),
    isSuspicious: safety.isSuspicious,
    warningReason: safety.warningReason,
    riskLevel: safety.riskLevel,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Fetches preview for a single URL with caching and error resilience.
 */
export async function fetchLinkPreview(rawUrl: string): Promise<LinkPreviewMetadata> {
  const cleanUrl = rawUrl.trim();
  if (previewCache.has(cleanUrl)) {
    return previewCache.get(cleanUrl)!;
  }

  try {
    const response = await fetch('/api/link-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: cleanUrl }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.preview) {
        previewCache.set(cleanUrl, data.preview);
        return data.preview;
      }
    }
  } catch (err) {
    console.warn('Network link preview fetch failed, using fallback:', err);
  }

  // Fallback
  const fallback = getOfflineFallback(cleanUrl);
  previewCache.set(cleanUrl, fallback);
  return fallback;
}

/**
 * Batch fetches previews for a list of URLs.
 */
export async function fetchMultipleLinkPreviews(urls: string[]): Promise<LinkPreviewMetadata[]> {
  const promises = urls.map(url => fetchLinkPreview(url));
  return Promise.all(promises);
}
