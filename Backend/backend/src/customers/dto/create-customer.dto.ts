import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'María López' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'maria@ejemplo.com' })
  @IsString()
  email!: string;

  @ApiProperty({ example: '600123456' })
  @IsString()
  phone!: string;

  @ApiPropertyOptional({ example: 'Peluquería Central' })
  @IsOptional()
  @IsString()
  business?: string;
}
