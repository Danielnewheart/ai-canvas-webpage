import puppeteer from 'puppeteer';

/**
 * Fetches the full HTML content of a given URL using a headless browser.
 * @param url The URL of the page to fetch.
 * @returns The rendered HTML content of the page.
 */
export async function getPageContent(url: string): Promise<string> {
  let browser;
  try {
    console.log(`Launching browser for URL: ${url}`);
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    const content = await page.content();
    console.log('Successfully fetched page content.');
    return content;
  } catch (error) {
    console.error(`Error fetching page content for ${url}:`, error);
    if (error instanceof Error) {
        throw new Error(`Failed to load page with Puppeteer: ${error.message}`);
    }
    throw new Error('An unknown error occurred while fetching page content.');
  } finally {
    if (browser) {
      await browser.close();
      console.log('Browser closed.');
    }
  }
} 