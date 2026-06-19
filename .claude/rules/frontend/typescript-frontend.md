# TypeScript in the Frontend

> Extends the global `rules/02-typescript.md` with browser/React-specific guidance. The
> global rules (no `any`, explicit return types, runtime validation, strict null) apply
> in full here.

## 1. Typing Components & Props
- Every component has a named props `interface`; return type is `JSX.Element` (or
  `React.ReactNode` when it may render nothing).
- Children: `children: React.ReactNode`. Event handlers: precise DOM event types
  (`React.ChangeEvent<HTMLInputElement>`), not `any`.
- Avoid `React.FC` (it implies `children` and weakens inference) — type props directly.

```tsx
interface InputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}
export function Input({ value, onChange, disabled = false }: InputProps): JSX.Element { /* ... */ }
```

## 2. Hooks Are Typed
- Type `useState` when inference is insufficient: `useState<User | null>(null)`.
- Type `useRef` to the element: `useRef<HTMLDivElement>(null)`.
- Custom hooks declare an explicit return type (object or tuple `as const`).

```ts
function useToggle(initial = false): { on: boolean; toggle: () => void } {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() => setOn((v) => !v), []);
  return { on, toggle };
}
```

## 3. Validate Data Crossing The Boundary
API responses are `unknown` until proven. Parse with Zod at the edge of the app; never
`as` an API payload into a type. Derive the TS type from the schema (`z.infer`).
See `rules/frontend/tanstack-query.md` and `rules/02-typescript.md` §4.

## 4. Discriminated Unions For UI State
Model loading/error/success as a union, not parallel booleans (`rules/02-typescript.md` §6).
TanStack Query already gives you this — use its `status`, don't recreate flag soup.

## 5. Environment Variables
Only `NEXT_PUBLIC_*` exist client-side. Validate them once at startup with a Zod schema
and export a typed `env` object; never read `process.env` ad hoc across components.

```ts
const ClientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});
export const env = ClientEnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});
```

## 6. Shared Types
Types shared with the backend live in `shared/types/` and are imported by both, so the
contract has one definition. Don't duplicate request/response shapes on each side.

## 7. Review Checklist
- [ ] No `any`; props and hooks explicitly typed; explicit return types.
- [ ] API data validated (Zod), not asserted.
- [ ] UI state modeled as a discriminated union.
- [ ] Env vars validated once and typed.
- [ ] Cross-boundary types sourced from `shared/`.
