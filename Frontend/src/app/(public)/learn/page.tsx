import type { JSX } from 'react';

import { TopicCard } from '@/components/learn/TopicCard';
import { Heading, Text } from '@/components/ui/Typography';
import { LEARN_TOPICS } from '@/lib/learn/topics';

export default function LearnPage(): JSX.Element {
  return (
    <div className="mx-auto flex max-w-[80rem] flex-col gap-8">
      <header className="flex flex-col gap-2">
        <Heading level={1} display>
          Learning Center
        </Heading>
        <Text variant="muted">
          The rules, the tech, and the strategy behind Formula 1 — explained.
        </Text>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {LEARN_TOPICS.map((topic) => (
          <TopicCard key={topic.slug} topic={topic} />
        ))}
      </div>
    </div>
  );
}
