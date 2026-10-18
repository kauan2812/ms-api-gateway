import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP");

  use(req: Request, res: Response, next: () => void) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get("User-agent") || "";
    const startTime = Date.now();

    this.logger.log(
      `Incoming Request: ${method} ${originalUrl} - IP: ${ip} - User-Agent: ${userAgent}`,
    );

    res.on("finish", () => {
      const { statusCode } = res;
      const contentLength = res.get("Content-Length") || 0;
      const duration = Date.now() - startTime;
      this.logger.log(
        `Outgoing Response: ${statusCode} - Content-Length: ${contentLength} - Duration: ${duration}ms`,
      );

      if (statusCode >= 400) {
        this.logger.error(
          `Error request ${method} ${originalUrl} - ${statusCode} - ${duration}ms`,
        );
      }
    });

    res.on("error", (error) => {
      this.logger.error(
        `Response error: ${method} ${originalUrl} - ${error.message}`,
      );
    });

    res.on("timeout", () => {
      this.logger.warn(
        `Request timeout: ${method} ${originalUrl} - ${Date.now() - startTime}ms`,
      );
    });

    next();
  }
}
