export interface FallbackStrategy<T> {
  execute(): Promise<T>;
}

export interface FallbackOptions {
  useCache?: boolean;
  cacheTimeout?: number;
  defaultResponse?: any;
  retryCount?: number;
  retryDelay?: number;
}
