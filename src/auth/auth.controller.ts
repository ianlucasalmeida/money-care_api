// src/auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

// Crie um LoginDto em src/auth/dto/login.dto.ts se desejar mais validação
class LoginDto {
    email: string;
    password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.signUp(registerDto);
  }

  // NOVO ENDPOINT:
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.signIn(loginDto);
  }
}