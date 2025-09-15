import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'O nome não pode ser vazio.' })
  name: string;

  @IsEmail({}, { message: 'Por favor, insira um e-mail válido.' })
  email: string;

  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  password: string;
}