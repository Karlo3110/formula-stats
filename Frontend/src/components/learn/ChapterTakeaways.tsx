import type { JSX } from 'react';

interface ChapterTakeawaysProps {
  items: ReadonlyArray<string>;
}

export function ChapterTakeaways({ items }: ChapterTakeawaysProps): JSX.Element {
  return (
    <section className="rounded-2xl border border-white/10 bg-surface/40 px-5 py-6 sm:px-7">
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-primary">
        Key takeaways
      </p>
      <ul className="mt-4 flex flex-col gap-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-base leading-relaxed text-foreground/80">
            <span
              aria-hidden
              className="mt-0.5 font-display text-base leading-none text-primary"
            >
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
