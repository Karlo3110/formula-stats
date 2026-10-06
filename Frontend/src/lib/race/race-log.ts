import type { ReplayMessage } from '@/lib/validation/f1-schemas';

/** Messages issued up to the playback clock, newest first. */
export function messagesUpTo(
  messages: ReadonlyArray<ReplayMessage>,
  clock: number,
): ReplayMessage[] {
  return messages.filter((message) => message.time <= clock).reverse();
}
