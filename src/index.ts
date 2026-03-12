export { ProductListItem } from './models/ProductListItem';
export type { ProductListItemData } from './models/ProductListItem';
export { ProductListPage } from './models/ProductListPage';
export type { ProductListPageData } from './models/ProductListPage';
export { NeweggRetailer } from './NeweggRetailer';
export type { GetProductListOptions, NeweggRetailerConfig, ProductListResult, PageSize, GetProductInfoOptions, ProductInfoResult } from './NeweggRetailer';
export { ProductInfo } from './models/ProductInfo';
export type { ProductInfoData } from './models/ProductInfo';
export { ProxyProvider } from './Proxy';
export type { ProxyConfig } from './Proxy';

// Run as a script: npx ts-node src/index.ts
import { NeweggRetailer } from './NeweggRetailer';

async function main() {
  const retailer = new NeweggRetailer();
  const keywords = 'Ryzen 7 5800XT';
  const allItems: import('./models/ProductListItem').ProductListItem[] = [];
  let currentPage = 1;
  let totalPages: number | null = null;

  do {
    console.log(`\nFetching page ${currentPage}${totalPages ? ` of ${totalPages}` : ''}...`);

    // first page always has one extra item probably due to a "Newegg Select" item on the top
    const result = await retailer.getProductList({ keywords, page: currentPage, pageSize: 96 });

    if (result.status === 'error') {
      console.error(`Failed on page ${currentPage}: ${result.error}`);
      break;
    }

    const page = result.data;
    totalPages = page.totalPages;
    allItems.push(...page.items);
    console.log(`  Collected ${page.itemCount} items (total so far: ${allItems.length})`);
    
    if (!page.hasNextPage) break;
    currentPage++;
  } while (true);

  console.log(`\nDone. Total items collected: ${allItems.length}`);
  console.log('\nFirst 3 items:');
  console.log(JSON.stringify(allItems.slice(0, 3), null, 2));

  const result = await retailer.getProductInfo({ url: allItems[0].productUrl, proxy: undefined });
  console.log('\nFirst item detailed info:');
  console.log(JSON.stringify(result, null, 2));

}

main().catch(console.error);

