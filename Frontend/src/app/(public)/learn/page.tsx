import type { Metadata } from 'next';
import type { JSX } from 'react';

import { LearnCatalog } from '@/components/learn/LearnCatalog';
import { buildPageMetadata } from '@/lib/seo/page-metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Learning Center',
  description:
    'Learn how Formula 1 works through short, readable courses: the rulebook, aerodynamics, tyres and strategy, the power unit, race flags, and penalties — explained from the ground up.',
  path: '/learn',
});

export default function LearnPage(): JSX.Element {
  return <LearnCatalog />;
}
