import type { JSX } from 'react';

import { Button } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Spinner } from '@/components/ui/Spinner';

export interface StageNoticeAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface StageNoticeProps {
  title: string;
  body: string;
  isLoading?: boolean;
  actions?: ReadonlyArray<StageNoticeAction>;
}

function NoticeAction({ action, isPrimary }: { action: StageNoticeAction; isPrimary: boolean }): JSX.Element {
  const variant = isPrimary ? 'primary' : 'secondary';
  if (action.href) {
    return (
      <ButtonLink href={action.href} size="sm" variant={variant}>
        {action.label}
      </ButtonLink>
    );
  }
  return (
    <Button size="sm" variant={variant} onClick={action.onClick}>
      {action.label}
    </Button>
  );
}

/** Full-stage message for loading, unavailable and error states. */
export function StageNotice({ title, body, isLoading = false, actions = [] }: StageNoticeProps): JSX.Element {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/85 p-6 backdrop-blur-sm">
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        {isLoading ? <Spinner size="lg" className="text-primary" /> : null}
        <p className="font-display text-3xl uppercase leading-none text-heading">{title}</p>
        <p className="text-sm text-muted">{body}</p>
        {actions.length > 0 ? (
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {actions.map((action, index) => (
              <NoticeAction key={action.label} action={action} isPrimary={index === 0} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
