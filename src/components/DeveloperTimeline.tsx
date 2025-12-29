import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface TimelineItem {
  date: string
  title: string
  description: string
  icon?: React.ReactNode
}

interface DeveloperTimelineProps {
  items: TimelineItem[]
  className?: string
}

export default function DeveloperTimeline({ items, className }: DeveloperTimelineProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  }

  return (
    <div
      ref={ref}
      data-testid="developer-timeline"
      className={cn('relative', className)}
    >
      {/* Vertical line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-zinc-800 hidden md:block" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="space-y-8"
      >
        {items.map((item, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="relative flex gap-6"
          >
            {/* Timeline dot */}
            <div className="relative z-10 flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-zinc-800 border-4 border-zinc-950 flex items-center justify-center">
                {item.icon || (
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 pb-8">
              <div className="text-sm text-indigo-400 font-medium mb-1">
                {item.date}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {item.title}
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

