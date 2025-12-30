/**
 * Client Invoice Detail Page
 * Displays invoice details for clients with payment options
 * Task Group 9: Client Billing Dashboard
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Download, Mail, FileText } from 'lucide-react'
import { getInvoiceWithLineItems } from '@/lib/db/invoices'
import { getPaymentsForInvoice } from '@/lib/db/payments'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PayInvoiceButton } from '@/components/client/PayInvoiceButton'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const statusColors: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  sent: 'bg-blue-500/10 text-blue-400',
  paid: 'bg-emerald-500/10 text-emerald-400',
  partially_paid: 'bg-amber-500/10 text-amber-400',
  overdue: 'bg-red-500/10 text-red-400',
  refunded: 'bg-purple-500/10 text-purple-400',
  cancelled: 'bg-zinc-800 text-zinc-500',
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Check for payment success/cancel messages
  const paymentStatus = searchParams.get('payment')

  const {
    data: invoice,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => (id ? getInvoiceWithLineItems(id) : null),
    enabled: !!id,
  })

  const { data: payments = [] } = useQuery({
    queryKey: ['payments', id],
    queryFn: () => (id ? getPaymentsForInvoice(id) : []),
    enabled: !!id,
  })

  const requestQuoteMutation = useMutation({
    mutationFn: async () => {
      // Create notification for admin
      const { error } = await supabase.from('notifications').insert({
        user_id: invoice!.client_id, // This will be the admin's user_id in practice
        type: 'quote_requested',
        title: 'Quote Request',
        message: `Client has requested a quote for invoice ${invoice!.invoice_number}`,
        metadata: { invoice_id: invoice!.id },
      })

      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Quote request sent to admin')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to request quote')
    },
  })

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const handleDownloadPDF = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
        body: { invoice_id: id },
      })

      if (error) throw error

      // For HTML format, create a new window to print/save as PDF
      if (data.format === 'html') {
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(data.pdf)
          printWindow.document.close()
          printWindow.print()
        }
      } else {
        // If actual PDF bytes, create blob and download
        const blob = new Blob([data.pdf], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${invoice?.invoice_number}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      toast.error('Failed to download PDF')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-zinc-100">Invoice Details</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-400">Error Loading Invoice</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : 'Invoice not found'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Payment Status Messages */}
      {paymentStatus === 'success' && (
        <Card className="bg-emerald-500/10 border-emerald-500/20">
          <CardContent className="pt-6">
            <p className="text-emerald-400 font-medium">Payment successful! Thank you.</p>
          </CardContent>
        </Card>
      )}
      {paymentStatus === 'cancelled' && (
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="pt-6">
            <p className="text-amber-400 font-medium">
              Payment was cancelled. You can try again anytime.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/billing')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-zinc-100">Invoice {invoice.invoice_number}</h1>
            <p className="text-zinc-400 mt-1">
              Created {new Date(invoice.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          {(invoice.status === 'sent' ||
            invoice.status === 'draft' ||
            invoice.status === 'partially_paid') && (
            <PayInvoiceButton invoice={invoice} />
          )}
        </div>
      </div>

      {/* Invoice Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400 mb-1">Status</p>
              <Badge className={statusColors[invoice.status] || statusColors.draft}>
                {invoice.status.replace('_', ' ')}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-zinc-400 mb-1">Total Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(invoice.total)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-zinc-400">Invoice Number</p>
              <p className="font-medium">{invoice.invoice_number}</p>
            </div>
            {invoice.due_date && (
              <div>
                <p className="text-sm text-zinc-400">Due Date</p>
                <p className="font-medium">{new Date(invoice.due_date).toLocaleDateString()}</p>
              </div>
            )}
            {invoice.notes && (
              <div>
                <p className="text-sm text-zinc-400">Notes</p>
                <p className="font-medium">{invoice.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Totals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-400">Subtotal:</span>
              <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.discount_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-zinc-400">Discount:</span>
                <span className="font-medium text-red-400">
                  -{formatCurrency(invoice.discount_amount)}
                </span>
              </div>
            )}
            {invoice.tax_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-zinc-400">Tax:</span>
                <span className="font-medium">{formatCurrency(invoice.tax_amount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-zinc-800">
              <span className="font-semibold">Total:</span>
              <span className="text-xl font-bold">{formatCurrency(invoice.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
          <CardDescription>{invoice.line_items.length} item(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.line_items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment History */}
      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>{payments.length} payment(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {payment.paid_at
                        ? new Date(payment.paid_at).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          payment.status === 'succeeded'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : payment.status === 'failed'
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-amber-500/10 text-amber-400'
                        }
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.status === 'succeeded' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              const { data, error } = await supabase.functions.invoke(
                                'generate-receipt-pdf',
                                {
                                  body: { payment_id: payment.id },
                                }
                              )
                              if (error) throw error
                              if (data.format === 'html') {
                                const printWindow = window.open('', '_blank')
                                if (printWindow) {
                                  printWindow.document.write(data.pdf)
                                  printWindow.document.close()
                                  printWindow.print()
                                }
                              }
                            } catch (error) {
                              toast.error('Failed to download receipt')
                            }
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Receipt
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => requestQuoteMutation.mutate()}
            disabled={requestQuoteMutation.isPending}
          >
            <Mail className="h-4 w-4 mr-2" />
            Request Quote
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

