import { ProductListItem } from './ProductListItem';

export interface ProductListPageData {
  keywords: string;
  url: string;
  currentPage: number;
  totalPages: number | null;
  items: ProductListItem[];
  scrapedAt: Date;
}

export class ProductListPage implements ProductListPageData {
  keywords: string;
  url: string;
  currentPage: number;
  totalPages: number | null;
  items: ProductListItem[];
  scrapedAt: Date;

  constructor(data: ProductListPageData) {
    this.keywords = data.keywords;
    this.url = data.url;
    this.currentPage = data.currentPage;
    this.totalPages = data.totalPages;
    this.items = data.items;
    this.scrapedAt = data.scrapedAt;
  }

  get itemCount(): number {
    return this.items.length;
  }

  get hasNextPage(): boolean {
    if (this.totalPages === null) return false;
    return this.currentPage < this.totalPages;
  }
}
