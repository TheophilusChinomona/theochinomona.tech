/**
 * Admin Process Refund Page
 * Task Group 8: Admin Refund & Tax Management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { getInvoiceWithLineItems } from '@/lib/db/invoices'
import { getPaymentsForInvoice } from '@/lib/db/payments'
import { createRefund, updateRefundStatus } from '@/lib/db/refunds'
import { updatePaymentStatus } from '@/lib/db/payments'
import { updateInvoiceStatus } from '@/lib/db/invoices'
import RefundForm from '@/components/admin/RefundForm'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export default function ProcessRefundPage() {
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
    queryFn: () => (id ? getPaymentsForInvoice(id!) : []),
    enabled: !!id,
  })

  const processRefundMutation = useMutation({
    mutationFn: async ({
      paymentId,
      amount,
      reason,
    }: {
      paymentId: string
      amount: number
      reason: string
    }) => {
      // Get payment to find Stripe charge ID
      const payment = payments.find((p) => p.id === paymentId)
      if (!payment || !payment.stripe_charge_id) {
        throw new Error('Payment or Stripe charge ID not found')
      }

      // Process refund via Stripe API (via Edge Function)
      const { data, error } = await supabase.functions.invoke('process-refund', {
        body: {
          charge_id: payment.stripe_charge_id,
          amount,
          reason,
        },
      })

      if (error) throw new Error(error.message || 'Failed to process refund')

      const stripeRefundId = data.refund_id

      // Create refund record
      const refund = await createRefund({
        payment_id: paymentId,
        invoice_id: id!,
        amount,
        reason,
        stripe_refund_id: stripeRefundId,
        status: 'succeeded',
      })

      // Update payment status
      const newPaymentStatus = amount >= payment.amount ? 'refunded' : 'partially_refunded'
      await updatePaymentStatus(paymentId, newPaymentStatus)

      // Update invoice status
      await updateInvoiceStatus(id!, 'refunded')

      // Create notification for client
      await supabase.from('notifications').insert({
        user_id: invoice!.client_id,
        type: 'refund_processed',
        title: 'Refund Processed',
        message: `Refund of $${(amount / 100).toFixed(2)} has been processed for invoice ${invoice!.invoice_number}.`,
        metadata: { invoice_id: id, refund_id: refund.id, amount },
      })

      // Log activity
      await supabase.from('activity_log').insert({
        user_id: invoice!.client_id,
        event_type: 'refund_processed',
        event_data: {
          invoice_id: id,
          payment_id: paymentId,
          refund_id: refund.id,
          amount,
        },
      })

      return refund
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] })
      queryClient.invalidateQueries({ queryKey: ['payments', id] })
      queryClient.invalidateQueries({ queryKey: ['refunds', id] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Refund processed successfully')
      navigate(`/admin/invoices/${id}`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to process refund')
    },
  })

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
        <h1 className="text-3xl font-bold text-zinc-100">Process Refund</h1>
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

  // Get the first successful payment (for now, we'll refund the first payment)
  const paymentToRefund = payments.find((p) => p.status === 'succeeded')

  if (!paymentToRefund) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-zinc-100">Process Refund</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-amber-400">No Payment Found</CardTitle>
            <CardDescription>
              There are no successful payments to refund for this invoice.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (data: { amount: number; reason: string }) => {
    await processRefundMutation.mutateAsync({
      paymentId: paymentToRefund.id,
      amount: data.amount,
      reason: data.reason,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Process Refund</h1>
        <p className="text-zinc-400 mt-1">Process refund for invoice {invoice.invoice_number}</p>
      </div>

      <RefundForm
        payment={paymentToRefund}
        invoiceTotal={invoice.total}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/admin/invoices/${id}`)}
        isSubmitting={processRefundMutation.isPending}
      />
    </div>
  )
}

