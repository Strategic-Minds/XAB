'use client'
import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full bg-[var(--color-background)] gap-4">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-red-400" />
      </div>
      <div className="text-center">
        <h2 className="text-[16px] font-semibold text-[var(--color-foreground)] mb-1">Something went wrong</h2>
        <p className="text-[13px] text-[var(--color-muted-foreground)] max-w-sm">{error.message || 'An unexpected error occurred'}</p>
      </div>
      <Button onClick={reset} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white h-8 px-4 text-[13px] gap-2">
        <RefreshCw className="w-3.5 h-3.5" /> Try again
      </Button>
    </div>
  )
}