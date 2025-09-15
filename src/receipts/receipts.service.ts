import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { ScrapedItem } from '../../src/types/index';

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

      // MUDANÇA: Aumentamos o tempo limite padrão de 30 para 60 segundos
      await page.setDefaultNavigationTimeout(60000);

      // MUDANÇA: Usamos Promise.all para esperar por dois eventos, 
      // o que torna a espera mais confiável.
      await Promise.all([
        page.goto(url),
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
      ]);
      
      // MUDANÇA: Adicionamos uma espera explícita por um seletor chave.
      // O scraper só continuará depois que a tabela de itens (#tabResult) estiver visível.
      // Substitua '#tabResult' por um seletor que sempre aparece na página da sua nota fiscal.
      await page.waitForSelector('#tabResult', { timeout: 10000 });
      
      const html = await page.content();
      const $ = cheerio.load(html);

      // O resto da lógica de extração permanece a mesma...
      const establishmentName = $('div.txtTopo').first().text().trim() || $('td.NFCCabEmiNome').first().text().trim();
      let totalAmount = 0;
      $('div#totalNota').find('span.totalNumb').each((_i, el) => {
          const label = $(el).prev('label').text().trim();
          if (label.includes('Valor a pagar')) {
              totalAmount = parseFloat($(el).text().trim().replace(',', '.'));
          }
      });

      const items: ScrapedItem[] = [];
      $('#tabResult tr').each((_i, row) => {
        const description = $(row).find('span.txtTit').text().trim();
        const quantity = parseFloat($(row).find('span.Rqtde').text().trim().replace('Qtde.:', '').replace(',', '.'));
        const unitPrice = parseFloat($(row).find('span.RvlUnit').text().trim().replace('Vl. Unit.:', '').replace(',', '.'));
        const totalPrice = parseFloat($(row).find('span.valor').text().trim().replace(',', '.'));

        if (description && !isNaN(quantity) && !isNaN(unitPrice) && !isNaN(totalPrice)) {
          items.push({ description, quantity, unitPrice, totalPrice });
        }
      });
      
      if (!establishmentName || isNaN(totalAmount) || items.length === 0) {
        throw new Error('Falha na extração de dados. Verifique os seletores de CSS no código.');
      }
      
      return {
        // ... seu objeto de retorno
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
  
  // ... resto do seu serviço
}