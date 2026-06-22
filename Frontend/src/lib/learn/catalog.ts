import { aerodynamics } from '@/lib/learn/content/aerodynamics';
import { flags } from '@/lib/learn/content/flags';
import { penalties } from '@/lib/learn/content/penalties';
import { powerUnit } from '@/lib/learn/content/power-unit';
import { rulebook } from '@/lib/learn/content/rulebook';
import { tyres } from '@/lib/learn/content/tyres';
import type { ContentBlock, LearnChapter, LearnTopic } from '@/lib/learn/types';

export const LEARN_TOPICS: ReadonlyArray<LearnTopic> = [
  rulebook,
  aerodynamics,
  tyres,
  powerUnit,
  flags,
  penalties,
];

export function getTopic(slug: string): LearnTopic | undefined {
  return LEARN_TOPICS.find((topic) => topic.slug === slug);
}

export interface ChapterLocation {
  topic: LearnTopic;
  chapter: LearnChapter;
  index: number;
  previous: LearnChapter | null;
  next: LearnChapter | null;
}

export function getChapter(
  topicSlug: string,
  chapterSlug: string,
): ChapterLocation | undefined {
  const topic = getTopic(topicSlug);
  if (!topic) {
    return undefined;
  }
  const index = topic.chapters.findIndex((c) => c.slug === chapterSlug);
  if (index === -1) {
    return undefined;
  }
  const chapter = topic.chapters[index];
  if (!chapter) {
    return undefined;
  }
  return {
    topic,
    chapter,
    index,
    previous: topic.chapters[index - 1] ?? null,
    next: topic.chapters[index + 1] ?? null,
  };
}

const WORDS_PER_MINUTE = 200;

function countBlockWords(block: ContentBlock): number {
  switch (block.type) {
    case 'paragraph':
    case 'subheading':
      return block.text.split(/\s+/).length;
    case 'callout':
      return block.title.split(/\s+/).length + block.text.split(/\s+/).length;
    case 'list':
      return block.items.reduce((sum, item) => sum + item.split(/\s+/).length, 0);
    case 'steps':
      return block.items.reduce(
        (sum, item) =>
          sum + item.title.split(/\s+/).length + item.text.split(/\s+/).length,
        0,
      );
    case 'terms':
      return block.items.reduce(
        (sum, item) =>
          sum +
          item.term.split(/\s+/).length +
          item.definition.split(/\s+/).length,
        0,
      );
    case 'table':
      return block.rows.reduce(
        (sum, row) =>
          sum + row.reduce((cells, cell) => cells + cell.split(/\s+/).length, 0),
        0,
      );
    default:
      return assertNever(block);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled content block: ${JSON.stringify(value)}`);
}

export function estimateChapterMinutes(chapter: LearnChapter): number {
  const words = chapter.blocks.reduce(
    (sum, block) => sum + countBlockWords(block),
    0,
  );
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function estimateTopicMinutes(topic: LearnTopic): number {
  return topic.chapters.reduce(
    (sum, chapter) => sum + estimateChapterMinutes(chapter),
    0,
  );
}
