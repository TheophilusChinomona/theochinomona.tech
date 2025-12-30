import Hero from '@/components/Hero'
import DeveloperTimeline, { type TimelineItem } from '@/components/DeveloperTimeline'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Code, 
  Database, 
  Cloud, 
  Smartphone,
  Palette,
  Zap,
} from 'lucide-react'

const skills = [
  { name: 'React & Next.js', icon: Code },
  { name: 'TypeScript', icon: Code },
  { name: 'Node.js & Express', icon: Database },
  { name: 'PostgreSQL & MongoDB', icon: Database },
  { name: 'AWS & Cloud Services', icon: Cloud },
  { name: 'React Native', icon: Smartphone },
  { name: 'Tailwind CSS', icon: Palette },
  { name: 'Performance Optimization', icon: Zap },
]

const timelineItems: TimelineItem[] = [
  {
    date: '2020',
    title: 'Started Development Journey',
    description: 'Began learning web development with HTML, CSS, and JavaScript. Built first portfolio website.',
  },
  {
    date: '2021',
    title: 'Full-Stack Development',
    description: 'Expanded skills to include React, Node.js, and database management. Completed first full-stack project.',
  },
  {
    date: '2022',
    title: 'Professional Experience',
    description: 'Started working as a freelance developer, building custom web applications for clients.',
  },
  {
    date: '2023',
    title: 'Advanced Technologies',
    description: 'Mastered TypeScript, cloud deployment, and modern development practices. Launched multiple production applications.',
  },
  {
    date: '2024',
    title: 'Current Focus',
    description: 'Continuing to build innovative solutions, focusing on performance, accessibility, and user experience.',
  },
]

export default function AboutPage() {
  return (
    <>
      <Hero
        variant="split"
        title="About Me"
        subtitle="Passionate developer building beautiful, functional web experiences"
        image={
          <div className="w-full h-64 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
            Profile Image Placeholder
          </div>
        }
      />

      {/* Personal Introduction */}
      <section className="py-20 bg-zinc-900/50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Introduction
            </h2>
            <div className="space-y-4 text-zinc-300 leading-relaxed">
              <p>
                Hello! I'm Theo, a full-stack developer with a passion for creating 
                digital experiences that are both beautiful and functional. I specialize 
                in modern web technologies and enjoy solving complex problems with 
                elegant solutions.
              </p>
              <p>
                My journey in development started with a curiosity about how websites 
                work, and it has evolved into a career focused on building applications 
                that make a difference. I believe in writing clean, maintainable code 
                and always keeping the user experience at the forefront of my work.
              </p>
              <p>
                When I'm not coding, you can find me exploring new technologies, 
                contributing to open-source projects, or sharing knowledge with the 
                developer community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Skills/Technologies Grid */}
      <section className="py-20">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">
            Skills & Technologies
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {skills.map((skill) => {
              const Icon = skill.icon
              return (
                <Card key={skill.name} className="text-center hover:bg-zinc-800 transition-colors">
                  <CardHeader>
                    <Icon className="w-10 h-10 mx-auto mb-3 text-indigo-500" />
                    <CardTitle className="text-base font-medium">{skill.name}</CardTitle>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Developer Journey Timeline */}
      <section className="py-20 bg-zinc-900/50">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">
            Developer Journey
          </h2>
          <div className="max-w-4xl mx-auto">
            <DeveloperTimeline items={timelineItems} />
          </div>
        </div>
      </section>
    </>
  )
}
