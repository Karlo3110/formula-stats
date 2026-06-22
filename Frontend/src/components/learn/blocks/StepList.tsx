import type { JSX } from 'react';

import { renderInline } from '@/components/learn/inline';
import type { StepItem } from '@/lib/learn/types';

interface StepListProps {
  items: ReadonlyArray<StepItem>;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function StepList({ items }: StepListProps): JSX.Element {
  return (
    <ol className="flex flex-col gap-4">
      {items.map((item, index) => (
        <li key={item.title} className="flex gap-4 sm:gap-5">
          <div className="flex flex-col items-center">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/40 font-display text-base tabular-nums text-primary">
              {pad(index + 1)}
            </span>
            {index < items.length - 1 ? (
              <span className="mt-1 w-px flex-1 bg-white/10" />
            ) : null}
          </div>
          <div className="pb-1 pt-1">
            <h3 className="font-display text-lg uppercase leading-tight tracking-wide text-heading">
              {item.title}
            </h3>
            <p className="mt-1 text-base leading-relaxed text-foreground/75">
              {renderInline(item.text)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
