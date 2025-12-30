/**
 * Admin Create Invoice Page
 * Task Group 7: Admin Invoice Management
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { createInvoice } from '@/lib/db/invoices'
import InvoiceForm from '@/components/admin/InvoiceForm'
import { createSubscription } from '@/lib/api/payments'
import { toast } from 'sonner'
import type { CreateInvoiceInput } from '@/lib/db/types/invoices'

export default function CreateInvoicePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const createInvoiceMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Invoice created successfully')
      navigate(`/admin/invoices/${data.id}`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create invoice')
    },
  })

  const handleSubmit = async (data: CreateInvoiceInput) => {
    // Create the invoice first
    const invoice = await createInvoiceMutation.mutateAsync(data)

    // If it's a recurring invoice, create the subscription
    if (data.is_recurring && data.recurring_interval) {
      try {
        await createSubscription({
          invoice_id: invoice.id,
          interval: data.recurring_interval,
        })
        toast.success('Recurring subscription created successfully')
        queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      } catch (error) {
        console.error('Failed to create subscription:', error)
        toast.error('Invoice created but subscription setup failed. Please create subscription manually.')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Create Invoice</h1>
        <p className="text-zinc-400 mt-1">Create a new invoice for a client</p>
      </div>

      <InvoiceForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/admin/invoices')}
        isSubmitting={createInvoiceMutation.isPending}
      />
    </div>
  )
}

