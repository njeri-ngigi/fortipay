import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class FundWalletDto {
  /** Minimum currency unit is cents */
  @IsNumber()
  @Min(500)
  amount: number;

  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;
}
