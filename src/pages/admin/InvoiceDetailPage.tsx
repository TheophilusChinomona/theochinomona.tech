/**
 * Admin Invoice Detail Page
 * Displays invoice details, line items, payment history, and refunds
 * Task Group 7: Admin Invoice Management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { Mail, Download, ArrowLeft, RefreshCw } from 'lucide-react'
import {
  getInvoiceWithLineItems,
  updateInvoiceStatus,
  type InvoiceWithLineItems,
} from '@/lib/db/invoices'
import { getPaymentsForInvoice } from '@/lib/db/payments'
import { getRefundsForInvoice } from '@/lib/db/refunds'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { supabase } from '@/lib/supabase'

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
  const navigate = useNavigate()
  const queryClient = useQueryClient()

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

  const { data: refunds = [] } = useQuery({
    queryKey: ['refunds', id],
    queryFn: () => (id ? getRefundsForInvoice(id) : []),
    enabled: !!id,
  })

  const sendInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      // Call Edge Function to send invoice email
      const { data, error } = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-invoice-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ invoice_id: invoiceId }),
        }
      ).then((res) => res.json())

      if (error) throw new Error(error.message || 'Failed to send invoice')

      // Update invoice status
      await updateInvoiceStatus(invoiceId, 'sent', {
        sent_at: new Date().toISOString(),
      })

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Invoice sent successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send invoice')
    },
  })

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
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

  const handleSendInvoice = () => {
    if (!id) return
    sendInvoiceMutation.mutate(id)
  }

  const handleDownloadPDF = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
        body: { invoice_id: id },
      })

      if (error) throw error

      // For HTML format, create a new window to print/save as PDF
      // In production, this would be actual PDF bytes
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
        a.download = `invoice-${invoice.invoice_number}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      toast.error('Failed to download PDF')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/invoices')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-zinc-100">Invoice {invoice.invoice_number}</h1>
            <p className="text-zinc-400 mt-1">
              Created {formatDistanceToNow(new Date(invoice.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {invoice.status === 'draft' && (
            <Button onClick={handleSendInvoice} disabled={sendInvoiceMutation.isPending}>
              <Mail className="h-4 w-4 mr-2" />
              {sendInvoiceMutation.isPending ? 'Sending...' : 'Send Invoice'}
            </Button>
          )}
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
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
            <div>
              <p className="text-sm text-zinc-400">Due Date</p>
              <p className="font-medium">
                {invoice.due_date
                  ? new Date(invoice.due_date).toLocaleDateString()
                  : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Currency</p>
              <p className="font-medium">{invoice.currency.toUpperCase()}</p>
            </div>
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
                  <TableHead>Payment Intent</TableHead>
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
                    <TableCell className="font-mono text-xs">
                      {payment.stripe_payment_intent_id || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Refunds */}
      {refunds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Refunds</CardTitle>
            <CardDescription>{refunds.length} refund(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refunds.map((refund) => (
                  <TableRow key={refund.id}>
                    <TableCell>
                      {new Date(refund.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(refund.amount)}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          refund.status === 'succeeded'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : refund.status === 'failed'
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-amber-500/10 text-amber-400'
                        }
                      >
                        {refund.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{refund.reason || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {invoice.status === 'paid' && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/invoices/${id}/refund`)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Process Refund
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

