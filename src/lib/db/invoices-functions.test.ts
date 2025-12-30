/**
 * Tests for invoice database functions
 * Task Group 4: Database Functions & Types
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createInvoice,
  getInvoiceById,
  getInvoicesForClient,
  updateInvoiceStatus,
  getInvoiceWithLineItems,
  calculateInvoiceTotal,
  type CreateInvoiceInput,
} from './invoices'
import { supabase } from '@/lib/supabase'

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('Invoice Database Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createInvoice', () => {
    it('should create invoice with line items', async () => {
      const mockInvoiceData = {
        id: 'invoice-123',
        client_id: 'client-123',
        invoice_number: 'INV-001',
        status: 'draft',
        subtotal: 10000,
        discount_amount: 0,
        tax_amount: 0,
        total: 10000,
        currency: 'usd',
        created_at: '2025-12-30T00:00:00Z',
        updated_at: '2025-12-30T00:00:00Z',
      }

      const mockLineItemsData = [
        {
          id: 'line-1',
          invoice_id: 'invoice-123',
          description: 'Service 1',
          quantity: 1,
          unit_price: 10000,
          total: 10000,
          created_at: '2025-12-30T00:00:00Z',
        },
      ]

      let invoiceInsertCalled = false
      let lineItemsInsertCalled = false

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'invoices') {
          return {
            insert: vi.fn().mockImplementation(() => {
              invoiceInsertCalled = true
              return {
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                  data: mockInvoiceData,
                  error: null,
                }),
              }
            }),
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          } as any
        }
        if (table === 'invoice_line_items') {
          return {
            insert: vi.fn().mockImplementation(() => {
              lineItemsInsertCalled = true
              return {
                select: vi.fn().mockResolvedValue({
                  data: mockLineItemsData,
                  error: null,
                }),
              }
            }),
          } as any
        }
        return {} as any
      })

      const input: CreateInvoiceInput = {
        client_id: 'client-123',
        invoice_number: 'INV-001',
        subtotal: 10000,
        total: 10000,
        line_items: [
          {
            description: 'Service 1',
            unit_price: 10000,
            total: 10000,
          },
        ],
      }

      const result = await createInvoice(input)

      expect(invoiceInsertCalled).toBe(true)
      expect(lineItemsInsertCalled).toBe(true)
      expect(result.id).toBe('invoice-123')
      expect(result.line_items).toHaveLength(1)
      expect(result.line_items[0].description).toBe('Service 1')
    })
  })

  describe('getInvoicesForClient', () => {
    it('should return only client\'s invoices', async () => {
      const mockInvoices = [
        {
          id: 'invoice-1',
          client_id: 'client-123',
          invoice_number: 'INV-001',
          status: 'draft',
          subtotal: 10000,
          total: 10000,
        },
        {
          id: 'invoice-2',
          client_id: 'client-123',
          invoice_number: 'INV-002',
          status: 'sent',
          subtotal: 20000,
          total: 20000,
        },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({
        data: mockInvoices,
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({
        eq: mockEq,
      })
      mockEq.mockReturnValue({
        order: mockOrder,
      })

      const result = await getInvoicesForClient('client-123')

      expect(mockEq).toHaveBeenCalledWith('client_id', 'client-123')
      expect(result).toHaveLength(2)
      expect(result.every((inv) => inv.client_id === 'client-123')).toBe(true)
    })
  })

  describe('updateInvoiceStatus', () => {
    it('should update status correctly', async () => {
      const mockUpdatedInvoice = {
        id: 'invoice-123',
        status: 'sent',
        sent_at: '2025-12-30T12:00:00Z',
      }

      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockUpdatedInvoice,
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any)
      mockUpdate.mockReturnValue({
        eq: mockEq,
      })
      mockEq.mockReturnValue({
        select: mockSelect,
      })
      mockSelect.mockReturnValue({
        single: mockSingle,
      })

      const result = await updateInvoiceStatus('invoice-123', 'sent', {
        sent_at: '2025-12-30T12:00:00Z',
      })

      expect(mockEq).toHaveBeenCalledWith('id', 'invoice-123')
      expect(result.status).toBe('sent')
      expect(result.sent_at).toBe('2025-12-30T12:00:00Z')
    })
  })

  describe('getInvoiceWithLineItems', () => {
    it('should include all line items', async () => {
      const mockInvoiceWithLineItems = {
        id: 'invoice-123',
        client_id: 'client-123',
        invoice_number: 'INV-001',
        status: 'draft',
        subtotal: 10000,
        total: 10000,
        line_items: [
          {
            id: 'line-1',
            description: 'Service 1',
            quantity: 1,
            unit_price: 10000,
            total: 10000,
          },
          {
            id: 'line-2',
            description: 'Service 2',
            quantity: 2,
            unit_price: 5000,
            total: 10000,
          },
        ],
      }

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockInvoiceWithLineItems,
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({
        eq: mockEq,
      })
      mockEq.mockReturnValue({
        single: mockSingle,
      })

      const result = await getInvoiceWithLineItems('invoice-123')

      expect(result).not.toBeNull()
      if (result) {
        expect(result.line_items).toHaveLength(2)
        expect(result.line_items[0].description).toBe('Service 1')
        expect(result.line_items[1].description).toBe('Service 2')
      }
    })
  })

  describe('calculateInvoiceTotal', () => {
    it('should compute subtotal, discount, tax, total correctly', () => {
      const lineItems = [
        { total: 10000 }, // $100.00
        { total: 20000 }, // $200.00
      ]
      const discountAmount = 5000 // $50.00
      const taxRate = 8.5 // 8.5%

      const result = calculateInvoiceTotal(lineItems, discountAmount, taxRate)

      expect(result.subtotal).toBe(30000) // $300.00
      expect(result.discount_amount).toBe(5000) // $50.00
      // Tax on $250.00 (after discount) = $21.25 = 2125 cents
      expect(result.tax_amount).toBe(2125)
      // Total = $250.00 + $21.25 = $271.25 = 27125 cents
      expect(result.total).toBe(27125)
    })

    it('should handle zero discount and no tax', () => {
      const lineItems = [{ total: 10000 }]
      const result = calculateInvoiceTotal(lineItems, 0)

      expect(result.subtotal).toBe(10000)
      expect(result.discount_amount).toBe(0)
      expect(result.tax_amount).toBe(0)
      expect(result.total).toBe(10000)
    })
  })
})

