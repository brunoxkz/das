import QRCode from 'qrcode';

interface PixQRCodeData {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount: number;
  description?: string;
  txId?: string;
}

/**
 * Gera código PIX no formato BR Code (EMV)
 * Baseado no padrão do Banco Central do Brasil
 */
export class PixQRCodeGenerator {
  private static formatValue(value: string): string {
    const length = value.length.toString().padStart(2, '0');
    return length + value;
  }

  private static calculateCRC16(payload: string): string {
    // Implementação simplificada do CRC16 CCITT
    let crc = 0xFFFF;
    
    for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8;
      
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc = crc << 1;
        }
      }
    }
    
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  }

  /**
   * Gera o payload do PIX no formato BR Code
   */
  static generatePixPayload(data: PixQRCodeData): string {
    const {
      pixKey,
      merchantName,
      merchantCity,
      amount,
      description = 'Pagamento via Quiz Vendzz',
      txId = `VENDZZ${Date.now()}`
    } = data;

    // Payload Format Indicator
    let payload = '00' + '02' + '01';

    // Point of Initiation Method (dinâmico)
    payload += '01' + '02' + '12';

    // Merchant Account Information (PIX)
    const pixData = 
      '00' + this.formatValue('br.gov.bcb.pix') + // GUI
      '01' + this.formatValue(pixKey); // PIX Key
    
    payload += '26' + this.formatValue(pixData);

    // Merchant Category Code
    payload += '52' + '04' + '0000';

    // Transaction Currency (BRL)
    payload += '53' + '03' + '986';

    // Transaction Amount
    if (amount > 0) {
      const amountStr = amount.toFixed(2);
      payload += '54' + this.formatValue(amountStr);
    }

    // Country Code
    payload += '58' + '02' + 'BR';

    // Merchant Name
    payload += '59' + this.formatValue(merchantName);

    // Merchant City
    payload += '60' + this.formatValue(merchantCity);

    // Additional Data Field Template
    const additionalData = 
      '05' + this.formatValue(txId) + // Reference Label
      '08' + this.formatValue(description); // Additional Information
    
    payload += '62' + this.formatValue(additionalData);

    // CRC16 placeholder
    payload += '6304';

    // Calculate and append CRC16
    const crc = this.calculateCRC16(payload);
    payload = payload.slice(0, -4) + crc;

    return payload;
  }

  /**
   * Gera QR Code como Data URL (base64)
   */
  static async generateQRCodeDataURL(data: PixQRCodeData): Promise<string> {
    try {
      const payload = this.generatePixPayload(data);
      
      const qrCodeDataURL = await QRCode.toDataURL(payload, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('❌ Erro ao gerar QR Code PIX:', error);
      throw new Error(`Falha ao gerar QR Code PIX: ${error.message}`);
    }
  }

  /**
   * Gera QR Code como SVG string
   */
  static async generateQRCodeSVG(data: PixQRCodeData): Promise<string> {
    try {
      const payload = this.generatePixPayload(data);
      
      const qrCodeSVG = await QRCode.toString(payload, {
        type: 'svg',
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return qrCodeSVG;
    } catch (error) {
      console.error('❌ Erro ao gerar QR Code PIX SVG:', error);
      throw new Error(`Falha ao gerar QR Code PIX SVG: ${error.message}`);
    }
  }

  /**
   * Valida chave PIX (formato básico)
   */
  static validatePixKey(pixKey: string): boolean {
    if (!pixKey || typeof pixKey !== 'string') {
      return false;
    }

    const key = pixKey.trim();

    // CPF: 11 dígitos
    if (/^\d{11}$/.test(key.replace(/\D/g, ''))) {
      return true;
    }

    // CNPJ: 14 dígitos
    if (/^\d{14}$/.test(key.replace(/\D/g, ''))) {
      return true;
    }

    // Email
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)) {
      return true;
    }

    // Telefone: +55 + 11 dígitos
    if (/^\+55\d{10,11}$/.test(key.replace(/\D/g, '+55'))) {
      return true;
    }

    // Chave aleatória: 32 caracteres
    if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(key)) {
      return true;
    }

    return false;
  }
}

export default PixQRCodeGenerator;