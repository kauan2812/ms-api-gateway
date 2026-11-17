import { Injectable, Logger } from "@nestjs/common";
import { healthStatus, ServiceHealthInterface } from "./health-check.interface";
import { HttpService } from "@nestjs/axios";
import { CircuitBreakerService } from "../circuit-breaker/circuit-breaker.service";
import { serviceConfig } from "src/config/gateway.config";
import { firstValueFrom, timeout } from "rxjs";

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name);
  private readonly healthCache = new Map<string, ServiceHealthInterface>();

  constructor(
    private readonly httpService: HttpService,
    private readonly circuitBreakerService: CircuitBreakerService,
  ) {}

  async checkServiceHealth(
    serviceName: keyof typeof serviceConfig,
  ): Promise<ServiceHealthInterface> {
    const service = serviceConfig[serviceName];
    const startTime = Date.now();

    try {
      const operantion = async () => {
        const response = await firstValueFrom(
          this.httpService
            .get(`${service.url}/halth`, {
              timeout: service.timeout,
            })
            .pipe(timeout(service.timeout)),
        );

        return response.status;
      };
      const key = `health-${serviceName}`;
      const fallback = async () => {
        throw new Error("Circuit breaker fallback");
      };

      await this.circuitBreakerService.executeWithCircuitBreaker(
        operantion,
        key,
        fallback,
      );

      const responseTime = Date.now() - startTime;

      const serviceHealh: ServiceHealthInterface = {
        name: serviceName,
        url: service.url,
        status: healthStatus.HEALTHY,
        responseTime,
        lastChecked: new Date(),
      };

      this.healthCache.set(serviceName, serviceHealh);

      return serviceHealh;
    } catch (err) {
      const responseTime = Date.now() - startTime;
      const serviceHealh: ServiceHealthInterface = {
        name: serviceName,
        url: service.url,
        status: healthStatus.UNHEALTHY,
        responseTime,
        lastChecked: new Date(),
        error: err.message,
      };

      this.healthCache.set(serviceName, serviceHealh);
      this.logger.error(
        `Health check failed for ${serviceName}: ${err.message}`,
      );

      return serviceHealh;
    }
  }

  async checkAllService(): Promise<ServiceHealthInterface[]> {
    const services: (keyof typeof serviceConfig)[] = [
      "users",
      "products",
      "checkout",
      "payments",
    ];

    const healthChecks = await Promise.allSettled(
      services.map((service) => this.checkServiceHealth(service)),
    );

    return healthChecks.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return {
          name: services[index],
          url: serviceConfig[services[index]].url,
          status: healthStatus.UNHEALTHY,
          responseTime: 0,
          lastChecked: new Date(),
          error: result.reason?.message || "Unknown error",
        };
      }
    });
  }

  getCachedHealth(
    serviceName: keyof typeof serviceConfig,
  ): ServiceHealthInterface | undefined {
    return this.healthCache.get(serviceName);
  }

  getAllCachedHealth(): ServiceHealthInterface[] {
    return Array.from(this.healthCache.values());
  }
}
