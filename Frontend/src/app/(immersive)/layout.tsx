import type { JSX, ReactNode } from 'react';

/** Chrome-less layout for full-viewport immersive views (no navbar). */
export default function ImmersiveLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return <div className="h-screen w-screen overflow-hidden">{children}</div>;
}
