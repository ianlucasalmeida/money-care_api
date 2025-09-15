// src/auth/auth.service.ts

import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt'; // <-- IMPORTE O JWT SERVICE

@Injectable()
export class AuthService {
  // Injetamos o PrismaService e o JwtService
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService, // <-- INJETE O JWT SERVICE
  ) {}

  async signUp(registerDto: RegisterDto) {
    // ... seu método signUp existente ...
    const { name, email, password: plainPassword } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('O e-mail informado já está em uso.');
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const { password, ...result } = user;
    return result;
  }

  // NOVO MÉTODO:
  async signIn(loginDto: any /* Crie um LoginDto se quiser */) {
    const { email, password: plainPassword } = loginDto;

    // 1. Encontra o usuário pelo e-mail
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // 2. Se não encontrar ou a senha não bater, retorna erro
    if (!user || !(await bcrypt.compare(plainPassword, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    // 3. Se as credenciais estiverem corretas, gera o token JWT
    const payload = { sub: user.id, email: user.email };
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}