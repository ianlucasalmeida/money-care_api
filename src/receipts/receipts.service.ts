import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { ScrapedItem } from 'src/types';

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
      await page.setDefaultNavigationTimeout(60000); // 60 segundos de timeout
      await page.goto(url, { waitUntil: 'networkidle0' }); // Espera a página ficar ociosa

      const html = await page.content();
      const $ = cheerio.load(html);

      // --- ESTRATÉGIA DE EXTRAÇÃO ROBUSTA ---

      // 1. Tenta múltiplos seletores para o nome do estabelecimento
      const establishmentName =
        $('div.txtTopo').first().text().trim() ||
        $('td.NFCCabEmiNome').first().text().trim() ||
        $('.razaoSocial').first().text().trim() ||
        $('div[id*="header"] .txtTopo').first().text().trim();

      // 2. Extrai TODOS os valores numéricos da página para análise
      const allValues: number[] = [];
      $('span.valor, span.totalNumb, td.NFCVal, .valor, .total').each((_i, el) => {
        const textValue = $(el).text().trim().replace('R$', '').replace('.', '').replace(',', '.');
        const numValue = parseFloat(textValue);
        if (!isNaN(numValue)) {
          allValues.push(numValue);
        }
      });
      // O valor total é, com alta probabilidade, o maior número encontrado na página.
      const totalAmount = allValues.length > 0 ? Math.max(...allValues) : 0;
      
      // 3. Tenta múltiplos seletores para a tabela de itens
      const items: ScrapedItem[] = [];
      const itemTableSelectors = 'table#tabResult tr, table.NFCCabTbl tr, table.table-striped tr';
      $(itemTableSelectors).each((_i, row) => {
        const description = $(row).find('span.txtTit, td.NFCTit, td:nth-child(1)').text().trim();
        const quantityText = $(row).find('span.Rqtde, td:nth-child(2)').text().trim().replace('Qtde.:', '').replace(',', '.');
        const unitPriceText = $(row).find('span.RvlUnit, td:nth-child(3)').text().trim().replace('Vl. Unit.:', '').replace(',', '.');
        const totalPriceText = $(row).find('span.valor, td.NFCVal, td:nth-child(4)').text().trim().replace(',', '.');
        
        const quantity = parseFloat(quantityText);
        const unitPrice = parseFloat(unitPriceText);
        const totalPrice = parseFloat(totalPriceText);

        if (description && !isNaN(totalPrice) && totalPrice > 0) {
          items.push({ 
            description, 
            quantity: isNaN(quantity) ? 1 : quantity, // Fallback para quantidade
            unitPrice: isNaN(unitPrice) ? totalPrice : unitPrice, // Fallback para preço unitário
            totalPrice 
          });
        }
      });

      // --- LOG DE DEPURAÇÃO MELHORADO ---
      console.log('--- DADOS BRUTOS EXTRAÍDOS (ESTRATÉGIA ROBUSTA) ---');
      console.log(`Estabelecimento: "${establishmentName}"`);
      console.log(`Valor Total Identificado: ${totalAmount}`);
      console.log(`Itens Encontrados: ${items.length}`);
      if(items.length > 0) console.log('Itens:', items);
      console.log('--------------------------------------------------');
      
      // Validação final
      if (!establishmentName || totalAmount === 0 || items.length === 0) {
        throw new Error('Falha na extração de dados. Verifique os seletores de CSS no código.');
      }
      
      // Lógica de categorização
      // const suggestedCategory = this.categorizeItems(items);
      
      return {
        success: true,
        data: {
          description: `Compra em ${establishmentName}`,
          amount: totalAmount,
          date: new Date(),
          type: 'saida',
          category: { id: 16, name: 'Compras', icon: 'cart-outline' }, // Categoria placeholder
          items: items,
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