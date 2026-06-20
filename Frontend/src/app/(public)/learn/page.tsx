import Link from 'next/link';
import type { JSX } from 'react';

import { LEARN_TOPICS } from '@/lib/learn/topics';

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
        <p className="mt-4 max-w-xl text-lg text-foreground/65">
          The rules, the technology, and the strategy behind Formula 1 — written
          plainly.
        </p>
      </header>

      <ul className="mt-10 border-t border-white/10">
        {LEARN_TOPICS.map((topic, index) => (
          <li key={topic.slug}>
            <Link
              href={`/learn/${topic.slug}`}
              className="group flex items-center gap-6 border-b border-white/10 py-8 transition sm:gap-10"
            >
              <span className="w-10 font-display text-2xl tabular-nums text-muted">
                {pad(index + 1)}
              </span>
              <div className="flex-1">
                <h2 className="font-display text-4xl uppercase leading-none text-heading transition-colors group-hover:text-primary sm:text-6xl">
                  {topic.title}
                </h2>
                <p className="mt-2 text-sm text-foreground/60 sm:text-base">
                  {topic.tagline}
                </p>
              </div>
              <span className="text-2xl text-muted transition group-hover:translate-x-1 group-hover:text-primary">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
