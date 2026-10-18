import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

enum Role {
  USER = "user",
  ADMIN = "admin",
  SELLER = "seller",
}

export class RegisterDto {
  @ApiProperty({
    description: "Email do usuário",
    example: "user@example.com",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "Senha do usuário",
    example: "password@123",
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: "Primeiro nome",
    example: "João",
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: "Segundo nome",
    example: "Silva",
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: "Role do usuário",
    example: "user",
    enum: ["user", "admin", "seller"],
    required: false,
  })
  @IsOptional()
  @IsString()
  role?: Role = Role.USER;
}
