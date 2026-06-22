import type { JSX } from 'react';

import { renderInline } from '@/components/learn/inline';
import type { TermItem } from '@/lib/learn/types';

interface TermListProps {
  items: ReadonlyArray<TermItem>;
}

export function TermList({ items }: TermListProps): JSX.Element {
  return (
    <dl className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.term} className="bg-surface/60 px-5 py-4">
          <dt className="font-display text-lg uppercase tracking-wide text-primary">
            {item.term}
          </dt>
          <dd className="mt-1.5 text-sm leading-relaxed text-foreground/70">
            {renderInline(item.definition)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
