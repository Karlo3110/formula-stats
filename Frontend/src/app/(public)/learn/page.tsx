import Link from 'next/link';
import type { Metadata } from 'next';
import type { JSX } from 'react';

import { LEARN_TOPICS } from '@/lib/learn/topics';

export const metadata: Metadata = {
  title: 'Learning Center — Formula Stats',
  description:
    'Learn how Formula 1 works: the rulebook, aerodynamics, tyres, the power unit, flags, and penalties — explained plainly.',
};

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export default function LearnPage(): JSX.Element {
  return (
    <div className="mx-auto max-w-[80rem] px-2 sm:px-6">
      <header className="pb-6 pt-6">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.45em] text-primary">
          Learning Center
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-6xl uppercase leading-[0.9] tracking-tight text-heading sm:text-8xl">
          Understand the sport
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-foreground/65">
          Formula 1 rewards the fans who understand it. These guides break down
          the rules, the technology, and the strategy from the ground up — no
          jargon, no assumptions. Start anywhere.
        </p>
      </header>

      <ul className="mt-12 border-t border-white/10">
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
                    className={`h-12 w-1 rounded-full ${accentBar} opacity-30 transition group-hover:opacity-100`}
                  />
                  <span className="w-8 font-display text-2xl tabular-nums text-muted">
                    {pad(index + 1)}
                  </span>
                </span>
                <div className="flex-1">
                  <h2
                    className={`font-display text-4xl uppercase leading-none text-heading transition-colors ${accentHover} sm:text-6xl`}
                  >
                    {topic.title}
                  </h2>
                  <p className="mt-2 text-sm text-foreground/60 sm:text-base">
                    {topic.tagline}
                  </p>
                  <p
                    className={`mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.3em] ${accentText}`}
                  >
                    {topic.sections.length} chapters
                  </p>
                </div>
                <span
                  className={`text-2xl text-muted transition group-hover:translate-x-1 ${accentHover}`}
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
