import { Link } from 'react-router-dom'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Smartphone, 
  Cloud, 
  ExternalLink
} from 'lucide-react'
import { SiReact, SiTypescript, SiNodedotjs, SiTailwindcss } from 'react-icons/si'

const skills = [
  { name: 'React', icon: SiReact, color: 'text-blue-400' },
  { name: 'TypeScript', icon: SiTypescript, color: 'text-blue-600' },
  { name: 'Node.js', icon: SiNodedotjs, color: 'text-green-500' },
  { name: 'Tailwind CSS', icon: SiTailwindcss, color: 'text-cyan-400' },
  { name: 'Mobile', icon: Smartphone, color: 'text-purple-400' },
  { name: 'Cloud', icon: Cloud, color: 'text-orange-400' },
]

const featuredProjects = [
  {
    id: '1',
    title: 'E-Commerce Platform',
    description: 'Full-stack e-commerce solution with payment integration',
    tech: ['React', 'Node.js', 'PostgreSQL'],
    thumbnail: '/images/projects/ecommerce.jpg',
  },
  {
    id: '2',
    title: 'Task Management App',
    description: 'Collaborative task management with real-time updates',
    tech: ['React', 'TypeScript', 'WebSocket'],
    thumbnail: '/images/projects/task-management.jpg',
  },
  {
    id: '3',
    title: 'Portfolio Website',
    description: 'Modern portfolio site with dark theme and animations',
    tech: ['React', 'Tailwind', 'Framer Motion'],
    thumbnail: '/images/projects/portfolio.jpg',
  },
]

export default function HomePage() {
  return (
    <>
      <Hero
        variant="full"
        title="Theo Chinomona"
        subtitle="Full-Stack Developer & Creative Problem Solver"
        ctaText="Let's Build Something"
        ctaLink="/contact"
      />

      {/* Introduction Section */}
      <section className="py-20 bg-zinc-900/50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Building Digital Experiences
            </h2>
            <p className="text-lg text-zinc-300 leading-relaxed">
              I'm a passionate full-stack developer specializing in creating beautiful, 
              functional web applications. With expertise in modern JavaScript frameworks 
              and cloud technologies, I bring ideas to life through clean code and 
              thoughtful design.
            </p>
          </div>
        </div>
      </section>

      {/* Skills/Tech Stack Section */}
      <section className="py-20">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">
            Skills & Technologies
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {skills.map((skill) => {
              const Icon = skill.icon
              return (
                <Card key={skill.name} className="text-center hover:bg-zinc-800 transition-colors">
                  <CardHeader>
                    <Icon className={`w-12 h-12 mx-auto mb-2 ${skill.color}`} />
                    <CardTitle className="text-sm font-medium">{skill.name}</CardTitle>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Projects Preview */}
      <section className="py-20 bg-zinc-900/50">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Featured Projects
            </h2>
            <Button asChild variant="outline">
              <Link to="/portfolio">
                View All <ExternalLink className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden hover:bg-zinc-800 transition-colors group">
                {project.thumbnail && (
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 text-xs bg-zinc-800 text-zinc-300 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Let's Work Together
            </h2>
            <p className="text-lg text-zinc-300 mb-8">
              Have a project in mind? I'd love to hear about it. Let's create something amazing together.
            </p>
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/contact">Start a Project</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
