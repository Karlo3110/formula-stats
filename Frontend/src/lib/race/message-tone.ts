import type { ReplayMessage } from '@/lib/validation/f1-schemas';

export const MessageTone = {
  Red: 'red',
  Yellow: 'yellow',
  Green: 'green',
  SafetyCar: 'safety-car',
  Drs: 'drs',
  Info: 'info',
} as const;

export type MessageTone = (typeof MessageTone)[keyof typeof MessageTone];

/** Display colour per tone; flag colours follow the marshals' flags. */
export const TONE_COLORS: Record<MessageTone, string> = {
  red: '#e8002d',
  yellow: '#f5c518',
  green: '#3ddc84',
  'safety-car': '#ff9f1a',
  drs: '#4fc3f7',
  info: '#8a8f98',
};

function flagTone(flag: string): MessageTone {
  const upper = flag.toUpperCase();
  if (upper === 'RED') return MessageTone.Red;
  if (upper.includes('YELLOW')) return MessageTone.Yellow;
  if (upper === 'GREEN' || upper === 'CLEAR') return MessageTone.Green;
  return MessageTone.Info;
}

/** Classifies a race-control message for colour coding. */
export function messageTone(message: ReplayMessage): MessageTone {
  if (message.category === 'Flag' && message.flag) return flagTone(message.flag);
  if (message.category === 'SafetyCar') return MessageTone.SafetyCar;
  if (message.category === 'Drs') return MessageTone.Drs;
  return MessageTone.Info;
}

/** Whether a message is significant enough to mark on the replay timeline. */
export function isTimelineEvent(message: ReplayMessage): boolean {
  const tone = messageTone(message);
  return (
    tone === MessageTone.Red ||
    tone === MessageTone.Yellow ||
    tone === MessageTone.SafetyCar
  );
}

export interface TimelineMarker {
  key: string;
  /** Position along the timeline, 0..100. */
  percent: number;
  color: string;
  label: string;
}

/** Significant race-control events positioned on a 0..100 timeline. */
export function timelineMarkers(
  messages: ReadonlyArray<ReplayMessage>,
  duration: number,
): TimelineMarker[] {
  if (duration <= 0) return [];
  return messages.filter(isTimelineEvent).map((message) => ({
    key: `${message.time}:${message.message}`,
    percent: Math.min(100, Math.max(0, (message.time / duration) * 100)),
    color: TONE_COLORS[messageTone(message)],
    label: message.message,
  }));
}
