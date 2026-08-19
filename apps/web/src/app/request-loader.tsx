'use client';

import { subscribeToRequests } from '@/lib/api-client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export function RequestLoader() {
  const [activeRequests, setActiveRequests] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    return subscribeToRequests(setActiveRequests);
  }, []);

  useEffect(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    if (activeRequests > 0) {
      setIsVisible(true);
      return;
    }

    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      hideTimeoutRef.current = null;
    }, 650);

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };
  }, [activeRequests]);

  return (
    <div
      aria-hidden={!isVisible}
      className={isVisible ? 'request-loader visible' : 'request-loader'}
    >
      <span />
    </div>
  );
}
