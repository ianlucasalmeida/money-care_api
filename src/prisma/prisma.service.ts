import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();
  }

  async onModuleInit() {
    // Conecta ao banco de dados quando o módulo é iniciado
    await this.$connect();
  }

  async onModuleDestroy() {
    // Desconecta do banco de dados quando a aplicação é encerrada
    await this.$disconnect();
  }
}