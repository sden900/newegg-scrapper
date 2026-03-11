import { Page } from 'playwright';
import { NEWEGG_SELECTORS as SEL } from '../selectors/newegg.selectors';
import { ProductListItem, ProductListItemData } from '../models/ProductListItem';
import { ProductListPage } from '../models/ProductListPage';

export class NeweggListingScraper {

  async scrapePage(page: Page, keywords: string, url: string, screenshotOnError = true): Promise<ProductListPage> {
    console.log('Waiting for product grid...');
    const gridFound = await page
      .waitForSelector(SEL.PRODUCT_CELL, { timeout: 15_000 })
      .then(() => true)
      .catch(() => false);

    if (!gridFound) {
      console.warn(`Product grid not found on page (title: "${await page.title()}"). Returning empty result.`);
      if (screenshotOnError) {
        await page.screenshot({ path: 'debug-screenshot.png', fullPage: true }).catch(() => {});
        console.warn('Saved debug-screenshot.png');
      }
      return new ProductListPage({ keywords, url, currentPage: 1, totalPages: null, items: [], scrapedAt: new Date() });
    }
    console.log('Product grid found, extracting items...');

    // Run all DOM extraction in a single browser-side call to avoid hundreds of IPC round-trips
    const rawItems = await page.evaluate((sel) => {
      const cells = Array.from(document.querySelectorAll(sel.PRODUCT_CELL));

      return cells
        .filter((cell) => cell.querySelector(sel.TITLE) !== null)
        .map((cell): ProductListItemData => {
          const titleEl = cell.querySelector<HTMLAnchorElement>(sel.TITLE);
          const title = titleEl?.textContent?.trim() ?? '';
          const productUrl = titleEl?.href ?? null;

          const imgEl = cell.querySelector<HTMLImageElement>(sel.IMAGE);
          const imageUrl = imgEl?.src || imgEl?.dataset.src || null;

          // Price: <strong> holds dollars, <sup> holds cents
          const dollarsEl = cell.querySelector(sel.PRICE_DOLLARS);
          const centsEl = cell.querySelector(sel.PRICE_CENTS);
          let priceCurrentDollars: number | null = null;
          if (dollarsEl?.textContent) {
            const dollars = parseInt(dollarsEl.textContent.replace(/[^0-9]/g, ''), 10);
            const cents = centsEl?.textContent
              ? parseInt(centsEl.textContent.replace(/[^0-9]/g, ''), 10)
              : 0;
            priceCurrentDollars = parseFloat(`${dollars}.${String(cents).padStart(2, '0')}`);
          }

          const wasEl = cell.querySelector(sel.PRICE_WAS);
          const wasText = wasEl?.textContent ?? null;
          const priceWas = wasText
            ? parseFloat(wasText.replace(/[^0-9.]/g, '')) || null
            : null;

          const ratingEl = cell.querySelector(sel.RATING_CONTAINER);
          const ariaLabel = ratingEl?.getAttribute('aria-label') ?? null;
          const ratingMatch = ariaLabel?.match(/([0-9.]+)\s+out\s+of/i);
          const ratingStars = ratingMatch ? parseFloat(ratingMatch[1]) : null;

          const reviewEl = cell.querySelector(sel.REVIEW_COUNT);
          const reviewText = reviewEl?.textContent ?? null;
          const reviewCount = reviewText
            ? parseInt(reviewText.replace(/[^0-9]/g, ''), 10) || null
            : null;

          const shippingEl = cell.querySelector(sel.SHIPPING);
          const shippingText = shippingEl?.textContent?.trim() ?? null;
          const isFreeShipping = shippingText?.toLowerCase().includes('free') ?? false;

          const isSponsored = cell.querySelector(sel.SPONSORED_LABEL) !== null;

          return {
            title,
            productUrl,
            imageUrl,
            priceCurrentDollars,
            priceWas,
            ratingStars,
            reviewCount,
            shippingText,
            isFreeShipping,
            isSponsored,
          };
        });
    }, SEL);

    const items = rawItems.map((d) => new ProductListItem(d));
    const { currentPage, totalPages } = await this.scrapePagination(page);

    return new ProductListPage({
      keywords,
      url,
      currentPage,
      totalPages,
      items,
      scrapedAt: new Date(),
    });
  }

  private async scrapePagination(
    page: Page
  ): Promise<{ currentPage: number; totalPages: number | null }> {
    try {
      const text = await page.locator(SEL.PAGINATION).first().textContent({ timeout: 3_000 });
      if (text) {
        const match = text.match(/(\d+)\s*\/\s*(\d+)/);
        if (match) {
          return {
            currentPage: parseInt(match[1], 10),
            totalPages: parseInt(match[2], 10),
          };
        }
      }
    } catch {
      // single-page results have no pagination element
    }
    return { currentPage: 1, totalPages: null };
  }
}
