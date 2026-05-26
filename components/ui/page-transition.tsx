'use client';

/**
 * PageTransition — CSS-based route transition
 *
 * Previously used framer-motion for a simple opacity/translate animation.
 * framer-motion is ~100KB gzipped — far too expensive for a fade transition.
 *
 * Replacement: Pure CSS via Tailwind transition classes + a key-based remount trick.
 * usePathname() is the only hook — this must stay 'use client', but the bundle
 * cost is now just this tiny component, not the entire framer-motion library.
 *
 * SimplePageTransition is a zero-JS alternative for pages that don't need
 * the exit animation — just an enter fade via CSS animation-fill-mode.
 */

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setIsExiting(true);
  }, [pathname]);

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (isExiting) {
      setDisplayChildren(children);
      setIsExiting(false);
    }
  };

  return (
    <div
      onTransitionEnd={handleTransitionEnd}
      className={cn(
        'transition-all duration-200 will-change-[opacity,transform]',
        isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0',
        className
      )}
    >
      {displayChildren}
    </div>
  );
}

/**
 * SimplePageTransition — zero JS alternative
 * Uses CSS @keyframes (defined in globals.css) for enter animation only.
 * No state, no hooks — safe to use inside Server Components if wrapping
 * server-rendered children.
 */
export function SimplePageTransition({ children, className }: PageTransitionProps) {
  return (
    <div className={cn('animate-fade-in-up', className)}>
      {children}
    </div>
  );
}
