import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class WithdrawWalletDto {
  /** Minimum currency unit is cents */
  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;
}
