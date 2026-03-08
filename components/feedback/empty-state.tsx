import { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  title?: string
  subtitle?: string
  icon?: LucideIcon | React.ElementType
}

export default function EmptyState({ title = 'Nothing here', subtitle = '', icon: Icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center animate-fade-in">
      {Icon && (
        <div className="bg-slate-50 p-4 rounded-full mb-4">
          <Icon className="h-8 w-8 text-slate-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">{subtitle}</p>}
    </div>
  )
}
