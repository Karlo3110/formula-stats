'use client';

import { useEffect, type RefObject } from 'react';

/** Closes a popover on Escape or on a pointer press outside `containerRef`. */
export function useDismiss(
  containerRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  onClose: () => void,
): void {
  useEffect(() => {
    if (!isOpen) return;

    function handlePointer(event: PointerEvent): void {
      const target = event.target;
      if (target instanceof Node && !containerRef.current?.contains(target)) {
        onClose();
      }
    }
    function handleKey(event: KeyboardEvent): void {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('pointerdown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [containerRef, isOpen, onClose]);
}
