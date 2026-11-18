import { Module } from "@nestjs/common";
import { HealthCheckService } from "./health-check.service";
import { CircuitBreakerModule } from "../circuit-breaker/circuit-breaker.module";
import { HttpModule } from "@nestjs/axios";

@Module({
  providers: [HealthCheckService],
  exports: [HealthCheckService],
  imports: [CircuitBreakerModule, HttpModule],
})
export class HealthCheckModule {}
