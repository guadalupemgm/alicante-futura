import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, IsEmail, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @ApiPropertyOptional({ example: 'juangarcia' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ example: 'juan@ejemplo.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123', minLength: 4 })
  @IsString()
  @MinLength(4)
  password!: string;

  @ApiPropertyOptional({ example: 'Juan García' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '600123456' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'customer', enum: ['admin', 'business', 'customer'] })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  businessId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  customerId?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
