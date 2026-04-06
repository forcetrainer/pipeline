import { templates } from './emailTemplates.js';
import type { EmailTemplate } from './emailTemplates.js';

export type { EmailTemplate } from './emailTemplates.js';

export interface IEmailService {
  send(to: string, template: EmailTemplate, data: Record<string, unknown>): Promise<void>;
}

export class ConsoleEmailService implements IEmailService {
  async send(to: string, template: EmailTemplate, data: Record<string, unknown>): Promise<void> {
    const templateDef = templates[template];
    if (!templateDef) {
      console.error(`[EMAIL] Unknown template: ${template}`);
      return;
    }

    const subject = templateDef.subject;
    const body = templateDef.body(data);

    console.log(`[EMAIL] To: ${to} | Template: ${template} | Subject: ${subject}`);
    console.log(`[EMAIL] Body: ${body}`);
  }
}

let emailServiceInstance: IEmailService | null = null;

export function getEmailService(): IEmailService {
  if (emailServiceInstance) return emailServiceInstance;

  if (process.env.SMTP_HOST) {
    // Future: return new SmtpEmailService() when implemented
    emailServiceInstance = new ConsoleEmailService();
  } else {
    emailServiceInstance = new ConsoleEmailService();
  }

  return emailServiceInstance;
}
