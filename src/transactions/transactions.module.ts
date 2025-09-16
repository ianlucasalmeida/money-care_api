import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule], // Importa o PrismaModule para usar o PrismaService
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}