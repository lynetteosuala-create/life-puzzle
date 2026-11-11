import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Suspicious URL detection patterns
const SUSPICIOUS_PATTERNS = [
  /login-verify/i,
  /secure-update/i,
  /free-crypto/i,
  /claim-gift/i,
  /bank-account-security/i,
  /wallet-connect-airdrop/i,
  /urgent-action-required/i,
  /password-reset-confirm/i,
  /bonus-reward-claim/i,
];

const SUSPICIOUS_TLDS = ['.xyz', '.top', '.buzz', '.fit', '.click', '.cam', '.tk', '.ml', '.ga', '.cf', '.gq', '.rest'];

interface LinkPreviewData {
  url: string;
  originalUrl: string;
  title: string;
  description: string;
  image?: string;
  siteName: string;
  domain: string;
  favicon?: string;
  isSecure: boolean;
  isSuspicious: boolean;
  warningReason?: string;
  riskLevel: 'safe' | 'caution' | 'danger';
  fetchedAt: string;
}

function analyzeLinkSafety(targetUrl: URL): { isSuspicious: boolean; warningReason?: string; riskLevel: 'safe' | 'caution' | 'danger' } {
  const hostname = targetUrl.hostname.toLowerCase();
  const fullUrl = targetUrl.toString().toLowerCase();

  // 1. IP address hostname check
  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipPattern.test(hostname)) {
    return {
      isSuspicious: true,
      warningReason: 'Link points directly to an IP address instead of a domain name, commonly used in phishing.',
      riskLevel: 'danger',
    };
  }

  // 2. Insecure protocol
  if (targetUrl.protocol === 'http:') {
    return {
      isSuspicious: true,
      warningReason: 'Unencrypted connection (HTTP). Credentials and personal info may not be secure.',
      riskLevel: 'caution',
    };
  }

  // 3. Phishing keywords
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(fullUrl)) {
      return {
        isSuspicious: true,
        warningReason: 'Suspicious keywords detected mimicking account or security verification.',
        riskLevel: 'danger',
      };
    }
  }

  // 4. Suspicious TLD check with unusual subdomains
  const hasSuspiciousTld = SUSPICIOUS_TLDS.some(tld => hostname.endsWith(tld));
  if (hasSuspiciousTld) {
    return {
      isSuspicious: true,
      warningReason: `High-risk top level domain (${hostname.slice(hostname.lastIndexOf('.'))}) frequently associated with spam or scam landing pages.`,
      riskLevel: 'caution',
    };
  }

  // 5. Excessive subdomains
  const parts = hostname.split('.');
  if (parts.length > 4) {
    return {
      isSuspicious: true,
      warningReason: 'Abnormally deep subdomain structure, often used to disguise deceptive websites.',
      riskLevel: 'caution',
    };
  }

  return { isSuspicious: false, riskLevel: 'safe' };
}

// Fallback metadata for known websites or offline/blocked scenarios
function getKnownDomainFallback(targetUrl: URL): Partial<LinkPreviewData> {
  const hostname = targetUrl.hostname.toLowerCase();
  
  if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
    return {
      title: 'YouTube Video – Inspiring Life Insights & Talks',
      description: 'Watch deep dives into personal mastery, psychology, and productivity on YouTube.',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      siteName: 'YouTube',
      favicon: 'https://www.youtube.com/s/desktop/1f0e4b7b/img/favicon.ico',
    };
  }
  if (hostname.includes('ted.com')) {
    return {
      title: 'TED: Ideas Worth Spreading',
      description: 'Riveting talks by remarkable people, free to the world. Psychology, habits, and human potential.',
      image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
      siteName: 'TED Talks',
      favicon: 'https://www.ted.com/favicon.ico',
    };
  }
  if (hostname.includes('medium.com')) {
    return {
      title: 'Medium – Where Good Ideas Find You',
      description: 'Read stories, thinking, and expertise from writers on mindsets, life philosophy, and growth.',
      image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80',
      siteName: 'Medium',
      favicon: 'https://medium.com/favicon.ico',
    };
  }
  if (hostname.includes('wikipedia.org')) {
    return {
      title: 'Wikipedia – The Free Encyclopedia',
      description: 'Explore research, cognitive biases, stoic philosophy, and human psychology.',
      image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
      siteName: 'Wikipedia',
      favicon: 'https://en.wikipedia.org/static/favicon/wikipedia.ico',
    };
  }
  if (hostname.includes('github.com')) {
    return {
      title: 'GitHub – Where the world builds software & tools',
      description: 'Open source tools, learning resources, and software repositories.',
      image: 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?auto=format&fit=crop&w=1200&q=80',
      siteName: 'GitHub',
      favicon: 'https://github.githubassets.com/favicons/favicon.svg',
    };
  }
  if (hostname.includes('coursera.org') || hostname.includes('khanacademy.org') || hostname.includes('edx.org')) {
    return {
      title: 'Online Learning Course & Mastery Program',
      description: 'High-impact learning modules to level up your mindset, communication, and professional skills.',
      image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=1200&q=80',
      siteName: 'Online Learning',
      favicon: 'https://www.coursera.org/favicon.ico',
    };
  }

  return {
    title: `${hostname.replace(/^www\./, '')} – Web Resource`,
    description: `Discover articles and resources shared from ${hostname} on the Life Puzzle community.`,
    siteName: hostname.replace(/^www\./, ''),
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
    favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
  };
}

// Extract OpenGraph, Twitter, and standard meta tags from raw HTML
function parseHtmlMetadata(html: string, baseUrl: URL): Partial<LinkPreviewData> {
  const getMeta = (propNames: string[]): string | undefined => {
    for (const prop of propNames) {
      // Look for property="prop" content="value" or name="prop" content="value"
      const regex1 = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i');
      const match1 = html.match(regex1);
      if (match1 && match1[1]) return match1[1];

      // Reverse order: content="value" property="prop"
      const regex2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, 'i');
      const match2 = html.match(regex2);
      if (match2 && match2[1]) return match2[1];
    }
    return undefined;
  };

  // Title
  let title = getMeta(['og:title', 'twitter:title']);
  if (!title) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
    }
  }

  // Description
  const description = getMeta(['og:description', 'twitter:description', 'description']);

  // Image
  let image = getMeta(['og:image', 'twitter:image', 'og:image:url', 'twitter:image:src']);
  if (image && !image.startsWith('http')) {
    try {
      image = new URL(image, baseUrl.origin).toString();
    } catch {
      // keep as is
    }
  }

  // Site name
  const siteName = getMeta(['og:site_name']) || baseUrl.hostname.replace(/^www\./, '');

  // Favicon
  let favicon: string | undefined;
  const iconMatch = html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i);
  if (iconMatch && iconMatch[1]) {
    const href = iconMatch[1];
    if (href.startsWith('http')) {
      favicon = href;
    } else {
      try {
        favicon = new URL(href, baseUrl.origin).toString();
      } catch {
        favicon = `https://www.google.com/s2/favicons?domain=${baseUrl.hostname}&sz=64`;
      }
    }
  } else {
    favicon = `https://www.google.com/s2/favicons?domain=${baseUrl.hostname}&sz=64`;
  }

  return {
    title,
    description,
    image,
    siteName,
    favicon,
  };
}

// Link Preview API
app.post('/api/link-preview', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'URL string is required' });
      return;
    }

    let parsedUrl: URL;
    try {
      // Prepend https:// if missing protocol
      const normalized = url.trim().startsWith('http://') || url.trim().startsWith('https://') 
        ? url.trim() 
        : `https://${url.trim()}`;
      parsedUrl = new URL(normalized);
    } catch {
      res.status(400).json({ error: 'Invalid URL format' });
      return;
    }

    // Safety and risk assessment
    const safety = analyzeLinkSafety(parsedUrl);
    const domain = parsedUrl.hostname.replace(/^www\./, '');
    const isSecure = parsedUrl.protocol === 'https:';

    // Attempt fetching webpage HTML with timeout
    let parsedMetadata: Partial<LinkPreviewData> = {};
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(parsedUrl.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (LifePuzzleBot/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const text = await response.text();
        parsedMetadata = parseHtmlMetadata(text, parsedUrl);
      }
    } catch {
      // Fallback if fetch fails or network blocked
    }

    // Blend with fallback defaults
    const fallback = getKnownDomainFallback(parsedUrl);

    const finalPreview: LinkPreviewData = {
      url: parsedUrl.toString(),
      originalUrl: url,
      title: parsedMetadata.title || fallback.title || `${domain} – Shared Article`,
      description: parsedMetadata.description || fallback.description || `Read and explore the latest insights from ${domain}.`,
      image: parsedMetadata.image || fallback.image,
      siteName: parsedMetadata.siteName || fallback.siteName || domain,
      domain,
      favicon: parsedMetadata.favicon || fallback.favicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      isSecure,
      isSuspicious: safety.isSuspicious,
      warningReason: safety.warningReason,
      riskLevel: safety.riskLevel,
      fetchedAt: new Date().toISOString(),
    };

    res.json({ success: true, preview: finalPreview });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate link preview' });
  }
});

// AI Life Guide API
app.post('/api/ai/guide', async (req: Request, res: Response) => {
  try {
    const { mode, prompt, context } = req.body;

    // Build system instruction & prompt based on mode
    let systemInstruction = `You are "Aria", the empathetic, playful, and deeply wise AI Life Guide in the game "Life Puzzle".
The tagline of Life Puzzle is: "Build a better life, one piece at a time."
Your mission is to turn meaningful life skills (across 7 sections: Mind, Relationships, Goals, Money, Learning, Growth, Happiness) into a fun, interactive game rather than a dull lecture.
Keep answers uplifting, concise, structured, and action-oriented. Provide practical micro-steps.`;

    let userPrompt = prompt || 'Give me today\'s life puzzle inspiration!';

    if (mode === 'dilemma_choice') {
      systemInstruction += ` You are evaluating the player's choice in an interactive life scenario. Praise thoughtful reasoning, explain long-term psychological or relational ripple effects, and award a Life Skill insight.`;
      userPrompt = `Scenario: ${context?.scenarioTitle || 'Life Choice'}
Domain: ${context?.domain || 'General'}
Dilemma: ${context?.scenarioText}
Player's Choice: "${prompt}"
Context: ${JSON.stringify(context || {})}
Evaluate this choice with wisdom, humor, and actionable advice. Return your feedback and one specific piece of advice to level up.`;
    } else if (mode === 'daily_challenge') {
      systemInstruction += ` You generate daily micro-action challenges. Challenges must take between 2 to 10 minutes, be fun, concrete, and directly reinforce real-life puzzle pieces.`;
      userPrompt = `Generate a fresh, creative daily challenge for the "${context?.domain || 'Mind'}" domain. Current streak: ${context?.streak || 1} days. Format with: Title, Time Needed, Objective, The Action Step, and The Life Reward.`;
    } else if (mode === 'lesson_insight') {
      systemInstruction += ` You explain a life lesson concisely with an unforgettable metaphor, a mini mental framework, and 1 reflection question.`;
      userPrompt = `Explain the lesson "${context?.lessonTitle || prompt}" in the domain of ${context?.domain || 'Growth'}. Make it interactive and memorable.`;
    }

    let aiText = '';

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: userPrompt,
          config: {
            systemInstruction,
          },
        });
        aiText = response.text || '';
      } catch (err: any) {
        console.warn('Gemini API call failed or quota reached, using intelligent offline coaching response:', err.message);
      }
    }

    // High quality offline fallback if Gemini is quota limited or offline
    if (!aiText) {
      if (mode === 'dilemma_choice') {
        aiText = `✨ **Aria's Wisdom Evaluation:**
Your choice reflects strong intentionality! By choosing courage over comfort, you protect both your self-respect and long-term peace of mind. 

🧩 **Puzzle Insight Unlocked:**
In relationships and self-worth, clarity is kindness. Practicing honest boundaries early prevents resentment later.

🎯 **Next Micro-Step:** Notice the next time you feel a reflexive "yes" when your body means "no" — pause for 3 breaths before replying!`;
      } else if (mode === 'daily_challenge') {
        const domain = context?.domain || 'Mind';
        aiText = `⚡ **Daily Challenge: The 5-Minute Reset (${domain})**
• **Time Needed:** 5 minutes
• **Objective:** Reclaim mental bandwidth and lower cortisol.
• **The Action Step:** Step away from all screens. Drink one glass of cold water slowly, noticing temperature and breath. Name 3 things you are genuinely grateful for that you usually take for granted.
• **The Life Reward:** +25 Mind XP and unlocks a Golden Focus Piece!`;
      } else {
        aiText = `Hello, fellow Life Puzzle architect! 🧩 
Remember: big transformations aren't built in dramatic leaps, but in the tiny, daily puzzle pieces you snap into place. Whether strengthening your **Mind**, nurturing **Relationships**, executing on **Goals**, or investing in **Happiness**, every small deliberate choice shapes your entire mosaic. What life challenge or domain would you like to explore together right now?`;
      }
    }

    res.json({ success: true, text: aiText });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error in AI guide' });
  }
});

// Dev vs Prod Vite handling
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Life Puzzle server running on port ${PORT}`);
  });
}

startServer();
