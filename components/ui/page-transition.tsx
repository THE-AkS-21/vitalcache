'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export interface PageTransitionProps {
    children: React.ReactNode
    className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
    const pathname = usePathname()
    const [displayChildren, setDisplayChildren] = useState(children)
    const [transitioning, setTransitioning] = useState(false)

    useEffect(() => {
        // Start exit animation
        setTransitioning(true)

        const timer = setTimeout(() => {
            // Update content
            setDisplayChildren(children)
            setTransitioning(false)
        }, 150)

        return () => clearTimeout(timer)
    }, [pathname])

    return (
        <div
            className={cn(
                'transition-all duration-300',
                transitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0',
                className
            )}
        >
            {displayChildren}
        </div>
    )
}

// Alternative: Immediate transition without state management
export function SimplePageTransition({
    children,
    className
}: PageTransitionProps) {
    return (
        <div className={cn('animate-fade-in-up', className)}>
            {children}
        </div>
    )
}
