import type { Metadata } from 'next';
import type { JSX } from 'react';

import { StandingsView } from '@/components/standings/StandingsView';

export const metadata: Metadata = {
  title: 'Standings — Formula Stats',
  description:
    'Live Formula 1 drivers’ and constructors’ championship standings for the current season.',
};

export default function StandingsPage(): JSX.Element {
  return <StandingsView />;
}
