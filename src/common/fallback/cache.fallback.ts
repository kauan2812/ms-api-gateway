import { Logger, Injectable } from "@nestjs/common";

@Injectable()
export class CacheFallbackService {
  private readonly logger = new Logger(CacheFallbackService.name);
  private readonly cache = new Map<string, { data: any; timestamp: number }>();

  async getCacheData<T>(
    key: string,
    timeout: number = 300000,
  ): Promise<T | null> {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    const isExpired = Date.now() - cached.timestamp > timeout;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    this.logger.log(`Cache HIT for key: ${key}`);
    return cached.data;
  }

  setCacheData<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    this.logger.log(`Cache SET for key ${key}`);
  }

  createCacheFallback<T>(
    key: string,
    defaultData: T,
    timeout: number = 300000,
  ): () => Promise<T> {
    return async (): Promise<T> => {
      const cached = await this.getCacheData<T>(key, timeout);

      if (cached) {
        this.logger.log(`Using cached data for ${key}`);
        return cached;
      }

      this.logger.warn(`No cached data available for ${key}, using default`);
      return defaultData;
    };
  }
}
