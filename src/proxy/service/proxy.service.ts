import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { AxiosResponse } from "axios";
import { firstValueFrom } from "rxjs";
import { CircuitBreakerService } from "src/common/circuit-breaker/circuit-breaker.service";
import { serviceConfig } from "src/config/gateway.config";

interface UserInfo {
  userId: string;
  email: string;
  role: string;
}

type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly httpService: HttpService,
  ) {}

  async proxyRequest(
    serviceName: keyof typeof serviceConfig,
    method: string,
    path: string,
    data?: unknown,
    headers?: Record<string, string>,
    userInfo?: UserInfo,
  ): Promise<AxiosResponse> {
    const service = serviceConfig[serviceName];
    const url = `${service.url}${path}`;

    this.logger.log(`Proxying ${method} request to ${serviceName}: ${url}`);

    return this.circuitBreakerService.executeWithCircuitBreaker(
      async () => {
        const enhancedHeaders = {
          ...headers,
          "x-user-id": userInfo?.userId,
          "x-user-email": userInfo?.email,
          "x-user-role": userInfo?.role,
        };

        const response = await firstValueFrom(
          this.httpService.request({
            method: method.toLowerCase() as HttpMethod,
            url,
            data,
            headers: enhancedHeaders,
            timeout: service.timeout,
          }),
        );

        return response;
      },
      `proxy-${serviceName}`,
      () => {
        throw new Error(`${serviceName} service is temporarily unavailable`);
      },
      { failureThreshold: 3, timeout: 30000, resetTimeout: 30000 },
    );
  }

  async getServiceHealth(serviceName: keyof typeof serviceConfig) {
    try {
      const service = serviceConfig[serviceName];
      const response = await firstValueFrom(
        this.httpService.get(`${service.url}/health`, {
          timeout: 3000,
        }),
      );
      return { status: "healthy", data: response.data };
    } catch (error) {
      return { status: "unhealthy", error: error.message };
    }
  }
}
