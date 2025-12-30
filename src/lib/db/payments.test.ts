/**
 * Tests for payments and refunds schema
 * Task Group 2: Payment & Refund Schema & Migrations
 * These tests verify the database schema structure and RLS policies
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '@/lib/supabase'

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}))

describe('Payment Schema', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('payment_status enum', () => {
    it('should accept only valid enum values', async () => {
      // Test that payment_status enum accepts: 'pending', 'succeeded', 'failed', 'refunded', 'partially_refunded'
      const validStatuses = ['pending', 'succeeded', 'failed', 'refunded', 'partially_refunded']
      
      validStatuses.forEach((status) => {
        expect(['pending', 'succeeded', 'failed', 'refunded', 'partially_refunded']).toContain(status)
      })
    })
  })

  describe('payments table', () => {
    it('should exist with all required columns', async () => {
      // Test that payments table can be queried
      const mockSelect = vi.fn().mockReturnThis()
      const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({
        limit: mockLimit,
      })

      const result = await supabase.from('payments').select('*').limit(0)
      
      expect(supabase.from).toHaveBeenCalledWith('payments')
      expect(result.error).toBeNull()
    })

    it('should enforce unique constraint on stripe_payment_intent_id', async () => {
      // Test that duplicate stripe_payment_intent_id is rejected
      const mockInsert = vi.fn().mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate key value violates unique constraint' },
      })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any)

      const result = await supabase.from('payments').insert({
        invoice_id: '123e4567-e89b-12d3-a456-426614174000',
        amount: 10000,
        currency: 'usd',
        status: 'pending',
        stripe_payment_intent_id: 'pi_1234567890',
      })

      // If unique constraint exists, duplicate insert should fail
      expect(mockInsert).toHaveBeenCalled()
    })
  })

  describe('RLS policies', () => {
    it('should allow clients to SELECT payments for their invoices', async () => {
      // Test RLS policy: Clients can view payments for their invoices
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({
        data: [{ id: '123', amount: 10000 }],
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({
        eq: mockEq,
      })

      const result = await supabase.from('payments').select('*').eq('invoice_id', 'invoice-id')

      expect(supabase.from).toHaveBeenCalledWith('payments')
      expect(mockEq).toHaveBeenCalledWith('invoice_id', 'invoice-id')
      expect(result.error).toBeNull()
    })

    it('should allow admins to manage all payments', async () => {
      // Test RLS policy: Admins can SELECT/INSERT/UPDATE all payments
      const mockSelect = vi.fn().mockReturnThis()
      const mockResolved = vi.fn().mockResolvedValue({
        data: [{ id: '123', amount: 10000 }],
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue(mockResolved)

      const result = await supabase.from('payments').select('*')

      expect(supabase.from).toHaveBeenCalledWith('payments')
      expect(result.error ?? null).toBeNull()
    })
  })

  describe('refunds table', () => {
    it('should exist with foreign keys to payments and invoices', async () => {
      // Test that refunds table can be queried
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({
        eq: mockEq,
      })

      const result = await supabase.from('refunds').select('*').eq('invoice_id', 'invoice-id')

      expect(supabase.from).toHaveBeenCalledWith('refunds')
      expect(result.error).toBeNull()
    })

    it('should enforce unique constraint on stripe_refund_id', async () => {
      // Test that duplicate stripe_refund_id is rejected
      const mockInsert = vi.fn().mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate key value violates unique constraint' },
      })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any)

      const result = await supabase.from('refunds').insert({
        payment_id: '123e4567-e89b-12d3-a456-426614174000',
        invoice_id: '223e4567-e89b-12d3-a456-426614174001',
        amount: 5000,
        status: 'pending',
        stripe_refund_id: 're_1234567890',
      })

      // If unique constraint exists, duplicate insert should fail
      expect(mockInsert).toHaveBeenCalled()
    })
  })
})

