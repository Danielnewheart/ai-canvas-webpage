import puppeteer, { Browser, Page } from 'puppeteer';

let browser: Browser | null = null;
// Track active requests to prevent race conditions
const activeRequests = new Map<string, Promise<string>>();

/**
 * Initializes and returns a singleton browser instance.
 */
async function getBrowser(): Promise<Browser> {
  if (!browser) {
    console.log('No active browser, launching new one...');
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    // Optional: Add a cleanup hook for when the server shuts down
    process.on('exit', async () => {
      if (browser) {
        console.log('Closing browser on server exit.');
        await browser.close();
        browser = null;
      }
    });
  }
  
  return browser;
}

/**
 * Creates a new page for each request to avoid race conditions
 */
async function createNewPage(): Promise<Page> {
  const currentBrowser = await getBrowser();
  const newPage = await currentBrowser.newPage();
  
  // Set reasonable timeouts and user agent
  await newPage.setDefaultTimeout(30000);
  await newPage.setDefaultNavigationTimeout(30000);
  await newPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  return newPage;
}

/**
 * Fetches the full HTML content of a given URL using a new page instance for each request.
 * This prevents race conditions when multiple requests are made simultaneously.
 * @param url The URL of the page to fetch.
 * @returns The rendered HTML content of the page.
 */
export async function getPageContent(url: string): Promise<string> {
  // Check if there's already an active request for this URL
  if (activeRequests.has(url)) {
    console.log(`Reusing active request for URL: ${url}`);
    return activeRequests.get(url)!;
  }

  // Create a new promise for this request
  const requestPromise = fetchPageContent(url);
  activeRequests.set(url, requestPromise);

  try {
    const result = await requestPromise;
    return result;
  } finally {
    // Clean up the active request
    activeRequests.delete(url);
  }
}

/**
 * Internal function that performs the actual page fetching
 */
async function fetchPageContent(url: string): Promise<string> {
  let currentPage: Page | null = null;
  
  try {
    currentPage = await createNewPage();
    console.log(`Navigating to URL: ${url}`);
    
    // Navigate with retry logic
    const response = await currentPage.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    if (!response) {
      throw new Error('Navigation failed: no response received from page.');
    }

    const content = await currentPage.content();

    // The <base> tag was causing issues with client-side routing.
    // It's removed to prevent hijacking relative fetch calls.
    
    console.log('Successfully fetched page content.');
    return content;
  } catch (error) {
    console.error(`Error fetching page content for ${url}:`, error);
    if (error instanceof Error) {
        throw new Error(`Failed to load page with Puppeteer: ${error.message}`);
    }
    throw new Error('An unknown error occurred while fetching page content.');
  } finally {
    // Always close the page to prevent memory leaks and race conditions
    if (currentPage) {
      try {
        await currentPage.close();
      } catch (e) {
        console.error('Error closing page:', e);
      }
    }
  }
} 