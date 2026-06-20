import Link from 'next/link';
import type { JSX } from 'react';

import type { LearnTopic } from '@/lib/learn/topics';

export function TopicCard({ topic }: { topic: LearnTopic }): JSX.Element {
  const glow = topic.accent === 'accent' ? 'var(--color-accent)' : 'var(--color-primary)';

  return (
    <Link
      href={`/learn/${topic.slug}`}
      className="glass-panel group relative flex flex-col overflow-hidden rounded-2xl p-6 transition hover:border-primary/40"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-30 blur-3xl transition group-hover:opacity-60"
        style={{ background: glow }}
      />
      <h2 className="relative font-display text-3xl uppercase leading-none text-heading">
        {topic.title}
      </h2>
      <p className="relative mt-3 text-sm text-foreground/75">{topic.tagline}</p>
      <span className="relative mt-6 text-xs uppercase tracking-[0.25em] text-primary">
        Explore →
      </span>
    </Link>
  );
}
