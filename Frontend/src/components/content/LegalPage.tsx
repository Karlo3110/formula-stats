import type { JSX, ReactNode } from 'react';

interface LegalPageProps {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
}

export function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: LegalPageProps): JSX.Element {
  return (
    <article className="mx-auto max-w-3xl px-2 pb-10 sm:px-6">
      <header className="pb-10 pt-6">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.45em] text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-4 font-display text-6xl uppercase leading-[0.9] tracking-tight text-heading sm:text-7xl">
          {title}
        </h1>
        <p className="mt-4 text-sm text-muted">Last updated {updated}</p>
      </header>

      <div className="space-y-8 text-foreground/75 [&_a]:text-primary [&_a]:underline [&_h2]:font-display [&_h2]:text-2xl [&_h2]:uppercase [&_h2]:tracking-wide [&_h2]:text-heading [&_li]:ml-5 [&_li]:list-disc [&_p]:leading-relaxed [&_section>*+*]:mt-3 [&_ul]:space-y-2">
        {children}
      </div>
    </article>
  );
}
