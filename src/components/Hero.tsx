import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MouseParallaxContainer, MouseParallaxChild } from 'react-parallax-mouse'
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
      ease: 'easeOut',
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
  if (variant === 'full') {
    return (
      <section
        data-testid="hero-full"
        className={cn('relative h-screen flex items-center justify-center overflow-hidden', className)}
      >
        <FluidBackground />
        
        <MouseParallaxContainer
          className="absolute inset-0 w-full h-full"
          globalFactorX={0.1}
          globalFactorY={0.1}
        >
          {/* Background layer - moves slower */}
          <MouseParallaxChild
            factorX={0.02}
            factorY={0.02}
            className="absolute inset-0 z-0"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-indigo-600/20" />
          </MouseParallaxChild>
          
          {/* Foreground layer - moves faster */}
          <MouseParallaxChild
            factorX={0.05}
            factorY={0.05}
            className="absolute inset-0 z-10 flex items-center justify-center"
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
          </MouseParallaxChild>
        </MouseParallaxContainer>
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

