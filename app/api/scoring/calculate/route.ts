import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

interface Contact {
  id: string
  title: string
  industry: string
  company_size: string
  last_activity_days: number
  email_opens: number
  replied: boolean
}

function calculateScore(contact: Contact, weights: Record<string, number>): number {
  let score = 0
  // Title scoring
  const seniorTitles = ['ceo','owner','founder','president','director','vp','vice president','manager']
  if (seniorTitles.some(t => contact.title?.toLowerCase().includes(t))) score += weights.title || 30
  // Industry scoring  
  const targetIndustries = ['construction','flooring','concrete','epoxy','real estate','manufacturing']
  if (targetIndustries.some(i => contact.industry?.toLowerCase().includes(i))) score += weights.industry || 25
  // Company size
  if (['11-50','51-200','201-500'].includes(contact.company_size)) score += weights.company_size || 20
  // Engagement
  if (contact.email_opens > 2) score += Math.min(weights.engagement || 15, contact.email_opens * 3)
  if (contact.replied) score += 10
  // Recency
  if (contact.last_activity_days < 7) score += weights.recency || 10
  else if (contact.last_activity_days < 30) score += (weights.recency || 10) * 0.5
  return Math.min(100, Math.round(score))
}

export async function POST(req: NextRequest) {
  const { contacts, weights } = await req.json()
  const scored = contacts.map((c: Contact) => ({ ...c, score: calculateScore(c, weights || {}) }))
  scored.sort((a: any, b: any) => b.score - a.score)
  return NextResponse.json({ scored, calculated_at: new Date().toISOString() })
}
