'use client';

import Link from 'next/link';
import { useEffect, useState, type JSX } from 'react';

import { Button } from '@/components/ui/Button';

const CONSENT_STORAGE_KEY = 'fs-cookie-consent';

type ConsentChoice = 'accepted' | 'declined';

/**
 * Lightweight cookie/consent notice shown on first visit. It records the
 * visitor's choice in localStorage and links to the Privacy Policy. Required
 * personalised-ads consent for EEA/UK traffic is handled by Google's certified
 * GDPR message (configured in the AdSense dashboard); this banner is the
 * always-present, first-party notice that complements it.
 */
export function CookieConsent(): JSX.Element | null {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(CONSENT_STORAGE_KEY)) {
        setIsVisible(true);
      }
    } catch {
      // localStorage can be unavailable (private mode); stay silent.
    }
  }, []);

  function persistChoice(choice: ConsentChoice): void {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
    } catch {
      // Ignore storage failures — the notice simply reappears next visit.
    }
    setIsVisible(false);
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie notice"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6"
    >
      <div className="glass-panel mx-auto flex max-w-4xl flex-col gap-4 rounded-lg p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-muted">
          We use cookies to keep you signed in, understand how the site is used,
          and — with your consent — show ads that keep Formula Stats free. Read
          our{' '}
          <Link href="/privacy" className="text-primary underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => persistChoice('declined')}
          >
            Decline
          </Button>
          <Button size="sm" onClick={() => persistChoice('accepted')}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
