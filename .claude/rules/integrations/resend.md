# Resend / Transactional Email Standards

## 1. Overview
Transactional email is sent **server-side**, **asynchronously**, from **typed templates**,
and is **idempotent**. Email is a fallible external dependency — a failed send must never
break the core operation that triggered it.

## 2. Approved Patterns
- **Server-side only**, behind a typed `MailerService` wrapper (one place owns the Resend
  client, from-addresses, retries, and logging).
- **Send asynchronously / out-of-band**: enqueue a job rather than blocking the request on
  the email send (`playbooks/background-job.md`). The user's action succeeds even if email
  is slow or down.
- **Typed templates** (React Email / a templating layer) with explicit, validated props —
  no string-concatenated HTML.
  ```typescript
  interface WelcomeEmailProps { name: string; verifyUrl: string; }
  async sendWelcome(to: string, props: WelcomeEmailProps): Promise<void> { /* ... */ }
  ```
- **Idempotency**: key sends by event so retries/duplicates don't double-send (store a
  send record; check before sending).
- **Sanitize/escape** all user-provided content rendered into emails (treat as untrusted).
- **Verified domains + SPF/DKIM/DMARC** configured for deliverability.
- **Handle delivery webhooks** (bounce, complaint, delivered) to maintain list hygiene and
  suppress bad addresses (verify signatures — `rules/integrations/webhooks.md`).
- Honor unsubscribe/suppression for any non-essential mail.

## 3. Forbidden Patterns
- ❌ Sending from the browser / exposing the API key client-side.
- ❌ Blocking the request thread on the email send; letting a send failure fail the action.
- ❌ Hand-built HTML strings with interpolated, unescaped user input.
- ❌ Hardcoded recipients/from-addresses/subjects (use config + templates).
- ❌ No idempotency → duplicate emails on retry.
- ❌ Logging full email bodies containing PII/tokens.
- ❌ Ignoring bounces/complaints (hurts deliverability and can get you blocked).

## 4. Security Requirements
- API key in the secret manager, server-only.
- Never embed long-lived secrets/tokens in email links; use short-lived, single-use,
  signed tokens for verification/reset flows.
- Verify delivery-webhook signatures; rate-limit user-triggerable sends (password reset,
  invites) to prevent abuse/bombing.

## 5. Reliability
- Retry transient failures with backoff (in the job/queue); dead-letter persistent
  failures for inspection.
- Suppress addresses that hard-bounce or complain.

## 6. Testing Requirements
- Unit-test the mailer wrapper and template rendering with mocked Resend (success,
  failure, retry). Snapshot-test critical templates. Use a sandbox/test key in non-prod;
  never send to real users from tests.

## 7. Example
```typescript
@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  constructor(private readonly resend: Resend, private readonly config: ConfigService) {}

  async sendWelcome(to: string, props: WelcomeEmailProps): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.config.getOrThrow<string>('mail.from'),
        to,
        subject: 'Welcome',
        react: WelcomeEmail(props),
      });
      this.logger.log(`Welcome email queued for ${to}`);
    } catch (error) {
      this.logger.error(`Welcome email failed for ${to}`, error instanceof Error ? error.stack : undefined);
      throw error; // surfaced to the job runner for retry; does not block the original request
    }
  }
}
```

## 8. Review Checklist
- [ ] Server-side; key in secret manager.
- [ ] Sent via queue/job, not inline; send failure can't fail the core action.
- [ ] Typed templates with validated props; user content escaped.
- [ ] Idempotent sends; reset/verify links short-lived + signed.
- [ ] Bounce/complaint webhooks handled (verified) + suppression list.
- [ ] User-triggerable sends rate-limited; no PII in logs; tests present.
