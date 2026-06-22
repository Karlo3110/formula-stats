import Link from 'next/link';
import type { JSX } from 'react';

import { estimateTopicMinutes, LEARN_TOPICS } from '@/lib/learn/catalog';
import { cn } from '@/lib/utils/cn';

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function LearnCatalog(): JSX.Element {
  return (
    <div className="mx-auto max-w-[80rem] px-2 sm:px-6">
      <header className="pb-6 pt-2">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.45em] text-primary">
          Learning Center
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-6xl uppercase leading-[0.9] tracking-tight text-heading sm:text-8xl">
          Understand the sport
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-foreground/65">
          Formula 1 rewards the fans who understand it. Each course below breaks
          a corner of the sport down into short, readable chapters — the rules,
          the technology, the strategy — built from the ground up with no jargon
          and no assumptions. Pick a course and start anywhere.
        </p>
      </header>

      <ul className="mt-10 border-t border-white/10">
        {LEARN_TOPICS.map((topic, index) => {
          const accentText =
            topic.accent === 'accent' ? 'text-accent' : 'text-primary';
          const accentBar =
            topic.accent === 'accent' ? 'bg-accent' : 'bg-primary';
          const accentHover =
            topic.accent === 'accent'
              ? 'group-hover:text-accent'
              : 'group-hover:text-primary';

          return (
            <li key={topic.slug}>
              <Link
                href={`/learn/${topic.slug}`}
                className="group flex items-center gap-6 border-b border-white/10 py-8 transition sm:gap-10"
              >
                <span className="flex items-center gap-4 sm:gap-6">
                  <span
                    className={cn(
                      'h-14 w-1 rounded-full opacity-30 transition group-hover:opacity-100',
                      accentBar,
                    )}
                  />
                  <span className="w-8 font-display text-2xl tabular-nums text-muted">
                    {pad(index + 1)}
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <h2
                    className={cn(
                      'font-display text-4xl uppercase leading-none text-heading transition-colors sm:text-6xl',
                      accentHover,
                    )}
                  >
                    {topic.title}
                  </h2>
                  <p className="mt-2 text-sm text-foreground/60 sm:text-base">
                    {topic.tagline}
                  </p>
                  <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.65rem] font-semibold uppercase tracking-[0.25em]">
                    <span className={accentText}>{topic.level}</span>
                    <span aria-hidden className="text-muted">
                      ·
                    </span>
                    <span className="text-muted">
                      {topic.chapters.length} chapters
                    </span>
                    <span aria-hidden className="text-muted">
                      ·
                    </span>
                    <span className="text-muted">
                      {estimateTopicMinutes(topic)} min
                    </span>
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 text-2xl text-muted transition group-hover:translate-x-1',
                    accentHover,
                  )}
                >
                  →
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
