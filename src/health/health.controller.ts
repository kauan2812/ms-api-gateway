import { Controller, Get, Param } from "@nestjs/common";
import { HealthCheckService } from "src/common/health/health-check.service";
import { HealthService } from "./health.service";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { version } from "node:process";

@Controller("health")
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly healthService: HealthService,
  ) {}

  @Get()
  @ApiOperation({ summary: "Health check do gateway " })
  @ApiResponse({ status: 200, description: "Gateway está saudável" })
  async getHealth() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || "1.0.0",
    };
  }

  @Get("services")
  @ApiOperation({ summary: "Health check de todos os serviços" })
  @ApiResponse({ status: 200, description: "Status de todos os serviços" })
  async getServicesHealth() {
    const services = await this.healthCheckService.checkAllServices();

    const overallStatus = services.every((s) => s.status === "healthy")
      ? "healthy"
      : services.some((s) => s.status === "healthy")
        ? "degraded"
        : "unhealthy";

    return {
      overallStatus,
      timestamp: new Date().toISOString(),
      services,
      summary: {
        total: services.length,
        healthy: services.filter((s) => s.status === "healthy").length,
        unhealthy: services.filter((s) => s.status === "unhealthy").length,
        degraded: services.filter((s) => s.status === "degraded").length,
      },
    };
  }

  @Get("services/:serviceName")
  @ApiOperation({ summary: "Health check de um serviço específico" })
  @ApiResponse({ status: 200, description: "Status do serviço" })
  async getServiceHealth(@Param("serviceName") serviceName: string) {
    const cached = this.healthCheckService.getCachedHealth(serviceName);

    if (!cached) {
      return {
        status: "unknown",
        message: "Service not found or never checked",
        timestamp: new Date().toISOString(),
      };
    }

    return cached;
  }

  @Get("ready")
  @ApiOperation({ summary: "Get readiness status" })
  @ApiResponse({
    status: 200,
    description: "Readiness status retrieved successfully",
  })
  async getReady() {
    return this.healthService.getReadyStatus();
  }

  @Get("live")
  @ApiOperation({ summary: "Get liveness status" })
  @ApiResponse({
    status: 200,
    description: "Liveness status retrieved successfully",
  })
  async getLive() {
    return this.healthService.getLiveStatus();
  }
}
