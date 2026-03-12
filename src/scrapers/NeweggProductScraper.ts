import { Page } from 'playwright';
import { NEWEGG_SELECTORS as SEL } from '../selectors/newegg.selectors';
import { ProductInfo, ProductInfoData } from '../models/ProductInfo';

export class NeweggProductScraper {

  async scrapePage(page: Page, url: string, screenshotOnError = true): Promise<ProductInfo> {
    console.log('Waiting for product detail page...');
    const titleFound = await page
      .waitForSelector(SEL.DETAIL_TITLE, { timeout: 15_000 }) 
      .then(() => true)
      .catch(() => false);

    if (!titleFound) {
      console.warn(`Product detail not found (title: "${await page.title()}"). Returning empty result.`);
      if (screenshotOnError) {
        await page.screenshot({ path: 'debug-screenshot.png', fullPage: true }).catch(() => {});
        console.warn('Saved debug-screenshot.png');
      }
      return new ProductInfo({
        url,
        title: '',
        brand: null,
        mainImageUrl: null,
        galleryImageUrls: [],
        priceCurrentDollars: null,
        priceWas: null,
        ratingStars: null,
        reviewCount: null,
        availability: null,
        shippingText: null,
        isFreeShipping: false,
        descriptionBullets: [],
        specs: {},
        scrapedAt: new Date(),
      });
    }

    console.log('Product detail found, extracting data...');

    var raw: Omit<ProductInfoData, 'url' | 'scrapedAt'> = await page.evaluate((sel) => {
      const text = (selector: string, root: Element | Document = document): string | null =>
        root.querySelector(selector)?.textContent?.trim() ?? null;

      // Title
      const title = text(sel.DETAIL_TITLE) ?? '';

      // Brand
      const brand = document.querySelector(sel.DETAIL_BRAND)?.getAttribute('title')?.trim() ?? null;

      // Main image
      const mainImgEl = document.querySelector<HTMLImageElement>(sel.DETAIL_MAIN_IMAGE);
      const mainImageUrl = mainImgEl?.src || mainImgEl?.dataset.src || null;

      // Gallery thumbnails
      console.log('Extracting gallery images with selector:', Array.from(document.querySelectorAll<HTMLImageElement>(sel.DETAIL_GALLERY_THUMBS)).length); //debug
      const galleryImageUrls = Array.from(document.querySelectorAll<HTMLImageElement>(sel.DETAIL_GALLERY_THUMBS))
        .map((img) => img.src || img.dataset.src || '')
        .filter((src) => src.length > 0);

      // Price
      const dollarsEl = document.querySelector(sel.PRICE_DOLLARS);
      const centsEl = document.querySelector(sel.PRICE_CENTS);
      let priceCurrentDollars: number | null = null;
      if (dollarsEl?.textContent) {
        const dollars = parseInt(dollarsEl.textContent.replace(/[^0-9]/g, ''), 10);
        const cents = centsEl?.textContent
          ? parseInt(centsEl.textContent.replace(/[^0-9]/g, ''), 10)
          : 0;
        priceCurrentDollars = parseFloat(`${dollars}.${String(cents).padStart(2, '0')}`);
      }

      const wasText = text(sel.PRICE_WAS);
      const priceWas = wasText ? parseFloat(wasText.replace(/[^0-9.]/g, '')) || null : null;

      // Rating — check both title and aria-label since Newegg uses either depending on context
      const ratingEl = document.querySelector(sel.DETAIL_RATING);
      const ratingAttr = ratingEl?.getAttribute('title') ?? ratingEl?.getAttribute('aria-label') ?? null;
      const ratingMatch = ratingAttr?.match(/([0-9.]+)\s+out\s+of/i);
      const ratingStars = ratingMatch ? parseFloat(ratingMatch[1]) : null;



      // Review count
      const reviewText = text(sel.DETAIL_REVIEW_COUNT);
      const reviewCount = reviewText ? parseInt(reviewText.replace(/[^0-9]/g, ''), 10) || null : null;

      // Availability
      const availability = text(sel.DETAIL_AVAILABILITY);

      // We will collect shipping information later, as it has not yet been loaded.
      const shippingText = '';
      const isFreeShipping = false;

      // Description bullets
      const descriptionBullets = Array.from(document.querySelectorAll(sel.DETAIL_BULLETS))
        .map((el) => el.textContent?.trim() ?? '')
        .filter((t) => t.length > 0);

      // Specs table
      const specs: Record<string, string> = {};
      document.querySelectorAll(sel.DETAIL_SPEC_ROW).forEach((row) => {
        const key = row.querySelector(sel.DETAIL_SPEC_KEY)?.textContent?.trim();
        const value = row.querySelector(sel.DETAIL_SPEC_VALUE)?.textContent?.trim();
        if (key && value) specs[key] = value;
      });

      return {
        title,
        brand,
        mainImageUrl,
        galleryImageUrls,
        priceCurrentDollars,
        priceWas,
        ratingStars, 
        reviewCount,
        availability,
        shippingText,
        isFreeShipping,
        descriptionBullets,
        specs,
      } satisfies Omit<ProductInfoData, 'url' | 'scrapedAt'>;
    }, SEL);

   
    const shippingText = await page.textContent(SEL.DETAIL_SHIPPING, { timeout: 5_000 }).catch(() => null);
    raw.shippingText = shippingText?.trim() ?? null;
    raw.isFreeShipping = shippingText?.toLowerCase().includes('free') ?? false;
    return new ProductInfo({ ...raw, url, scrapedAt: new Date() });
  }
}
