import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // getTracker padrao do throttler usa apenas IP.
    // E nos queremos usar o IP e o user-agent
    return `${req.ip}-${req.headers["user-agent"]}`;
  }
}
