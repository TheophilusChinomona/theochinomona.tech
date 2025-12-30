/**
 * MyRequestsPage
 * Shows client's project requests (quote requests)
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { getProjectRequestsForClient } from '@/lib/db/projectRequests'
import { ClipboardList, FileText, FileImage } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

type StatusFilter = 'all' | 'pending' | 'approved' | 'denied' | 'needs_info'

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'pending':
      return 'default' // Yellow
    case 'approved':
      return 'default' // Green
    case 'denied':
      return 'destructive' // Red
    case 'needs_info':
      return 'secondary' // Blue
    default:
      return 'default'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'pending':
      return 'Pending Approval'
    case 'approved':
      return 'Approved'
    case 'denied':
      return 'Denied'
    case 'needs_info':
      return 'Needs Info'
    default:
      return status
  }
}

export default function MyRequestsPage() {
  const { user } = useAuth()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const { data: requests, isLoading } = useQuery({
    queryKey: ['client', 'project-requests', user?.id, statusFilter],
    queryFn: async () => {
      if (!user?.id) return []
      return getProjectRequestsForClient(user.id, {
        status: statusFilter === 'all' ? undefined : statusFilter,
      })
    },
    enabled: !!user?.id,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">My Requests</h1>
        <p className="text-zinc-400 mt-1">
          View the status of your project quote requests.
        </p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-800 text-zinc-100">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="denied">Denied</SelectItem>
            <SelectItem value="needs_info">Needs Info</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="bg-zinc-900/50 border-zinc-800 animate-pulse"
            >
              <CardContent className="p-6">
                <div className="h-6 w-48 bg-zinc-800 rounded mb-4" />
                <div className="h-4 w-32 bg-zinc-800 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Requests List */}
      {!isLoading && requests && requests.length > 0 && (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card
              key={request.id}
              className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-zinc-100">{request.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {request.category} • Created{' '}
                      {format(new Date(request.created_at), 'MMM d, yyyy')}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusBadgeVariant(request.status)}>
                    {getStatusLabel(request.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-300 mb-4 line-clamp-2">
                  {request.description}
                </p>

                {/* Additional Info */}
                {(request.budget_range ||
                  request.timeline ||
                  request.special_requirements) && (
                  <div className="space-y-2 mb-4 text-sm text-zinc-400">
                    {request.budget_range && (
                      <div>
                        <span className="font-medium">Budget:</span> {request.budget_range}
                      </div>
                    )}
                    {request.timeline && (
                      <div>
                        <span className="font-medium">Timeline:</span> {request.timeline}
                      </div>
                    )}
                    {request.special_requirements && (
                      <div>
                        <span className="font-medium">Special Requirements:</span>{' '}
                        {request.special_requirements}
                      </div>
                    )}
                  </div>
                )}

                {/* Attachments */}
                {request.attachments && request.attachments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <p className="text-sm font-medium text-zinc-400 mb-2">Attachments:</p>
                    <div className="flex flex-wrap gap-2">
                      {request.attachments.map((attachment) => (
                        <a
                          key={attachment.id}
                          href={attachment.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
                        >
                          {attachment.file_type === 'pdf' ? (
                            <FileText className="h-4 w-4" />
                          ) : (
                            <FileImage className="h-4 w-4" />
                          )}
                          {attachment.file_name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Response */}
                {request.admin_notes && (
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <p className="text-sm font-medium text-zinc-400 mb-1">Admin Notes:</p>
                    <p className="text-sm text-zinc-300">{request.admin_notes}</p>
                  </div>
                )}

                {request.denial_reason && (
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <p className="text-sm font-medium text-red-400 mb-1">Denial Reason:</p>
                    <p className="text-sm text-zinc-300">{request.denial_reason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!requests || requests.length === 0) && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-8 text-center">
            <ClipboardList className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
            <h3 className="text-lg font-semibold text-zinc-200 mb-2">
              {statusFilter !== 'all'
                ? 'No matching requests'
                : 'No requests yet'}
            </h3>
            <p className="text-zinc-400 max-w-md mx-auto">
              {statusFilter !== 'all'
                ? 'Try adjusting your filter criteria.'
                : "You haven't submitted any project quote requests yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

