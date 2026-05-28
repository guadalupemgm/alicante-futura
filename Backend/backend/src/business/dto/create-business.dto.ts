import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateBusinessDto {
  @ApiProperty({ example: 'Peluquería Central' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Calle Mayor 10, Alicante' })
  @IsString()
  address!: string;

  @ApiPropertyOptional({ example: 'peluquería' })
  @IsOptional() @IsString()
  category?: string;

  @ApiPropertyOptional({ example: '965123456' })
  @IsOptional() @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional() @IsString()
  status?: string;

  @ApiProperty({ example: 'negocio@ejemplo.com' })
  @IsEmail()
  ownerEmail!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  ownerPassword!: string;
}
