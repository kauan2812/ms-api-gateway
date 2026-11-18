export enum HealthStatus {
  HEALTHY = "healthy",
  UNHEALTHY = "unhealthy",
  DEGRADED = "degraded",
}

export interface ServiceHealthInterface {
  name: string;
  url: string;
  status: HealthStatus;
  responseTime: number;
  lastChecked: Date;
  error?: Error;
}
