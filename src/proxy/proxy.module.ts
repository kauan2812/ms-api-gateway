import { Module } from "@nestjs/common";
import { ProxyService } from "./service/proxy.service";
import { HttpModule } from "@nestjs/axios";
import { CircuitBreakerModule } from "src/common/circuit-breaker/circuit-breaker.module";
import { FallbackModule } from "src/common/fallback/fallback.module";

@Module({
  imports: [HttpModule, CircuitBreakerModule, FallbackModule],
  providers: [ProxyService],
  exports: [ProxyService],
})
export class ProxyModule {}
