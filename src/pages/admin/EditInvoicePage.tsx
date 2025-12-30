/**
 * Admin Edit Invoice Page
 * Task Group 7: Admin Invoice Management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { getInvoiceWithLineItems, updateInvoice } from '@/lib/db/invoices'
import InvoiceForm from '@/components/admin/InvoiceForm'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import type { UpdateInvoiceInput } from '@/lib/db/types/invoices'

export default function EditInvoicePage() {
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

  const updateInvoiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInvoiceInput }) =>
      updateInvoice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoice', id] })
      toast.success('Invoice updated successfully')
      navigate(`/admin/invoices/${id}`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update invoice')
    },
  })

  const handleSubmit = async (data: UpdateInvoiceInput) => {
    if (!id) return
    await updateInvoiceMutation.mutateAsync({ id, data })
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
        <h1 className="text-3xl font-bold text-zinc-100">Edit Invoice</h1>
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

  if (invoice.status !== 'draft') {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-zinc-100">Edit Invoice</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-amber-400">Cannot Edit Invoice</CardTitle>
            <CardDescription>
              Only draft invoices can be edited. This invoice has status: {invoice.status}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => navigate(`/admin/invoices/${id}`)}
              className="text-indigo-400 hover:text-indigo-300"
            >
              View Invoice Details
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Convert invoice data to form format
  const formData = {
    ...invoice,
    line_items: invoice.line_items.map((item) => ({
      ...item,
      quantity: item.quantity,
      unit_price: item.unit_price / 100, // Convert from cents
      total: item.total / 100, // Convert from cents
    })),
    discount_amount: invoice.discount_amount / 100, // Convert from cents
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Edit Invoice</h1>
        <p className="text-zinc-400 mt-1">Edit invoice {invoice.invoice_number}</p>
      </div>

      <InvoiceForm
        invoice={invoice}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/admin/invoices/${id}`)}
        isSubmitting={updateInvoiceMutation.isPending}
      />
    </div>
  )
}

