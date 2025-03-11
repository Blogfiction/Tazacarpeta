import { RefObject, useEffect } from 'react';

export function useOnClickOutside(
  ref: RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      const targetElement = event.target as HTMLElement;
      const isGoogleMapsElement = 
        targetElement.classList?.contains('pac-container') || 
        targetElement.classList?.contains('pac-item') ||
        targetElement.closest('.pac-container') !== null ||
        targetElement.closest('.pac-item') !== null ||
        targetElement.closest('iframe[src*="google.com/maps"]') !== null;

      if (isGoogleMapsElement) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}