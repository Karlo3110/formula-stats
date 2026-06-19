# OpenAI / LLM Integration Standards

## 1. Overview
LLM calls are **server-side, validated, cost-aware, and defensively handled**. Treat model
output as untrusted input and model APIs as slow, fallible, rate-limited dependencies.

## 2. Approved Patterns
- **All calls server-side**, behind a thin typed wrapper service (one place owns the
  client, retries, timeouts, and cost logging). Components/clients never call the model
  API directly.
- **Validate model output** with Zod before use — especially for structured output / tool
  calls / JSON mode. Never `JSON.parse` and trust it (`rules/02-typescript.md` §4).
  ```typescript
  const ResultSchema = z.object({ category: z.enum(['bug', 'feature']), confidence: z.number() });
  const parsed = ResultSchema.parse(JSON.parse(completion.choices[0].message.content ?? '{}'));
  ```
- **Timeouts + bounded retries** on transient errors (`429`, `5xx`) with exponential
  backoff + jitter; respect `Retry-After`. See `rules/08-error-handling.md`.
- **Streaming** for user-facing latency; backpressure-aware.
- **Prompt construction is structured and reviewed**: system/developer instructions
  separated from user content; user content clearly delimited.
- **Cost & usage controls**: cap `max_tokens`, choose the smallest sufficient model,
  cache deterministic results, and log token usage per request for cost attribution.
- **Idempotency / dedup** for expensive generations where applicable.

## 3. Forbidden Patterns
- ❌ Calling the model API from the browser / exposing the API key client-side.
- ❌ Trusting/executing model output without validation (code, SQL, shell, file paths).
- ❌ Interpolating raw user input into a system prompt in a way that lets it override
  instructions (prompt injection) — keep user content in a user-role, delimited block.
- ❌ Unbounded `max_tokens` or unbounded retries.
- ❌ Logging full prompts/completions containing PII or secrets.
- ❌ Blocking a request thread on a long generation instead of streaming/queuing.

## 4. Security Requirements
- API key in the secret manager; server-only. Rate-limit and authenticate the endpoints
  that trigger generations (abuse = cost).
- **Prompt-injection defense**: never let user/tool content silently gain system
  authority; validate and sandbox any tool/function the model can invoke; allow-list
  tools and their arguments.
- Treat retrieved/model-produced URLs, code, and commands as untrusted.
- Apply content moderation/filtering where user-facing.

## 5. Cost & Performance
- Set per-request and per-user budgets/quotas; alert on spend anomalies.
- Cache idempotent prompts; use embeddings + retrieval instead of stuffing huge context;
  pick model tier by task. Log latency and tokens. See `rules/06-performance.md`.

## 6. Reliability
- Graceful degradation: a fallback response/model when the primary is down or rate-limited
  (an AI Gateway with provider failover is preferred where available).
- Handle partial/streamed failures cleanly; never leave the user with a half-rendered,
  unrecoverable state.

## 7. Testing Requirements
- Unit-test the wrapper with mocked responses (success, malformed output, `429`, timeout).
- Assert output validation rejects malformed completions. Don't hit the live API in CI;
  use recorded fixtures.

## 8. Example — Wrapper Service
```typescript
@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  constructor(private readonly client: OpenAI, private readonly config: ConfigService) {}

  async classify(text: string): Promise<Classification> {
    const completion = await this.withRetry(() =>
      this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 200,
        messages: [
          { role: 'system', content: CLASSIFY_SYSTEM_PROMPT },
          { role: 'user', content: text }, // user content stays in the user role
        ],
        response_format: { type: 'json_object' },
      }),
    );
    this.logger.log({ message: 'llm.usage', tokens: completion.usage?.total_tokens });
    return ClassificationSchema.parse(JSON.parse(completion.choices[0]?.message.content ?? '{}'));
  }
}
```

## 9. Review Checklist
- [ ] Server-side only; key in secret manager; endpoints authed + rate-limited.
- [ ] Output validated with Zod; tool calls allow-listed and sandboxed.
- [ ] User content isolated from system instructions (injection-resistant).
- [ ] Timeouts, bounded retries, streaming; fallback on outage.
- [ ] `max_tokens` capped; token usage logged; budgets/alerts set.
- [ ] No PII/secrets in prompt logs; tests cover malformed output + failures.
