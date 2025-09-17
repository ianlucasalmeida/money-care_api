// No seu projeto NestJS
// Arquivo: src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

// Middleware para registrar todas as requisições que chegam
function loggerMiddleware(req: any, res: any, next: () => void) {
  Logger.log(`Requisição recebida: ${req.method} ${req.originalUrl}`, 'RequestLogger');
  next();
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Habilita o CORS para permitir a comunicação com o app
  app.enableCors();

  // 2. Adiciona o logger global de requisições
  app.use(loggerMiddleware);

  // 3. Habilita a validação automática de DTOs
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
  Logger.log(`Servidor rodando em: ${await app.getUrl()}`, 'Application');
}
bootstrap();