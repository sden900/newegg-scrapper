/* 
skeleton class for implementing proxy logic. 
Here we need to implement queries to the database with proxy tables, queries to the provider's API, etc.
*/

export interface ProxyConfig {
  server: string;       // e.g. "http://proxy-host:8080"
  username?: string;
  password?: string;
}

export class ProxyProvider {
  private readonly proxies: ProxyConfig[];
  private lastProxy: ProxyConfig | null = null;

  constructor(proxies: ProxyConfig[]) {
    this.proxies = proxies;
  }

  /** Returns the last used proxy, a new random one if none used yet, or null if the list is empty. */
  GetLastProxy(): ProxyConfig | null {
    if (this.proxies.length === 0) return null;
    if (this.lastProxy) return this.lastProxy;
    return this.GetRandomProxy();
  }

  /** Clears the last used proxy so the next GetLastProxy call picks a fresh random one. */
  ResetProxy(): void {
    this.lastProxy = null;
  }

  /** Picks a random proxy from the list, saves it as the last used, and returns it. */
  GetRandomProxy(): ProxyConfig {
    const index = Math.floor(Math.random() * this.proxies.length);
    this.lastProxy = this.proxies[index];
    return this.lastProxy;
  }
}
