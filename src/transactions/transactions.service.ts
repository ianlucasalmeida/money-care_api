import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Ajuste o caminho se necessário
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto, userId: number) {
    // Separa os 'items' do resto dos dados da transação
    const { categoryId, items, ...transactionData } = createTransactionDto;

    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        OR: [{ userId: null }, { userId }],
      },
    });

    if (!category) {
      throw new NotFoundException(`Categoria com ID ${categoryId} não encontrada.`);
    }
    
    const transactionDate = transactionData.date ? new Date(transactionData.date) : new Date();

    // Usa uma transação do Prisma para garantir que ou tudo é salvo, ou nada é salvo.
    return this.prisma.$transaction(async (tx) => {
      // 1. Cria a transação principal
      const newTransaction = await tx.transaction.create({
        data: {
          ...transactionData,
          date: transactionDate,
          userId,
          categoryId,
        },
      });

      // 2. Se houver itens, prepara e salva todos eles, associando ao ID da transação criada
      if (items && items.length > 0) {
        await tx.transactionItem.createMany({
          data: items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            transactionId: newTransaction.id, // Link para a transação principal
          })),
        });
      }

      // 3. Retorna a transação completa com os itens para o front-end
      return tx.transaction.findUnique({
        where: { id: newTransaction.id },
        include: { category: true, items: true },
      });
    });
  }

  findAllByUser(userId: number) {
    return this.prisma.transaction.findMany({
      where: { userId },
      include: {
        category: true,
        items: true, // Agora também incluímos os itens ao listar transações
      },
      orderBy: {
        date: 'desc',
      },
    });
  }
}