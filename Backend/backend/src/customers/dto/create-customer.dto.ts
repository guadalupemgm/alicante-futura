<<<<<<< HEAD
import { IsString, IsOptional } from 'class-validator';
=======
import { IsEmail, IsString, Matches } from 'class-validator';
>>>>>>> e1b3fb2182e54d464229d93a0bbe3d13edf285f7

export class CreateCustomerDto {
  @IsString()
  name!: string;

  @IsString()
<<<<<<< HEAD
  email!: string;

  @IsString()
  phone!: string;

  @IsOptional()
  @IsString()
  business?: string;
=======
  @Matches(/^\d{9}$/, { message: 'El teléfono debe tener 9 dígitos' })
  phone!: string;

  @IsEmail({}, { message: 'El email no es válido' })
  email!: string;

  @IsString()
  business!: string;
>>>>>>> e1b3fb2182e54d464229d93a0bbe3d13edf285f7
}