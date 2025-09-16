// src/transactions/dto/create-transaction.dto.ts
import { IsNotEmpty, IsNumber, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  type: 'income' | 'expense';

  @IsDateString()
  date: Date;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsNotEmpty()
  categoryId: number;
}