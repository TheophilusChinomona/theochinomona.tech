/**
 * MetricCard component
 * Reusable card for displaying dashboard metrics
 */

import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  color?: 'default' | 'indigo' | 'emerald' | 'amber' | 'rose'
}

const colorVariants = {
  default: {
    icon: 'text-zinc-400 bg-zinc-800',
    text: 'text-zinc-100',
  },
  indigo: {
    icon: 'text-indigo-400 bg-indigo-500/10',
    text: 'text-indigo-400',
  },
  emerald: {
    icon: 'text-emerald-400 bg-emerald-500/10',
    text: 'text-emerald-400',
  },
  amber: {
    icon: 'text-amber-400 bg-amber-500/10',
    text: 'text-amber-400',
  },
  rose: {
    icon: 'text-rose-400 bg-rose-500/10',
    text: 'text-rose-400',
  },
}

export default function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  color = 'default',
}: MetricCardProps) {
  const colors = colorVariants[color]

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 transition-all hover:border-zinc-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-400 mb-1">{title}</p>
          <p className={cn('text-3xl font-bold', colors.text)}>{value}</p>
          {description && (
            <p className="text-xs text-zinc-500 mt-2">{description}</p>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', colors.icon)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

