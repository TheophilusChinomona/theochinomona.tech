/**
 * Database helper functions for client groups
 * Task Group 7: Database Functions - Release Notes & Groups
 */

import { supabase } from '@/lib/supabase'
import type {
  ClientGroup,
  ClientGroupWithMemberCount,
  ClientGroupInput,
} from './types/dashboard'
import type { User } from './users'

// ============================================================================
// Client Groups CRUD Functions
// ============================================================================

/**
 * Get all client groups with member counts
 */
export async function getAllClientGroups(): Promise<ClientGroupWithMemberCount[]> {
  // Get all groups
  const { data: groups, error: groupsError } = await supabase
    .from('client_groups')
    .select('*')
    .order('name', { ascending: true })

  if (groupsError) {
    throw new Error(`Failed to get client groups: ${groupsError.message}`)
  }

  if (!groups || groups.length === 0) {
    return []
  }

  // Get member counts for all groups
  const { data: counts, error: countsError } = await supabase
    .from('client_group_members')
    .select('group_id')

  if (countsError) {
    throw new Error(`Failed to get member counts: ${countsError.message}`)
  }

  // Count members per group
  const memberCounts = new Map<string, number>()
  for (const member of counts ?? []) {
    const currentCount = memberCounts.get(member.group_id) ?? 0
    memberCounts.set(member.group_id, currentCount + 1)
  }

  // Combine groups with counts
  return groups.map((group) => ({
    ...group,
    member_count: memberCounts.get(group.id) ?? 0,
  })) as ClientGroupWithMemberCount[]
}

/**
 * Get a client group by ID
 */
export async function getClientGroupById(id: string): Promise<ClientGroup | null> {
  const { data, error } = await supabase
    .from('client_groups')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to get client group: ${error.message}`)
  }

  return data as ClientGroup | null
}

/**
 * Get a client group by ID with member count
 */
export async function getClientGroupWithMemberCount(
  id: string
): Promise<ClientGroupWithMemberCount | null> {
  const group = await getClientGroupById(id)
  if (!group) return null

  const { count, error } = await supabase
    .from('client_group_members')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', id)

  if (error) {
    throw new Error(`Failed to get member count: ${error.message}`)
  }

  return {
    ...group,
    member_count: count ?? 0,
  }
}

/**
 * Create a new client group
 */
export async function createClientGroup(
  name: string,
  description?: string
): Promise<ClientGroup> {
  const { data, error } = await supabase
    .from('client_groups')
    .insert({
      name,
      description: description ?? null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('A group with this name already exists')
    }
    throw new Error(`Failed to create client group: ${error.message}`)
  }

  return data as ClientGroup
}

/**
 * Update a client group
 */
export async function updateClientGroup(
  id: string,
  updates: Partial<ClientGroupInput>
): Promise<ClientGroup> {
  const { data, error } = await supabase
    .from('client_groups')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('A group with this name already exists')
    }
    throw new Error(`Failed to update client group: ${error.message}`)
  }

  return data as ClientGroup
}

/**
 * Delete a client group
 * Also deletes all memberships (via CASCADE)
 */
export async function deleteClientGroup(id: string): Promise<void> {
  const { error } = await supabase
    .from('client_groups')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete client group: ${error.message}`)
  }
}

// ============================================================================
// Group Membership Functions
// ============================================================================

/**
 * Add a user to a group
 */
export async function addUserToGroup(
  groupId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('client_group_members')
    .insert({
      group_id: groupId,
      user_id: userId,
    })

  if (error) {
    // Ignore duplicate errors (already a member)
    if (error.code !== '23505') {
      throw new Error(`Failed to add user to group: ${error.message}`)
    }
  }
}

/**
 * Remove a user from a group
 */
export async function removeUserFromGroup(
  groupId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('client_group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to remove user from group: ${error.message}`)
  }
}

/**
 * Get all members of a group
 */
export async function getGroupMembers(groupId: string): Promise<User[]> {
  const { data, error } = await supabase
    .from('client_group_members')
    .select(`
      user_id,
      users (*)
    `)
    .eq('group_id', groupId)

  if (error) {
    throw new Error(`Failed to get group members: ${error.message}`)
  }

  // Extract user objects from the join
  return (data ?? [])
    .map((m) => (m as { user_id: string; users: User }).users)
    .filter(Boolean) as User[]
}

/**
 * Get all groups a user belongs to
 */
export async function getUserGroups(userId: string): Promise<ClientGroup[]> {
  const { data, error } = await supabase
    .from('client_group_members')
    .select(`
      group_id,
      client_groups (*)
    `)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to get user groups: ${error.message}`)
  }

  // Extract group objects from the join
  return (data ?? [])
    .map((m) => (m as { group_id: string; client_groups: ClientGroup }).client_groups)
    .filter(Boolean) as ClientGroup[]
}

/**
 * Check if a user is a member of a group
 */
export async function isUserInGroup(
  groupId: string,
  userId: string
): Promise<boolean> {
  const { count, error } = await supabase
    .from('client_group_members')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', groupId)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to check group membership: ${error.message}`)
  }

  return (count ?? 0) > 0
}

/**
 * Set all members for a group
 * Replaces existing members with new list
 */
export async function setGroupMembers(
  groupId: string,
  userIds: string[]
): Promise<void> {
  // Delete existing members
  const { error: deleteError } = await supabase
    .from('client_group_members')
    .delete()
    .eq('group_id', groupId)

  if (deleteError) {
    throw new Error(`Failed to clear existing members: ${deleteError.message}`)
  }

  // Insert new members if any
  if (userIds.length > 0) {
    const memberRecords = userIds.map((userId) => ({
      group_id: groupId,
      user_id: userId,
    }))

    const { error: insertError } = await supabase
      .from('client_group_members')
      .insert(memberRecords)

    if (insertError) {
      throw new Error(`Failed to set group members: ${insertError.message}`)
    }
  }
}


