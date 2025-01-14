import { IsEmail, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class TransferFundsDto {
  @IsNumber()
  @Min(500)
  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  @IsEmail()
  recipientEmail: string;

  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;
}
