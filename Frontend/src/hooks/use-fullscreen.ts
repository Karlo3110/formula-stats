'use client';

import { useCallback, useEffect, useState } from 'react';

interface FullscreenControls {
  isFullscreen: boolean;
  toggle: () => void;
}

export function useFullscreen(): FullscreenControls {
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
    } else {
      void document.documentElement.requestFullscreen().catch(() => undefined);
    }
  }, []);

  return { isFullscreen, toggle };
}
