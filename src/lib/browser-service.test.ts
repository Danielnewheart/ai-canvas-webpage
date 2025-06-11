import type { Browser } from 'puppeteer';

// Use jest.doMock to ensure the mock is hoisted and available before any imports
const mockPage = {
  goto: jest.fn(),
  content: jest.fn(),
  isClosed: jest.fn().mockReturnValue(false),
  close: jest.fn().mockResolvedValue(null),
};

const mockBrowser = {
  newPage: jest.fn().mockResolvedValue(mockPage),
  close: jest.fn(),
};

// Use jest.doMock for hoisted mocks
jest.doMock('puppeteer', () => ({
  __esModule: true,
  default: {
    launch: jest.fn(),
  },
}));

describe('getPageContent', () => {
  let getPageContent: (url: string) => Promise<string>;
  let puppeteerLaunchMock: jest.Mock;

  beforeEach(async () => {
    // Reset modules to get a fresh instance of browser-service
    jest.resetModules();
    
    // Dynamically import puppeteer to get the mocked launch function
    const puppeteer = (await import('puppeteer')).default;
    puppeteerLaunchMock = puppeteer.launch as jest.Mock;
    puppeteerLaunchMock.mockResolvedValue(mockBrowser as unknown as Browser);

    // Now import the service to be tested
    const browserService = await import('./browser-service');
    getPageContent = browserService.getPageContent;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should launch the browser and create a page on the first call', async () => {
    const url = 'https://example.com';
    const expectedContent = '<html></html>';
    mockPage.content.mockResolvedValue(expectedContent);

    const content = await getPageContent(url);
    
    expect(content).toBe(expectedContent);
    expect(puppeteerLaunchMock).toHaveBeenCalledTimes(1);
    expect(mockBrowser.newPage).toHaveBeenCalledTimes(1);
    expect(mockPage.goto).toHaveBeenCalledWith(url, { waitUntil: 'networkidle2', timeout: 30000 });
  });

  it('should reuse the existing browser and page on a second call', async () => {
    const url1 = 'https://example.com';
    const url2 = 'https://anotherexample.com';
    mockPage.content.mockResolvedValue('<html></html>');
    
    await getPageContent(url1);
    await getPageContent(url2);

    expect(puppeteerLaunchMock).toHaveBeenCalledTimes(1);
    expect(mockBrowser.newPage).toHaveBeenCalledTimes(1);
    
    expect(mockPage.goto).toHaveBeenCalledWith(url1, { waitUntil: 'networkidle2', timeout: 30000 });
    expect(mockPage.goto).toHaveBeenCalledWith(url2, { waitUntil: 'networkidle2', timeout: 30000 });
  });
  
  it('should close and recreate a page if navigation fails', async () => {
    const goodUrl = 'https://example.com';
    const badUrl = 'https://example.com/404';
    const navigationError = new Error('Failed to navigate');

    mockPage.content.mockResolvedValue('<html></html>');
    await getPageContent(goodUrl);

    mockPage.goto.mockRejectedValueOnce(navigationError);

    await expect(getPageContent(badUrl)).rejects.toThrow(
      `Failed to load page with Puppeteer: ${navigationError.message}`
    );
    
    expect(mockPage.close).toHaveBeenCalledTimes(1);
    
    await getPageContent(goodUrl);
    
    expect(mockBrowser.newPage).toHaveBeenCalledTimes(2);
  });
}); 