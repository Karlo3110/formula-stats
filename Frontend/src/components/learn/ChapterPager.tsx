import Link from 'next/link';
import type { JSX } from 'react';

import type { LearnChapter, LearnTopic } from '@/lib/learn/types';

interface ChapterPagerProps {
  topic: LearnTopic;
  previous: LearnChapter | null;
  next: LearnChapter | null;
}

export function ChapterPager({ topic, previous, next }: ChapterPagerProps): JSX.Element {
  return (
    <nav
      aria-label="Chapter navigation"
      className="grid gap-3 border-t border-white/10 pt-8 sm:grid-cols-2"
    >
      {previous ? (
        <Link
          href={`/learn/${topic.slug}/${previous.slug}`}
          className="group flex flex-col rounded-2xl border border-white/10 bg-surface/40 px-5 py-4 transition hover:border-white/25"
        >
          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-muted">
            ← Previous
          </span>
          <span className="mt-1 font-display text-lg uppercase leading-tight tracking-wide text-foreground transition-colors group-hover:text-primary">
            {previous.title}
          </span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}

      {next ? (
        <Link
          href={`/learn/${topic.slug}/${next.slug}`}
          className="group flex flex-col rounded-2xl border border-white/10 bg-surface/40 px-5 py-4 text-right transition hover:border-white/25"
        >
          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-muted">
            Next →
          </span>
          <span className="mt-1 font-display text-lg uppercase leading-tight tracking-wide text-foreground transition-colors group-hover:text-primary">
            {next.title}
          </span>
        </Link>
      ) : (
        <Link
          href={`/learn/${topic.slug}`}
          className="group flex flex-col rounded-2xl border border-primary/30 bg-primary/[0.06] px-5 py-4 text-right transition hover:border-primary/60"
        >
          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-primary">
            Course complete
          </span>
          <span className="mt-1 font-display text-lg uppercase leading-tight tracking-wide text-foreground transition-colors group-hover:text-primary">
            Back to {topic.title}
          </span>
        </Link>
      )}
    </nav>
  );
}
