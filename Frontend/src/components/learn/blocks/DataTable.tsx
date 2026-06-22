import type { JSX } from 'react';

import { renderInline } from '@/components/learn/inline';

interface DataTableProps {
  caption?: string;
  columns: ReadonlyArray<string>;
  rows: ReadonlyArray<ReadonlyArray<string>>;
}

export function DataTable({ caption, columns, rows }: DataTableProps): JSX.Element {
  return (
    <figure className="overflow-hidden rounded-2xl border border-white/10 bg-surface/40">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03]">
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-4 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted sm:px-5"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-white/[0.06] last:border-0 transition-colors hover:bg-white/[0.02]"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={
                      cellIndex === 0
                        ? 'px-4 py-3 font-medium text-foreground sm:px-5'
                        : 'px-4 py-3 text-foreground/70 sm:px-5'
                    }
                  >
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption ? (
        <figcaption className="border-t border-white/10 px-4 py-2.5 text-xs text-muted sm:px-5">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
