import type { JSX, ReactNode } from 'react';

import { Heading } from '@/components/ui/Typography';
import { cn } from '@/lib/utils/cn';

interface EditorialSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * Always-rendered, server-side editorial prose. The data pages fetch on the
 * client, so their initial HTML is mostly a loading state; this section gives
 * every page substantial, crawlable content (and internal links) regardless of
 * live API state — important for SEO and ad-network review. Styling mirrors the
 * legal/content pages.
 */
export function EditorialSection({
  title,
  children,
  className,
}: EditorialSectionProps): JSX.Element {
  return (
    <section
      className={cn(
        'mx-auto mt-20 max-w-3xl border-t border-white/5 px-2 pt-12 sm:px-6',
        className,
      )}
    >
      <Heading level={2} className="text-2xl">
        {title}
      </Heading>
      <div className="mt-5 space-y-4 text-foreground/70 [&_a]:text-primary [&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_p]:leading-relaxed [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:space-y-2">
        {children}
      </div>
    </section>
  );
}
