import * as cheerio from 'cheerio';

// Use Node.js runtime for server-side HTTP requests and HTML parsing
export const runtime = 'nodejs';

interface UrlMetadata {
  url: string;
  title?: string;
  description?: string;
  favicon?: string;
  image?: string;
  siteName?: string;
  type?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL parameter is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
        }
      );
    }

    // Validate URL format
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
        }
      );
    }

    // Only allow HTTP and HTTPS protocols
    if (!['http:', 'https:'].includes(validUrl.protocol)) {
      return new Response(
        JSON.stringify({ error: 'Only HTTP and HTTPS URLs are supported' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
        }
      );
    }

    const metadata: UrlMetadata = {
      url: validUrl.toString()
    };

    try {
      // Fetch the webpage with timeout and user agent
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(validUrl.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; UrlMetadataBot/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // If response is not ok, we still try to return basic metadata
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract title
      metadata.title = 
        $('meta[property="og:title"]').attr('content') ||
        $('meta[name="twitter:title"]').attr('content') ||
        $('title').text().trim() ||
        validUrl.hostname;

      // Extract description
      metadata.description = 
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="twitter:description"]').attr('content') ||
        $('meta[name="description"]').attr('content') ||
        '';

      // Extract image
      const ogImage = $('meta[property="og:image"]').attr('content');
      const twitterImage = $('meta[name="twitter:image"]').attr('content');
      if (ogImage || twitterImage) {
        const imageUrl = ogImage || twitterImage;
        if (imageUrl) {
          // Convert relative URLs to absolute
          metadata.image = imageUrl.startsWith('http') 
            ? imageUrl 
            : new URL(imageUrl, validUrl.origin).toString();
        }
      }

      // Extract favicon
      const favicon = 
        $('link[rel="apple-touch-icon"]').attr('href') ||
        $('link[rel="icon"]').attr('href') ||
        $('link[rel="shortcut icon"]').attr('href') ||
        '/favicon.ico';
      
      if (favicon) {
        metadata.favicon = favicon.startsWith('http') 
          ? favicon 
          : new URL(favicon, validUrl.origin).toString();
      }

      // Extract site name
      metadata.siteName = 
        $('meta[property="og:site_name"]').attr('content') ||
        validUrl.hostname;

      // Extract type
      metadata.type = 
        $('meta[property="og:type"]').attr('content') ||
        'website';

      // Clean up empty values
      Object.keys(metadata).forEach(key => {
        const value = metadata[key as keyof UrlMetadata];
        if (typeof value === 'string' && value.trim() === '') {
          delete metadata[key as keyof UrlMetadata];
        }
      });

    } catch (fetchError) {
      console.error('Error fetching URL metadata:', fetchError);
      
      // Return basic metadata even if fetch fails
      metadata.title = validUrl.hostname;
      metadata.siteName = validUrl.hostname;
      metadata.type = 'website';
    }

    return new Response(
      JSON.stringify(metadata),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400', // Cache for 1 hour
          ...CORS_HEADERS
        }
      }
    );

  } catch (error) {
    console.error('Error in metadata API:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required in request body' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
        }
      );
    }

    // Redirect to GET endpoint for consistency
    const metadataUrl = new URL('/api/metadata', req.url);
    metadataUrl.searchParams.set('url', url);

    const response = await fetch(metadataUrl.toString());
    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      { 
        status: response.status,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      }
    );

  } catch (error) {
    console.error('Error in metadata POST API:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      }
    );
  }
} 