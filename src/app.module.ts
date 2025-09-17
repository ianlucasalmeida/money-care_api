import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ReceiptsModule } from './receipts/receipts.module';
import { TransactionsModule } from './transactions/transactions.module'; // <-- IMPORTE AQUI

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ReceiptsModule,
    TransactionsModule, // <-- ADICIONE AQUI
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}