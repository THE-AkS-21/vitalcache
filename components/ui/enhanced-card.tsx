import React from 'react'
import { cn } from '@/lib/utils'

export interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'elevated' | 'flat' | 'outlined' | 'gradient'
    hover?: boolean
    shine?: boolean
    icon?: React.ReactNode
    iconBg?: string
    loading?: boolean
}

export function EnhancedCard({
    variant = 'elevated',
    hover = true,
    shine = false,
    icon,
    iconBg = 'bg-blue-50',
    loading = false,
    className,
    children,
    ...props
}: EnhancedCardProps) {
    const baseStyles = 'relative rounded-2xl transition-all duration-300 overflow-hidden'

    const variantStyles = {
        elevated: 'bg-white/80 backdrop-blur-xl shadow-lg border border-white/60',
        flat: 'bg-white border border-gray-200',
        outlined: 'bg-transparent border-2 border-gray-300',
        gradient: 'bg-gradient-to-br from-blue-50 to-purple-50 border border-white/40 shadow-lg'
    }

    const hoverStyles = hover ? 'hover-lift hover-glow cursor-pointer' : ''

    return (
        <div
            className={cn(
                baseStyles,
                variantStyles[variant],
                hoverStyles,
                loading && 'pointer-events-none',
                className
            )}
            {...props}
        >
            {/* Shine effect overlay */}
            {shine && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            )}

            {/* Icon slot */}
            {icon && (
                <div className={cn('inline-flex p-3 rounded-xl mb-4', iconBg)}>
                    {icon}
                </div>
            )}

            {/* Loading skeleton overlay */}
            {loading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
                </div>
            )}

            {children}
        </div>
    )
}

// Card sections for composition
export function EnhancedCardHeader({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('p-6 pb-4', className)} {...props} />
}

export function EnhancedCardContent({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('p-6 pt-0', className)} {...props} />
}

export function EnhancedCardFooter({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('p-6 pt-0 flex items-center gap-2', className)}
            {...props}
        />
    )
}
