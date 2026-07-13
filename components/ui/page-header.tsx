import { type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  ctaLabel?: string
  onCta?: () => void
  children?: React.ReactNode
}

export function PageHeader({ title, description, icon: Icon, ctaLabel, onCta, children }: PageHeaderProps) {
  return (
    <div className="border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-[18px] font-semibold text-[var(--color-foreground)] flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-[var(--color-primary)]" />}
          {title}
        </h1>
        {description && <p className="text-[13px] text-[var(--color-muted-foreground)] mt-0.5">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {children}
        {ctaLabel && (
          <Button onClick={onCta} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white h-8 px-3 text-[13px] gap-1.5">
            <Plus className="w-3.5 h-3.5" /> {ctaLabel}
          </Button>
        )}
      </div>
    </div>
  )
}