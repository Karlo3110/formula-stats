'use client';

import { useEffect, useState } from 'react';

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function compute(target: Date | null): Countdown {
  if (!target) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
  const diff = target.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
  return {
    days: Math.floor(diff / DAY),
    hours: Math.floor((diff % DAY) / HOUR),
    minutes: Math.floor((diff % HOUR) / MINUTE),
    seconds: Math.floor((diff % MINUTE) / SECOND),
    isPast: false,
  };
}

/** Live countdown to a target date, ticking every second. */
export function useCountdown(target: Date | null): Countdown {
  const [countdown, setCountdown] = useState<Countdown>(() => compute(target));

  useEffect(() => {
    setCountdown(compute(target));
    const id = setInterval(() => setCountdown(compute(target)), SECOND);
    return () => clearInterval(id);
  }, [target]);

  return countdown;
}
