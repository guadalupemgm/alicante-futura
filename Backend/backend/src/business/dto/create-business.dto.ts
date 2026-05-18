import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateBusinessDto {
  @IsString()
  name!: string;

  @IsString()
  address!: string;

  @IsOptional() @IsString()
  category?: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  status?: string;

  // 👇 NUEVOS
  @IsEmail()
  ownerEmail!: string;

  @IsString()
  ownerPassword!: string;
}