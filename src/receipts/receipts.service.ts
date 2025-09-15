import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

@Injectable()
export class ReceiptsService {
  async processReceiptUrl(url: string) {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2' });

      const html = await page.content();
      const $ = cheerio.load(html);

      // --- TENTATIVA DE EXTRAÇÃO COM SELETORES MAIS COMUNS ---
      // Tente encontrar o nome do estabelecimento
      const establishmentName = $('div.txtTopo').first().text().trim() || $('td.NFCCabEmiNome').first().text().trim();
      
      // Tente encontrar o valor total
      const totalAmountText = $('#NFCDetalhe_pnlValoresTotais span.totalNumb.txtMax').text().trim() || $('span.totalNumb').text().trim();
      const totalAmount = parseFloat(totalAmountText.replace('R$', '').replace(',', '.').trim());

      // Adicionamos logs para debug
      console.log('Estabelecimento Encontrado:', establishmentName);
      console.log('Texto do Valor Total Encontrado:', totalAmountText);
      console.log('Valor Total Convertido:', totalAmount);
      
      const items: { description: string; total: number }[] = [];
      $('#tabResult tr, table.NFCCabTbl tr').each((_i, el) => {
        const description = $(el).find('span.txtTit, td.NFCTit').text().trim();
        const totalItemPriceText = $(el).find('span.valor, td.NFCVal').text().trim();
        const totalItemPrice = parseFloat(totalItemPriceText.replace('R$', '').replace(',', '.').trim());
        
        if(description && !isNaN(totalItemPrice)){
            items.push({ description, total: totalItemPrice });
            console.log(`Item Encontrado: ${description} - R$ ${totalItemPrice}`);
        }
      });
      
      if (!establishmentName || isNaN(totalAmount) || items.length === 0) {
        throw new Error('Não foi possível extrair os dados da nota fiscal. Verifique os seletores de CSS no código.');
      }
      
      // ... (Resto da sua lógica de categorização e retorno)
      return {
        success: true,
        data: {
          description: `Compra em ${establishmentName}`,
          amount: totalAmount,
          date: new Date(), // A data real também precisa ser extraída
          type: 'saida',
          category: { id: 16, name: 'Compras', icon: 'cart-outline' },
          items,
        },
      };

    } catch (error) {
      console.error('Erro no scraping da nota fiscal:', error);
      throw new InternalServerErrorException(error.message || 'Falha ao processar a nota fiscal.');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}