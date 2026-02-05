import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, Calendar, Code, Layout, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Project data with detailed information
const projectsData: Record<string, {
  id: string
  title: string
  tagline: string
  description: string
  longDescription: string
  thumbnail: string
  logo?: string
  url: string
  github?: string
  completionDate: string
  category: string
  tech: string[]
  features: string[]
  stats: { label: string; value: string }[]
  bentoLayout: { type: string; content: string; span?: string }[]
}> = {
  'planzy': {
    id: 'planzy',
    title: 'Planzy Studio',
    tagline: 'Creative Studio Portfolio',
    description: 'A workshop environment for shaping intent and locking decisions before the first line of code.',
    longDescription: 'Planzy Studio is a creative agency portfolio designed to showcase the studio\'s capabilities. It features a clean, modern aesthetic with smooth animations and an intuitive user experience. The site was built to reflect the studio\'s philosophy of thinking before building.',
    thumbnail: '/images/projects/planzy.jpg',
    url: 'https://planzy.theochinomona.tech',
    completionDate: '2026-01',
    category: 'Web Design',
    tech: ['React', 'Tailwind CSS', 'Framer Motion', 'Vite', 'TypeScript'],
    features: [
      'Animated hero section',
      'Smooth page transitions',
      'Responsive design system',
      'Project showcase gallery',
      'Service listings with icons',
      'Contact form integration'
    ],
    stats: [
      { label: 'Pages', value: '5+' },
      { label: 'Sections', value: '8' },
      { label: 'Animations', value: '15+' },
      { label: 'Components', value: '20+' }
    ],
    bentoLayout: [
      { type: 'hero', content: 'hero', span: 'col-span-2 row-span-2' },
      { type: 'stat', content: 'Pages: 5+', span: '' },
      { type: 'stat', content: 'Components: 20+', span: '' },
      { type: 'feature', content: 'Animated transitions', span: 'col-span-2' },
      { type: 'tech', content: 'React + Framer Motion', span: '' },
      { type: 'tech', content: 'TypeScript', span: '' }
    ]
  },
  'ibstrategies': {
    id: 'ibstrategies',
    title: 'IBStrategies',
    tagline: 'Business Consulting & Training',
    description: 'Delivery excellence for regulated, complex industries with ISO certification and SHREQ training.',
    longDescription: 'IBStrategies is a comprehensive business consulting website for a South African consulting firm. The site showcases their expertise in ISO certification, SHREQ consulting, and integrated business strategies. It was built with a professional, corporate aesthetic that reflects their industry authority.',
    thumbnail: '/images/projects/ibstrategies.jpg',
    url: 'https://ibstrategies.co.za',
    completionDate: '2026-01',
    category: 'Enterprise Web',
    tech: ['React', 'TypeScript', 'CMS', 'Tailwind CSS', 'Responsive Design'],
    features: [
      'ISO certification services page',
      'SHREQ training programs',
      'Partner logos section',
      'Service breakdown pages',
      'Contact inquiry forms',
      'Document download area'
    ],
    stats: [
      { label: 'Services', value: '10+' },
      { label: 'Pages', value: '8' },
      { label: 'Partners', value: '5' },
      { label: 'Training Programs', value: '4' }
    ],
    bentoLayout: [
      { type: 'hero', content: 'hero', span: 'col-span-2 row-span-2' },
      { type: 'stat', content: 'Services: 10+', span: '' },
      { type: 'stat', content: 'Partners: 5', span: '' },
      { type: 'feature', content: 'ISO Certification Experts', span: 'col-span-2' },
      { type: 'tech', content: 'React + TypeScript', span: '' },
      { type: 'tech', content: 'CMS Powered', span: '' }
    ]
  },
  'acbf': {
    id: 'acbf',
    title: 'ACBF RSA',
    tagline: 'African Cyber Battlefield Forum',
    description: 'Building a better future together through cybersecurity education and community empowerment.',
    longDescription: 'ACBF RSA is the official website for the African Cyber Battlefield Forum, a cybersecurity event and community platform. The site promotes cybersecurity awareness, provides educational resources, and facilitates community building among security professionals and enthusiasts in Africa.',
    thumbnail: '/images/projects/acbf.jpg',
    url: 'https://acbf.org.za',
    completionDate: '2026-01',
    category: 'Community Platform',
    tech: ['React', 'Node.js', 'Events', 'Community', 'Tailwind CSS'],
    features: [
      'Event registration system',
      'Community member profiles',
      'Resource library',
      'Newsletter subscription',
      'Social media integration',
      'Blog/announcements section'
    ],
    stats: [
      { label: 'Events', value: '3+' },
      { label: 'Community Members', value: '500+' },
      { label: 'Resources', value: '25+' },
      { label: 'Partners', value: '8' }
    ],
    bentoLayout: [
      { type: 'hero', content: 'hero', span: 'col-span-2 row-span-2' },
      { type: 'stat', content: 'Events: 3+', span: '' },
      { type: 'stat', content: 'Community: 500+', span: '' },
      { type: 'feature', content: 'Cyber Security Focus', span: 'col-span-2' },
      { type: 'tech', content: 'React + Node.js', span: '' },
      { type: 'tech', content: 'Community Driven', span: '' }
    ]
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function PortfolioDetailPage() {
  const { projectId } = useParams()

  const project = projectId ? projectsData[projectId] : null

  if (!project) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Project Not Found</h1>
          <p className="text-zinc-400 mb-6">The project you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/portfolio">Back to Portfolio</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-zinc-950"
    >
      {/* Hero Section */}
      <section className="relative h-[50vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        </div>

        <div className="relative z-10 container-custom h-full flex items-end pb-12">
          <motion.div variants={itemVariants} className="max-w-2xl">
            <Badge variant="secondary" className="mb-4">
              {project.category}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              {project.title}
            </h1>
            <p className="text-xl text-zinc-300 mb-6">
              {project.tagline}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                <a href={project.url} target="_blank" rel="noopener noreferrer">
                  Visit Site <ExternalLink className="ml-2 w-4 h-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/portfolio">
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back to Portfolio
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid Layout */}
      <section className="py-20">
        <div className="container-custom">
          <motion.div variants={itemVariants} className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Project Overview</h2>
            <p className="text-zinc-400 max-w-2xl">
              {project.longDescription}
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[200px]">
            {/* Main Hero Image */}
            <motion.div
              variants={itemVariants}
              className={`lg:col-span-2 lg:row-span-2 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 ${project.id === 'planzy' ? 'lg:row-span-3' : ''}`}
            >
              <div className="h-full w-full relative">
                <img
                  src={project.thumbnail}
                  alt={`${project.title} main view`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-indigo-500/90">{project.title} Main View</Badge>
                </div>
              </div>
            </motion.div>

            {/* Stats Cards */}
            {project.stats.slice(0, 2).map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-6 flex flex-col justify-center"
              >
                <div className="text-3xl font-bold text-indigo-400">{stat.value}</div>
                <div className="text-sm text-zinc-400">{stat.label}</div>
              </motion.div>
            ))}

            {/* Features Section - spans full width */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 rounded-2xl bg-zinc-900/50 border border-zinc-800 p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" /> Key Features
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {project.features.slice(0, 4).map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-zinc-300">
                    <span className="text-indigo-400 mt-0.5">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* More Stats */}
            {project.stats.slice(2, 4).map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-6 flex flex-col justify-center"
              >
                <div className="text-3xl font-bold text-purple-400">{stat.value}</div>
                <div className="text-sm text-zinc-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 bg-zinc-900/30">
        <div className="container-custom">
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Technologies Used</h2>
            <p className="text-zinc-400">Built with modern tools and frameworks</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-3"
          >
            {project.tech.map((tech) => (
              <Badge
                key={tech}
                variant="outline"
                className="px-4 py-2 text-sm border-zinc-700 text-zinc-300 hover:border-indigo-500 hover:text-indigo-400 transition-colors"
              >
                <Code className="w-4 h-4 mr-2" />
                {tech}
              </Badge>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Project Timeline */}
      <section className="py-20">
        <div className="container-custom">
          <motion.div variants={itemVariants} className="max-w-2xl mx-auto">
            <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-lg bg-indigo-500/20">
                  <Calendar className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Project Timeline</h3>
                  <p className="text-sm text-zinc-400">Completed in {project.completionDate}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2" />
                  <div>
                    <p className="text-white font-medium">Discovery & Planning</p>
                    <p className="text-sm text-zinc-400">Requirements gathering and wireframes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-400 mt-2" />
                  <div>
                    <p className="text-white font-medium">Design & Development</p>
                    <p className="text-sm text-zinc-400">UI design and implementation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 mt-2" />
                  <div>
                    <p className="text-white font-medium">Launch & Deploy</p>
                    <p className="text-sm text-zinc-400">Testing, optimization, and deployment</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-zinc-900/50">
        <div className="container-custom text-center">
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold text-white mb-4">
              Like what you see?
            </h2>
            <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
              Let's work together to build something amazing. Check out my other projects or get in touch!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                <Link to="/portfolio">
                  <Layout className="mr-2 w-4 h-4" /> View All Projects
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/contact">
                  Get In Touch
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
