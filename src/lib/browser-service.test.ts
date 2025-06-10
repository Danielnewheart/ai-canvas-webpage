import { getPageContent } from './browser-service';
import puppeteer, { Browser } from 'puppeteer';

// Mock the puppeteer module
jest.mock('puppeteer');

// Type assertion for the mocked module
const puppeteerMock = puppeteer as jest.Mocked<typeof puppeteer>;

describe('getPageContent', () => {
  const mockPage = {
    goto: jest.fn(),
    content: jest.fn(),
  };

  const mockBrowser = {
    newPage: jest.fn().mockResolvedValue(mockPage),
    close: jest.fn(),
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup the launch mock to return our mock browser
    puppeteerMock.launch.mockResolvedValue(mockBrowser as unknown as Browser);
  });

  it('should return page content on successful navigation', async () => {
    const url = 'https://example.com';
    const expectedContent = '<html><body><h1>Success</h1></body></html>';
    
    mockPage.goto.mockResolvedValue(null);
    mockPage.content.mockResolvedValue(expectedContent);

    const content = await getPageContent(url);

    expect(content).toBe(expectedContent);
    expect(puppeteerMock.launch).toHaveBeenCalledWith({ headless: true });
    expect(mockBrowser.newPage).toHaveBeenCalledTimes(1);
    expect(mockPage.goto).toHaveBeenCalledWith(url, { waitUntil: 'networkidle2', timeout: 30000 });
    expect(mockBrowser.close).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if page navigation fails', async () => {
    const url = 'https://example.com/404';
    const navigationError = new Error('Failed to navigate');
    
    mockPage.goto.mockRejectedValue(navigationError);

    await expect(getPageContent(url)).rejects.toThrow(
      `Failed to load page with Puppeteer: ${navigationError.message}`
    );
    expect(mockBrowser.close).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if puppeteer.launch fails', async () => {
    const url = 'https://example.com/bad-launch';
    const launchError = new Error('Failed to launch browser');

    puppeteerMock.launch.mockRejectedValue(launchError);

    await expect(getPageContent(url)).rejects.toThrow(
      `Failed to load page with Puppeteer: ${launchError.message}`
    );
    // Ensure close is not called if launch fails
    expect(mockBrowser.close).not.toHaveBeenCalled();
  });
}); 