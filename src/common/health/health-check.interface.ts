export enum healthStatus {
  HEALTHY = "healthy",
  UNHEALTHY = "unhealthy",
  DEGRADED = "degraded",
}

export interface ServiceHealthInterface {
  name: string;
  url: string;
  status: healthStatus;
  responseTime: number;
  lastChecked: Date;
  error?: Error;
}
