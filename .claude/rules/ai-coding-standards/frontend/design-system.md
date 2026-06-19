# Design System

The single source of truth for colors, typography, spacing, and shared UI primitives.
**No component ever hardcodes a color, font size, or spacing value.** Everything comes from
tokens and the shared primitives defined here.

## Principle

- Define design values **once** as tokens.
- Expose semantic tokens (e.g. `--color-foreground`), not raw values, to components.
- Build a small set of typed primitives (`Heading`, `Text`, `Button`, `Input`) that every
  feature reuses. New visual elements that do not exist are added here as primitives, then
  consumed — never inlined.

## 1. Color tokens — `app/globals.css`

Define colors as CSS variables on `:root`, with a `.dark` override. Use semantic names so
components reference roles, not hues. This file is the same shape in every project.

```css
@layer base {
  :root {
    /* Surfaces */
    --color-background: 0 0% 100%;
    --color-surface: 0 0% 98%;
    --color-border: 220 13% 91%;

    /* Text roles */
    --color-foreground: 222 47% 11%;     /* default body text */
    --color-muted: 220 9% 46%;           /* secondary/muted text */
    --color-heading: 222 47% 11%;        /* headings */

    /* Brand / intent */
    --color-primary: 221 83% 53%;
    --color-primary-foreground: 0 0% 100%;
    --color-destructive: 0 72% 51%;
    --color-destructive-foreground: 0 0% 100%;
    --color-success: 142 71% 45%;
    --color-warning: 38 92% 50%;

    /* Radius and shadow */
    --radius-sm: 0.25rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
  }

  .dark {
    --color-background: 222 47% 7%;
    --color-surface: 222 47% 11%;
    --color-border: 217 19% 27%;
    --color-foreground: 210 40% 98%;
    --color-muted: 215 16% 65%;
    --color-heading: 210 40% 98%;
    --color-primary: 217 91% 60%;
    --color-primary-foreground: 222 47% 11%;
    /* ...intent overrides... */
  }
}
```

(Colors are stored as HSL channel values so opacity modifiers work: `hsl(var(--color-primary) / 0.5)`.)

## 2. Map tokens into Tailwind — `tailwind` theme

Expose tokens as Tailwind colors so utilities resolve to the variables. With Tailwind v4,
declare them in the CSS `@theme`; with v3, map them in `tailwind.config`.

```css
/* Tailwind v4 — in globals.css */
@theme inline {
  --color-background: hsl(var(--color-background));
  --color-surface: hsl(var(--color-surface));
  --color-border: hsl(var(--color-border));
  --color-foreground: hsl(var(--color-foreground));
  --color-muted: hsl(var(--color-muted));
  --color-primary: hsl(var(--color-primary));
  --color-primary-foreground: hsl(var(--color-primary-foreground));
  --color-destructive: hsl(var(--color-destructive));
}
```

Now `bg-background`, `text-foreground`, `text-muted`, `border-border`, `bg-primary` all
work and adapt to dark mode automatically.

## 3. Typography tokens

Define the type scale and weights as tokens; never use raw `text-[17px]` literals.

```css
@theme inline {
  --font-sans: "Inter", system-ui, sans-serif;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
}
```

## 4. Typography primitives — `components/ui/typography.tsx`

Every piece of text on screen uses one of these. This is the "always the same file for
headers, paragraphs, muted text" requirement, implemented as typed components.

```tsx
import type { JSX, ReactNode } from "react";

type HeadingLevel = 1 | 2 | 3 | 4;

type HeadingProps = {
  level: HeadingLevel;
  children: ReactNode;
  className?: string;
};

const HEADING_STYLES: Record<HeadingLevel, string> = {
  1: "text-4xl font-bold text-foreground tracking-tight",
  2: "text-3xl font-semibold text-foreground tracking-tight",
  3: "text-2xl font-semibold text-foreground",
  4: "text-xl font-medium text-foreground",
};

export function Heading({ level, children, className }: HeadingProps): JSX.Element {
  const Tag = `h${level}` as const;
  return <Tag className={cn(HEADING_STYLES[level], className)}>{children}</Tag>;
}

type TextVariant = "body" | "muted" | "small" | "label";

type TextProps = {
  variant?: TextVariant;
  children: ReactNode;
  className?: string;
};

const TEXT_STYLES: Record<TextVariant, string> = {
  body: "text-base text-foreground leading-relaxed",
  muted: "text-sm text-muted",
  small: "text-xs text-muted",
  label: "text-sm font-medium text-foreground",
};

export function Text({ variant = "body", children, className }: TextProps): JSX.Element {
  return <p className={cn(TEXT_STYLES[variant], className)}>{children}</p>;
}
```

Usage everywhere:

```tsx
<Heading level={1}>Dashboard</Heading>
<Text>Primary body copy.</Text>
<Text variant="muted">Secondary, de-emphasized copy.</Text>
```

## 5. The `cn` utility — `lib/utils/cn.ts`

One helper to merge class names safely (clsx + tailwind-merge).

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

## 6. Interactive primitives — `components/ui/`

Build a minimal, typed set. Variants are defined with a typed map, never inline conditionals.

```tsx
// components/ui/button.tsx
import type { ButtonHTMLAttributes, JSX } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "destructive" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "bg-surface text-foreground border border-border hover:bg-background",
  destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
  ghost: "text-foreground hover:bg-surface",
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-12 px-6 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...rest
}: ButtonProps): JSX.Element {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition disabled:opacity-50 disabled:pointer-events-none",
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className,
      )}
      {...rest}
    />
  );
}
```

Minimum primitive set every project starts with: `Button`, `Input`, `Label`, `Heading`,
`Text`, `Card`, `Badge`, `Spinner`. Add more here as needed; never inline them.

## 7. Spacing and layout

- Use Tailwind's spacing scale only (`p-4`, `gap-6`). No arbitrary pixel values.
- Layout primitives (`Stack`, `Container`) live in `components/ui/` and encapsulate spacing.

## Rules summary

- Color, font size, radius, spacing → tokens only. No literals in components.
- All text → `Heading` / `Text`. No raw `<h1>`/`<p>` with ad-hoc classes in features.
- Variants → typed maps, never inline ternaries on class strings.
- New visual element missing → add a primitive here, then consume it.
- Dark mode is free because everything references semantic tokens.
