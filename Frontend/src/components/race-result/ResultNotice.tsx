import type { JSX } from 'react';

import { ButtonLink } from '@/components/ui/ButtonLink';

interface ResultNoticeProps {
  title: string;
  body: string;
  backHref: string;
}

/** Full-width message for archive pages that cannot show a result. */
export function ResultNotice({ title, body, backHref }: ResultNoticeProps): JSX.Element {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-3 text-center">
      <p className="font-display text-5xl uppercase leading-none text-heading">{title}</p>
      <p className="text-muted">{body}</p>
      <ButtonLink href={backHref} variant="secondary" className="mt-4">
        Back to the season
      </ButtonLink>
    </div>
  );
}
