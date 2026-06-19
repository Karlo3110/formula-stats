# Environment Variables and Config

Misconfigured env files are a top source of "works locally, breaks in production" bugs.
These rules make configuration explicit, validated, and predictable.

## Universal rules

1. **Every config value is validated at startup.** The app refuses to boot on missing or
   malformed config. No silent fallback to a wrong default (e.g. `localhost`).
2. **`.env.example` is committed and always current.** It lists every variable with a safe
   placeholder. Real `.env*` files are gitignored.
3. **No secrets in the repository, ever.** Not in code, not in committed env files, not in
   client-exposed variables.
4. **One source of truth per environment.** Do not spread the same variable across multiple
   files with conflicting values.
5. **Never hardcode URLs, ports, or keys.** Read them from validated config.

## File layout — the `env/` folder

Environment files live in an `env/` folder at the app root:

```
env/
├── .env.example       # committed; every variable with a safe placeholder
├── .env               # local development (gitignored)
├── .env.staging       # staging values (gitignored; secrets via platform in prod)
└── .env.production    # production non-secret defaults (gitignored)
```

Only `.env.example` is committed. Real secret values are injected by the platform's secret
store in deployed environments, not read from committed files.

### Important framework constraint (Next.js)

Next.js **only auto-loads env files from the project root**, not from an `env/` folder.
To keep the `env/` folder convention for Next.js, load the file explicitly with `dotenv-cli`
in the npm scripts; do not rely on auto-loading:

```jsonc
// package.json (Next.js app) — Windows-safe, cross-platform
{
  "scripts": {
    "dev": "dotenv -e env/.env -- next dev",
    "build:staging": "dotenv -e env/.env.staging -- next build",
    "build:production": "dotenv -e env/.env.production -- next build",
    "codegen": "dotenv -e env/.env -- graphql-codegen --config src/graphql/codegen.ts"
  }
}
```

`NEXT_PUBLIC_*` values are still inlined at build time (see below), so the correct
`env/.env.<stage>` must be loaded for the build of that stage. NestJS and .NET load from the
`env/` folder by pointing the config loader at the path — no constraint there.

## `.gitignore` (always)

```
env/.env
env/.env.*
!env/.env.example
```

## Next.js — load order and the `NEXT_PUBLIC_` rule

Next.js loads env files in this precedence (later overrides earlier):

```
.env  <  .env.local  <  .env.[environment]  <  .env.[environment].local
```

`.env.local` is **not** loaded during tests. `.env.[environment]` is selected by `NODE_ENV`.

**The exposure rule — this is the cause of most "calls localhost in production" bugs:**

- A variable is sent to the browser **only if** it is prefixed `NEXT_PUBLIC_`.
- `NEXT_PUBLIC_*` values are **inlined at build time**, not read at runtime. Changing one
  requires a rebuild and redeploy. A running container will not pick up a new value.
- Anything the browser needs (API base URL, public keys) **must** be `NEXT_PUBLIC_`.
- Anything secret (DB URL, private keys) **must not** be `NEXT_PUBLIC_` and must only be
  read in server components, route handlers, or server actions.

```bash
# .env.example
NEXT_PUBLIC_API_URL=https://api.example.com   # browser-visible, baked at build
DATABASE_URL=postgresql://user:pass@host:5432/db  # server-only, never NEXT_PUBLIC_
```

Client code reads the API URL only through validated config — never a raw literal:

```ts
// lib/config/client-config.ts
import { z } from "zod";

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
```

Server-only config lives in a separate file (`lib/config/server-config.ts`) so secrets
can never be imported into a client bundle.

**Checklist when a client request hits the wrong host:**
- [ ] Is the URL variable prefixed `NEXT_PUBLIC_`?
- [ ] Was the app rebuilt after changing it (build-time inlining)?
- [ ] Is the production `.env.production` value correct and not overridden by `.env.local`?
- [ ] Are server-constructed URLs (e.g. file/image URLs) using the public base URL, not a
      hardcoded `localhost` or a server-internal host?

## NestJS — validated config module

Validate the entire environment at startup with zod; expose typed config via DI.

```ts
// src/config/env.validation.ts
import { z } from "zod";

export const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "staging", "production"]),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  CORS_ORIGINS: z.string(), // comma-separated
});

export type Env = z.infer<typeof EnvSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  return EnvSchema.parse(raw);
}
```

```ts
// src/config/config.module.ts
import { ConfigModule } from "@nestjs/config";
import { validateEnv } from "./env.validation";

ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: [`env/.env.${process.env.NODE_ENV ?? "development"}`, "env/.env"],
  validate: validateEnv,
});
```

## .NET — appsettings + options pattern + user-secrets

- Layered config: `appsettings.json` (committed, non-secret defaults) →
  `appsettings.{Environment}.json` → User Secrets (local dev) → environment variables (prod).
- Secrets in local dev use `dotnet user-secrets`, never `appsettings.json`.
- Bind config to strongly typed options classes and validate on start.

```csharp
public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    [Required, MinLength(32)]
    public string AccessSecret { get; init; } = string.Empty;

    [Required, MinLength(32)]
    public string RefreshSecret { get; init; } = string.Empty;
}
```

```csharp
builder.Services
    .AddOptions<JwtOptions>()
    .Bind(builder.Configuration.GetSection(JwtOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();
```

## Secret management in production

- Use the platform's secret store (Railway variables, cloud secret manager, etc.).
- Rotate secrets without code changes.
- JWT secrets are at least 32 characters of high entropy and differ per environment.
