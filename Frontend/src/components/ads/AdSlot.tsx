'use client';

import { useEffect, type JSX } from 'react';

import { clientConfig } from '@/lib/config/client-config';
import { cn } from '@/lib/utils/cn';

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

interface AdSlotProps {
  slot: string;
  className?: string;
}

/**
 * A single responsive AdSense unit. Renders nothing unless a publisher id is
 * configured, keeping content pages clean during development and pre-approval.
 */
export function AdSlot({ slot, className }: AdSlotProps): JSX.Element | null {
  const client = clientConfig.adsenseClient;

  useEffect(() => {
    if (!client) {
      return;
    }
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // AdSense pushes can throw on hot-reload / repeated mounts; safe to ignore.
    }
  }, [client]);

  if (!client) {
    return null;
  }

  return (
    <aside
      className={cn('mx-auto w-full max-w-[100rem] py-6 text-center', className)}
    >
      <p className="mb-2 text-[0.6rem] uppercase tracking-[0.3em] text-muted">
        Advertisement
      </p>
      <ins
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
