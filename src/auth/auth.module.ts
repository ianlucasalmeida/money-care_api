// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; // <-- IMPORTE AQUI

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    // MUDANÇA: Adicione o JwtModule aqui
    JwtModule.registerAsync({
      imports: [ConfigModule], // Importa o ConfigModule para usar o ConfigService
      inject: [ConfigService], // Injeta o ConfigService
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Pega o segredo do .env
        signOptions: { expiresIn: '60m' }, // Token expira em 60 minutos
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}