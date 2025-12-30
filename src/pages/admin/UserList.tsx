/**
 * Admin User List Page
 * Displays all users in a table with management actions
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, MoreVertical, Edit, Trash2, Key, Eye, UserPlus, UserCog } from 'lucide-react'
import { getAllUsers, deleteUser, updateUserRole, type User } from '@/lib/db/users'
import { sendPasswordResetEmail, inviteUserByEmail, type InviteUserData } from '@/lib/auth'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import EditUserForm from '@/components/admin/EditUserForm'
import RoleChangeDialog from '@/components/admin/RoleChangeDialog'
import DeleteUserDialog from '@/components/admin/DeleteUserDialog'
import ViewUserDialog from '@/components/admin/ViewUserDialog'
import InviteUserDialog from '@/components/admin/InviteUserDialog'

export default function UserList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [viewingUser, setViewingUser] = useState<User | null>(null)
  const [roleChangeUser, setRoleChangeUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [inviteUserOpen, setInviteUserOpen] = useState(false)

  const queryClient = useQueryClient()

  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
  })

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('User deleted successfully')
      setDeletingUser(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete user')
    },
  })

  const roleChangeMutation = useMutation({
    mutationFn: ({ userId, newRole }: { userId: string; newRole: 'admin' | 'client' }) =>
      updateUserRole(userId, newRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('User role updated successfully')
      setRoleChangeUser(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user role')
    },
  })

  const passwordResetMutation = useMutation({
    mutationFn: sendPasswordResetEmail,
    onSuccess: () => {
      toast.success('Password reset email sent successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send password reset email')
    },
  })

  const inviteUserMutation = useMutation({
    mutationFn: (data: InviteUserData) => inviteUserByEmail(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['users'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
        toast.success(response.message || 'Invitation sent successfully')
        setInviteUserOpen(false)
      } else {
        toast.error(response.error || 'Failed to send invitation')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send invitation')
    },
  })

  const handlePasswordReset = async (email: string) => {
    passwordResetMutation.mutate(email)
  }

  const handleDelete = (user: User) => {
    deleteUserMutation.mutate(user.id)
  }

  const handleRoleChange = (userId: string, newRole: 'admin' | 'client') => {
    roleChangeMutation.mutate({ userId, newRole })
  }

  // Filter users based on search query
  const filteredUsers = users?.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-zinc-100">Users</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-400">Error Loading Users</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : 'An error occurred'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Users</h1>
          <p className="text-zinc-400 mt-1">
            Manage all user accounts and permissions
          </p>
        </div>
        <Button onClick={() => setInviteUserOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
          <CardDescription>
            Search by name or email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {filteredUsers?.length ?? 0} user{filteredUsers?.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers && filteredUsers.length > 0 ? (
            <div className="rounded-md border border-zinc-800">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.name} {user.surname}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>
                        {user.role === 'admin' ? (
                          <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-400 text-xs font-medium">
                            Admin
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-400 text-xs font-medium">
                            Client
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-zinc-400 text-sm">
                        {formatDistanceToNow(new Date(user.created_at), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => setViewingUser(user)}
                              className="cursor-pointer"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setEditingUser(user)}
                              className="cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setRoleChangeUser(user)}
                              className="cursor-pointer"
                            >
                              <UserCog className="h-4 w-4 mr-2" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handlePasswordReset(user.email)}
                              className="cursor-pointer"
                              disabled={passwordResetMutation.isPending}
                            >
                              <Key className="h-4 w-4 mr-2" />
                              Send Password Reset
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeletingUser(user)}
                              className="cursor-pointer text-red-400 focus:text-red-400"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-400">
              {searchQuery
                ? 'No users found matching your search'
                : 'No users found'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {editingUser && (
        <EditUserForm
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
        />
      )}

      {viewingUser && (
        <ViewUserDialog
          user={viewingUser}
          open={!!viewingUser}
          onOpenChange={(open) => !open && setViewingUser(null)}
        />
      )}

      {roleChangeUser && (
        <RoleChangeDialog
          user={roleChangeUser}
          open={!!roleChangeUser}
          onOpenChange={(open) => !open && setRoleChangeUser(null)}
          onConfirm={handleRoleChange}
        />
      )}

      {deletingUser && (
        <DeleteUserDialog
          user={deletingUser}
          open={!!deletingUser}
          onOpenChange={(open) => !open && setDeletingUser(null)}
          onConfirm={handleDelete}
        />
      )}

      <InviteUserDialog
        open={inviteUserOpen}
        onOpenChange={setInviteUserOpen}
        onConfirm={async (data) => {
          await inviteUserMutation.mutateAsync(data)
        }}
        isSubmitting={inviteUserMutation.isPending}
      />
    </div>
  )
}

