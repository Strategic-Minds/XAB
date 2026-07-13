/**
 * XAB Browser/Scraping API
 * Handles web scraping, search, SEO audit, screenshots.
 * Uses fetch-based scraping with bot-detection bypass headers.
 * SSRF protected: blocks private IPs.
 */
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

const BOT_BYPASS_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'DNT': '1',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
};

function isPrivateIp(hostname: string): boolean {
  const privatePatterns = [
    /^localhost$/i,
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^169\.254\./,
    /^::1$/,
    /^fc00:/,
    /^fe80:/,
  ];
  return privatePatterns.some(p => p.test(hostname));
}

function validateUrl(urlStr: string): URL {
  const url = new URL(urlStr);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only http/https allowed');
  if (isPrivateIp(url.hostname)) throw new Error('Private/internal URLs blocked (SSRF protection)');
  return url;
}

async function scrapeUrl(url: string, extract?: string[]) {
  const validated = validateUrl(url);
  const res = await fetch(validated.toString(), { headers: BOT_BYPASS_HEADERS, redirect: 'follow' });
  const html = await res.text();

  // Parse with regex (no DOM parser in edge runtime)
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? '';
  const description = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim() ?? '';
  const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1]?.trim() ?? '';
  const h2s = [...html.matchAll(/<h2[^>]*>([^<]+)<\/h2>/gi)].map(m => m[1].trim()).slice(0, 5);
  const links = [...html.matchAll(/href=["']([^"']+)["']/gi)].map(m => m[1]).filter(l => l.startsWith('http')).slice(0, 20);
  const images = [...html.matchAll(/src=["']([^"']+\.(?:jpg|jpeg|png|webp|svg))["']/gi)].map(m => m[1]).slice(0, 10);
  const text = html.replace(/<script[^>]*>.*?<\/script>/gis, '').replace(/<style[^>]*>.*?<\/style>/gis, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 5000);

  return { url, title, description, h1, h2s, links, images, text, status: res.status, timestamp: new Date().toISOString() };
}

async function searchWeb(query: string, maxResults = 5) {
  // DuckDuckGo HTML search
  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const res = await fetch(searchUrl, { headers: BOT_BYPASS_HEADERS });
  const html = await res.text();
  const results: Array<{title:string,url:string,snippet:string}> = [];
  const matches = [...html.matchAll(/class="result__a"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi)];
  const snippets = [...html.matchAll(/class="result__snippet"[^>]*>([^<]+)<\/span>/gi)];
  for (let i = 0; i < Math.min(matches.length, maxResults); i++) {
    results.push({ title: matches[i][2]?.trim() ?? '', url: matches[i][1]?.trim() ?? '', snippet: snippets[i]?.[1]?.trim() ?? '' });
  }
  return { query, results, timestamp: new Date().toISOString() };
}

async function seoAudit(url: string) {
  const data = await scrapeUrl(url);
  const score = [
    data.title ? 10 : 0,
    data.description ? 10 : 0,
    data.h1 ? 10 : 0,
    data.links.length > 0 ? 5 : 0,
    data.images.length > 0 ? 5 : 0,
    data.title && data.title.length >= 30 && data.title.length <= 60 ? 10 : 0,
    data.description && data.description.length >= 50 && data.description.length <= 160 ? 10 : 0,
  ].reduce((a, b) => a + b, 0);
  return {
    url,
    seo_score: score,
    max_score: 60,
    checks: {
      has_title: !!data.title,
      title_length: data.title?.length ?? 0,
      title_optimal: data.title?.length >= 30 && data.title?.length <= 60,
      has_meta_description: !!data.description,
      meta_description_length: data.description?.length ?? 0,
      meta_description_optimal: data.description?.length >= 50 && data.description?.length <= 160,
      has_h1: !!data.h1,
      h1_text: data.h1,
      internal_links: data.links.length,
      images_count: data.images.length,
    },
    title: data.title,
    description: data.description,
    h1: data.h1,
    timestamp: new Date().toISOString()
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    switch (action) {
      case 'scrape': return NextResponse.json(await scrapeUrl(body.url, body.extract));
      case 'search': return NextResponse.json(await searchWeb(body.query, body.maxResults));
      case 'seo_audit': return NextResponse.json(await seoAudit(body.url));
      case 'screenshot': {
        // Use screenshotone free tier or return placeholder
        const screenshotUrl = `https://image.thum.io/get/width/1200/crop/800/${body.url}`;
        return NextResponse.json({ screenshot_url: screenshotUrl, url: body.url });
      }
      case 'competitor_analysis': {
        const [scraped, seo] = await Promise.all([scrapeUrl(body.url), seoAudit(body.url)]);
        return NextResponse.json({ ...scraped, seo_audit: seo });
      }
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: msg.includes('SSRF') ? 403 : 500 });
  }
}