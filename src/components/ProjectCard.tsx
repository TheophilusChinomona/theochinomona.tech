import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ExternalLink, Github } from 'lucide-react'

export interface ProjectCardProps {
  id: string
  title: string
  description: string
  thumbnail?: string | null
  tech: string[]
  category: string
  href?: string
  className?: string
  // Database project fields (optional for backward compatibility)
  client_name?: string | null
  project_url?: string | null
  github_url?: string | null
  completion_date?: string | null
  featured?: boolean
}

export default function ProjectCard({
  title,
  description,
  thumbnail,
  tech,
  href = '#',
  className,
  client_name,
  project_url,
  github_url,
  completion_date,
  featured = false,
}: ProjectCardProps) {
  const content = (
    <Card
      data-testid="project-card"
      className={cn(
        'group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/20 hover:-translate-y-1',
        className
      )}
    >
      {thumbnail && (
        <div className="relative h-48 w-full overflow-hidden rounded-t-xl bg-zinc-800">
          <img
            src={thumbnail}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent" />
          {featured && (
            <div className="absolute top-2 right-2">
              <Badge variant="default" className="bg-indigo-500 text-white">
                Featured
              </Badge>
            </div>
          )}
        </div>
      )}
      {!thumbnail && featured && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="default" className="bg-indigo-500 text-white">
            Featured
          </Badge>
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-xl">{title}</CardTitle>
            {client_name && (
              <p className="text-sm text-zinc-400 mt-1">Client: {client_name}</p>
            )}
            {completion_date && (
              <p className="text-xs text-zinc-500 mt-1">
                Completed: {new Date(completion_date).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-3">
          {tech.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        {(project_url || github_url) && (
          <div className="flex gap-2 pt-2 border-t border-zinc-800">
            {project_url && (
              <a
                href={project_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                View Project
              </a>
            )}
            {github_url && (
              <a
                href={github_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Github className="h-3 w-3" />
                GitHub
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (href === '#') {
    return content
  }

  return (
    <Link to={href} className="block">
      {content}
    </Link>
  )
}

