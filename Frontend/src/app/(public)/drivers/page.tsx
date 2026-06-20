import type { Metadata } from 'next';
import type { JSX } from 'react';

import { DriversView } from '@/components/drivers/DriversView';

export const metadata: Metadata = {
  title: 'Drivers — Formula Stats',
  description:
    'Formula 1 driver championship standings by season: points, wins, and grid position for every driver.',
};

export default function DriversPage(): JSX.Element {
  return <DriversView />;
}
