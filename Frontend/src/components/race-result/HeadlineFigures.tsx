import type { JSX } from 'react';

import { Eyebrow } from '@/components/ui/Typography';
import { cn } from '@/lib/utils/cn';
import type { ClassificationSummary } from '@/lib/f1/classification';

interface Figure {
  label: string;
  value: number;
  isHighlighted: boolean;
}

function figuresOf(summary: ClassificationSummary): Figure[] {
  return [
    { label: 'Starters', value: summary.starters, isHighlighted: false },
    { label: 'Classified', value: summary.classified, isHighlighted: false },
    { label: 'Retired', value: summary.retired, isHighlighted: true },
  ];
}

/** Stacked headline numbers beside the circuit (last one in signal yellow). */
export function HeadlineFigures({ summary }: { summary: ClassificationSummary }): JSX.Element {
  return (
    <dl className="flex shrink-0 flex-col items-end gap-4 text-right">
      {figuresOf(summary).map((figure) => (
        <div key={figure.label} className="flex flex-col-reverse">
          <dt>
            <Eyebrow>{figure.label}</Eyebrow>
          </dt>
          <dd className={cn('font-display text-6xl leading-[0.85] tabular-nums', figure.isHighlighted ? 'text-accent' : 'text-heading/85')}>
            {figure.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
