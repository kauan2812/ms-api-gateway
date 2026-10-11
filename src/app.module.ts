import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { ProxyModule } from "./proxy/proxy.module";
import { MiddlewareModule } from "./middleware/middleware.module";
import { LoggingMiddleware } from "./middleware/logging/logging.middleware";
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: "short",
          ttl: 1000, // 1 second
          limit: 10, // 10 requests per minute
        },
        {
          name: "medium",
          ttl: 60000, // 1 minute
          limit: 100, // 100 requests per minute
        },
        {
          name: "long",
          ttl: 900000, // 15 minutes
          limit: 1000, // 1000 requests per minute
        },
      ],
    }),
    ProxyModule,
    MiddlewareModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes("*");
  }
}
