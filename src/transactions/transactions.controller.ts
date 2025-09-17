import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Req() req: { user?: { sub?: number | string } }
  ) {
    const userId =
      req.user && typeof req.user.sub !== 'undefined'
        ? Number(req.user.sub)
        : undefined;
    if (typeof userId !== 'number' || isNaN(userId)) {
      throw new Error('Invalid user id');
    }
    return this.transactionsService.create(createTransactionDto, userId);
  }
}