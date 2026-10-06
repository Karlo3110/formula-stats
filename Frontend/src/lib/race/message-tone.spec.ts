import { describe, expect, it } from 'vitest';

import type { ReplayMessage } from '@/lib/validation/f1-schemas';

import { MessageTone, TONE_COLORS, messageTone, timelineMarkers } from './message-tone';

function createMessage(overrides: Partial<ReplayMessage> = {}): ReplayMessage {
  return { time: 10, category: 'Other', message: 'NOTE', flag: null, scope: null, ...overrides };
}

describe('messageTone', () => {
  it('classifies a double yellow flag as yellow', () => {
    expect(messageTone(createMessage({ category: 'Flag', flag: 'DOUBLE YELLOW' }))).toBe(
      MessageTone.Yellow,
    );
  });

  it('treats CLEAR as the end of a hazard (green)', () => {
    expect(messageTone(createMessage({ category: 'Flag', flag: 'CLEAR' }))).toBe(MessageTone.Green);
  });

  it('classifies safety car messages by category', () => {
    expect(messageTone(createMessage({ category: 'SafetyCar' }))).toBe(MessageTone.SafetyCar);
  });

  it('falls back to info for uncategorised messages', () => {
    expect(messageTone(createMessage())).toBe(MessageTone.Info);
  });
});

describe('timelineMarkers', () => {
  it('marks only hazards, positioned as a percentage of the window', () => {
    const markers = timelineMarkers(
      [
        createMessage({ time: 24, category: 'Drs', message: 'DRS DISABLED' }),
        createMessage({ time: 48, category: 'Flag', flag: 'RED', message: 'RED FLAG' }),
      ],
      96,
    );

    expect(markers).toEqual([
      { key: '48:RED FLAG', percent: 50, color: TONE_COLORS.red, label: 'RED FLAG' },
    ]);
  });

  it('returns no markers for an empty replay window', () => {
    expect(timelineMarkers([createMessage({ category: 'SafetyCar' })], 0)).toEqual([]);
  });
});
