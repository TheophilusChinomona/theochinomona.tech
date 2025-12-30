/**
 * ClientPortfolioPage
 * Browse all published portfolio projects (same as public view)
 */

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ExternalLink, Github, Search, Briefcase } from 'lucide-react'
import { getPublishedProjects } from '@/lib/db/projects'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function ClientPortfolioPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const { data: projects, isLoading } = useQuery({
    queryKey: ['portfolio', 'published'],
    queryFn: getPublishedProjects,
  })

  // Get unique categories
  const categories = useMemo(() => {
    if (!projects) return []
    const cats = new Set(projects.map((p) => p.category))
    return Array.from(cats).sort()
  }, [projects])

  // Filter projects
  const filteredProjects = useMemo(() => {
    if (!projects) return []

    return projects.filter((project) => {
      const matchesSearch =
        !searchQuery ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tech.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory =
        categoryFilter === 'all' || project.category === categoryFilter

      return matchesSearch && matchesCategory
    })
  }, [projects, searchQuery, categoryFilter])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Portfolio</h1>
        <p className="text-zinc-400 mt-1">
          Browse all published projects and case studies.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-800 text-zinc-100">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden animate-pulse"
            >
              <div className="aspect-video bg-zinc-800" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 bg-zinc-800 rounded" />
                <div className="h-4 w-full bg-zinc-800 rounded" />
                <div className="h-4 w-2/3 bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Projects Grid */}
      {!isLoading && filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                {project.thumbnail ? (
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Briefcase className="w-12 h-12 text-zinc-700" />
                  </div>
                )}
                {project.featured && (
                  <span className="absolute top-2 left-2 px-2 py-1 bg-indigo-500 text-white text-xs font-medium rounded">
                    Featured
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-white transition-colors">
                    {project.title}
                  </h3>
                  <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded shrink-0">
                    {project.category}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
                  {project.description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {project.tech.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.tech.length > 4 && (
                    <span className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-500 rounded">
                      +{project.tech.length - 4}
                    </span>
                  )}
                </div>

                {/* Links */}
                <div className="flex items-center gap-3">
                  {project.project_url && (
                    <a
                      href={project.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors'
                      )}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Live Demo
                    </a>
                  )}
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      Source
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredProjects.length === 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center">
          <Briefcase className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
          <h3 className="text-lg font-semibold text-zinc-200 mb-2">
            {searchQuery || categoryFilter !== 'all'
              ? 'No matching projects'
              : 'No projects yet'}
          </h3>
          <p className="text-zinc-400 max-w-md mx-auto">
            {searchQuery || categoryFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Published portfolio projects will appear here.'}
          </p>
        </div>
      )}
    </div>
  )
}

