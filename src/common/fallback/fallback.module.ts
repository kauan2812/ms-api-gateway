import { Module } from "@nestjs/common";
import { CacheFallbackService } from "./cache.fallback";
import { DefaultFallbackService } from "./default.fallback";

@Module({
  providers: [CacheFallbackService, DefaultFallbackService],
  exports: [CacheFallbackService, DefaultFallbackService],
})
export class FallbackModule {}
