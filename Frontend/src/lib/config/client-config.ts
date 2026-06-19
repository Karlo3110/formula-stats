import { z } from 'zod';

const ClientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
});

// Reference each var by its full name so Next.js can statically inline it.
const parsed = ClientEnvSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

if (!parsed.success) {
  throw new Error(`Invalid client env: ${parsed.error.message}`);
}

export const clientConfig = {
  apiUrl: parsed.data.NEXT_PUBLIC_API_URL,
} as const;
