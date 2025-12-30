
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateInvoiceStatus, createInvoice } from './invoices'
import { updatePaymentStatus } from './payments'
import { createRefund } from './refunds'
import * as notificationsDb from './notifications'
import * as activityLogDb from './activityLog'
import { supabase } from '@/lib/supabase'

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(),
        })),
        single: vi.fn(),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  },
}))

// Mock notification and activity log helpers
vi.mock('./notifications', () => ({
  createNotification: vi.fn(),
}))

vi.mock('./activityLog', () => ({
  logActivity: vi.fn(),
}))

describe('Payment Notifications & Activity Logging', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Invoice Notifications', () => {
    it('should create notification and log activity when invoice is sent', async () => {
      const mockInvoice = {
        id: 'invoice-123',
        client_id: 'user-123',
        project_id: 'project-123',
        status: 'sent',
        invoice_number: 'INV-001',
        total: 5000,
        currency: 'usd',
      }

      // Mock updateInvoiceStatus response
      const mockSupabaseUpdate = {
        data: mockInvoice,
        error: null,
      } as any

      // Setup the mock chain for supabase update
      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockSupabaseUpdate),
          }),
        }),
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: updateMock,
      } as any)
      
      // Also need to mock getInvoiceById since updateInvoiceStatus might use it or we might need it for context
      // Actually updateInvoiceStatus just updates. But we need to make sure we pass the right args.

      await updateInvoiceStatus('invoice-123', 'sent')

      // Check notification creation
      expect(notificationsDb.createNotification).toHaveBeenCalledWith(
        'user-123',
        'invoice_sent',
        expect.stringContaining('Invoice Sent'),
        expect.stringContaining('INV-001'),
        expect.objectContaining({
          invoice_id: 'invoice-123',
          project_id: 'project-123',
        })
      )

      // Check activity logging
      expect(activityLogDb.logActivity).toHaveBeenCalledWith(
        'project-123',
        'invoice_sent',
        expect.objectContaining({
          invoice_id: 'invoice-123',
          invoice_number: 'INV-001',
        }),
        undefined // user_id is optional/undefined in this context usually
      )
    })
    
    it('should log activity when invoice is created', async () => {
       const mockInvoice = {
        id: 'invoice-new',
        client_id: 'user-123',
        project_id: 'project-123',
        status: 'draft',
        invoice_number: 'INV-NEW',
        total: 1000
      }
      
      // Mock createInvoice response
      vi.mocked(supabase.from).mockReturnValue({
         insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockInvoice, error: null })
            })
         })
      } as any)

      await createInvoice({
          client_id: 'user-123',
          invoice_number: 'INV-NEW',
          line_items: [{ description: 'Test', quantity: 1, unit_price: 1000, total: 1000 }],
          subtotal: 1000,
          total: 1000,
          project_id: 'project-123'
      })

      expect(activityLogDb.logActivity).toHaveBeenCalledWith(
        'project-123',
        'invoice_created',
        expect.objectContaining({
            invoice_id: 'invoice-new',
            invoice_number: 'INV-NEW',
            total: 1000
        }),
        undefined
      )
    })
  })

  describe('Payment Notifications', () => {
    it('should create notification and log activity when payment is received', async () => {
      const mockPayment = {
        id: 'payment-123',
        invoice_id: 'invoice-123',
        amount: 5000,
        currency: 'usd',
        status: 'succeeded',
      }
      
      // Mock getting the invoice to get client_id and project_id
      const mockInvoice = {
          id: 'invoice-123',
          client_id: 'user-123',
          project_id: 'project-123',
          invoice_number: 'INV-001'
      }

      // We need to mock getInvoiceById behavior inside updatePaymentStatus or wherever it's called
      // If updatePaymentStatus doesn't fetch invoice, we might need to modify it to do so or rely on the caller.
      // Assuming updatePaymentStatus will be modified to fetch invoice details to send notification.
      
      const selectMock = vi.fn().mockImplementation((table) => {
          if (table === 'invoices') {
              return {
                  select: vi.fn().mockReturnValue({
                      eq: vi.fn().mockReturnValue({
                          single: vi.fn().mockResolvedValue({ data: mockInvoice, error: null })
                      })
                  })
              }
          }
          return {
             update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                   select: vi.fn().mockReturnValue({
                      single: vi.fn().mockResolvedValue({ data: mockPayment, error: null })
                   })
                })
             }),
             select: vi.fn().mockReturnValue({
                 eq: vi.fn().mockReturnValue({
                     single: vi.fn().mockResolvedValue({ data: mockPayment, error: null }) // for getPaymentById if needed
                 })
             })
          }
      })

      vi.mocked(supabase.from).mockImplementation(selectMock as any)

      await updatePaymentStatus('payment-123', 'succeeded')

      expect(notificationsDb.createNotification).toHaveBeenCalledWith(
        'user-123',
        'payment_received',
        expect.stringContaining('Payment Received'),
        expect.any(String),
        expect.objectContaining({
            payment_id: 'payment-123',
            invoice_id: 'invoice-123'
        })
      )

      expect(activityLogDb.logActivity).toHaveBeenCalledWith(
        'project-123',
        'payment_received',
        expect.objectContaining({
            payment_id: 'payment-123',
            amount: 5000
        }),
        undefined
      )
    })

    it('should create notification when payment fails', async () => {
      const mockPayment = {
        id: 'payment-fail',
        invoice_id: 'invoice-123',
        amount: 5000,
        status: 'failed',
      }
      
       const mockInvoice = {
          id: 'invoice-123',
          client_id: 'user-123',
          project_id: 'project-123',
          invoice_number: 'INV-001'
      }

       const selectMock = vi.fn().mockImplementation((table) => {
          if (table === 'invoices') {
              return {
                  select: vi.fn().mockReturnValue({
                      eq: vi.fn().mockReturnValue({
                          single: vi.fn().mockResolvedValue({ data: mockInvoice, error: null })
                      })
                  })
              }
          }
          return {
             update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                   select: vi.fn().mockReturnValue({
                      single: vi.fn().mockResolvedValue({ data: mockPayment, error: null })
                   })
                })
             })
          }
      })

      vi.mocked(supabase.from).mockImplementation(selectMock as any)

      await updatePaymentStatus('payment-fail', 'failed')

      expect(notificationsDb.createNotification).toHaveBeenCalledWith(
        'user-123',
        'payment_failed',
        expect.stringContaining('Payment Failed'),
        expect.any(String),
        expect.objectContaining({
            payment_id: 'payment-fail',
            invoice_id: 'invoice-123'
        })
      )
      
      // Should NOT log activity for failed payment (per requirements, or at least typical)
      // Spec says "Payment failed creates notification". Doesn't explicitly say activity log.
      // But 11.3 says "Update payment operations to log 'payment_received' events". 
      // It doesn't mention payment_failed for activity log.
      expect(activityLogDb.logActivity).not.toHaveBeenCalledWith(
        expect.anything(),
        'payment_failed',
        expect.anything(),
        expect.anything()
      )
    })
  })

  describe('Refund Notifications', () => {
    it('should create notification and log activity when refund is processed', async () => {
       const mockRefund = {
        id: 'refund-123',
        payment_id: 'payment-123',
        invoice_id: 'invoice-123',
        amount: 1000,
        status: 'succeeded'
      }
      
      const mockInvoice = {
          id: 'invoice-123',
          client_id: 'user-123',
          project_id: 'project-123',
          invoice_number: 'INV-001'
      }

       const selectMock = vi.fn().mockImplementation((table) => {
          if (table === 'invoices') {
              return {
                  select: vi.fn().mockReturnValue({
                      eq: vi.fn().mockReturnValue({
                          single: vi.fn().mockResolvedValue({ data: mockInvoice, error: null })
                      })
                  })
              }
          }
          return {
             insert: vi.fn().mockReturnValue({
                 select: vi.fn().mockReturnValue({
                     single: vi.fn().mockResolvedValue({ data: mockRefund, error: null })
                 })
             })
          }
      })

      vi.mocked(supabase.from).mockImplementation(selectMock as any)

      await createRefund({
          invoice_id: 'invoice-123',
          payment_id: 'payment-123',
          amount: 1000,
          status: 'succeeded' // Assuming immediate success for test
      })

      expect(notificationsDb.createNotification).toHaveBeenCalledWith(
        'user-123',
        'refund_processed',
        expect.stringContaining('Refund Processed'),
        expect.any(String),
        expect.objectContaining({
            refund_id: 'refund-123',
            invoice_id: 'invoice-123'
        })
      )

      expect(activityLogDb.logActivity).toHaveBeenCalledWith(
        'project-123',
        'refund_processed',
        expect.objectContaining({
            refund_id: 'refund-123',
            amount: 1000,
            invoice_number: 'INV-001'
        }),
        undefined
      )
    })
  })
})
