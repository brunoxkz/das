import fetch from 'node-fetch';

interface BrevoEmailParams {
  to: string;
  from: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export class BrevoEmailService {
  private apiKey: string;
  private apiUrl = 'https://api.brevo.com/v3/smtp/email';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendEmail(params: BrevoEmailParams): Promise<boolean> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Api-Key': this.apiKey
        },
        body: JSON.stringify({
          sender: {
            email: params.from,
            name: "Vendzz"
          },
          to: [{
            email: params.to
          }],
          subject: params.subject,
          htmlContent: params.htmlContent,
          textContent: params.textContent || this.stripHtml(params.htmlContent)
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Brevo API error:', error);
        return false;
      }

      const result = await response.json();
      console.log('Email sent successfully:', result);
      return true;
    } catch (error) {
      console.error('Error sending email via Brevo:', error);
      return false;
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  async verifyApiKey(): Promise<boolean> {
    try {
      const response = await fetch('https://api.brevo.com/v3/account', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Api-Key': this.apiKey
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error verifying Brevo API key:', error);
      return false;
    }
  }
}