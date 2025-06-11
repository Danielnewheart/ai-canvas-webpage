import { NextResponse } from 'next/server';
import { getPageContent } from '@/lib/browser-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const htmlContent = await getPageContent(url);
    
    // Fix relative paths in the HTML content
    const baseUrl = new URL(url);
    const fixedContent = htmlContent
      // Fix relative paths that start with /
      .replace(/href="\/([^"]*?)"/g, `href="${baseUrl.origin}/$1"`)
      .replace(/src="\/([^"]*?)"/g, `src="${baseUrl.origin}/$1"`)
      // Fix relative paths for CSS imports and other @ rules
      .replace(/url\(\/([^)]*?)\)/g, `url(${baseUrl.origin}/$1)`)
      // Fix relative paths for background images
      .replace(/background-image:\s*url\(["']?\/([^)"']*?)["']?\)/g, `background-image: url("${baseUrl.origin}/$1")`)
      // Add base tag to help with relative paths
      .replace(/<head>/i, `<head><base href="${baseUrl.origin}/">`);

    return new Response(fixedContent, {
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: 'Failed to fetch page', details: errorMessage }, { status: 500 });
  }
} 