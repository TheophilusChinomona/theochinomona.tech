/**
 * PayInvoiceButton component
 * Handles payment initiation for invoices via Stripe Checkout
 * Task Group 6: Payment Processing Flow
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCheckoutSession } from '@/lib/api/payments'
import { toast } from 'sonner'
import type { Invoice } from '@/lib/db/types/invoices'

interface PayInvoiceButtonProps {
  invoice: Invoice
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

export function PayInvoiceButton({ invoice, variant = 'default', size = 'default' }: PayInvoiceButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState<string>('')
  const [isPartialPayment, setIsPartialPayment] = useState(false)
  const navigate = useNavigate()

  const invoiceTotal = invoice.total / 100 // Convert cents to dollars
  const remainingAmount = invoiceTotal

  const handlePayNow = async () => {
    setIsLoading(true)

    try {
      // Determine payment amount
      let amount: number | undefined
      if (isPartialPayment && paymentAmount) {
        const amountInDollars = parseFloat(paymentAmount)
        if (isNaN(amountInDollars) || amountInDollars <= 0) {
          toast.error('Please enter a valid payment amount')
          setIsLoading(false)
          return
        }
        if (amountInDollars > invoiceTotal) {
          toast.error('Payment amount cannot exceed invoice total')
          setIsLoading(false)
          return
        }
        amount = Math.round(amountInDollars * 100) // Convert to cents
      }

      // Create checkout session
      const baseUrl = window.location.origin
      const { url } = await createCheckoutSession({
        invoice_id: invoice.id,
        amount,
        success_url: `${baseUrl}/dashboard/billing/${invoice.id}?payment=success`,
        cancel_url: `${baseUrl}/dashboard/billing/${invoice.id}?payment=cancelled`,
      })

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to initiate payment')
      setIsLoading(false)
    }
  }

  // Don't show button if invoice is already paid or cancelled
  if (invoice.status === 'paid' || invoice.status === 'cancelled') {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <CreditCard className="h-4 w-4" />
          Pay Now
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pay Invoice</DialogTitle>
          <DialogDescription>
            Invoice {invoice.invoice_number} - ${invoiceTotal.toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="full-payment"
              checked={!isPartialPayment}
              onChange={() => {
                setIsPartialPayment(false)
                setPaymentAmount('')
              }}
              className="h-4 w-4"
            />
            <Label htmlFor="full-payment" className="cursor-pointer">
              Pay full amount: ${invoiceTotal.toFixed(2)}
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="partial-payment"
              checked={isPartialPayment}
              onChange={() => setIsPartialPayment(true)}
              className="h-4 w-4"
            />
            <Label htmlFor="partial-payment" className="cursor-pointer">
              Make partial payment
            </Label>
          </div>

          {isPartialPayment && (
            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount</Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                max={invoiceTotal}
                step="0.01"
                placeholder="0.00"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Remaining balance: ${(invoiceTotal - (parseFloat(paymentAmount) || 0)).toFixed(2)}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handlePayNow} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Continue to Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

