'use client'

import React, { use, useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  Edit,
  Receipt,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DataTable } from '@/components/ui/data-table'
import { type ColumnDef } from '@tanstack/react-table'
import { useEvent } from '@/hooks/api/useEvent'
import { useGiftsByEvent } from '@/hooks/api/useGift'
import { format } from 'date-fns'
import Empty from '@/components/Empty'

interface Expense {
  id: string
  category: string
  description: string
  amount: number
  expectedAmount?: number // Budgeted/full price
  currency: 'USD' | 'KHR'
  date: string
  notes?: string
}

interface ExpensePageProps {
  params: Promise<{ eventId: string }>
}

const EXPENSE_CATEGORIES = [
  'Venue & Catering',
  'Decoration',
  'Entertainment',
  'Photography',
  'Transportation',
  'Invitations',
  'Gifts & Favors',
  'Other'
]

export default function ExpensePage({ params }: ExpensePageProps) {
  const resolvedParams = use(params)
  const { eventId } = resolvedParams
  const router = useRouter()

  // Fetch data
  const { data: event, isLoading: eventLoading } = useEvent(eventId)
  const { data: gifts = [], isLoading: giftsLoading } = useGiftsByEvent(eventId)

  // Load expenses from localStorage - use lazy initial state
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    if (typeof window !== 'undefined') {
      const storedExpenses = localStorage.getItem(`expenses_${eventId}`)
      if (storedExpenses) {
        try {
          return JSON.parse(storedExpenses)
        } catch {
          return []
        }
      }
    }
    return []
  })

  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [expenseForm, setExpenseForm] = useState({
    category: '',
    customCategory: '',
    description: '',
    expectedAmount: '',
    amount: '',
    currency: 'USD' as 'USD' | 'KHR',
    notes: ''
  })

  // Calculate totals
  const { totalContributions, totalExpenses, netBalance, expensesByCategory } = useMemo(() => {
    // Contributions
    const contributionsUsd = gifts
      .filter((g) => g.currency === 'usd')
      .reduce((sum, g) => sum + g.amount, 0)
    
    const contributionsKhr = gifts
      .filter((g) => g.currency === 'khr')
      .reduce((sum, g) => sum + g.amount, 0)
    
    const totalContributionsUsd = contributionsUsd + (contributionsKhr / 4000)

    // Expenses
    const expensesUsd = expenses
      .filter((e) => e.currency === 'USD')
      .reduce((sum, e) => sum + e.amount, 0)
    
    const expensesKhr = expenses
      .filter((e) => e.currency === 'KHR')
      .reduce((sum, e) => sum + e.amount, 0)

    const totalExpensesUsd = expensesUsd + (expensesKhr / 4000)

    // Net balance
    const netBalanceUsd = totalContributionsUsd - totalExpensesUsd

    // Group by category
    const byCategory = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = {
          count: 0,
          totalUsd: 0,
          totalKhr: 0
        }
      }
      acc[expense.category].count++
      if (expense.currency === 'USD') {
        acc[expense.category].totalUsd += expense.amount
      } else {
        acc[expense.category].totalKhr += expense.amount
      }
      return acc
    }, {} as Record<string, { count: number; totalUsd: number; totalKhr: number }>)

    return {
      totalContributions: {
        usd: contributionsUsd,
        khr: contributionsKhr,
        total: totalContributionsUsd
      },
      totalExpenses: {
        usd: expensesUsd,
        khr: expensesKhr,
        total: totalExpensesUsd
      },
      netBalance: netBalanceUsd,
      expensesByCategory: byCategory
    }
  }, [gifts, expenses])

  // Handle add/edit expense
  const handleSaveExpense = () => {
    // Determine the final category
    const finalCategory = expenseForm.category === 'Other' && expenseForm.customCategory.trim()
      ? expenseForm.customCategory.trim()
      : expenseForm.category

    if (!finalCategory || !expenseForm.description || !expenseForm.amount) {
      alert('Please fill in all required fields')
      return
    }

    const amount = parseFloat(expenseForm.amount)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid actual amount')
      return
    }

    // Parse expected amount if provided
    let expectedAmount: number | undefined
    if (expenseForm.expectedAmount.trim()) {
      expectedAmount = parseFloat(expenseForm.expectedAmount)
      if (isNaN(expectedAmount) || expectedAmount <= 0) {
        alert('Please enter a valid expected amount')
        return
      }
    }

    let updatedExpenses: Expense[]

    if (editingExpense) {
      updatedExpenses = expenses.map((e) => 
        e.id === editingExpense.id 
          ? {
              ...e,
              category: finalCategory,
              description: expenseForm.description,
              amount,
              expectedAmount,
              currency: expenseForm.currency,
              notes: expenseForm.notes
            }
          : e
      )
    } else {
      const newExpense: Expense = {
        id: `expense_${Date.now()}`,
        category: finalCategory,
        description: expenseForm.description,
        amount,
        expectedAmount,
        currency: expenseForm.currency,
        date: new Date().toISOString(),
        notes: expenseForm.notes
      }
      updatedExpenses = [...expenses, newExpense]
    }

    setExpenses(updatedExpenses)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`expenses_${eventId}`, JSON.stringify(updatedExpenses))
    }

    setExpenseForm({
      category: '',
      customCategory: '',
      description: '',
      expectedAmount: '',
      amount: '',
      currency: 'USD',
      notes: ''
    })
    setEditingExpense(null)
    setIsExpenseDialogOpen(false)
  }

  // Handle edit expense
  const handleEditExpense = useCallback((expense: Expense) => {
    setEditingExpense(expense)
    
    // Check if the expense category is one of the predefined categories
    const isPredefinedCategory = EXPENSE_CATEGORIES.includes(expense.category)
    
    setExpenseForm({
      category: isPredefinedCategory ? expense.category : 'Other',
      customCategory: isPredefinedCategory ? '' : expense.category,
      description: expense.description,
      expectedAmount: expense.expectedAmount ? expense.expectedAmount.toString() : '',
      amount: expense.amount.toString(),
      currency: expense.currency,
      notes: expense.notes || ''
    })
    setIsExpenseDialogOpen(true)
  }, [])

  // Handle delete expense
  const handleDeleteExpense = useCallback((id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      setExpenses((prevExpenses) => {
        const updatedExpenses = prevExpenses.filter((e) => e.id !== id)
        if (typeof window !== 'undefined') {
          localStorage.setItem(`expenses_${eventId}`, JSON.stringify(updatedExpenses))
        }
        return updatedExpenses
      })
    }
  }, [eventId])

  // Reset expense form when dialog closes
  const handleDialogClose = (open: boolean) => {
    setIsExpenseDialogOpen(open)
    if (!open) {
      setExpenseForm({
        category: '',
        customCategory: '',
        description: '',
        expectedAmount: '',
        amount: '',
        currency: 'USD',
        notes: ''
      })
      setEditingExpense(null)
    }
  }

  // Calculate budget performance
  const calculateBudgetPerformance = useCallback((expense: Expense) => {
    if (!expense.expectedAmount) return null
    
    const percentage = (expense.amount / expense.expectedAmount) * 100
    const difference = expense.amount - expense.expectedAmount
    const isUnderBudget = expense.amount <= expense.expectedAmount
    
    return {
      percentage: percentage.toFixed(1),
      difference: Math.abs(difference),
      isUnderBudget
    }
  }, [])

  const formatCurrency = useCallback((amount: number, currency: 'USD' | 'KHR') => {
    if (currency === 'USD') {
      return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return `${amount.toLocaleString()} ៛`
  }, [])

  // Define table columns
  const columns = useMemo<ColumnDef<Expense>[]>(
    () => [
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
              <Receipt className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">{row.original.description}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span>{format(new Date(row.original.date), 'MMM dd, yyyy')}</span>
                {row.original.notes && <span>• {row.original.notes}</span>}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs">
            {row.original.category}
          </Badge>
        ),
      },
      {
        accessorKey: 'expectedAmount',
        header: 'Budget',
        cell: ({ row }) => {
          if (!row.original.expectedAmount) {
            return <span className="text-muted-foreground text-sm">—</span>
          }
          return (
            <span className="text-sm text-muted-foreground">
              {formatCurrency(row.original.expectedAmount, row.original.currency)}
            </span>
          )
        },
      },
      {
        accessorKey: 'amount',
        header: 'Actual Amount',
        cell: ({ row }) => {
          const performance = calculateBudgetPerformance(row.original)
          return (
            <div className="flex flex-col items-end gap-1">
              <p className="font-semibold text-sm text-red-600">
                {formatCurrency(row.original.amount, row.original.currency)}
              </p>
              {row.original.expectedAmount && performance && (
                <Badge 
                  variant={performance.isUnderBudget ? "default" : "destructive"}
                  className={`text-xs ${performance.isUnderBudget ? 'bg-green-500' : 'bg-red-500'}`}
                >
                  {performance.percentage}% • {performance.isUnderBudget ? 'Saved' : 'Over'} {formatCurrency(performance.difference, row.original.currency)}
                </Badge>
              )}
            </div>
          )
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleEditExpense(row.original)}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              onClick={() => handleDeleteExpense(row.original.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [handleEditExpense, handleDeleteExpense, formatCurrency, calculateBudgetPerformance]
  )

  const isLoading = eventLoading || giftsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading expenses...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/financial')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Financial Dashboard
        </Button>
        <Empty
          title="Event Not Found"
          description="The event you're looking for doesn't exist or has been removed."
          size="lg"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Button
            variant="ghost"
            onClick={() => router.push(`/dashboard/financial/${eventId}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Financial Details
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Expense Tracking</h1>
            <p className="text-muted-foreground mt-2">
              {event.title} • {format(new Date(event.date), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
        <Button onClick={() => setIsExpenseDialogOpen(true)} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Contributions */}
        <Card className="border border-gray-200 p-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Contributions</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalContributions.total, 'USD')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  From gifts received
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card className="border border-gray-200 p-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalExpenses.total, 'USD')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {expenses.length} expenses recorded
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Net Balance */}
        <Card className="border border-gray-200 p-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Net Balance</p>
                <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(netBalance), 'USD')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {netBalance >= 0 ? 'Surplus' : 'Deficit'}
                </p>
              </div>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${netBalance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <DollarSign className={`h-6 w-6 ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card className="border border-gray-200 p-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Categories</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Object.keys(expensesByCategory).length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Expense categories used
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses List */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">All Expenses</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Track and manage all event expenses
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={expenses}
            searchKey="description"
            searchPlaceholder="Search expenses..."
            enableFiltering={true}
            enableSorting={true}
            enablePagination={true}
            enableColumnVisibility={false}
            enableExport={true}
            exportOptions={{
              filename: `expenses-${eventId}`,
              formats: ['csv', 'json'],
            }}
            emptyMessage="No expenses recorded yet. Start tracking your event expenses for better budget management."
            pageSize={10}
            maxHeight="600px"
          />
        </CardContent>
      </Card>

      {/* Expense Dialog */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </DialogTitle>
            <DialogDescription>
              Record an expense for this event. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={expenseForm.category}
                onValueChange={(value) => setExpenseForm({ ...expenseForm, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Category Input - Shows when "Other" is selected */}
            {expenseForm.category === 'Other' && (
              <div className="space-y-2">
                <Label htmlFor="customCategory">Custom Category Name *</Label>
                <Input
                  id="customCategory"
                  placeholder="e.g., Venue Setup, Makeup & Hair"
                  value={expenseForm.customCategory}
                  onChange={(e) => setExpenseForm({ ...expenseForm, customCategory: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Enter a custom category name for this expense
                </p>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                placeholder="e.g., Wedding venue deposit"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              />
            </div>

            {/* Expected Amount (Budget) */}
            <div className="space-y-2">
              <Label htmlFor="expectedAmount">Expected/Budgeted Amount (Optional)</Label>
              <Input
                id="expectedAmount"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={expenseForm.expectedAmount}
                onChange={(e) => setExpenseForm({ ...expenseForm, expectedAmount: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Enter the budgeted amount to track savings or overspending
              </p>
            </div>

            {/* Actual Amount and Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Actual Amount Paid *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Currency *</Label>
                <Select
                  value={expenseForm.currency}
                  onValueChange={(value: 'USD' | 'KHR') => setExpenseForm({ ...expenseForm, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="KHR">KHR (៛)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes..."
                rows={3}
                value={expenseForm.notes}
                onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleDialogClose(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveExpense}>
              {editingExpense ? 'Update Expense' : 'Add Expense'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
