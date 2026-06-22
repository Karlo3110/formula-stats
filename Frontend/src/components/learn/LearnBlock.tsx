import type { JSX } from 'react';

import { Callout } from '@/components/learn/blocks/Callout';
import { DataTable } from '@/components/learn/blocks/DataTable';
import { StepList } from '@/components/learn/blocks/StepList';
import { TermList } from '@/components/learn/blocks/TermList';
import { renderInline } from '@/components/learn/inline';
import type { ContentBlock } from '@/lib/learn/types';

function assertNever(value: never): never {
  throw new Error(`Unhandled content block: ${JSON.stringify(value)}`);
}

export function LearnBlock({ block }: { block: ContentBlock }): JSX.Element {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="text-lg leading-relaxed text-foreground/80">
          {renderInline(block.text)}
        </p>
      );
    case 'subheading':
      return (
        <h2 className="font-display text-2xl uppercase leading-tight tracking-wide text-heading sm:text-3xl">
          {block.text}
        </h2>
      );
    case 'list':
      return (
        <ul className="flex flex-col gap-3">
          {block.items.map((item, index) => (
            <li key={index} className="flex gap-3 text-lg leading-relaxed text-foreground/80">
              <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
    case 'steps':
      return <StepList items={block.items} />;
    case 'terms':
      return <TermList items={block.items} />;
    case 'callout':
      return <Callout tone={block.tone} title={block.title} text={block.text} />;
    case 'table':
      return block.caption !== undefined ? (
        <DataTable caption={block.caption} columns={block.columns} rows={block.rows} />
      ) : (
        <DataTable columns={block.columns} rows={block.rows} />
      );
    default:
      return assertNever(block);
  }
}
