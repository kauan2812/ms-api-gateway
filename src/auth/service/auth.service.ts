import { HttpService } from "@nestjs/axios";
import { JwtService } from "@nestjs/jwt";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { serviceConfig } from "src/config/gateway.config";
import { RegisterDto } from "../dtos/register.dto";
import { LoginDto } from "../dtos/login.dto";

export interface UserSession {
  valid: boolean;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
  } | null;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
  ) {}

  async validateJwtToken(token: string): Promise<AuthResponse> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException("Invalid token");
    }
  }

  async validateSessionToken(sessionToken: string): Promise<UserSession> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          `${serviceConfig.users.url}/sessions/validate/${sessionToken}`,
          { timeout: serviceConfig.users.timeout },
        ),
      );
      return data;
    } catch (error) {
      throw new UnauthorizedException("Invalid session token");
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${serviceConfig.users.url}/login`, loginDto, {
          timeout: serviceConfig.users.timeout,
        }),
      );
      return data;
    } catch (error) {
      throw new UnauthorizedException("Invalid credentials");
    }
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          `${serviceConfig.users.url}/auth/register`,
          registerDto,
          {
            timeout: serviceConfig.users.timeout,
          },
        ),
      );
      return data;
    } catch (error) {
      throw new UnauthorizedException("Invalid credentials");
    }
  }
}
