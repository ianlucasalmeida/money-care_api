import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Importe seu guarda de autenticação
import { CreateTransactionDto } from './dto/create-transaction.dto'; // Crie este DTO

@Controller('transactions')
@UseGuards(JwtAuthGuard) // Protege TODAS as rotas neste controlador
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // ESTE É O MÉTODO QUE ESTAVA FALTANDO
  @Get()
  findAll(@Req() req) {
    // O JwtAuthGuard anexa o 'user' ao objeto de requisição (req)
    // Assim, sabemos para qual usuário buscar as transações.
    const userId = req.user.sub; // 'sub' é o ID do usuário no payload do token
    return this.transactionsService.findAllByUser(userId);
  }

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto, @Req() req) {
    const userId = req.user.sub;
    return this.transactionsService.create(createTransactionDto, userId);
  }
}