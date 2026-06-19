import type { JSX, ReactNode } from 'react';

import { Card } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';

interface AuthPanelProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthPanel({
  title,
  subtitle,
  children,
  footer,
}: AuthPanelProps): JSX.Element {
  return (
    <Card className="w-full max-w-md">
      <div className="mb-6 flex flex-col gap-1">
        <Heading level={2} display>
          {title}
        </Heading>
        <Text variant="muted">{subtitle}</Text>
      </div>
      {children}
      {footer ? <div className="mt-6 text-center">{footer}</div> : null}
    </Card>
  );
}
