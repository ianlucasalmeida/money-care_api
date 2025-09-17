import { IsNotEmpty, IsNumber, IsString, IsDateString, IsOptional, IsIn, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// DTO para um item individual dentro da transação
class TransactionItemDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  unitPrice: number;

  @IsNumber()
  @IsNotEmpty()
  totalPrice: number;
}

export class CreateTransactionDto {
  @IsString({ message: 'A descrição deve ser um texto.' })
  @IsNotEmpty({ message: 'A descrição não pode ser vazia.' })
  description: string;

  @IsNumber({}, { message: 'O valor deve ser um número.' })
  @IsNotEmpty({ message: 'O valor não pode ser vazio.' })
  amount: number;

  @IsIn(['income', 'expense'], { message: 'O tipo deve ser "income" ou "expense".' })
  type: 'income' | 'expense';

  @IsDateString({}, { message: 'A data deve estar no formato de data válido (ISO 8601).' })
  @IsOptional()
  date?: Date;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsInt({ message: 'O ID da categoria deve ser um número inteiro.' })
  @IsNotEmpty({ message: 'O ID da categoria não pode ser vazio.' })
  categoryId: number;

  // MUDANÇA: Adicionada a validação para a lista de itens (opcional)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionItemDto)
  @IsOptional()
  items?: TransactionItemDto[];
}