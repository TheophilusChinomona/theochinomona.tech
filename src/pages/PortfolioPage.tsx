import { useState } from 'react'
import Hero from '@/components/Hero'
import ProjectCard, { type ProjectCardProps } from '@/components/ProjectCard'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const categories = ['All', 'Web', 'Mobile', 'Full-Stack', 'Design']

const projects: ProjectCardProps[] = [
  {
    id: '1',
    title: 'E-Commerce Platform',
    description: 'Full-stack e-commerce solution with payment integration, inventory management, and admin dashboard.',
    tech: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
    category: 'Full-Stack',
  },
  {
    id: '2',
    title: 'Task Management App',
    description: 'Collaborative task management application with real-time updates and team collaboration features.',
    tech: ['React', 'TypeScript', 'WebSocket', 'MongoDB'],
    category: 'Web',
  },
  {
    id: '3',
    title: 'Mobile Fitness Tracker',
    description: 'Cross-platform mobile app for tracking workouts, nutrition, and fitness goals.',
    tech: ['React Native', 'Firebase', 'TypeScript'],
    category: 'Mobile',
  },
  {
    id: '4',
    title: 'Portfolio Website',
    description: 'Modern portfolio website with dark theme, smooth animations, and responsive design.',
    tech: ['React', 'Tailwind', 'Framer Motion'],
    category: 'Web',
  },
  {
    id: '5',
    title: 'SaaS Dashboard',
    description: 'Analytics dashboard for SaaS platform with data visualization and reporting features.',
    tech: ['Next.js', 'TypeScript', 'Chart.js', 'PostgreSQL'],
    category: 'Full-Stack',
  },
  {
    id: '6',
    title: 'UI Design System',
    description: 'Comprehensive design system with reusable components, documentation, and style guide.',
    tech: ['React', 'Storybook', 'Tailwind', 'TypeScript'],
    category: 'Design',
  },
]

export default function PortfolioPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredProjects =
    selectedCategory === 'All'
      ? projects
      : projects.filter((project) => project.category === selectedCategory)

  return (
    <>
      <Hero
        variant="minimal"
        title="Portfolio"
        subtitle="A collection of my recent work and projects"
      />

      {/* Filter Tabs */}
      <section className="py-12 bg-zinc-900/50">
        <div className="container-custom">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'transition-all',
                  selectedCategory === category && 'bg-indigo-500 hover:bg-indigo-600'
                )}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Project Grid */}
      <section className="py-20">
        <div className="container-custom">
          <div
            data-testid="project-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-zinc-400">No projects found in this category.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
