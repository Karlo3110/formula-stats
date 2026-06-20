import { z } from 'zod';

const ClientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  // Optional: Google AdSense publisher id, e.g. "ca-pub-1234567890123456".
  // Ads render only when this is set, so the site runs ad-free until approved.
  NEXT_PUBLIC_ADSENSE_CLIENT: z.string().min(1).optional(),
});

// Reference each var by its full name so Next.js can statically inline it.
const parsed = ClientEnvSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_ADSENSE_CLIENT: process.env.NEXT_PUBLIC_ADSENSE_CLIENT,
});

if (!parsed.success) {
  throw new Error(`Invalid client env: ${parsed.error.message}`);
}

export const clientConfig = {
  apiUrl: parsed.data.NEXT_PUBLIC_API_URL,
  adsenseClient: parsed.data.NEXT_PUBLIC_ADSENSE_CLIENT ?? null,
} as const;
