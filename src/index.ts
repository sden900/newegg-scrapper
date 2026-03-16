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
import { ProxyProvider } from './Proxy';

async function main() {
  const proxy = new ProxyProvider([{ server: 'http://203.24.108.161:8080' }]); // Example proxy; replace with your own or set to null for no proxy
  const retailer = new NeweggRetailer();
  const keywords = 'Ryzen 7 5800XT';

  const listResult = await retailer.getProductList({ keywords, proxy });
  if (listResult.status === 'error') {
    console.error(`Failed to fetch products: ${listResult.error}`);
    return;
  }

  const allItems = listResult.data;
  console.log(`\nDone. Total items collected: ${allItems.length}`);
  console.log('\nFirst 3 items:');
  console.log(JSON.stringify(allItems.slice(0, 3), null, 2));

  const result = await retailer.getProductInfo({ url: allItems[0].productUrl, proxy });
  console.log('\nFirst item detailed info:');
  console.log(JSON.stringify(result, null, 2));

}

main().catch(console.error);

