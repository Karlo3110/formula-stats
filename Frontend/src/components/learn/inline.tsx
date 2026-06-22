import { Fragment, type ReactNode } from 'react';

const BOLD_PATTERN = /(\*\*[^*]+\*\*)/g;

/**
 * Renders the tiny inline syntax used in learning content: `**bold**` becomes a
 * <strong>. Everything else is plain text. No HTML is ever interpreted, so the
 * content stays safe regardless of source.
 */
export function renderInline(text: string): ReactNode {
  const parts = text.split(BOLD_PATTERN);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-heading">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}
