import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";
import { HealthCheckModule } from "src/common/health/health-check.module";

@Module({
  controllers: [HealthController],
  providers: [HealthService],
  imports: [HealthCheckModule],
})
export class HealthModule {}
