import puppeteer, { Browser, Page } from 'puppeteer';

let browser: Browser | null = null;
let page: Page | null = null;

/**
 * Initializes and returns a singleton browser and page instance.
 * This ensures the same browser session is reused across requests.
 */
async function getBrowserPage(): Promise<Page> {
  if (!browser) {
    console.log('No active browser, launching new one...');
    browser = await puppeteer.launch({ headless: true });
    // Optional: Add a cleanup hook for when the server shuts down
    process.on('exit', async () => {
      if (browser) {
        console.log('Closing browser on server exit.');
        await browser.close();
        browser = null;
      }
    });
  }
  
  if (!page || page.isClosed()) {
    console.log('No active page, creating new one...');
    page = await browser.newPage();
  }

  return page;
}

/**
 * Fetches the full HTML content of a given URL using the persistent headless browser session.
 * @param url The URL of the page to fetch.
 * @returns The rendered HTML content of the page.
 */
export async function getPageContent(url: string): Promise<string> {
  try {
    const currentPage = await getBrowserPage();
    console.log(`Navigating to URL: ${url}`);
    
    const response = await currentPage.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    if (!response) {
      throw new Error('Navigation failed: no response received from page.');
    }

    const finalUrl = response.url();
    let content = await currentPage.content();

    // Inject a <base> tag to ensure all relative links and resources work correctly.
    const baseTag = `<base href="${finalUrl}" />`;
    if (content.includes('<head>')) {
        content = content.replace('<head>', `<head>${baseTag}`);
    } else {
        // If no <head> tag, prepend it to the document.
        content = baseTag + content;
    }
    
    console.log('Successfully fetched page content.');
    return content;
  } catch (error) {
    console.error(`Error fetching page content for ${url}:`, error);
    // If navigation fails, the page might be in a weird state. Close it so a new one is created next time.
    if (page) {
        await page.close().catch(e => console.error('Error closing failed page:', e));
        page = null;
    }
    if (error instanceof Error) {
        throw new Error(`Failed to load page with Puppeteer: ${error.message}`);
    }
    throw new Error('An unknown error occurred while fetching page content.');
  }
} 