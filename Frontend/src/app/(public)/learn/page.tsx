import type { Metadata } from 'next';
import type { JSX } from 'react';

import { LearnCatalog } from '@/components/learn/LearnCatalog';

export const metadata: Metadata = {
  title: 'Learning Center — Formula Stats',
  description:
    'Learn how Formula 1 works through short, readable courses: the rulebook, aerodynamics, tyres and strategy, the power unit, race flags, and penalties — explained from the ground up.',
};

export default function LearnPage(): JSX.Element {
  return <LearnCatalog />;
}
