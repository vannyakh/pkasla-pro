import { useState, useMemo } from 'react'
import type {
  PaymentLogListFilters,
  PaymentMethod,
  PaymentType,
  PaymentLogEventType,
  PaymentStatus,
} from '@/hooks/api/usePaymentLog'

interface UsePaymentLogFiltersOptions {
  itemsPerPage?: number
}

export function usePaymentLogFilters(options: UsePaymentLogFiltersOptions = {}) {
  const { itemsPerPage = 20 } = options

  const [searchTerm, setSearchTerm] = useState('')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all')
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<string>('all')
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Build filters for API
  const apiFilters = useMemo<PaymentLogListFilters>(() => {
    const filters: PaymentLogListFilters = {
      page: currentPage,
      limit: itemsPerPage,
    }

    if (paymentMethodFilter !== 'all') {
      filters.paymentMethod = paymentMethodFilter as PaymentMethod
    }

    if (paymentTypeFilter !== 'all') {
      filters.paymentType = paymentTypeFilter as PaymentType
    }

    if (eventTypeFilter !== 'all') {
      filters.eventType = eventTypeFilter as PaymentLogEventType
    }

    if (statusFilter !== 'all') {
      filters.status = statusFilter as PaymentStatus
    }

    if (searchTerm) {
      filters.search = searchTerm
    }

    return filters
  }, [currentPage, paymentMethodFilter, paymentTypeFilter, eventTypeFilter, statusFilter, searchTerm, itemsPerPage])

  // Handlers that reset to page 1
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    if (currentPage !== 1) setCurrentPage(1)
  }

  const handlePaymentMethodFilterChange = (value: string) => {
    setPaymentMethodFilter(value)
    if (currentPage !== 1) setCurrentPage(1)
  }

  const handlePaymentTypeFilterChange = (value: string) => {
    setPaymentTypeFilter(value)
    if (currentPage !== 1) setCurrentPage(1)
  }

  const handleEventTypeFilterChange = (value: string) => {
    setEventTypeFilter(value)
    if (currentPage !== 1) setCurrentPage(1)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    if (currentPage !== 1) setCurrentPage(1)
  }

  const resetFilters = () => {
    setSearchTerm('')
    setPaymentMethodFilter('all')
    setPaymentTypeFilter('all')
    setEventTypeFilter('all')
    setStatusFilter('all')
    setCurrentPage(1)
  }

  return {
    // State values
    searchTerm,
    paymentMethodFilter,
    paymentTypeFilter,
    eventTypeFilter,
    statusFilter,
    currentPage,
    
    // Setters
    setSearchTerm,
    setPaymentMethodFilter,
    setPaymentTypeFilter,
    setEventTypeFilter,
    setStatusFilter,
    setCurrentPage,
    
    // Smart handlers
    handleSearchChange,
    handlePaymentMethodFilterChange,
    handlePaymentTypeFilterChange,
    handleEventTypeFilterChange,
    handleStatusFilterChange,
    
    // Other utilities
    resetFilters,
    apiFilters,
  }
}

