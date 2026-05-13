import { IsString, IsOptional } from 'class-validator';

export class CreateBusinessDto {
  @IsString()
  name!: string;

  @IsString()
  address!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  status?: string;
}