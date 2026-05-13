import { IsString, IsNumber, IsInt } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  amount!: number;

  @IsString()
  method!: string;

  @IsString()
  status!: string;

  @IsInt()
  appointmentId!: number;
}