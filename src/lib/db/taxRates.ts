/**
 * Database helper functions for tax_rates table
 * Task Group 4: Database Functions & Types
 */

import { supabase } from '@/lib/supabase'
import type {
  TaxRate,
  CreateTaxRateInput,
  UpdateTaxRateInput,
} from './types/invoices'

/**
 * Get all tax rates
 */
export async function getAllTaxRates(): Promise<TaxRate[]> {
  const { data, error } = await supabase
    .from('tax_rates')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    throw new Error(`Failed to get tax rates: ${error.message}`)
  }

  return data as TaxRate[]
}

/**
 * Get active tax rates only
 */
export async function getActiveTaxRates(): Promise<TaxRate[]> {
  const { data, error } = await supabase
    .from('tax_rates')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) {
    throw new Error(`Failed to get active tax rates: ${error.message}`)
  }

  return data as TaxRate[]
}

/**
 * Create a new tax rate
 */
export async function createTaxRate(data: CreateTaxRateInput): Promise<TaxRate> {
  if (!data.name || data.rate === undefined) {
    throw new Error('Name and rate are required')
  }

  const { data: taxRate, error } = await supabase
    .from('tax_rates')
    .insert({
      name: data.name,
      rate: data.rate,
      country: data.country || null,
      state: data.state || null,
      is_active: data.is_active ?? true,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create tax rate: ${error.message}`)
  }

  return taxRate as TaxRate
}

/**
 * Update a tax rate
 */
export async function updateTaxRate(
  id: string,
  updates: UpdateTaxRateInput
): Promise<TaxRate> {
  const { data, error } = await supabase
    .from('tax_rates')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Tax rate not found')
    }
    throw new Error(`Failed to update tax rate: ${error.message}`)
  }

  return data as TaxRate
}

/**
 * Delete a tax rate
 */
export async function deleteTaxRate(id: string): Promise<void> {
  const { error } = await supabase.from('tax_rates').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete tax rate: ${error.message}`)
  }
}

