import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ReceiptsService } from './receipts.service';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Você vai descomentar isso para proteger a rota

// DTO para validar o corpo da requisição
class ScanQrCodeDto {
  sefaz_url: string;
}

@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  // Este é o método que faltava
  @Post('scan-qrcode')
  // @UseGuards(JwtAuthGuard) // Lembre-se de proteger a rota depois
  scanQrCode(@Body() body: ScanQrCodeDto) {
    return this.receiptsService.processReceiptUrl(body.sefaz_url);
  }
}