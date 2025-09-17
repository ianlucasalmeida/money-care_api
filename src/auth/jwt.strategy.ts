import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    configService: ConfigService, // Injeta o ConfigService
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET não está definido no arquivo .env');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  // Esta função é chamada automaticamente pelo Passport após o token ser decodificado
  async validate(payload: { sub: number; email: string }) {
    // Verificamos se o usuário do token ainda existe no banco de dados
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Token inválido ou usuário não encontrado.');
    }

    // MUDANÇA: Retornamos o payload validado.
    // O Passport vai anexar este objeto ao `req.user`.
    return { sub: user.id, email: user.email };
  }
}