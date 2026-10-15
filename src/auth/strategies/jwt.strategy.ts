import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "../service/auth.service";
import { ExtractJwt, Strategy } from "passport-jwt";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }
  return secret;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  async validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException("Invalid token");
    }
    const user = await this.authService.validateJwtToken(payload.token);
    if (!user) {
      throw new UnauthorizedException("Invalid token");
    }
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
