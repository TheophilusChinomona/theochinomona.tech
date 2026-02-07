import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import Hero from '@/components/Hero'
import ProjectCard, { type ProjectCardProps } from '@/components/ProjectCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { getPublishedProjects, type Project } from '@/lib/db/projects'

const categories = ['All', 'Web', 'Mobile', 'Full-Stack', 'Design']

// Real portfolio projects
const portfolioProjects: ProjectCardProps[] = [
  {
    id: 'portfolio-planzy',
    title: 'Planzy Studio',
    description: 'Creative agency portfolio showcasing studio capabilities with modern design and smooth animations.',
    tech: ['React', 'Tailwind CSS', 'Framer Motion', 'Vite'],
    category: 'Web',
    thumbnail: '/images/projects/planzy.jpg',
  },
  {
    id: 'portfolio-ibstrategies',
    title: 'IBStrategies',
    description: 'Business consulting website with ISO certification services and SHREQ training programs.',
    tech: ['React', 'TypeScript', 'CMS', 'Responsive Design'],
    category: 'Web',
    thumbnail: '/images/projects/ibstrategies.jpg',
  },
  {
    id: 'portfolio-acbf',
    title: 'ACBF RSA',
    description: 'African Cyber Battlefield Forum - Cybersecurity event platform empowering communities.',
    tech: ['React', 'Node.js', 'Events', 'Community'],
    category: 'Web',
    thumbnail: '/images/projects/acbf.jpg',
  },
]

type SortOption = 'newest' | 'alphabetical' | 'featured'

const PROJECTS_PER_PAGE = 12

export default function PortfolioPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTech, setSelectedTech] = useState<Set<string>>(new Set())
  const [sortOption, setSortOption] = useState<SortOption>('newest')
  const [currentPage, setCurrentPage] = useState(1)

  const {
    data: dbProjects = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['published-projects'],
    queryFn: getPublishedProjects,
  })

  // Convert database projects to ProjectCardProps format
  const dbProjectsFormatted: ProjectCardProps[] = useMemo(
    () =>
      dbProjects.map((project: Project) => ({
        id: project.id,
        title: project.title,
        description: project.description,
        thumbnail: project.thumbnail || undefined,
        tech: project.tech,
        category: project.category,
        href: `/portfolio/${project.id}`,
        client_name: project.client_name || undefined,
        project_url: project.project_url || undefined,
        github_url: project.github_url || undefined,
        completion_date: project.completion_date || undefined,
        featured: project.featured,
      })),
    [dbProjects]
  )

  // Merge portfolio projects and database projects
  const allProjects = useMemo(
    () => [
      ...portfolioProjects.map(p => ({ ...p, href: `/portfolio/${p.id.replace('portfolio-', '')}` })),
      ...dbProjectsFormatted
    ],
    [dbProjectsFormatted]
  )

  // Extract unique tech values from all projects
  const availableTech = useMemo(() => {
    const techSet = new Set<string>()
    allProjects.forEach((project) => {
      project.tech.forEach((tech) => techSet.add(tech))
    })
    return Array.from(techSet).sort()
  }, [allProjects])

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = allProjects

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((project) => project.category === selectedCategory)
    }

    // Tech filter
    if (selectedTech.size > 0) {
      filtered = filtered.filter((project) =>
        project.tech.some((tech) => selectedTech.has(tech))
      )
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query)
      )
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          // For hardcoded projects, maintain original order
          // For database projects, sort by created_at (already sorted by getPublishedProjects)
          return 0
        case 'alphabetical':
          return a.title.localeCompare(b.title)
        case 'featured':
          // Featured first, then by title
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    return sorted
  }, [allProjects, selectedCategory, selectedTech, searchQuery, sortOption])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProjects.length / PROJECTS_PER_PAGE)
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * PROJECTS_PER_PAGE
    return filteredAndSortedProjects.slice(startIndex, startIndex + PROJECTS_PER_PAGE)
  }, [filteredAndSortedProjects, currentPage])

  const handleTechToggle = (tech: string) => {
    const newSelected = new Set(selectedTech)
    if (newSelected.has(tech)) {
      newSelected.delete(tech)
    } else {
      newSelected.add(tech)
    }
    setSelectedTech(newSelected)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const handleSortChange = (value: string) => {
    setSortOption(value as SortOption)
    setCurrentPage(1) // Reset to first page when sort changes
  }

  return (
    <>
      <Hero
        variant="minimal"
        title="Portfolio"
        subtitle="A collection of my recent work and projects"
      />

      {/* Filters and Search */}
      <section className="py-12 bg-zinc-900/50">
        <div className="container-custom">
          <div className="space-y-6">
            {/* Category Filter */}
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Category</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => handleCategoryChange(category)}
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

            {/* Search */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10 bg-zinc-950 border-zinc-800 text-zinc-100"
                />
              </div>
            </div>

            {/* Tech Stack Filter */}
            {availableTech.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Technologies</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {availableTech.map((tech) => (
                    <Badge
                      key={tech}
                      variant={selectedTech.has(tech) ? 'default' : 'secondary'}
                      className={cn(
                        'cursor-pointer transition-all',
                        selectedTech.has(tech) && 'bg-indigo-500 hover:bg-indigo-600'
                      )}
                      onClick={() => handleTechToggle(tech)}
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
                {selectedTech.size > 0 && (
                  <div className="mt-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedTech(new Set())
                        setCurrentPage(1)
                      }}
                      className="text-zinc-400 hover:text-zinc-300"
                    >
                      Clear tech filters
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Sort */}
            <div className="flex items-center justify-center gap-3">
              <label htmlFor="sort" className="text-sm font-medium text-zinc-400">
                Sort by:
              </label>
              <Select value={sortOption} onValueChange={handleSortChange}>
                <SelectTrigger
                  id="sort"
                  className="w-48 bg-zinc-950 border-zinc-800 text-zinc-100"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical (A-Z)</SelectItem>
                  <SelectItem value="featured">Featured First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Project Grid */}
      <section className="py-20">
        <div className="container-custom">
          {isLoading ? (
            <div
              data-testid="project-grid"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400">Error loading projects. Please try again later.</p>
            </div>
          ) : (
            <>
              <div
                data-testid="project-grid"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {paginatedProjects.map((project) => (
                  <ProjectCard key={project.id} {...project} />
                ))}
              </div>

              {paginatedProjects.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-zinc-400">
                    {searchQuery || selectedTech.size > 0 || selectedCategory !== 'All'
                      ? 'No projects found matching your filters.'
                      : 'No projects found.'}
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-zinc-400 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
