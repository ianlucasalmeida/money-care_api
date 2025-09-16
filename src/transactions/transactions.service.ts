import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto, userId: number) {
    // Verifica se a categoria existe e pertence ao usuário (ou é uma categoria padrão)
    const category = await this.prisma.category.findFirst({
      where: {
        id: createTransactionDto.categoryId,
        OR: [{ userId: null }, { userId }],
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada.');
    }

    return this.prisma.transaction.create({
      data: {
        ...createTransactionDto,
        userId,
      },
    });
  }

  findAllByUser(userId: number) {
    return this.prisma.transaction.findMany({
      where: { userId },
      include: {
        category: true, // Inclui os dados da categoria na resposta
      },
      orderBy: {
        date: 'desc',
      },
    });
  }
}