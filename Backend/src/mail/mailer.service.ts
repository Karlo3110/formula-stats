import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

interface VerificationEmailParams {
  to: string;
  displayName: string;
  code: string;
}

interface PasswordResetEmailParams {
  to: string;
  displayName: string;
  resetUrl: string;
}

/**
 * Transactional email via Resend. Sends are best-effort from the caller's
 * perspective: a failure is logged and surfaced so the flow can decide, but it
 * never silently succeeds (.claude/rules/integrations/resend.md).
 */
@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly resend: Resend;
  private readonly from: string;

  constructor(config: ConfigService) {
    this.resend = new Resend(config.getOrThrow<string>('RESEND_API_KEY'));
    this.from = config.getOrThrow<string>('MAIL_FROM');
  }

  async sendVerificationCode(params: VerificationEmailParams): Promise<void> {
    await this.send(
      params.to,
      'Verify your Formula Stats email',
      `<p>Hi ${escapeHtml(params.displayName)},</p>
       <p>Your verification code is:</p>
       <p style="font-size:24px;font-weight:bold;letter-spacing:4px">${escapeHtml(params.code)}</p>
       <p>This code expires shortly. If you did not sign up, ignore this email.</p>`,
    );
  }

  async sendPasswordReset(params: PasswordResetEmailParams): Promise<void> {
    await this.send(
      params.to,
      'Reset your Formula Stats password',
      `<p>Hi ${escapeHtml(params.displayName)},</p>
       <p>Reset your password using the link below:</p>
       <p><a href="${escapeHtml(params.resetUrl)}">Reset password</a></p>
       <p>If you did not request this, you can safely ignore this email.</p>`,
    );
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    try {
      const result = await this.resend.emails.send({
        from: this.from,
        to,
        subject,
        html,
      });
      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      this.logger.error(
        `Failed to send "${subject}" to ${to}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
