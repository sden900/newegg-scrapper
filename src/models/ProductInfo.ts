export interface ProductInfoData {
  url: string;
  title: string;
  brand: string | null;
  mainImageUrl: string | null;
  galleryImageUrls: string[];
  priceCurrentDollars: number | null;
  priceWas: number | null;
  ratingStars: number | null;
  reviewCount: number | null;
  availability: string | null;
  shippingText: string | null;
  isFreeShipping: boolean;
  descriptionBullets: string[];
  specs: Record<string, string>;
  scrapedAt: Date;
}

export class ProductInfo implements ProductInfoData {
  url: string;
  title: string;
  brand: string | null;
  mainImageUrl: string | null;
  galleryImageUrls: string[];
  priceCurrentDollars: number | null;
  priceWas: number | null;
  ratingStars: number | null;
  reviewCount: number | null;
  availability: string | null;
  shippingText: string | null;
  isFreeShipping: boolean;
  descriptionBullets: string[];
  specs: Record<string, string>;
  scrapedAt: Date;

  constructor(data: ProductInfoData) {
    this.url = data.url;
    this.title = data.title;
    this.brand = data.brand;
    this.mainImageUrl = data.mainImageUrl;
    this.galleryImageUrls = data.galleryImageUrls;
    this.priceCurrentDollars = data.priceCurrentDollars;
    this.priceWas = data.priceWas;
    this.ratingStars = data.ratingStars;
    this.reviewCount = data.reviewCount;
    this.availability = data.availability;
    this.shippingText = data.shippingText;
    this.isFreeShipping = data.isFreeShipping;
    this.descriptionBullets = data.descriptionBullets;
    this.specs = data.specs;
    this.scrapedAt = data.scrapedAt;
  }

  toJSON(): ProductInfoData {
    return { ...this };
  }
}
