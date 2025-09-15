import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto'; // Crie este DTO para validação

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signUp(registerDto: RegisterDto) {
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

  // MÉTODO CORRIGIDO
  async signIn(loginDto: LoginDto) {
    const { email, password: plainPassword } = loginDto;

    // 1. Encontra o usuário pelo e-mail
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // 2. Se não encontrar ou a senha não bater, retorna erro
    if (!user || !(await bcrypt.compare(plainPassword, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    // 3. Prepara os dados para o token e para a resposta
    const payload = { sub: user.id, email: user.email };
    const { password, ...userData } = user; // Remove a senha do objeto do usuário

    // 4. MUDANÇA PRINCIPAL: Retorna tanto o token quanto os dados do usuário
    return {
      access_token: this.jwtService.sign(payload),
      user: userData, // <-- A INFORMAÇÃO QUE FALTAVA
    };
  }
}