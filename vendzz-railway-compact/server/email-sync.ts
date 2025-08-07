import Imap from 'imap';
import { simpleParser } from 'mailparser';
import nodemailer from 'nodemailer';
import { nanoid } from 'nanoid';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
}

class EmailSyncService {
  private imap: any;
  private smtp: any;
  private sqlite: any;
  private isConnected = false;
  private onNewEmail?: (email: any) => void;

  constructor(sqlite: any) {
    this.sqlite = sqlite;
  }

  // Configurar conexão IMAP e SMTP
  async configure(config: EmailConfig) {
    try {
      // Configurar IMAP para receber emails
      this.imap = new Imap({
        user: config.user,
        password: config.password,
        host: config.host,
        port: config.port,
        tls: config.secure,
        tlsOptions: { rejectUnauthorized: false },
        authTimeout: 3000,
        connTimeout: 3000
      });

      // Configurar SMTP para enviar emails
      this.smtp = nodemailer.createTransporter({
        host: config.host,
        port: config.secure ? 465 : 587,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.password
        }
      });

      console.log('✅ Configuração de email salva para:', config.user);
      return { success: true, message: 'Email configurado com sucesso' };
    } catch (error) {
      console.error('❌ Erro ao configurar email:', error);
      return { success: false, error: error.message };
    }
  }

  // Conectar e sincronizar emails em tempo real
  async startSync() {
    if (!this.imap) {
      throw new Error('Email não configurado');
    }

    return new Promise((resolve, reject) => {
      this.imap.once('ready', () => {
        console.log('🔗 Conectado ao servidor IMAP');
        this.isConnected = true;

        // Abrir caixa de entrada
        this.imap.openBox('INBOX', false, (err: any, box: any) => {
          if (err) {
            console.error('❌ Erro ao abrir INBOX:', err);
            reject(err);
            return;
          }

          console.log('📧 INBOX aberta, total de emails:', box.messages.total);
          
          // Buscar emails não lidos
          this.syncRecentEmails();
          
          // Escutar novos emails em tempo real
          this.imap.on('mail', (numNewMsgs: number) => {
            console.log('📬 Novos emails recebidos:', numNewMsgs);
            this.syncRecentEmails();
          });

          resolve({ success: true, totalEmails: box.messages.total });
        });
      });

      this.imap.once('error', (err: any) => {
        console.error('❌ Erro IMAP:', err);
        this.isConnected = false;
        reject(err);
      });

      this.imap.once('end', () => {
        console.log('🔌 Conexão IMAP encerrada');
        this.isConnected = false;
      });

      // Conectar
      this.imap.connect();
    });
  }

  // Sincronizar emails recentes
  private syncRecentEmails() {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    // Buscar emails dos últimos 7 dias
    this.imap.search([
      ['SINCE', sevenDaysAgo]
    ], (err: any, results: number[]) => {
      if (err) {
        console.error('❌ Erro na busca:', err);
        return;
      }

      if (!results || results.length === 0) {
        console.log('📭 Nenhum email novo encontrado');
        return;
      }

      console.log('📧 Processando', results.length, 'emails');

      // Buscar apenas os 20 mais recentes para não sobrecarregar
      const recentResults = results.slice(-20);
      
      const fetch = this.imap.fetch(recentResults, {
        bodies: '',
        struct: true
      });

      fetch.on('message', (msg: any, seqno: number) => {
        let buffer = '';

        msg.on('body', (stream: any, info: any) => {
          stream.on('data', (chunk: any) => {
            buffer += chunk.toString('utf8');
          });

          stream.once('end', () => {
            this.processEmailBuffer(buffer, seqno);
          });
        });
      });

      fetch.once('error', (err: any) => {
        console.error('❌ Erro ao buscar emails:', err);
      });

      fetch.once('end', () => {
        console.log('✅ Sincronização de emails concluída');
      });
    });
  }

  // Processar buffer do email
  private async processEmailBuffer(buffer: string, seqno: number) {
    try {
      const parsed = await simpleParser(buffer);
      
      const emailData = {
        id: nanoid(),
        subject: parsed.subject || 'Sem assunto',
        sender: parsed.from?.text || 'Remetente desconhecido',
        sender_email: parsed.from?.value?.[0]?.address || '',
        content: parsed.text || parsed.html || 'Conteúdo não disponível',
        preview: this.generatePreview(parsed.text || parsed.html || ''),
        read_status: 0, // Novo email = não lido
        important: this.isImportant(parsed),
        starred: 0,
        has_attachment: parsed.attachments?.length > 0 ? 1 : 0,
        time: this.formatTime(parsed.date),
        date: this.formatDate(parsed.date),
        account: 'zynt@zynt.com.br',
        folder: 'inbox',
        labels: this.generateLabels(parsed),
        received_at: new Date().toISOString()
      };

      // Verificar se email já existe
      const existingEmail = this.sqlite.prepare(
        'SELECT id FROM emails WHERE sender_email = ? AND subject = ? AND date = ?'
      ).get(emailData.sender_email, emailData.subject, emailData.date);

      if (!existingEmail) {
        // Inserir novo email
        const insertStmt = this.sqlite.prepare(`
          INSERT INTO emails (
            id, subject, sender, sender_email, content, preview,
            read_status, important, starred, has_attachment,
            time, date, account, folder, labels, received_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insertStmt.run(
          emailData.id, emailData.subject, emailData.sender, emailData.sender_email,
          emailData.content, emailData.preview, emailData.read_status, emailData.important,
          emailData.starred, emailData.has_attachment, emailData.time, emailData.date,
          emailData.account, emailData.folder, emailData.labels, emailData.received_at
        );

        console.log('📩 Novo email sincronizado:', emailData.subject);

        // Callback para notificar frontend
        if (this.onNewEmail) {
          this.onNewEmail(emailData);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao processar email:', error);
    }
  }

  // Enviar email
  async sendEmail(to: string, subject: string, content: string) {
    if (!this.smtp) {
      throw new Error('SMTP não configurado');
    }

    try {
      const info = await this.smtp.sendMail({
        from: this.smtp.options.auth.user,
        to: to,
        subject: subject,
        text: content,
        html: content.replace(/\n/g, '<br>')
      });

      console.log('📤 Email enviado:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      return { success: false, error: error.message };
    }
  }

  // Funções auxiliares
  private generatePreview(content: string): string {
    const clean = content.replace(/<[^>]*>/g, '').replace(/\n/g, ' ').trim();
    return clean.length > 100 ? clean.substring(0, 100) + '...' : clean;
  }

  private isImportant(parsed: any): number {
    const subject = (parsed.subject || '').toLowerCase();
    const importantKeywords = ['urgente', 'importante', 'critical', 'asap', 'priority'];
    return importantKeywords.some(keyword => subject.includes(keyword)) ? 1 : 0;
  }

  private formatTime(date: Date): string {
    if (!date) return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  private formatDate(date: Date): string {
    if (!date) return 'Hoje';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    if (days === 2) return 'Anteontem';
    if (days <= 7) return `${days} dias atrás`;
    return date.toLocaleDateString('pt-BR');
  }

  private generateLabels(parsed: any): string {
    const labels = [];
    
    if (parsed.attachments?.length > 0) labels.push('anexo');
    if (this.isImportant(parsed)) labels.push('importante');
    
    const subject = (parsed.subject || '').toLowerCase();
    if (subject.includes('reunião') || subject.includes('meeting')) labels.push('reunião');
    if (subject.includes('contrato') || subject.includes('contract')) labels.push('contrato');
    if (subject.includes('proposta') || subject.includes('proposal')) labels.push('proposta');
    
    return labels.join(',');
  }

  // Definir callback para novos emails
  onNewEmailReceived(callback: (email: any) => void) {
    this.onNewEmail = callback;
  }

  // Status da conexão
  getStatus() {
    return {
      connected: this.isConnected,
      hasImap: !!this.imap,
      hasSmtp: !!this.smtp
    };
  }

  // Desconectar
  disconnect() {
    if (this.imap && this.isConnected) {
      this.imap.end();
    }
  }
}

export default EmailSyncService;