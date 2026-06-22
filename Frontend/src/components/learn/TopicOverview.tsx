import Link from 'next/link';
import type { JSX } from 'react';

import { estimateChapterMinutes, estimateTopicMinutes } from '@/lib/learn/catalog';
import { cn } from '@/lib/utils/cn';
import type { LearnTopic } from '@/lib/learn/types';

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function TopicOverview({ topic }: { topic: LearnTopic }): JSX.Element {
  const totalMinutes = estimateTopicMinutes(topic);
  const accentText = topic.accent === 'accent' ? 'text-accent' : 'text-primary';
  const accentBar = topic.accent === 'accent' ? 'bg-accent' : 'bg-primary';
  const firstChapter = topic.chapters[0];

  return (
    <div className="mx-auto max-w-3xl px-2 sm:px-6">
      <header className="border-b border-white/10 pb-10 pt-2">
        <Link
          href="/learn"
          className="text-[0.7rem] uppercase tracking-[0.35em] text-muted transition hover:text-foreground"
        >
          ← Learning Center
        </Link>
        <h1 className="mt-6 font-display text-6xl uppercase leading-[0.9] tracking-tight text-heading sm:text-8xl">
          {topic.title}
        </h1>
        <p className="mt-4 text-xl leading-relaxed text-foreground/70">
          {topic.tagline}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.65rem] font-semibold uppercase tracking-[0.25em]">
          <span className={accentText}>{topic.level}</span>
          <span aria-hidden className="text-muted">
            ·
          </span>
          <span className="text-muted">{topic.chapters.length} chapters</span>
          <span aria-hidden className="text-muted">
            ·
          </span>
          <span className="text-muted">{totalMinutes} min total</span>
        </div>
        <p className="mt-7 max-w-2xl text-base leading-relaxed text-foreground/65">
          {topic.description}
        </p>
        {firstChapter ? (
          <Link
            href={`/learn/${topic.slug}/${firstChapter.slug}`}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-display text-sm uppercase tracking-[0.2em] text-primary-foreground transition hover:opacity-90"
          >
            Start course →
          </Link>
        ) : null}
      </header>

      <ol className="mt-4">
        {topic.chapters.map((chapter, index) => (
          <li key={chapter.slug}>
            <Link
              href={`/learn/${topic.slug}/${chapter.slug}`}
              className="group flex items-center gap-5 border-b border-white/10 py-6 transition sm:gap-7"
            >
              <span className="flex items-center gap-4">
                <span
                  className={cn(
                    'h-12 w-1 rounded-full opacity-30 transition group-hover:opacity-100',
                    accentBar,
                  )}
                />
                <span className="w-7 font-display text-2xl tabular-nums text-muted">
                  {pad(index + 1)}
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-2xl uppercase leading-tight tracking-wide text-heading transition-colors group-hover:text-foreground sm:text-3xl">
                  {chapter.title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-foreground/55">
                  {chapter.summary}
                </p>
              </div>
              <span className="hidden shrink-0 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted sm:block">
                {estimateChapterMinutes(chapter)} min
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
