import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { ProxyModule } from "./proxy/proxy.module";
import { MiddlewareModule } from "./middleware/middleware.module";
import { LoggingMiddleware } from "./middleware/logging/logging.middleware";
import { AuthModule } from "./auth/auth.module";
import { APP_GUARD } from "@nestjs/core";
import { CustomThrottlerGuard } from "./guards/throttler.guard";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          name: "short",
          ttl: 1000, // 1 second
          limit: configService.get<number>("RATE_LIMIT_SHORT", 10), // 10 requests per minute
        },
        {
          name: "medium",
          ttl: 60000, // 1 minute
          limit: configService.get<number>("RATE_LIMIT_MEDIUM", 100), // 100 requests per minute
        },
        {
          name: "long",
          ttl: 900000, // 15 minute
          limit: configService.get<number>("RATE_LIMIT_LONG", 1000), // 1000 requests per minute
        },
      ],
      inject: [ConfigService],
    }),
    ProxyModule,
    MiddlewareModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: CustomThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes("*");
  }
}
