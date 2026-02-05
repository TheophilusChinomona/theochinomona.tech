import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  ...props
}: SkeletonProps) {
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  return (
    <div
      className={cn(
        'animate-pulse bg-zinc-700/50',
        variantStyles[variant],
        className
      )}
      style={{
        width: width,
        height: height || (variant === 'text' ? '1em' : undefined),
      }}
      {...props}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="space-y-2 flex-1">
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={12} />
        </div>
      </div>
      <Skeleton width="100%" height={80} variant="rectangular" />
      <div className="flex gap-2">
        <Skeleton width={60} height={24} />
        <Skeleton width={60} height={24} />
        <Skeleton width={60} height={24} />
      </div>
    </div>
  )
}

export function SkeletonProjectCard() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <Skeleton width="100%" height={192} variant="rectangular" />
      <div className="p-6 space-y-3">
        <Skeleton width="70%" height={24} />
        <Skeleton width="90%" height={16} />
        <Skeleton width="50%" height={12} />
        <div className="flex gap-2 pt-2">
          <Skeleton width={60} height={24} />
          <Skeleton width={60} height={24} />
          <Skeleton width={60} height={24} />
        </div>
      </div>
    </div>
  )
}

export function SkeletonButton() {
  return (
    <Skeleton
      width={120}
      height={40}
      variant="rectangular"
      className="rounded-lg"
    />
  )
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
