import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { NeweggListingScraper } from './scrapers/NeweggListingScraper';
import { ProductListPage } from './models/ProductListPage';

export interface NeweggRetailerConfig {
  screenshotOnError?: boolean;   // save debug-screenshot.png when scraping fails (default: true)
}

export interface GetProductListOptions {
  keywords: string;
  page?: number;
}

export class NeweggRetailer {
  private readonly baseListingUrl = 'https://www.newegg.com/p/pl';
  private readonly scraper: NeweggListingScraper;
  private readonly screenshotOnError: boolean;

  constructor(config: NeweggRetailerConfig = {}) {
    this.scraper = new NeweggListingScraper();
    this.screenshotOnError = config.screenshotOnError ?? true;
  }

  async getProductList(options: GetProductListOptions): Promise<ProductListPage> {
    const { keywords, page = 1 } = options;
    const url = this.buildUrl(keywords, page);

    const browser = await this.launchBrowser();
    const context = await this.createContext(browser);

    const browserPage = await context.newPage();
    try {
      await this.applyAntiDetection(browserPage);
      // 'commit' resolves on first response headers — avoids hanging on Cloudflare challenges
      await browserPage.goto(url, { waitUntil: 'commit', timeout: 30_000 });
      return await this.scraper.scrapePage(browserPage, keywords, url, this.screenshotOnError);
    } catch (err) {
      if (this.screenshotOnError) {
        await browserPage.screenshot({ path: 'debug-screenshot.png', fullPage: true }).catch(() => {});
        console.error('Saved debug-screenshot.png');
      }
      throw err;
    } finally {
      await context.close();
      await browser.close();
    }
  }

  private buildUrl(keywords: string, page: number): string {
    const params = new URLSearchParams({ d: keywords });
    if (page > 1) params.set('page', String(page));
    return `${this.baseListingUrl}?${params.toString()}`;
  }

  private async launchBrowser(): Promise<Browser> {
    return chromium.launch({ headless: true });
  }

  private async createContext(browser: Browser): Promise<BrowserContext> {
    return browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      locale: 'en-US',
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
  }

  private async applyAntiDetection(page: Page): Promise<void> {
    // Script string runs in browser context, not Node — no DOM types available here
    await page.addInitScript(
      'Object.defineProperty(navigator, "webdriver", { get: () => undefined })'
    );
  }
}
