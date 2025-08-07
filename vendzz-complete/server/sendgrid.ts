import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable not set - email functionality will be disabled");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

interface EmailTemplateParams {
  to: string;
  from: string;
  templateId: string;
  dynamicTemplateData?: Record<string, any>;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SendGrid API key not configured');
      return false;
    }
    
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendTemplateEmail(params: EmailTemplateParams): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SendGrid API key not configured');
      return false;
    }
    
    await mailService.send({
      to: params.to,
      from: params.from,
      templateId: params.templateId,
      dynamicTemplateData: params.dynamicTemplateData || {},
    });
    
    console.log(`Template email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid template email error:', error);
    return false;
  }
}

export async function sendBulkEmail(emails: EmailParams[]): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SendGrid API key not configured');
      return false;
    }
    
    await mailService.send(emails);
    console.log(`Bulk email sent successfully to ${emails.length} recipients`);
    return true;
  } catch (error) {
    console.error('SendGrid bulk email error:', error);
    return false;
  }
}

export async function sendCampaignEmail(
  to: string,
  subject: string,
  content: string,
  variables: Record<string, any> = {}
): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SendGrid API key not configured');
      return false;
    }
    
    // Replace variables in subject and content
    let processedSubject = subject;
    let processedContent = content;
    
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), String(value));
      processedContent = processedContent.replace(new RegExp(placeholder, 'g'), String(value));
    });
    
    await mailService.send({
      to: to,
      from: 'noreply@vendzz.com',
      subject: processedSubject,
      html: processedContent,
    });
    
    console.log(`Campaign email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('SendGrid campaign email error:', error);
    return false;
  }
}

export function isEmailConfigured(): boolean {
  return !!process.env.SENDGRID_API_KEY;
}