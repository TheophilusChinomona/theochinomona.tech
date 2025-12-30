/**
 * Refund Form Component
 * Form for processing refunds on payments
 * Task Group 8: Admin Refund & Tax Management
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { Payment } from '@/lib/db/types/invoices'

const refundFormSchema = z.object({
  refund_type: z.enum(['full', 'partial']),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  reason: z.string().min(1, 'Reason is required'),
  confirm: z.boolean().refine((val) => val === true, {
    message: 'You must confirm this refund',
  }),
})

type RefundFormData = z.infer<typeof refundFormSchema>

interface RefundFormProps {
  payment: Payment
  invoiceTotal: number // Total invoice amount in cents
  onSubmit: (data: { amount: number; reason: string }) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
}

const REFUND_REASONS = [
  'Customer request',
  'Duplicate payment',
  'Fraudulent transaction',
  'Service not provided',
  'Other',
]

export default function RefundForm({
  payment,
  invoiceTotal: _invoiceTotal,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: RefundFormProps) {
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full')

  const paymentAmount = payment.amount / 100 // Convert to dollars
  const maxRefundAmount = paymentAmount

  const form = useForm<RefundFormData>({
    resolver: zodResolver(refundFormSchema),
    defaultValues: {
      refund_type: 'full',
      amount: paymentAmount,
      reason: '',
      confirm: false,
    },
  })

  const handleSubmit = async (data: RefundFormData) => {
    const refundAmount = Math.round(data.amount * 100) // Convert to cents
    await onSubmit({
      amount: refundAmount,
      reason: data.reason,
    })
  }

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Process Refund</CardTitle>
          <CardDescription>
            Refund payment for invoice. Original payment: {formatCurrency(payment.amount)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This action will process a refund through Stripe. The refund will be processed
              immediately and cannot be undone.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Refund Type</Label>
            <Select
              value={refundType}
              onValueChange={(value: 'full' | 'partial') => {
                setRefundType(value)
                form.setValue('refund_type', value)
                if (value === 'full') {
                  form.setValue('amount', paymentAmount)
                } else {
                  form.setValue('amount', 0)
                }
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Refund ({formatCurrency(payment.amount)})</SelectItem>
                <SelectItem value="partial">Partial Refund</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {refundType === 'partial' && (
            <div className="space-y-2">
              <Label htmlFor="amount">Refund Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={maxRefundAmount}
                {...form.register('amount', {
                  valueAsNumber: true,
                  validate: (value) => {
                    if (value <= 0) return 'Amount must be greater than 0'
                    if (value > maxRefundAmount)
                      return `Amount cannot exceed ${formatCurrency(payment.amount)}`
                    return true
                  },
                })}
                disabled={isSubmitting}
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Maximum refund: {formatCurrency(payment.amount)}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Select
              value={form.watch('reason')}
              onValueChange={(value) => form.setValue('reason', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REFUND_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.reason && (
              <p className="text-sm text-red-500">{form.formState.errors.reason.message}</p>
            )}
          </div>

          {form.watch('reason') === 'Other' && (
            <div className="space-y-2">
              <Label htmlFor="reason_details">Additional Details</Label>
              <Textarea
                id="reason_details"
                {...form.register('reason')}
                placeholder="Please provide additional details..."
                disabled={isSubmitting}
                rows={3}
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="confirm"
              {...form.register('confirm')}
              disabled={isSubmitting}
              className="h-4 w-4"
            />
            <Label htmlFor="confirm" className="cursor-pointer">
              I confirm that I want to process this refund
            </Label>
          </div>
          {form.formState.errors.confirm && (
            <p className="text-sm text-red-500">{form.formState.errors.confirm.message}</p>
          )}

          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Refund Amount:</span>
              <span>{formatCurrency(Math.round((form.watch('amount') || 0) * 100))}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="destructive" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Process Refund'
          )}
        </Button>
      </div>
    </form>
  )
}

