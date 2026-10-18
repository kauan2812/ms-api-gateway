import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import helmet from "helmet";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || ["*"];

      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers",
    ],
    credentials: true,
    maxAge: 86400, // 24 hours
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle("API Gateway")
    .setDescription(
      `
        API Gateway for the Marketplace microservices system

        Available services:
          - Users Service: User authentication and management
          - Products Service: Product catalog and management
          - Checkout Service: Cart and order processing
          - Payments Service: Payment processing

        Authentication:
          - Use a JWT Bearer token for protected routes
          - Use a session token for session validation
      `,
    )
    .setVersion("1.0")
    .setContact(
      "Marketplace Team",
      "<https://marketplace.com>",
      "dev@marketplace.com",
    )
    .setLicense("MIT", "<https://opensource.org/licenses/MIT>")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "JWT-auth",
    )
    .addApiKey(
      {
        type: "apiKey",
        name: "x-session-token",
        in: "header",
        description: "Session token for user validation",
      },
      "session-auth",
    )
    .addTag("Authentication", "Authentication and authorization endpoints")
    .addTag("Users", "User management endpoints")
    .addTag("Products", "Product catalog endpoints")
    .addTag("Checkout", "Cart and order endpoints")
    .addTag("Payments", "Payment processing endpoints")
    .addTag("Health", "Health monitoring endpoints")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  const port = process.env.PORT ?? 3005;

  await app.listen(port);

  console.log(`Server is running on port ${port}`);
  console.log(`Swagger UI is available at http://localhost:${port}/api`);
}
bootstrap();
