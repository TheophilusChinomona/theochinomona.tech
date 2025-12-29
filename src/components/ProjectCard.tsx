import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface ProjectCardProps {
  id: string
  title: string
  description: string
  thumbnail?: string
  tech: string[]
  category: string
  href?: string
  className?: string
}

export default function ProjectCard({
  title,
  description,
  thumbnail,
  tech,
  href = '#',
  className,
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
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {tech.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
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

