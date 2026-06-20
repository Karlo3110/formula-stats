import Link from 'next/link';
import type { JSX } from 'react';

import type { LearnTopic } from '@/lib/learn/topics';

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function LearnArticle({ topic }: { topic: LearnTopic }): JSX.Element {
  return (
    <article className="mx-auto max-w-3xl px-2 sm:px-6">
      <header className="border-b border-white/10 pb-10 pt-6">
        <Link
          href="/learn"
          className="text-[0.7rem] uppercase tracking-[0.35em] text-primary transition hover:text-foreground"
        >
          ← Learning Center
        </Link>
        <h1 className="mt-5 font-display text-6xl uppercase leading-[0.9] tracking-tight text-heading sm:text-8xl">
          {topic.title}
        </h1>
        <p className="mt-5 max-w-2xl text-xl leading-relaxed text-foreground/70">
          {topic.tagline}
        </p>
      </header>

      <div className="flex flex-col gap-16 py-16">
        {topic.sections.map((section, index) => (
          <section key={section.heading}>
            <div className="flex items-center gap-4">
              <span className="font-display text-xl tabular-nums text-primary">
                {pad(index + 1)}
              </span>
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <h2 className="mt-5 font-display text-3xl uppercase leading-tight text-heading sm:text-4xl">
              {section.heading}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-foreground/80">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </article>
  );
}
