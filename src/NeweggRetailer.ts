import { chromium, Browser, BrowserContext, Page } from 'playwright';   // I use Playwright as a more standard tool, but I would probably choose Patchright/Camoufox/ some cloud browser.
import { NeweggListingScraper } from './scrapers/NeweggListingScraper';
import { NeweggProductScraper } from './scrapers/NeweggProductScraper';
import { ProductListPage } from './models/ProductListPage';
import { ProductInfo } from './models/ProductInfo';
import { ProxyProvider, ProxyConfig } from './Proxy';

export interface NeweggRetailerConfig {
  screenshotOnError?: boolean;   // save debug-screenshot.png when scraping fails (default: true)
}

export type PageSize = 36 | 60 | 96;

export interface GetProductListOptions {
  keywords: string;
  page?: number;
  pageSize?: PageSize;  // items per page: 36, 60, or 96 (default: 96)
  proxy?: ProxyProvider;        // optional proxy provider for this request (if not set, no proxy will be used)
}

export type ProductListResult =
  | { status: 'success'; data: ProductListPage }
  | { status: 'error'; error: string };

export type ProductInfoResult =
  | { status: 'success'; data: ProductInfo }
  | { status: 'error'; error: string };

export interface GetProductInfoOptions {
  url: string;
  proxy?: ProxyProvider;
}

export class NeweggRetailer {
  private readonly baseListingUrl = 'https://www.newegg.com/p/pl';
  private readonly scraper: NeweggListingScraper;
  private readonly productScraper: NeweggProductScraper;
  private readonly screenshotOnError: boolean;

  constructor(config: NeweggRetailerConfig = {}) {
    this.scraper = new NeweggListingScraper();
    this.productScraper = new NeweggProductScraper();
    this.screenshotOnError = config.screenshotOnError ?? true;
  }

  async getProductList(options: GetProductListOptions): Promise<ProductListResult> {
    const { keywords, page = 1, pageSize = 96, proxy } = options;
    const url = this.buildUrl(keywords, page, pageSize);

    const maxRetries = 3;
    let lastError = '';

    // Here, the tactic of using a single proxy for all pagination requests is implemented.
    // Possibly, the number of pagination requests for a single proxy should be limited.
    const browser = await this.launchBrowser();
    try {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const proxyConfig = proxy?.GetLastProxy() ?? undefined;
        const context = await this.createContext(browser, proxyConfig);
        const browserPage = await context.newPage();
        //browserPage.on('console', msg => console.log('PAGE LOG:', msg.text()));

        try {
          await this.applyAntiDetection(browserPage);
          // 'commit' resolves on first response headers — avoids hanging on Cloudflare challenges
          await browserPage.goto(url, { waitUntil: 'commit', timeout: 30_000 });
          const data = await this.scraper.scrapePage(browserPage, keywords, url, this.screenshotOnError);
          return { status: 'success', data };
        } catch (err) {
          lastError = err instanceof Error ? err.message : String(err);
          console.warn(`Attempt ${attempt}/${maxRetries} failed: ${lastError}`);
          if (this.screenshotOnError) {
            await browserPage.screenshot({ path: 'debug-screenshot.png', fullPage: true }).catch(() => {});
            console.error('Saved debug-screenshot.png');
          }
          if (attempt < maxRetries) {
            proxy?.ResetProxy();
          }
        } finally {
          await context.close();
        }
      }
    } finally {
      await browser.close();
    }

    return { status: 'error', error: lastError };
  }

  async getProductInfo(options: GetProductInfoOptions): Promise<ProductInfoResult> {
    const { url, proxy } = options;

    const maxRetries = 3;
    let lastError = '';

    const browser = await this.launchBrowser();
    try {
      for (let attempt = 1; attempt <= maxRetries; attempt++) { //refactor to avoid code duplication with getProductList?
        const proxyConfig = proxy?.GetLastProxy() ?? undefined;
        const context = await this.createContext(browser, proxyConfig);
        const browserPage = await context.newPage();
        // browserPage.on('console', msg => console.log('PAGE LOG:', msg.text()));
        try {
          await this.applyAntiDetection(browserPage);
          await browserPage.goto(url, { waitUntil: 'commit', timeout: 30_000 });
          const data = await this.productScraper.scrapePage(browserPage, url, this.screenshotOnError);
          return { status: 'success', data };
        } catch (err) {
          lastError = err instanceof Error ? err.message : String(err);
          console.warn(`Attempt ${attempt}/${maxRetries} failed: ${lastError}`);
          if (this.screenshotOnError) {
            await browserPage.screenshot({ path: 'debug-screenshot.png', fullPage: true }).catch(() => {});
            console.error('Saved debug-screenshot.png');
          }
          if (attempt < maxRetries) {
            proxy?.ResetProxy();
          }
        } finally {
          await context.close();
        }
      }
    } finally {
      await browser.close();
    }

    return { status: 'error', error: lastError };
  }

  private buildUrl(keywords: string, page: number, pageSize: PageSize): string {
    const params = new URLSearchParams({ d: keywords, pageSize: String(pageSize) });
    if (page > 1) params.set('page', String(page));
    return `${this.baseListingUrl}?${params.toString()}`;
  }

  private async launchBrowser(): Promise<Browser> {
    return chromium.launch({ headless: true });
  }

  private async createContext(browser: Browser, proxy?: ProxyConfig): Promise<BrowserContext> {
    return browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      locale: 'en-US',
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
      },
      ...(proxy && { proxy }),
    });
  }

  private async applyAntiDetection(page: Page): Promise<void> {
    // Script string runs in browser context, not Node — no DOM types available here
    await page.addInitScript(
      'Object.defineProperty(navigator, "webdriver", { get: () => undefined })'
    );
  }
}
