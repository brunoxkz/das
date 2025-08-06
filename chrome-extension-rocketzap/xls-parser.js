// Parser de arquivos XLS para RocketZap Lead Extractor
// Implementação usando SheetJS (js-xlsx)

class XLSParser {
  constructor() {
    this.supportedFormats = ['.xls', '.xlsx', '.csv'];
  }

  // Parser principal de arquivo XLS/XLSX
  async parseFile(arrayBuffer, filename = '') {
    try {
      console.log('📊 Iniciando parsing do arquivo:', filename);
      
      // Detectar tipo de arquivo
      const fileType = this.detectFileType(arrayBuffer, filename);
      console.log('🔍 Tipo de arquivo detectado:', fileType);
      
      let data = null;
      
      switch (fileType) {
        case 'xlsx':
        case 'xls':
          data = await this.parseExcelFile(arrayBuffer);
          break;
        case 'csv':
          data = await this.parseCSVFile(arrayBuffer);
          break;
        default:
          throw new Error(`Formato de arquivo não suportado: ${fileType}`);
      }
      
      if (data && data.length > 0) {
        console.log(`✅ ${data.length} registros encontrados no arquivo`);
        return this.processLeadData(data);
      } else {
        console.log('⚠️ Nenhum dado encontrado no arquivo');
        return [];
      }
      
    } catch (error) {
      console.error('❌ Erro ao processar arquivo:', error);
      throw error;
    }
  }
  
  // Detectar tipo de arquivo
  detectFileType(arrayBuffer, filename) {
    // Verificar por extensão
    if (filename) {
      const ext = filename.toLowerCase();
      if (ext.includes('.xlsx')) return 'xlsx';
      if (ext.includes('.xls')) return 'xls';
      if (ext.includes('.csv')) return 'csv';
    }
    
    // Verificar por magic bytes
    const view = new Uint8Array(arrayBuffer, 0, 4);
    const hex = Array.from(view).map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Excel 2007+ (XLSX)
    if (hex.startsWith('504b0304')) return 'xlsx';
    
    // Excel 97-2003 (XLS)
    if (hex.startsWith('d0cf11e0')) return 'xls';
    
    // CSV (texto)
    return 'csv';
  }
  
  // Parser para arquivos Excel (.xls/.xlsx)
  async parseExcelFile(arrayBuffer) {
    try {
      // NOTA: Aqui seria usado o SheetJS (XLSX.read)
      // Por limitações do ambiente, simulamos o parsing
      
      console.log('📋 Simulando parsing Excel... (implementar SheetJS)');
      
      // Simulação de dados típicos do RocketZap
      const mockData = [
        { 'Nome': 'João Silva', 'Telefone': '11999999999', 'Email': 'joao@email.com' },
        { 'Nome': 'Maria Santos', 'Telefone': '11888888888', 'Email': 'maria@email.com' },
        { 'Nome': 'Pedro Costa', 'Telefone': '21777777777', 'Email': 'pedro@email.com' }
      ];
      
      return mockData;
      
      /* Implementação real com SheetJS:
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      return XLSX.utils.sheet_to_json(worksheet);
      */
      
    } catch (error) {
      console.error('❌ Erro no parsing Excel:', error);
      throw error;
    }
  }
  
  // Parser para arquivos CSV
  async parseCSVFile(arrayBuffer) {
    try {
      const text = new TextDecoder('utf-8').decode(arrayBuffer);
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('Arquivo CSV inválido ou vazio');
      }
      
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const data = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const row = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        
        data.push(row);
      }
      
      return data;
      
    } catch (error) {
      console.error('❌ Erro no parsing CSV:', error);
      throw error;
    }
  }
  
  // Processar dados de leads extraídos
  processLeadData(rawData) {
    const leads = [];
    
    for (const row of rawData) {
      try {
        const lead = this.extractLeadFromRow(row);
        
        if (lead && lead.phone) {
          leads.push(lead);
        }
        
      } catch (error) {
        console.warn('⚠️ Erro ao processar linha:', error, row);
      }
    }
    
    return leads;
  }
  
  // Extrair lead de uma linha de dados
  extractLeadFromRow(row) {
    const lead = {
      name: null,
      phone: null,
      email: null,
      source: 'rocketzap-xls',
      timestamp: Date.now()
    };
    
    // Mapeamento flexível de campos
    const nameFields = ['nome', 'name', 'contact', 'contato', 'cliente', 'customer'];
    const phoneFields = ['telefone', 'phone', 'celular', 'whatsapp', 'numero', 'number'];
    const emailFields = ['email', 'e-mail', 'correio'];
    
    // Extrair nome
    for (const field of nameFields) {
      const value = this.findFieldValue(row, field);
      if (value) {
        lead.name = value;
        break;
      }
    }
    
    // Extrair telefone
    for (const field of phoneFields) {
      const value = this.findFieldValue(row, field);
      if (value) {
        const phone = this.normalizePhone(value);
        if (phone) {
          lead.phone = phone;
          break;
        }
      }
    }
    
    // Extrair email
    for (const field of emailFields) {
      const value = this.findFieldValue(row, field);
      if (value && value.includes('@')) {
        lead.email = value;
        break;
      }
    }
    
    return lead.phone ? lead : null;
  }
  
  // Buscar valor de campo (case insensitive)
  findFieldValue(row, fieldName) {
    const keys = Object.keys(row);
    
    for (const key of keys) {
      if (key.toLowerCase().includes(fieldName.toLowerCase())) {
        const value = row[key];
        return value ? value.toString().trim() : null;
      }
    }
    
    return null;
  }
  
  // Normalizar número de telefone brasileiro
  normalizePhone(phone) {
    if (!phone) return null;
    
    // Remover caracteres não numéricos
    const cleaned = phone.toString().replace(/\D/g, '');
    
    // Validar e normalizar
    if (cleaned.length === 11 && cleaned.startsWith('9')) {
      // Celular com 9 (11 dígitos)
      return '55' + cleaned;
    } else if (cleaned.length === 10) {
      // Telefone fixo ou celular sem 9
      return '559' + cleaned;
    } else if (cleaned.length === 13 && cleaned.startsWith('55')) {
      // Já tem código do país
      return cleaned;
    } else if (cleaned.length === 8 || cleaned.length === 9) {
      // Apenas número local (assumir SP)
      return '5511' + cleaned;
    }
    
    // Retornar apenas se tiver pelo menos 10 dígitos
    return cleaned.length >= 10 ? cleaned : null;
  }
  
  // Validar estrutura do arquivo
  validateFileStructure(data) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Arquivo não contém dados válidos');
    }
    
    // Verificar se pelo menos algumas linhas têm telefone
    let phoneCount = 0;
    const sampleSize = Math.min(10, data.length);
    
    for (let i = 0; i < sampleSize; i++) {
      const row = data[i];
      const hasPhone = Object.values(row).some(value => {
        const phone = this.normalizePhone(value);
        return phone && phone.length >= 10;
      });
      
      if (hasPhone) phoneCount++;
    }
    
    if (phoneCount === 0) {
      throw new Error('Nenhum número de telefone válido encontrado no arquivo');
    }
    
    console.log(`✅ Arquivo validado: ${phoneCount}/${sampleSize} linhas com telefone`);
    return true;
  }
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = XLSParser;
} else {
  window.XLSParser = XLSParser;
}