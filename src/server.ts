import http from 'http';
import { NeweggRetailer } from './NeweggRetailer';
import { ProxyProvider } from './Proxy';

const PORT = 3129;
const retailer = new NeweggRetailer();
const proxy = new ProxyProvider([{ server: 'http://203.24.108.161:8080' }]); // Example proxy; replace with your own or set to null for no proxy

const server = http.createServer(async (req, res) => {
  const parsed = new URL(req.url ?? '/', `http://localhost:${PORT}`);

  if (parsed.pathname === '/neweggProductInfo') {
    const url = parsed.searchParams.get('url');
    if (!url) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing required query parameter: url' }));
      return;
    }

    const result = await retailer.getProductInfo({ url, proxy });
    const statusCode = result.status === 'success' ? 200 : 502;
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  if (parsed.pathname === '/neweggProductList') {
    const keywords = parsed.searchParams.get('keywords');
    if (!keywords) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing required query parameter: keywords' }));
      return;
    }

    const maxResultsParam = parsed.searchParams.get('maxResults');
    const maxResults = maxResultsParam ? parseInt(maxResultsParam, 10) : undefined;

    const result = await retailer.getProductList({ keywords, maxResults, proxy });
    const statusCode = result.status === 'success' ? 200 : 502;
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
