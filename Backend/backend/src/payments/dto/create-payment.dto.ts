import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsInt } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 35.0 })
  @IsNumber()
  amount!: number;

  @ApiProperty({ example: 'card' })
  @IsString()
  method!: string;

  @ApiProperty({ example: 'paid' })
  @IsString()
  status!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  appointmentId!: number;
}
