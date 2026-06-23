import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { JSX } from 'react';

import { TopicOverview } from '@/components/learn/TopicOverview';
import { getTopic, LEARN_TOPICS } from '@/lib/learn/catalog';
import { buildPageMetadata } from '@/lib/seo/page-metadata';

export function generateStaticParams(): { slug: string }[] {
  return LEARN_TOPICS.map((topic) => ({ slug: topic.slug }));
}

interface TopicPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) {
    return { title: 'Not found', robots: { index: false } };
  }
  return buildPageMetadata({
    title: `${topic.title} — Learning Center`,
    description: topic.description,
    path: `/learn/${topic.slug}`,
  });
}

export default async function TopicPage({
  params,
}: TopicPageProps): Promise<JSX.Element> {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) {
    notFound();
  }
  return <TopicOverview topic={topic} />;
}
