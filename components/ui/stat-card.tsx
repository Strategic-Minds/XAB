import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  change?: string
  up?: boolean
  valueColor?: string
}

export function StatCard({ label, value, change, up, valueColor }: StatCardProps) {
  return (
    <Card className="bg-[var(--color-card)] border-[var(--color-border)]">
      <CardContent className="p-4">
        <div className="text-[11px] text-[var(--color-muted-foreground)] mb-1 font-medium uppercase tracking-wide">{label}</div>
        <div className={cn('text-[26px] font-bold leading-none', valueColor || 'text-[var(--color-foreground)]')}>{value}</div>
        {change && (
          <div className={cn('text-[11px] font-medium flex items-center gap-1 mt-1.5', up ? 'text-green-400' : 'text-red-400')}>
            {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </div>
        )}
      </CardContent>
    </Card>
  )
}