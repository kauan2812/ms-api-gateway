import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

enum Role {
  USER = "user",
  ADMIN = "admin",
  SELLER = "seller",
}

export class RegisterDto {
  @ApiProperty({
    description: "User email",
    example: "user@example.com",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "User password",
    example: "password@123",
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: "First name",
    example: "John",
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: "Last name",
    example: "Doe",
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: "User role",
    example: "user",
    enum: ["user", "admin", "seller"],
    required: false,
  })
  @IsOptional()
  @IsString()
  role?: Role = Role.USER;
}
