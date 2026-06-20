'use client';

import { useCallback, useEffect, useState, type RefObject } from 'react';

interface FullscreenControls {
  isFullscreen: boolean;
  toggle: () => void;
}

/** Fullscreen the given element (defaults to the document root). */
export function useFullscreen(
  targetRef?: RefObject<HTMLElement | null>,
): FullscreenControls {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = (): void =>
      setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggle = useCallback((): void => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    const target = targetRef?.current ?? document.documentElement;
    void target.requestFullscreen().catch(() => undefined);
  }, [targetRef]);

  return { isFullscreen, toggle };
}
