/**
 * Web Browsing Module
 * Provides web search and URL fetching capabilities for AI agents
 */

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface FetchResult {
  url: string;
  contentLength: number;
  content: string;
  statusCode: number;
}

/**
 * Validate if a URL is properly formatted
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Search the web using Serper API
 * Requires SERPER_API_KEY environment variable
 */
export async function webSearch(
  query: string,
  maxResults: number = 5
): Promise<SearchResult[]> {
  const apiKey = process.env.SERPER_API_KEY;

  // If no API key, return mock results with helpful message
  if (!apiKey) {
    console.warn(
      "[Web Search] SERPER_API_KEY not configured. Using mock results."
    );
    return [
      {
        title: `Search results for: ${query}`,
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        snippet: `To enable live web search, add SERPER_API_KEY to environment variables. Learn more at https://serper.dev`,
      },
    ];
  }

  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        num: Math.min(maxResults, 10),
        autocorrect: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.status}`);
    }

  // @ts-expect-error -- type safety suppressed for compatibility
    const data = (await response.json()) as any;
    const results: SearchResult[] = [];

    // Process organic search results
    if (data.organic && Array.isArray(data.organic)) {
      for (const item of data.organic.slice(0, maxResults)) {
        results.push({
          title: item.title || "",
          url: item.link || "",
          snippet: item.snippet || "",
        });
      }
    }

    return results.length > 0
      ? results
      : [
          {
            title: "No results found",
            url: "",
            snippet: `No search results found for query: ${query}`,
          },
        ];
  } catch (error) {
    console.error("[Web Search] Error:", error);
    throw new Error(`Web search failed: ${String(error)}`);
  }
}

/**
 * Extract main content from HTML
 * Simple regex-based extraction (for production, use cheerio)
 */
function extractMainContent(html: string): string {
  // Remove script and style tags
  let content = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // Extract text from common content tags
  const textMatch = content.match(/<(main|article|div[^>]*class="[^"]*content[^"]*")[^>]*>(.*?)<\/(main|article|div)>/is);

  if (textMatch) {
    content = textMatch[2];
  }

  // Remove HTML tags
  content = content.replace(/<[^>]*>/g, "");

  // Decode HTML entities
  content = content
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

  // Clean up whitespace
  content = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");

  return content.slice(0, 5000); // Limit to 5000 chars
}

/**
 * Fetch and extract content from a URL
 */
export async function fetchUrl(
  url: string,
  extractContent: boolean = true
): Promise<FetchResult> {
  if (!isValidUrl(url)) {
    throw new Error(`Invalid URL: ${url}`);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    let content = html;

    if (extractContent && html.length > 500) {
      content = extractMainContent(html);
    }

    return {
      url,
      contentLength: content.length,
      content,
      statusCode: response.status,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout");
    }
    throw new Error(`Failed to fetch URL: ${String(error)}`);
  }
}

/**
 * Search knowledge base (placeholder for integration)
 */
export async function searchKnowledgeBase(
  query: string
): Promise<{ title: string; content: string }[]> {
  // This would integrate with your actual knowledge base
  // For now, return a placeholder
  return [
    {
      title: "Knowledge Base Search",
      content: `Results for "${query}" would appear here when integrated with your knowledge base system.`,
    },
  ];
}
