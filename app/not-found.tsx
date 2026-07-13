import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full bg-[var(--color-background)] gap-6">
      <div className="text-[80px] font-black text-[var(--color-primary)] leading-none opacity-20">404</div>
      <div className="text-center -mt-4">
        <h2 className="text-[18px] font-semibold text-[var(--color-foreground)] mb-2">Page not found</h2>
        <p className="text-[13px] text-[var(--color-muted-foreground)]">This page doesn't exist or has been moved.</p>
      </div>
      <div className="flex gap-2">
        <Button asChild variant="outline" className="h-8 px-4 text-[13px] border-[var(--color-border)] gap-2">
          <Link href="javascript:history.back()"><ArrowLeft className="w-3.5 h-3.5" /> Go back</Link>
        </Button>
        <Button asChild className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white h-8 px-4 text-[13px] gap-2">
          <Link href="/dashboard"><Home className="w-3.5 h-3.5" /> Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}