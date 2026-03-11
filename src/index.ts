export { ProductListItem } from './models/ProductListItem';
export type { ProductListItemData } from './models/ProductListItem';
export { ProductListPage } from './models/ProductListPage';
export type { ProductListPageData } from './models/ProductListPage';
export { NeweggRetailer } from './NeweggRetailer';
export type { GetProductListOptions } from './NeweggRetailer';

// Run as a script: npx ts-node src/index.ts
import { NeweggRetailer } from './NeweggRetailer';

async function main() {
  const retailer = new NeweggRetailer();

  console.log('Fetching product list for "ddr5"...');
  const productList = await retailer.getProductList({ keywords: 'ddr5' });

  console.log(`\nURL: ${productList.url}`);
  console.log(`Page ${productList.currentPage} of ${productList.totalPages ?? '?'}`);
  console.log(`Items scraped: ${productList.itemCount}`);
  console.log(`Scraped at: ${productList.scrapedAt.toISOString()}`);
  console.log('\nFirst 3 items:');
  console.log(JSON.stringify(productList.items.slice(0, 3), null, 2));
}

main().catch(console.error);
