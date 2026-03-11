export interface ProductListItemData {
  title: string;
  imageUrl: string | null;
  priceCurrentDollars: number | null;
  priceWas: number | null;
  ratingStars: number | null;
  reviewCount: number | null;
  shippingText: string | null;
  isFreeShipping: boolean;
  isSponsored: boolean;
  productUrl: string | null;
}

export class ProductListItem implements ProductListItemData {
  title: string;
  imageUrl: string | null;
  priceCurrentDollars: number | null;
  priceWas: number | null;
  ratingStars: number | null;
  reviewCount: number | null;
  shippingText: string | null;
  isFreeShipping: boolean;
  isSponsored: boolean;
  productUrl: string | null;

  constructor(data: ProductListItemData) {
    this.title = data.title;
    this.imageUrl = data.imageUrl;
    this.priceCurrentDollars = data.priceCurrentDollars;
    this.priceWas = data.priceWas;
    this.ratingStars = data.ratingStars;
    this.reviewCount = data.reviewCount;
    this.shippingText = data.shippingText;
    this.isFreeShipping = data.isFreeShipping;
    this.isSponsored = data.isSponsored;
    this.productUrl = data.productUrl;
  }

  toJSON(): ProductListItemData {
    return { ...this };
  }
}
