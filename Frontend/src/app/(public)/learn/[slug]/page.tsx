import { notFound } from 'next/navigation';
import type { JSX } from 'react';

import { LearnArticle } from '@/components/learn/LearnArticle';
import { getTopic, LEARN_TOPICS } from '@/lib/learn/topics';

export function generateStaticParams(): { slug: string }[] {
  return LEARN_TOPICS.map((topic) => ({ slug: topic.slug }));
}

interface TopicPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TopicPage({
  params,
}: TopicPageProps): Promise<JSX.Element> {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) {
    notFound();
  }
  return <LearnArticle topic={topic} />;
}
