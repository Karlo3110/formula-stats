import { z } from 'zod';

const MIN_SECRET_LENGTH = 32;

export const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'staging', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3001),

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  JWT_ACCESS_SECRET: z.string().min(MIN_SECRET_LENGTH),
  JWT_REFRESH_SECRET: z.string().min(MIN_SECRET_LENGTH),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(30),

  // Comma-separated allowlist of browser origins for CORS.
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // Public base URL of the frontend (used to build email links).
  APP_WEB_URL: z.string().url().default('http://localhost:3000'),

  RESEND_API_KEY: z.string().min(1),
  MAIL_FROM: z.string().min(1),

  EMAIL_VERIFICATION_TTL_MIN: z.coerce.number().int().positive().default(15),
  PASSWORD_RESET_TTL_MIN: z.coerce.number().int().positive().default(30),

  // FastF1 data service (private Railway URL). Kept loose (not .url()) so a
  // misconfigured value can't crash API startup — the F1 client validates and
  // fails loudly per request instead.
  DATA_SERVICE_URL: z.string().optional(),
  DATA_SERVICE_INTERNAL_KEY: z.string().optional(),
  DATA_SERVICE_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  // Replays process a whole session's telemetry on first build.
  DATA_SERVICE_REPLAY_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(180000),

  // Optional cookie domain for the refresh-token cookie (e.g. .formula-stats.app).
  COOKIE_DOMAIN: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const parsed = EnvSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `Invalid environment configuration:\n${parsed.error.message}`,
    );
  }
  return parsed.data;
}
