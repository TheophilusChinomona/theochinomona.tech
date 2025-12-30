/**
 * Billing Summary Widget
 * Displays billing summary information for client dashboard
 * Task Group 9: Client Billing Dashboard
 */

import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { CreditCard, AlertCircle, DollarSign, Calendar } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getInvoicesForClient } from '@/lib/db/invoices'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

export default function BillingSummaryWidget() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', 'client', user?.id],
    queryFn: () => (user?.id ? getInvoicesForClient(user.id) : []),
    enabled: !!user?.id,
  })

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!invoices || invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing Summary</CardTitle>
          <CardDescription>No invoices yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-400 text-sm">You don't have any invoices at this time.</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate summary metrics
  const unpaidInvoices = invoices.filter(
    (inv) => inv.status === 'sent' || inv.status === 'draft' || inv.status === 'partially_paid'
  )
  const overdueInvoices = invoices.filter((inv) => inv.status === 'overdue')
  const totalOutstanding = unpaidInvoices.reduce((sum, inv) => sum + inv.total, 0)

  // Get recent payments (from paid invoices)
  const paidInvoices = invoices
    .filter((inv) => inv.status === 'paid')
    .sort((a, b) => new Date(b.paid_at || b.created_at).getTime() - new Date(a.paid_at || a.created_at).getTime())
    .slice(0, 3)

  // Get next due invoice
  const nextDueInvoice = unpaidInvoices
    .filter((inv) => inv.due_date)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())[0]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Billing Summary</CardTitle>
            <CardDescription>Your invoice and payment overview</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/billing')}>
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Outstanding */}
        <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-lg">
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-zinc-400" />
            <div>
              <p className="text-sm text-zinc-400">Total Outstanding</p>
              <p className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</p>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-zinc-900 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <p className="text-xs text-zinc-400">Overdue</p>
            </div>
            <p className="text-xl font-semibold">{overdueInvoices.length}</p>
          </div>
          <div className="p-3 bg-zinc-900 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="h-4 w-4 text-amber-400" />
              <p className="text-xs text-zinc-400">Unpaid</p>
            </div>
            <p className="text-xl font-semibold">{unpaidInvoices.length}</p>
          </div>
        </div>

        {/* Next Due Invoice */}
        {nextDueInvoice && (
          <div className="p-4 bg-zinc-900 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-blue-400" />
              <p className="text-sm font-medium">Next Due</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">{nextDueInvoice.invoice_number}</p>
                <p className="text-xs text-zinc-500">
                  Due: {new Date(nextDueInvoice.due_date!).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(nextDueInvoice.total)}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1"
                  onClick={() => navigate(`/dashboard/billing/${nextDueInvoice.id}`)}
                >
                  Pay Now
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Payments */}
        {paidInvoices.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Recent Payments</p>
            <div className="space-y-2">
              {paidInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-2 bg-zinc-900 rounded text-sm cursor-pointer hover:bg-zinc-800"
                  onClick={() => navigate(`/dashboard/billing/${invoice.id}`)}
                >
                  <div>
                    <p className="font-medium">{invoice.invoice_number}</p>
                    <p className="text-xs text-zinc-500">
                      {invoice.paid_at
                        ? new Date(invoice.paid_at).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-400">Paid</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

