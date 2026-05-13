import { IsEmail, IsString, Matches } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  name!: string;

  @IsString()
  @Matches(/^\d{9}$/, { message: 'El teléfono debe tener 9 dígitos' })
  phone!: string;

  @IsEmail({}, { message: 'El email no es válido' })
  email!: string;

  @IsString()
  business!: string;
}