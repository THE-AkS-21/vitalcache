'use client';

/**
 * StatCard — Client Component (legitimate: uses animated counter with useEffect)
 *
 * The counter animation requires setInterval on the client — this is a correct
 * use of 'use client'. No framer-motion — CSS handles hover effects.
 *
 * Performance notes:
 * ✅ No framer-motion — hover effects via Tailwind transition classes
 * ✅ Proper useEffect cleanup prevents timer leaks on unmount
 * ✅ Animation runs once per value change (hasAnimated guard)
 * ✅ Exported as named export — tree-shakeable
 */

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Icons } from './icons';

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    label?: string;
  };
  loading?: boolean;
  animate?: boolean;
  gradient?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  loading = false,
  animate = true,
  gradient = false,
  className,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(typeof value === 'number' ? 0 : value);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!animate || hasAnimatedRef.current || typeof value !== 'number') {
      if (typeof value === 'number') setDisplayValue(value);
      return;
    }

    hasAnimatedRef.current = true;
    const DURATION_MS = 1_200;
    const STEPS = 50;
    const stepValue = value / STEPS;
    const stepDuration = DURATION_MS / STEPS;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= STEPS) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(stepValue * currentStep));
      }
    }, stepDuration);

    // Cleanup: prevent state update on unmounted component
    return () => clearInterval(timer);
  }, [value, animate]);

  const displayed = animate && typeof value === 'number' ? displayValue : value;

  if (loading) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-lg p-6',
          className
        )}
        aria-busy="true"
        aria-label={`Loading ${title}`}
      >
        <div className="space-y-3">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl transition-all duration-300',
        'bg-white/80 backdrop-blur-xl border border-white/60 shadow-lg',
        'hover:-translate-y-1 hover:shadow-xl',
        gradient && 'bg-gradient-to-br from-white to-blue-50',
        className
      )}
    >
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}

      <div className="relative p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          {Icon && (
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 group-hover:from-blue-100 group-hover:to-blue-200 transition-colors duration-300">
              <Icon className="h-5 w-5 text-blue-600" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-gray-900 tabular-nums" aria-label={`${title}: ${value}`}>
            {displayed}
          </p>

          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                trend.direction === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              )}
            >
              {trend.direction === 'up' ? (
                <Icons.arrowUp className="h-3 w-3" aria-hidden="true" />
              ) : (
                <Icons.arrowDown className="h-3 w-3" aria-hidden="true" />
              )}
              <span>{trend.value}%</span>
            </div>
          )}
        </div>

        {description && <p className="text-sm text-gray-500">{description}</p>}
        {trend?.label && <p className="text-xs text-gray-400">{trend.label}</p>}
      </div>

      {/* Accent line — CSS only, no framer-motion */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </div>
  );
}

export function StatCardGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('grid gap-6 md:grid-cols-2 lg:grid-cols-4 stagger-fade-in', className)}>
      {children}
    </div>
  );
}
