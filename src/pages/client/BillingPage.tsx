/**
 * Client Billing Page
 * Displays all invoices for the logged-in client
 * Task Group 9: Client Billing Dashboard
 */

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { getInvoicesForClient } from '@/lib/db/invoices'
import { CreditCard, FileText, Calendar, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PayInvoiceButton } from '@/components/client/PayInvoiceButton'
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

type StatusFilter = 'all' | 'paid' | 'unpaid' | 'overdue'
type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'status'

export default function BillingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('date-desc')
  const [searchQuery, setSearchQuery] = useState('')

  const {
    data: invoices,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['invoices', 'client', user?.id],
    queryFn: () => (user?.id ? getInvoicesForClient(user.id) : []),
    enabled: !!user?.id,
  })

  // Filter and sort invoices
  const filteredInvoices = useMemo(() => {
    if (!invoices) return []

    let filtered = invoices

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoice_number.toLowerCase().includes(query) ||
          invoice.status.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((invoice) => {
        if (statusFilter === 'paid') return invoice.status === 'paid'
        if (statusFilter === 'unpaid')
          return invoice.status === 'sent' || invoice.status === 'draft'
        if (statusFilter === 'overdue') return invoice.status === 'overdue'
        return true
      })
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'amount-desc':
          return b.total - a.total
        case 'amount-asc':
          return a.total - b.total
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

    return filtered
  }, [invoices, searchQuery, statusFilter, sortBy])

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-zinc-100">Billing</h1>
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
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Billing</h1>
        <p className="text-zinc-400 mt-1">View and manage your invoices</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="amount-desc">Highest Amount</SelectItem>
                <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>
            {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredInvoices.length > 0 ? (
            <div className="space-y-4">
              {filteredInvoices.map((invoice: Invoice) => (
                <Card
                  key={invoice.id}
                  className="cursor-pointer hover:bg-zinc-900 transition-colors"
                  onClick={() => navigate(`/dashboard/billing/${invoice.id}`)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="h-5 w-5 text-zinc-400" />
                          <h3 className="text-lg font-semibold">{invoice.invoice_number}</h3>
                          <Badge className={statusColors[invoice.status] || statusColors.draft}>
                            {invoice.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-zinc-400">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-medium text-zinc-300">
                              {formatCurrency(invoice.total)}
                            </span>
                          </div>
                          {invoice.due_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Due: {new Date(invoice.due_date).toLocaleDateString()}</span>
                            </div>
                          )}
                          <span>
                            {formatDistanceToNow(new Date(invoice.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(invoice.status === 'sent' ||
                          invoice.status === 'draft' ||
                          invoice.status === 'partially_paid') && (
                          <PayInvoiceButton invoice={invoice} variant="default" />
                        )}
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/dashboard/billing/${invoice.id}`)
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-zinc-300 mb-2">No invoices found</h3>
              <p className="text-zinc-500">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'You don\'t have any invoices yet'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

