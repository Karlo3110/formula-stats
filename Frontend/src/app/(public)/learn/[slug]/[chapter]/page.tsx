import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { JSX } from 'react';

import { ChapterReader } from '@/components/learn/ChapterReader';
import {
  estimateChapterMinutes,
  getChapter,
  LEARN_TOPICS,
} from '@/lib/learn/catalog';

export function generateStaticParams(): { slug: string; chapter: string }[] {
  return LEARN_TOPICS.flatMap((topic) =>
    topic.chapters.map((chapter) => ({
      slug: topic.slug,
      chapter: chapter.slug,
    })),
  );
}

interface ChapterPageProps {
  params: Promise<{ slug: string; chapter: string }>;
}

export async function generateMetadata({
  params,
}: ChapterPageProps): Promise<Metadata> {
  const { slug, chapter } = await params;
  const location = getChapter(slug, chapter);
  if (!location) {
    return { title: 'Not found — Formula Stats' };
  }
  return {
    title: `${location.chapter.title} — ${location.topic.title}`,
    description: location.chapter.summary,
  };
}

export default async function ChapterPage({
  params,
}: ChapterPageProps): Promise<JSX.Element> {
  const { slug, chapter } = await params;
  const location = getChapter(slug, chapter);
  if (!location) {
    notFound();
  }
  return (
    <ChapterReader
      location={location}
      readMinutes={estimateChapterMinutes(location.chapter)}
    />
  );
}
