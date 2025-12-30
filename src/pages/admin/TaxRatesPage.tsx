/**
 * Admin Tax Rates Management Page
 * Task Group 8: Admin Refund & Tax Management
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react'
import {
  getAllTaxRates,
  createTaxRate,
  updateTaxRate,
  deleteTaxRate,
} from '@/lib/db/taxRates'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import type { TaxRate, CreateTaxRateInput, UpdateTaxRateInput } from '@/lib/db/types/invoices'

const taxRateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  rate: z.number().min(0, 'Rate must be greater than or equal to 0').max(100, 'Rate cannot exceed 100'),
  country: z.string().optional(),
  state: z.string().optional(),
  is_active: z.boolean().default(true),
})

type TaxRateFormData = z.infer<typeof taxRateSchema>

export default function TaxRatesPage() {
  const [editingTaxRate, setEditingTaxRate] = useState<TaxRate | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const queryClient = useQueryClient()

  const {
    data: taxRates,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['tax-rates'],
    queryFn: getAllTaxRates,
  })

  const form = useForm<TaxRateFormData>({
    resolver: zodResolver(taxRateSchema) as any,
    defaultValues: {
      name: '',
      rate: 0,
      country: '',
      state: '',
      is_active: true,
    },
  })

  const createMutation = useMutation({
    mutationFn: createTaxRate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-rates'] })
      toast.success('Tax rate created successfully')
      setIsDialogOpen(false)
      form.reset()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create tax rate')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaxRateInput }) =>
      updateTaxRate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-rates'] })
      toast.success('Tax rate updated successfully')
      setIsDialogOpen(false)
      setEditingTaxRate(null)
      form.reset()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update tax rate')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTaxRate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-rates'] })
      toast.success('Tax rate deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete tax rate')
    },
  })

  const handleOpenCreate = () => {
    setEditingTaxRate(null)
    form.reset({
      name: '',
      rate: 0,
      country: '',
      state: '',
      is_active: true,
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (taxRate: TaxRate) => {
    setEditingTaxRate(taxRate)
    form.reset({
      name: taxRate.name,
      rate: taxRate.rate,
      country: taxRate.country || '',
      state: taxRate.state || '',
      is_active: taxRate.is_active,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (data: TaxRateFormData) => {
    const taxRateData: CreateTaxRateInput | UpdateTaxRateInput = {
      name: data.name,
      rate: data.rate,
      country: data.country || null,
      state: data.state || null,
      is_active: data.is_active,
    }

    if (editingTaxRate) {
      await updateMutation.mutateAsync({ id: editingTaxRate.id, data: taxRateData })
    } else {
      await createMutation.mutateAsync(taxRateData as CreateTaxRateInput)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this tax rate?')) {
      deleteMutation.mutate(id)
    }
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-zinc-100">Tax Rates</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-400">Error Loading Tax Rates</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : 'An error occurred'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Tax Rates</h1>
          <p className="text-zinc-400 mt-1">Manage tax rates for invoices</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Tax Rate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <DialogHeader>
                <DialogTitle>
                  {editingTaxRate ? 'Edit Tax Rate' : 'Create Tax Rate'}
                </DialogTitle>
                <DialogDescription>
                  {editingTaxRate
                    ? 'Update tax rate information'
                    : 'Add a new tax rate for invoice calculations'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" {...form.register('name')} />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate">Rate (%) *</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    {...form.register('rate', { valueAsNumber: true })}
                  />
                  {form.formState.errors.rate && (
                    <p className="text-sm text-red-500">{form.formState.errors.rate.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" {...form.register('country')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" {...form.register('state')} />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    {...form.register('is_active')}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Active
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingTaxRate ? (
                    'Update'
                  ) : (
                    'Create'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tax Rates Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tax Rates</CardTitle>
          <CardDescription>
            {taxRates?.length ?? 0} tax rate{taxRates?.length !== 1 ? 's' : ''} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : taxRates && taxRates.length > 0 ? (
            <div className="rounded-md border border-zinc-800">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxRates.map((taxRate) => (
                    <TableRow key={taxRate.id}>
                      <TableCell className="font-medium">{taxRate.name}</TableCell>
                      <TableCell>{taxRate.rate}%</TableCell>
                      <TableCell>
                        {taxRate.country || taxRate.state
                          ? `${taxRate.country || ''}${taxRate.country && taxRate.state ? ', ' : ''}${taxRate.state || ''}`
                          : 'Global'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            taxRate.is_active
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-zinc-700 text-zinc-300'
                          }
                        >
                          {taxRate.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(taxRate)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(taxRate.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-zinc-400 mb-4">No tax rates configured</p>
              <Button onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create Tax Rate
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

