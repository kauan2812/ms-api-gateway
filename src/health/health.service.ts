import { Injectable } from "@nestjs/common";
import { HealthStatus } from "src/common/health/health-check.interface";
import { HealthCheckService } from "src/common/health/health-check.service";

@Injectable()
export class HealthService {
  constructor(private readonly healthCheckService: HealthCheckService) {}

  async getHealthStatus() {
    const healthChecks = await this.healthCheckService.checkAllServices();

    const results = {
      status: HealthStatus.HEALTHY,
      timestamp: new Date().toISOString(),
      gateway: {
        status: HealthStatus.HEALTHY,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      },
      services: {},
    };

    let hasUnhealthyServices = false;

    healthChecks.forEach((serviceHealth) => {
      results.services[serviceHealth.name] = {
        status: serviceHealth.status,
        responseTime: serviceHealth.responseTime,
        lastCheck: serviceHealth.lastChecked,
        url: serviceHealth.url,
        ...(serviceHealth.error && { error: serviceHealth.error }),
      };

      if (serviceHealth.status === "unhealthy") {
        hasUnhealthyServices = true;
      }
    });

    if (hasUnhealthyServices) {
      results.status = HealthStatus.DEGRADED;
    }

    return results;
  }

  async getReadyStatus() {
    const healthStatus = await this.getHealthStatus();

    return {
      status:
        healthStatus.status === HealthStatus.HEALTHY ? "ready" : "not_ready",
      timestamp: new Date().toISOString(),
    };
  }

  async getLiveStatus() {
    return {
      status: "alive",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
