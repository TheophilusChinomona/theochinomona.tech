import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import FluidBackground from './FluidBackground'
import { cn } from '@/lib/utils'

export interface HeroProps {
  variant: 'full' | 'split' | 'minimal'
  title: string
  subtitle: string
  ctaText?: string
  ctaLink?: string
  image?: ReactNode
  className?: string
}

// Custom mouse parallax hook using Framer Motion
function useMouseParallax(factor: number = 0.05) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Add spring physics for smooth animation
  const springConfig = { damping: 25, stiffness: 150 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  // Transform mouse position to offset
  const x = useTransform(springX, (val) => val * factor)
  const y = useTransform(springY, (val) => val * factor)

  return { mouseX, mouseY, x, y }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
}

export default function Hero({
  variant,
  title,
  subtitle,
  ctaText,
  ctaLink,
  image,
  className,
}: HeroProps) {
  // Mouse parallax for the full variant
  const bgParallax = useMouseParallax(0.02)
  const fgParallax = useMouseParallax(0.05)

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const mouseX = e.clientX - rect.left - centerX
    const mouseY = e.clientY - rect.top - centerY

    bgParallax.mouseX.set(mouseX)
    bgParallax.mouseY.set(mouseY)
    fgParallax.mouseX.set(mouseX)
    fgParallax.mouseY.set(mouseY)
  }

  if (variant === 'full') {
    return (
      <section
        data-testid="hero-full"
        className={cn('relative h-screen flex items-center justify-center overflow-hidden', className)}
        onMouseMove={handleMouseMove}
      >
        {/* Hero background image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/images/hero/hero-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 z-[1] bg-zinc-950/60" />

        <FluidBackground className="z-[2] opacity-40" />

        {/* Parallax container */}
        <div
          data-testid="parallax-wrapper"
          className="absolute inset-0 w-full h-full"
        >
          {/* Background layer - moves slower */}
          <motion.div
            data-testid="parallax-layer"
            className="absolute inset-0 z-0"
            style={{ x: bgParallax.x, y: bgParallax.y }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-indigo-600/20" />
          </motion.div>

          {/* Foreground layer - moves faster */}
          <motion.div
            data-testid="parallax-layer"
            className="absolute inset-0 z-10 flex items-center justify-center"
            style={{ x: fgParallax.x, y: fgParallax.y }}
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="relative z-10 text-center px-4 max-w-4xl mx-auto"
            >
              <motion.h1
                variants={itemVariants}
                className="text-5xl md:text-7xl font-bold mb-6 text-white"
              >
                {title}
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-xl md:text-2xl text-zinc-300 mb-8"
              >
                {subtitle}
              </motion.p>

              {ctaText && ctaLink && (
                <motion.div variants={itemVariants}>
                  <Button asChild size="lg" className="text-lg px-8 py-6">
                    <Link to={ctaLink}>{ctaText}</Link>
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>
    )
  }

  if (variant === 'split') {
    return (
      <section
        data-testid="hero-split"
        className={cn(
          'py-16 md:py-24',
          'grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center',
          'container-custom',
          className
        )}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-zinc-300">
            {subtitle}
          </p>
          {ctaText && ctaLink && (
            <div className="mt-6">
              <Button asChild>
                <Link to={ctaLink}>{ctaText}</Link>
              </Button>
            </div>
          )}
        </motion.div>

        {image && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center"
          >
            {image}
          </motion.div>
        )}
      </section>
    )
  }

  // Minimal variant
  return (
    <section
      data-testid="hero-minimal"
      className={cn(
        'py-12 md:py-16',
        'flex flex-col items-center justify-center text-center',
        'container-custom',
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
          {title}
        </h1>
        <p className="text-lg text-zinc-400">
          {subtitle}
        </p>
      </motion.div>
    </section>
  )
}

