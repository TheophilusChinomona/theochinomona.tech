/**
 * Database helper functions for client projects
 * These functions interact with Supabase to manage client-specific project data
 */

import { supabase } from '@/lib/supabase'
import type { Project } from './projects'
import type { ProjectPhase } from './tracking'

export interface ProjectWithPhases extends Project {
  project_phases: ProjectPhase[]
}

export interface ClientProjectMetrics {
  totalProjects: number
  inProgressCount: number
  completedCount: number
  overallCompletionPercentage: number
}

export interface NextMilestone {
  projectId: string
  projectTitle: string
  phaseName: string
  estimatedEndDate: string
  daysRemaining: number
}

/**
 * Get all projects assigned to a specific client
 */
export async function getProjectsByClientId(clientId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch client projects: ${error.message}`)
  }

  return data as Project[]
}

/**
 * Get a specific project with all its phases (for client view)
 * Only returns if the project belongs to the client
 */
export async function getClientProjectWithPhases(
  projectId: string,
  clientId: string
): Promise<ProjectWithPhases | null> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_phases (
        id,
        project_id,
        name,
        description,
        status,
        sort_order,
        estimated_start_date,
        estimated_end_date,
        actual_start_date,
        actual_end_date,
        notify_on_complete,
        created_at,
        updated_at
      )
    `)
    .eq('id', projectId)
    .eq('client_id', clientId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch project: ${error.message}`)
  }

  // Sort phases by sort_order
  if (data.project_phases) {
    data.project_phases.sort((a: ProjectPhase, b: ProjectPhase) => a.sort_order - b.sort_order)
  }

  return data as ProjectWithPhases
}

/**
 * Calculate client project metrics
 */
export async function getClientProjectMetrics(
  clientId: string
): Promise<ClientProjectMetrics> {
  const projects = await getProjectsByClientId(clientId)

  if (projects.length === 0) {
    return {
      totalProjects: 0,
      inProgressCount: 0,
      completedCount: 0,
      overallCompletionPercentage: 0,
    }
  }

  // Get phases for all projects to calculate completion
  const { data: phases, error } = await supabase
    .from('project_phases')
    .select('id, project_id, status')
    .in(
      'project_id',
      projects.map((p) => p.id)
    )

  if (error) {
    throw new Error(`Failed to fetch project phases: ${error.message}`)
  }

  // Count completed projects (all phases completed)
  const projectPhaseMap = new Map<string, { total: number; completed: number }>()

  for (const phase of phases || []) {
    const current = projectPhaseMap.get(phase.project_id) || { total: 0, completed: 0 }
    current.total += 1
    if (phase.status === 'completed') {
      current.completed += 1
    }
    projectPhaseMap.set(phase.project_id, current)
  }

  let completedProjects = 0
  let inProgressProjects = 0
  let totalCompletedPhases = 0
  let totalPhases = 0

  for (const [, counts] of projectPhaseMap) {
    totalPhases += counts.total
    totalCompletedPhases += counts.completed
    if (counts.total > 0 && counts.completed === counts.total) {
      completedProjects += 1
    } else if (counts.completed > 0) {
      inProgressProjects += 1
    }
  }

  // Projects without phases are considered "in progress"
  const projectsWithoutPhases = projects.length - projectPhaseMap.size
  inProgressProjects += projectsWithoutPhases

  const overallCompletionPercentage =
    totalPhases > 0 ? Math.round((totalCompletedPhases / totalPhases) * 100) : 0

  return {
    totalProjects: projects.length,
    inProgressCount: inProgressProjects,
    completedCount: completedProjects,
    overallCompletionPercentage,
  }
}

/**
 * Get the next upcoming milestone for a client
 */
export async function getNextMilestone(
  clientId: string
): Promise<NextMilestone | null> {
  const projects = await getProjectsByClientId(clientId)

  if (projects.length === 0) {
    return null
  }

  // Get all in-progress phases with end dates
  const { data: phases, error } = await supabase
    .from('project_phases')
    .select('id, project_id, name, estimated_end_date, status')
    .in(
      'project_id',
      projects.map((p) => p.id)
    )
    .in('status', ['pending', 'in_progress'])
    .not('estimated_end_date', 'is', null)
    .order('estimated_end_date', { ascending: true })
    .limit(1)

  if (error) {
    throw new Error(`Failed to fetch phases: ${error.message}`)
  }

  if (!phases || phases.length === 0) {
    return null
  }

  const nextPhase = phases[0]
  if (!nextPhase) {
    return null
  }

  const project = projects.find((p) => p.id === nextPhase.project_id)

  if (!project) {
    return null
  }

  const endDate = new Date(nextPhase.estimated_end_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  endDate.setHours(0, 0, 0, 0)
  const daysRemaining = Math.ceil(
    (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  return {
    projectId: project.id,
    projectTitle: project.title,
    phaseName: nextPhase.name,
    estimatedEndDate: nextPhase.estimated_end_date,
    daysRemaining,
  }
}

/**
 * Calculate project progress percentage based on completed phases
 */
export function calculateProjectProgress(phases: ProjectPhase[]): number {
  if (phases.length === 0) return 0
  const completed = phases.filter((p) => p.status === 'completed').length
  return Math.round((completed / phases.length) * 100)
}

