import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'MoneyCare API - Teste de rede!';
  }
}
