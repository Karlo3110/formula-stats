import Link from 'next/link';
import type { JSX } from 'react';

import { AdSlot } from '@/components/ads/AdSlot';
import { ChapterNav } from '@/components/learn/ChapterNav';
import { ChapterPager } from '@/components/learn/ChapterPager';
import { ChapterTakeaways } from '@/components/learn/ChapterTakeaways';
import { LearnBlock } from '@/components/learn/LearnBlock';
import type { ChapterLocation } from '@/lib/learn/catalog';

const LEARN_AD_SLOT = '0000000000';

interface ChapterReaderProps {
  location: ChapterLocation;
  readMinutes: number;
}

export function ChapterReader({ location, readMinutes }: ChapterReaderProps): JSX.Element {
  const { topic, chapter, index, previous, next } = location;
  const total = topic.chapters.length;

  return (
    <div className="mx-auto max-w-[80rem] px-2 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-14">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <ChapterNav topic={topic} currentSlug={chapter.slug} />
          </div>
        </aside>

        <article className="min-w-0 max-w-2xl">
          <header className="border-b border-white/10 pb-8">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.7rem] uppercase tracking-[0.3em] text-muted">
              <Link href="/learn" className="transition hover:text-foreground">
                Learn
              </Link>
              <span aria-hidden>/</span>
              <Link
                href={`/learn/${topic.slug}`}
                className="transition hover:text-foreground"
              >
                {topic.title}
              </Link>
            </div>
            <p className="mt-6 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-primary">
              Chapter {index + 1} of {total} · {readMinutes} min read
            </p>
            <h1 className="mt-3 font-display text-5xl uppercase leading-[0.92] tracking-tight text-heading sm:text-7xl">
              {chapter.title}
            </h1>
          </header>

          <div className="flex flex-col gap-8 py-10">
            {chapter.blocks.map((block, blockIndex) => (
              <LearnBlock key={blockIndex} block={block} />
            ))}
          </div>

          <ChapterTakeaways items={chapter.takeaways} />

          <AdSlot slot={LEARN_AD_SLOT} className="my-10" />

          <ChapterPager topic={topic} previous={previous} next={next} />
        </article>
      </div>
    </div>
  );
}
