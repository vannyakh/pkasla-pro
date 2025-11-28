'use client'

import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SubscriptionPlanTable } from '@/components/admin/plans/SubscriptionPlanTable'
import { SubscriptionPlanForm } from '@/components/admin/plans/SubscriptionPlanForm'
import { Spinner } from '@/components/ui/shadcn-io/spinner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  useSubscriptionPlans,
  useCreateSubscriptionPlan,
  useUpdateSubscriptionPlan,
  useDeleteSubscriptionPlan,
} from '@/hooks/api/useSubscriptionPlan'
import type { SubscriptionPlan, CreateSubscriptionPlanDto, UpdateSubscriptionPlanDto } from '@/types/subscription-plan'

export default function AdminPlansPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<string | null>(null)

  const { data: plans = [], isLoading } = useSubscriptionPlans(false)
  const createPlan = useCreateSubscriptionPlan()
  const updatePlan = useUpdateSubscriptionPlan()
  const deletePlan = useDeleteSubscriptionPlan()

  const handleCreate = () => {
    setEditingPlan(null)
    setShowForm(true)
  }

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    setPlanToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleFormSubmit = async (data: CreateSubscriptionPlanDto | UpdateSubscriptionPlanDto) => {
    try {
      if (editingPlan) {
        await updatePlan.mutateAsync({ id: editingPlan.id, data: data as UpdateSubscriptionPlanDto })
      } else {
        await createPlan.mutateAsync(data as CreateSubscriptionPlanDto)
      }
      setShowForm(false)
      setEditingPlan(null)
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Error saving plan:', error)
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingPlan(null)
  }

  const confirmDelete = async () => {
    if (!planToDelete) return

    try {
      await deletePlan.mutateAsync(planToDelete)
      setDeleteDialogOpen(false)
      setPlanToDelete(null)
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Error deleting plan:', error)
    }
  }

  const isSubmitting = createPlan.isPending || updatePlan.isPending

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
        <span className="ml-2 text-xs text-gray-600">Loading subscription plans...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-black">Subscription Plans</h1>
            <p className="text-xs text-gray-600 mt-1">
              Manage subscription plans and pricing
            </p>
          </div>
          <Button
            onClick={handleCreate}
            size="sm"
            className="h-9 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Create Plan
          </Button>
        </div>
      </div>

      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-black">
            All Plans ({plans.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {plans.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-xs text-gray-500 mb-4">No subscription plans found</p>
              <Button onClick={handleCreate} size="sm" variant="outline" className="h-9 text-xs">
                <Plus className="h-3 w-3 mr-1" />
                Create Your First Plan
              </Button>
            </div>
          ) : (
            <SubscriptionPlanTable
              plans={plans}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={deletePlan.isPending}
            />
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 border border-gray-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                {editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SubscriptionPlanForm
                plan={editingPlan || undefined}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                isSubmitting={isSubmitting}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subscription Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this subscription plan? This action cannot be undone.
              Users with active subscriptions to this plan may be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePlan.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deletePlan.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletePlan.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
