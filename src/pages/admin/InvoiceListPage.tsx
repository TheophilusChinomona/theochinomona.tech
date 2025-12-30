/**
 * Admin Invoice List Page
 * Displays all invoices in a table with management actions
 * Task Group 7: Admin Invoice Management
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Eye, Edit, FileText } from 'lucide-react'
import { getAllInvoices } from '@/lib/db/invoices'
import { getAllProjects } from '@/lib/db/projects'
import { getClientUsers } from '@/lib/db/users'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import type { Invoice } from '@/lib/db/types/invoices'

const statusColors: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  sent: 'bg-blue-500/10 text-blue-400',
  paid: 'bg-emerald-500/10 text-emerald-400',
  partially_paid: 'bg-amber-500/10 text-amber-400',
  overdue: 'bg-red-500/10 text-red-400',
  refunded: 'bg-purple-500/10 text-purple-400',
  cancelled: 'bg-zinc-800 text-zinc-500',
}

export default function InvoiceListPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [clientFilter, setClientFilter] = useState<string>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const navigate = useNavigate()

  const {
    data: invoices,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['invoices'],
    queryFn: getAllInvoices,
  })

  const { data: clients = [] } = useQuery({
    queryKey: ['client-users'],
    queryFn: getClientUsers,
  })

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: getAllProjects,
  })

  // Filter invoices
  const filteredInvoices = invoices?.filter((invoice) => {
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clients.find((c) => c.id === invoice.client_id)?.email
        .toLowerCase()
        .includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    const matchesClient = clientFilter === 'all' || invoice.client_id === clientFilter
    const matchesProject =
      projectFilter === 'all' || invoice.project_id === projectFilter

    return matchesSearch && matchesStatus && matchesClient && matchesProject
  })

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    return client ? `${client.name} ${client.surname}` : 'Unknown'
  }

  const getProjectTitle = (projectId: string | null) => {
    if (!projectId) return 'N/A'
    const project = projects.find((p) => p.id === projectId)
    return project?.title || 'Unknown'
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-zinc-100">Invoices</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-400">Error Loading Invoices</CardTitle>
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
          <h1 className="text-3xl font-bold text-zinc-100">Invoices</h1>
          <p className="text-zinc-400 mt-1">Manage all invoices</p>
        </div>
        <Button onClick={() => navigate('/admin/invoices/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter invoices by status, client, or project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partially_paid">Partially Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} {client.surname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>
            {filteredInvoices?.length ?? 0} invoice{filteredInvoices?.length !== 1 ? 's' : ''}{' '}
            found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredInvoices && filteredInvoices.length > 0 ? (
            <div className="rounded-md border border-zinc-800">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice: Invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>{getClientName(invoice.client_id)}</TableCell>
                      <TableCell>{getProjectTitle(invoice.project_id)}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[invoice.status] || statusColors.draft}>
                          {invoice.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(invoice.total)}
                      </TableCell>
                      <TableCell>
                        {invoice.due_date
                          ? new Date(invoice.due_date).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-zinc-400">
                        {formatDistanceToNow(new Date(invoice.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/admin/invoices/${invoice.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {invoice.status === 'draft' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/admin/invoices/${invoice.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-zinc-300 mb-2">No invoices found</h3>
              <p className="text-zinc-500 mb-4">
                {searchQuery || statusFilter !== 'all' || clientFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first invoice'}
              </p>
              {!searchQuery && statusFilter === 'all' && clientFilter === 'all' && (
                <Button onClick={() => navigate('/admin/invoices/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

