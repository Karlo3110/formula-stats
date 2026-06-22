import Link from 'next/link';
import type { JSX } from 'react';

import { cn } from '@/lib/utils/cn';
import type { LearnTopic } from '@/lib/learn/types';

interface ChapterNavProps {
  topic: LearnTopic;
  currentSlug: string;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function ChapterNav({ topic, currentSlug }: ChapterNavProps): JSX.Element {
  return (
    <nav aria-label="Chapters" className="flex flex-col gap-1">
      <Link
        href={`/learn/${topic.slug}`}
        className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted transition hover:text-foreground"
      >
        ← {topic.title}
      </Link>
      {topic.chapters.map((chapter, index) => {
        const isActive = chapter.slug === currentSlug;
        return (
          <Link
            key={chapter.slug}
            href={`/learn/${topic.slug}/${chapter.slug}`}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'group flex items-start gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-primary/10 text-foreground'
                : 'text-foreground/55 hover:bg-white/[0.03] hover:text-foreground',
            )}
          >
            <span
              className={cn(
                'mt-px font-display text-sm tabular-nums',
                isActive ? 'text-primary' : 'text-muted',
              )}
            >
              {pad(index + 1)}
            </span>
            <span className="leading-snug">{chapter.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
