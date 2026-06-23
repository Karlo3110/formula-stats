import type { JSX } from 'react';

import { HomeExplainer } from '@/components/home/HomeExplainer';
import { HomeView } from '@/components/home/HomeView';

export default function HomePage(): JSX.Element {
  return (
    <>
      <HomeView />
      <HomeExplainer />
    </>
  );
}
