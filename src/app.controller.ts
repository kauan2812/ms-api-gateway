import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { ProxyService } from "./proxy/service/proxy.service";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly proxyService: ProxyService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("health")
  async getHealth() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      services: {
        users: await this.proxyService.getServiceHealth("users"),
        products: await this.proxyService.getServiceHealth("products"),
        checkout: await this.proxyService.getServiceHealth("checkout"),
        payments: await this.proxyService.getServiceHealth("payments"),
      },
    };
  }
}
