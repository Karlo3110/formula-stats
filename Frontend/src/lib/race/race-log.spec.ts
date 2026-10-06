import { describe, expect, it } from 'vitest';

import type { ReplayMessage } from '@/lib/validation/f1-schemas';

import { messagesUpTo } from './race-log';

function createMessage(time: number): ReplayMessage {
  return { time, category: 'Other', message: `AT ${time}`, flag: null, scope: null };
}

describe('messagesUpTo', () => {
  it('returns only messages already issued, newest first', () => {
    const log = messagesUpTo([createMessage(1), createMessage(5), createMessage(9)], 5);

    expect(log.map((message) => message.time)).toEqual([5, 1]);
  });

  it('is empty before the first message', () => {
    expect(messagesUpTo([createMessage(3)], 0)).toEqual([]);
  });
});
