# Tailwind CSS Standards

## 1. Overview
Tailwind is our single styling system. Style with utility classes driven by design
tokens. One styling approach, used consistently — no parallel CSS-in-JS, no ad-hoc
stylesheets competing with utilities.

## 2. Version Requirements
- Tailwind CSS **3.4+** (or 4.x), configured with the project design tokens.
- Class merging via `clsx` + `tailwind-merge` (wrapped in a `cn()` helper).

## 3. Approved Patterns
- **Design tokens drive everything.** Colors, spacing, radii, typography, and breakpoints
  come from `tailwind.config`. Components reference semantic tokens
  (`bg-primary`, `text-muted-foreground`), not raw hex or one-off pixel values.
- **`cn()` helper** to compose and conditionally apply classes:
  ```ts
  import { clsx, type ClassValue } from 'clsx';
  import { twMerge } from 'tailwind-merge';
  export function cn(...inputs: ClassValue[]): string { return twMerge(clsx(inputs)); }
  ```
- **Variants via `cva`** (class-variance-authority) for components with multiple
  visual states — not sprawling ternary chains in JSX.
- **Mobile-first responsive** (`sm:`, `md:`, `lg:`) and **`dark:`** for theming.
- Extract a component (not an `@apply` blob) when the same cluster of utilities repeats.

## 4. Forbidden Patterns
- ❌ Arbitrary magic values where a token exists: `mt-[13px]`, `text-[#3b82f6]`.
- ❌ Inline `style={{ }}` for anything Tailwind can express.
- ❌ A second styling system (CSS Modules, styled-components, raw global CSS) for app UI.
- ❌ `@apply` used to recreate component abstraction — extract a React component instead.
- ❌ Long, duplicated class strings copy-pasted across files — extract a component/variant.
- ❌ Conditional classes by string concatenation that can produce conflicts — use `cn()`.

## 5. Security Requirements
- Never interpolate untrusted input into class names or `style`.

## 6. Performance Requirements
- Rely on Tailwind's content scanning for purging; keep `content` globs accurate so unused
  CSS is stripped.
- Avoid unbounded dynamic class generation that defeats purging.

## 7. Testing Requirements
- Don't assert on class names in tests (implementation detail). Test rendered behavior and
  accessibility. Use visual regression for design-critical surfaces if needed.

## 8. Example
```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const button = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4', lg: 'h-12 px-6 text-lg' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export function Button({ className, variant, size, ...props }: ButtonProps): JSX.Element {
  return <button className={cn(button({ variant, size }), className)} {...props} />;
}
```

## 9. Accessibility (Non-Negotiable)
- Always provide visible focus states (`focus-visible:ring-*`).
- Maintain WCAG AA contrast using token pairs (`*-foreground` on `*`).
- Don't convey meaning by color alone.

## 10. Review Checklist
- [ ] Tokens used; no arbitrary hex/px where a token exists.
- [ ] `cn()` for conditional classes; `cva` for variants.
- [ ] No competing styling system or inline styles.
- [ ] Repeated class clusters extracted into components.
- [ ] Focus states and AA contrast present.
