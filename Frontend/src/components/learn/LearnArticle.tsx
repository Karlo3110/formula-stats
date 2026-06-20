import Link from 'next/link';
import type { JSX } from 'react';

import { Heading, Text } from '@/components/ui/Typography';
import type { LearnTopic } from '@/lib/learn/topics';

export function LearnArticle({ topic }: { topic: LearnTopic }): JSX.Element {
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link
          href="/learn"
          className="text-xs uppercase tracking-[0.25em] text-primary hover:underline"
        >
          ← Learning Center
        </Link>
        <Heading level={1} display>
          {topic.title}
        </Heading>
        <Text variant="muted">{topic.tagline}</Text>
      </header>

      <div className="flex flex-col gap-4">
        {topic.sections.map((section) => (
          <section key={section.heading} className="glass-panel rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-heading">{section.heading}</h2>
            <p className="mt-2 leading-relaxed text-foreground/80">{section.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
