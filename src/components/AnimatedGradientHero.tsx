import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { SiReact, SiTypescript, SiNodedotjs, SiTailwindcss, SiDocker, SiPostgresql } from 'react-icons/si'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
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
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
}

const techBadges = [
  { name: 'React', icon: SiReact, color: 'text-indigo-500' },
  { name: 'TypeScript', icon: SiTypescript, color: 'text-indigo-600' },
  { name: 'Node.js', icon: SiNodedotjs, color: 'text-purple-500' },
  { name: 'Tailwind', icon: SiTailwindcss, color: 'text-indigo-400' },
  { name: 'Docker', icon: SiDocker, color: 'text-purple-400' },
  { name: 'PostgreSQL', icon: SiPostgresql, color: 'text-indigo-500' },
]

const codeLines = [
  { text: '// Building digital experiences', type: 'comment' },
  { text: "import { creativity, code } from 'theo';", type: 'import' },
  { text: '', type: 'empty' },
  { text: 'const Portfolio = () => {', type: 'function' },
  { text: '  const skills = [', type: 'code' },
  { text: "    'Full-Stack Development',", type: 'string' },
  { text: "    'Cloud Architecture',", type: 'string' },
  { text: "    'UI/UX Design',", type: 'string' },
  { text: "    'API Integration'", type: 'string' },
  { text: '  ];', type: 'code' },
  { text: '', type: 'empty' },
  { text: '  return (', type: 'code' },
  { text: '    <Projects', type: 'jsx' },
  { text: '      passion={true}', type: 'prop' },
  { text: '      quality="exceptional"', type: 'prop' },
  { text: '      delivery="on-time"', type: 'prop' },
  { text: '    />', type: 'jsx' },
  { text: '  );', type: 'code' },
  { text: '};', type: 'function' },
  { text: '', type: 'empty' },
  { text: 'export default Portfolio;', type: 'export' },
]

function TypewriterCode() {
  const [displayedLines, setDisplayedLines] = useState<number>(0)
  const [currentLineChars, setCurrentLineChars] = useState<number>(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (displayedLines >= codeLines.length) {
      setIsComplete(true)
      return
    }

    const currentLine = codeLines[displayedLines]
    if (!currentLine) return
    
    if (currentLineChars < currentLine.text.length) {
      const charTimer = setTimeout(() => {
        setCurrentLineChars(prev => prev + 1)
      }, 12) // Faster typing
      return () => clearTimeout(charTimer)
    } else {
      const lineTimer = setTimeout(() => {
        setDisplayedLines(prev => prev + 1)
        setCurrentLineChars(0)
      }, 30) // Faster line transition
      return () => clearTimeout(lineTimer)
    }
  }, [displayedLines, currentLineChars])

  const getLineColor = (type: string) => {
    switch (type) {
      case 'comment': return 'text-zinc-500'
      case 'import': return 'text-purple-400'
      case 'function': return 'text-indigo-400'
      case 'string': return 'text-amber-300'
      case 'jsx': return 'text-indigo-300'
      case 'prop': return 'text-purple-300'
      case 'export': return 'text-purple-400'
      default: return 'text-zinc-300'
    }
  }

  return (
    <pre className="text-sm leading-relaxed overflow-x-auto">
      {codeLines.map((line, index) => {
        if (index > displayedLines) return null
        
        const chars = index === displayedLines 
          ? line.text.slice(0, currentLineChars)
          : line.text
        
        return (
          <div key={index} className={`${getLineColor(line.type)} min-h-[1.5em]`}>
            {chars}
            {index === displayedLines && !isComplete && (
              <span className="inline-block w-2 h-4 bg-indigo-400 animate-pulse ml-0.5" />
            )}
          </div>
        )
      })}
    </pre>
  )
}

export default function AnimatedGradientHero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Animated gradient blobs - coordinated indigo/purple theme */}
      <motion.div
        className="absolute top-0 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full blur-3xl opacity-60"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute top-20 right-0 w-[400px] h-[400px] bg-gradient-to-br from-purple-200 to-pink-200 rounded-full blur-3xl opacity-50"
        animate={{
          x: [0, -40, 0],
          y: [0, 30, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-20 left-1/4 w-[350px] h-[350px] bg-gradient-to-br from-indigo-100 to-violet-200 rounded-full blur-3xl opacity-40"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute -bottom-20 right-1/3 w-[300px] h-[300px] bg-gradient-to-br from-violet-200 to-indigo-300 rounded-full blur-3xl opacity-50"
        animate={{
          x: [0, -30, 0],
          y: [0, 40, 0],
          scale: [1, 0.95, 1],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-xl"
          >
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-zinc-900 leading-tight mb-6"
            >
              Building digital
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
                experiences
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-zinc-600 mb-8 leading-relaxed"
            >
              Full-stack developer specializing in creating beautiful, 
              functional web applications. Turning ideas into reality 
              through clean code and thoughtful design.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-3 mb-8">
              <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">
                <Link to="/portfolio">View Projects</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                <Link to="/contact">Get In Touch</Link>
              </Button>
            </motion.div>

            {/* Tech badges */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
              {techBadges.map((tech) => (
                <span
                  key={tech.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-indigo-100 bg-white/80 text-sm text-zinc-700 hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
                >
                  <tech.icon className={`w-4 h-4 ${tech.color}`} />
                  {tech.name}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right side - Code preview with typing animation */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Browser-like window */}
              <div className="bg-zinc-900 rounded-xl shadow-2xl overflow-hidden border border-indigo-500/20">
                {/* Window header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-zinc-800/80 border-b border-zinc-700/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="ml-4 text-sm text-zinc-400 font-mono">portfolio.tsx</span>
                </div>
                {/* Code content with typing animation */}
                <div className="p-6 font-mono min-h-[400px]">
                  <TypewriterCode />
                </div>
              </div>
              
              {/* Floating decoration - coordinated with theme */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg opacity-20 blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg opacity-20 blur-xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
