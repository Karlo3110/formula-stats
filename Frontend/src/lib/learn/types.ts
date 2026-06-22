export type TopicAccent = 'primary' | 'accent';

export type TopicLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type CalloutTone = 'key' | 'info' | 'warning';

export interface StepItem {
  title: string;
  text: string;
}

export interface TermItem {
  term: string;
  definition: string;
}

/**
 * A single unit of chapter content. A discriminated union so the renderer can
 * switch exhaustively and so illegal combinations (a table without rows, a
 * callout without a tone) are impossible to express.
 *
 * `text` fields support a tiny inline syntax: `**bold**` is rendered as a
 * <strong>, nothing else. No HTML is ever interpreted.
 */
export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'callout'; tone: CalloutTone; title: string; text: string }
  | { type: 'list'; items: ReadonlyArray<string> }
  | { type: 'steps'; items: ReadonlyArray<StepItem> }
  | { type: 'terms'; items: ReadonlyArray<TermItem> }
  | { type: 'table'; caption?: string; columns: ReadonlyArray<string>; rows: ReadonlyArray<ReadonlyArray<string>> };

export interface LearnChapter {
  slug: string;
  title: string;
  /** One-line summary shown in the table of contents. */
  summary: string;
  blocks: ReadonlyArray<ContentBlock>;
  /** Plain-language recap rendered at the end of the chapter. */
  takeaways: ReadonlyArray<string>;
}

export interface LearnTopic {
  slug: string;
  title: string;
  tagline: string;
  /** Longer intro shown on the topic overview page. */
  description: string;
  accent: TopicAccent;
  level: TopicLevel;
  chapters: ReadonlyArray<LearnChapter>;
}
