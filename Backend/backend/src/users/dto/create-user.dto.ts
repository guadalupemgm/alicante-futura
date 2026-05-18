import { IsString, MinLength, IsEmail, IsOptional, IsNumber } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  role?: UserRole;

  @IsOptional()
  @IsNumber()
  businessId?: number;
}