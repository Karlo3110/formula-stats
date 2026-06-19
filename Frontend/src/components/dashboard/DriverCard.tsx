import type { JSX } from 'react';

import { Avatar } from '@/components/ui/Avatar';
import type { DriverInfo } from '@/lib/mock/telemetry';

interface DriverCardProps {
  driver: DriverInfo;
}

export function DriverCard({ driver }: DriverCardProps): JSX.Element {
  const fullName = `${driver.firstInitial}. ${driver.lastName}`;

  return (
    <div className="flex items-center justify-end gap-4">
      <div className="text-right">
        <h1 className="font-display text-5xl uppercase leading-none tracking-wide text-heading">
          {driver.firstInitial}. {driver.lastName}
        </h1>
        <p className="mt-1 text-xs uppercase tracking-widest text-muted">
          {driver.team}
        </p>
      </div>
      <span className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/15 font-display text-2xl text-primary ring-1 ring-primary/30">
        {driver.number}
      </span>
      <Avatar name={fullName} className="h-12 w-12" />
    </div>
  );
}
