/**
 * Invoice Form Component
 * Reusable form component for creating and editing invoices
 * Task Group 7: Admin Invoice Management
 */

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Plus, Loader2, Calculator } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { getClientUsers } from '@/lib/db/users'
import { getAllProjects } from '@/lib/db/projects'
import { getPhasesByProjectId } from '@/lib/db/phases'
import { getTasksByPhaseIds } from '@/lib/db/tasks'
import { getActiveTaxRates } from '@/lib/db/taxRates'
import { calculateInvoiceTotal } from '@/lib/db/invoices'
import { generateInvoiceNumber } from '@/lib/db/invoices'
import type {
  Invoice,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  CreateInvoiceLineItemInput,
} from '@/lib/db/types/invoices'
import type { ProjectPhase } from '@/lib/db/tracking'
import type { ProjectTask } from '@/lib/db/tracking'

const invoiceFormSchema = z
  .object({
    client_id: z.string().min(1, 'Client is required'),
    project_id: z.string().optional(),
    invoice_number: z.string().min(1, 'Invoice number is required'),
    due_date: z.string().optional(),
    notes: z.string().optional(),
    line_items: z
      .array(
        z.object({
          description: z.string().min(1, 'Description is required'),
          quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
          unit_price: z.number().min(0, 'Unit price must be greater than or equal to 0'),
          total: z.number().min(0, 'Total must be greater than or equal to 0'),
          phase_id: z.string().optional().nullable(),
          task_id: z.string().optional().nullable(),
        })
      )
      .min(1, 'At least one line item is required'),
    discount_amount: z.number().min(0, 'Discount cannot be negative').default(0),
    tax_rate_id: z.string().optional(),
    is_recurring: z.boolean().default(false),
    recurring_interval: z.enum(['month', 'year']).optional(),
  })
  .refine(
    (data) => {
      // If is_recurring is true, recurring_interval must be provided
      if (data.is_recurring && !data.recurring_interval) {
        return false
      }
      return true
    },
    {
      message: 'Billing interval is required for recurring payments',
      path: ['recurring_interval'],
    }
  )

type InvoiceFormData = z.infer<typeof invoiceFormSchema>

interface InvoiceFormProps {
  invoice?: Invoice
  onSubmit: (data: CreateInvoiceInput | UpdateInvoiceInput) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
}

export default function InvoiceForm({
  invoice,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: InvoiceFormProps) {
  const [autoPopulated, setAutoPopulated] = useState(false)
  const [invoiceNumber, setInvoiceNumber] = useState('')

  // Fetch clients, projects, and tax rates
  const { data: clients = [] } = useQuery({
    queryKey: ['client-users'],
    queryFn: getClientUsers,
  })

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: getAllProjects,
  })

  const { data: taxRates = [] } = useQuery({
    queryKey: ['tax-rates'],
    queryFn: getActiveTaxRates,
  })

  // Fetch phases when project is selected
  const selectedProjectId = form.watch('project_id')
  const { data: phases = [] } = useQuery({
    queryKey: ['phases', selectedProjectId],
    queryFn: () => (selectedProjectId ? getPhasesByProjectId(selectedProjectId) : []),
    enabled: !!selectedProjectId,
  })

  // Fetch tasks when phases are available
  const phaseIds = phases.map((p) => p.id)
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', phaseIds],
    queryFn: () => (phaseIds.length > 0 ? getTasksByPhaseIds(phaseIds) : []),
    enabled: phaseIds.length > 0,
  })

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      client_id: invoice?.client_id || '',
      project_id: invoice?.project_id || '',
      invoice_number: invoice?.invoice_number || '',
      due_date: invoice?.due_date || '',
      notes: invoice?.notes || '',
      line_items: invoice
        ? []
        : [
            {
              description: '',
              quantity: 1,
              unit_price: 0,
              total: 0,
              phase_id: null,
              task_id: null,
            },
          ],
      discount_amount: invoice ? invoice.discount_amount / 100 : 0,
      tax_rate_id: '',
      is_recurring: false,
      recurring_interval: undefined,
    },
  })

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'line_items',
  })

  const selectedTaxRateId = form.watch('tax_rate_id')
  const selectedTaxRate = taxRates.find((tr) => tr.id === selectedTaxRateId)
  const discountAmount = form.watch('discount_amount') || 0
  const lineItems = form.watch('line_items')

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + (item.total || 0), 0)
  const discountCents = Math.round(discountAmount * 100)
  const taxAmount = selectedTaxRate
    ? Math.round((subtotal - discountCents) * (selectedTaxRate.rate / 100))
    : 0
  const total = subtotal - discountCents + taxAmount

  // Generate invoice number on mount if creating new invoice
  useEffect(() => {
    if (!invoice && !invoiceNumber) {
      generateInvoiceNumber().then((num) => {
        setInvoiceNumber(num)
        form.setValue('invoice_number', num)
      })
    }
  }, [invoice, invoiceNumber, form])

  // Auto-populate line items from project phases/tasks
  const handleAutoPopulate = () => {
    if (!selectedProjectId || phases.length === 0) {
      return
    }

    const newLineItems: CreateInvoiceLineItemInput[] = []

    // Add phases with estimated_cost
    phases.forEach((phase: ProjectPhase) => {
      if (phase.estimated_cost && phase.estimated_cost > 0) {
        newLineItems.push({
          description: `Phase: ${phase.name}`,
          quantity: 1,
          unit_price: phase.estimated_cost / 100, // Convert from cents to dollars
          total: phase.estimated_cost / 100, // Convert from cents to dollars
          phase_id: phase.id,
          task_id: null,
        })
      }
    })

    // Add tasks with estimated_cost
    tasks.forEach((task: ProjectTask) => {
      if (task.estimated_cost && task.estimated_cost > 0) {
        const phase = phases.find((p) => p.id === task.phase_id)
        newLineItems.push({
          description: `Task: ${task.name}${phase ? ` (${phase.name})` : ''}`,
          quantity: 1,
          unit_price: task.estimated_cost / 100, // Convert from cents to dollars
          total: task.estimated_cost / 100, // Convert from cents to dollars
          phase_id: task.phase_id,
          task_id: task.id,
        })
      }
    })

    if (newLineItems.length > 0) {
      // Replace existing line items
      form.setValue('line_items', newLineItems)
      setAutoPopulated(true)
    }
  }

  // Update line item total when quantity or unit_price changes
  const updateLineItemTotal = (index: number) => {
    const item = lineItems[index]
    if (item) {
      const total = Math.round(item.quantity * item.unit_price)
      update(index, { ...item, total })
    }
  }

  const handleSubmit = async (data: InvoiceFormData) => {
    const lineItemsData: CreateInvoiceLineItemInput[] = data.line_items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unit_price: Math.round(item.unit_price * 100), // Convert to cents
      total: Math.round(item.total * 100), // Convert to cents
      phase_id: item.phase_id || null,
      task_id: item.task_id || null,
    }))

    const invoiceData = {
      client_id: data.client_id,
      project_id: data.project_id || null,
      invoice_number: data.invoice_number,
      subtotal: Math.round(subtotal * 100), // Convert to cents
      discount_amount: discountCents,
      tax_amount: taxAmount,
      total: Math.round(total * 100), // Convert to cents
      currency: 'usd',
      due_date: data.due_date || null,
      notes: data.notes || null,
      line_items: lineItemsData,
      status: invoice?.status || 'draft',
      is_recurring: data.is_recurring || false,
      recurring_interval: data.recurring_interval,
    }

    await onSubmit(invoiceData as CreateInvoiceInput | UpdateInvoiceInput)
  }

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
          <CardDescription>Enter basic invoice information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_id">Client *</Label>
              <Select
                value={form.watch('client_id')}
                onValueChange={(value) => form.setValue('client_id', value)}
                disabled={!!invoice || isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} {client.surname} ({client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.client_id && (
                <p className="text-sm text-red-500">{form.formState.errors.client_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_id">Project (Optional)</Label>
              <Select
                value={form.watch('project_id') || ''}
                onValueChange={(value) => {
                  form.setValue('project_id', value || undefined)
                  setAutoPopulated(false)
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No project</SelectItem>
                  {projects
                    .filter((p) => p.client_id === form.watch('client_id'))
                    .map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice_number">Invoice Number *</Label>
              <Input
                id="invoice_number"
                {...form.register('invoice_number')}
                disabled={!!invoice || isSubmitting}
              />
              {form.formState.errors.invoice_number && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.invoice_number.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                {...form.register('due_date')}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...form.register('notes')}
              placeholder="Additional notes for the invoice..."
              disabled={isSubmitting}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Line Items</CardTitle>
              <CardDescription>Add items to this invoice</CardDescription>
            </div>
            {selectedProjectId && phases.length > 0 && !autoPopulated && (
              <Button
                type="button"
                variant="outline"
                onClick={handleAutoPopulate}
                disabled={isSubmitting}
              >
                <Calculator className="mr-2 h-4 w-4" />
                Auto-populate from Project
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg">
              <div className="col-span-12 md:col-span-5 space-y-2">
                <Label>Description *</Label>
                <Input
                  {...form.register(`line_items.${index}.description`)}
                  placeholder="Item description"
                  disabled={isSubmitting}
                />
              </div>
              <div className="col-span-4 md:col-span-2 space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...form.register(`line_items.${index}.quantity`, {
                    valueAsNumber: true,
                    onChange: () => updateLineItemTotal(index),
                  })}
                  disabled={isSubmitting}
                />
              </div>
              <div className="col-span-4 md:col-span-2 space-y-2">
                <Label>Unit Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...form.register(`line_items.${index}.unit_price`, {
                    valueAsNumber: true,
                    onChange: () => updateLineItemTotal(index),
                  })}
                  disabled={isSubmitting}
                />
              </div>
              <div className="col-span-3 md:col-span-2 space-y-2">
                <Label>Total ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...form.register(`line_items.${index}.total`, {
                    valueAsNumber: true,
                  })}
                  disabled={isSubmitting}
                  readOnly
                />
              </div>
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1 || isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                description: '',
                quantity: 1,
                unit_price: 0,
                total: 0,
                phase_id: null,
                task_id: null,
              })
            }
            disabled={isSubmitting}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Line Item
          </Button>

          {form.formState.errors.line_items && (
            <p className="text-sm text-red-500">
              {form.formState.errors.line_items.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardHeader>
          <CardTitle>Totals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount_amount">Discount Amount ($)</Label>
              <Input
                id="discount_amount"
                type="number"
                step="0.01"
                min="0"
                {...form.register('discount_amount', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_rate_id">Tax Rate</Label>
              <Select
                value={form.watch('tax_rate_id') || ''}
                onValueChange={(value) => form.setValue('tax_rate_id', value || undefined)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No tax" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No tax</SelectItem>
                  {taxRates.map((rate) => (
                    <SelectItem key={rate.id} value={rate.id}>
                      {rate.name} ({rate.rate}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Recurring Payment Options */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_recurring">Recurring Payment</Label>
                <p className="text-sm text-muted-foreground">
                  Set up automatic recurring billing for this invoice
                </p>
              </div>
              <Switch
                id="is_recurring"
                checked={form.watch('is_recurring')}
                onCheckedChange={(checked) => {
                  form.setValue('is_recurring', checked)
                  if (!checked) {
                    form.setValue('recurring_interval', undefined)
                  }
                }}
                disabled={isSubmitting || !!invoice}
              />
            </div>
            {form.watch('is_recurring') && (
              <div className="space-y-2">
                <Label htmlFor="recurring_interval">Billing Interval *</Label>
                <Select
                  value={form.watch('recurring_interval') || ''}
                  onValueChange={(value) =>
                    form.setValue('recurring_interval', value as 'month' | 'year')
                  }
                  disabled={isSubmitting || !!invoice}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Monthly</SelectItem>
                    <SelectItem value="year">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.recurring_interval && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.recurring_interval.message}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">{formatCurrency(Math.round(subtotal * 100))}</span>
            </div>
            {discountCents > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount:</span>
                <span className="font-medium text-red-500">
                  -{formatCurrency(discountCents)}
                </span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Tax ({selectedTaxRate?.rate}%):
                </span>
                <span className="font-medium">{formatCurrency(taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total:</span>
              <span>{formatCurrency(Math.round(total * 100))}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : invoice ? (
            'Update Invoice'
          ) : (
            'Create Invoice'
          )}
        </Button>
      </div>
    </form>
  )
}

