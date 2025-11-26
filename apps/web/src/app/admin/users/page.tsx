'use client'

import React, { useState, useMemo } from 'react'
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAdminUsers, useUpdateUserStatus, useUpdateUserRole } from '@/hooks/api/useAdmin'

export default function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const limit = 20

  // Debounce search term
  const [debouncedSearch, setDebouncedSearch] = useState('')
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1) // Reset to first page when search changes
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Build filters
  const filters = useMemo(() => {
    const filter: {
      page: number
      limit: number
      search?: string
      role?: string
      status?: string
    } = {
      page,
      limit,
    }
    if (debouncedSearch) filter.search = debouncedSearch
    if (roleFilter !== 'all') filter.role = roleFilter
    if (statusFilter !== 'all') filter.status = statusFilter
    return filter
  }, [page, debouncedSearch, roleFilter, statusFilter])

  const { data, isLoading, error, refetch } = useAdminUsers(filters)
  const updateStatusMutation = useUpdateUserStatus()
  const updateRoleMutation = useUpdateUserRole()

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleStatusChange = async (userId: string, status: 'active' | 'pending' | 'suspended') => {
    try {
      await updateStatusMutation.mutateAsync({ userId, status })
    } catch (error) {
      console.error('Failed to update user status:', error)
    }
  }

  const handleRoleChange = async (userId: string, role: 'admin' | 'user') => {
    try {
      await updateRoleMutation.mutateAsync({ userId, role })
    } catch (error) {
      console.error('Failed to update user role:', error)
    }
  }

  // Calculate pagination from new API structure
  const totalPages = data?.total ? Math.ceil(data.total / (data.pageSize || limit)) : 0
  const currentPage = data?.page || page
  const pageSize = data?.pageSize || limit
  const hasNextPage = data ? currentPage * pageSize < data.total : false
  const hasPrevPage = data ? currentPage > 1 : false

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-semibold text-black">User Management</h1>
        <p className="text-xs text-gray-600 mt-1">View and manage all registered users in the system</p>
      </div>

      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-sm font-semibold text-black">
                All Users {data?.total ? `(${data.total})` : ''}
              </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9 text-xs border-gray-200"
              />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-40 h-9 text-xs">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 h-9 text-xs">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-xs text-gray-600">Loading users...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-xs text-red-600 mb-4">
                {error instanceof Error ? error.message : 'Failed to load users'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="text-xs h-8"
              >
                Retry
              </Button>
            </div>
          ) : (
            <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="text-xs font-semibold text-black">Name</TableHead>
                  <TableHead className="text-xs font-semibold text-black">Email</TableHead>
                  <TableHead className="text-xs font-semibold text-black">Role</TableHead>
                      <TableHead className="text-xs font-semibold text-black">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-black">Registered</TableHead>
                  <TableHead className="text-xs font-semibold text-black">Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                    {!data?.items || data.items.length === 0 ? (
                  <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-xs text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                      data.items.map((user) => {
                        const userId = user.id
                        const userRole = user.role || 'user'
                        const userStatus = user.status || 'active'
                        const userName = user.name || 'N/A'
                        const userEmail = user.email || 'N/A'
                        const createdAt = user.createdAt
                        const updatedAt = user.updatedAt
                        
                        return (
                        <TableRow key={userId} className="border-gray-200">
                      <TableCell className="text-xs text-black font-medium">
                            {userName}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">
                            {userEmail}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={userRole}
                              onValueChange={(value) =>
                                handleRoleChange(userId, value as 'admin' | 'user')
                              }
                              disabled={updateRoleMutation.isPending}
                            >
                              <SelectTrigger className="w-24 h-6 text-xs border-gray-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                              </SelectContent>
                            </Select>
                      </TableCell>
                      <TableCell>
                            <Select
                              value={userStatus}
                              onValueChange={(value) =>
                                handleStatusChange(
                                  userId,
                                  value as 'active' | 'pending' | 'suspended'
                                )
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              <SelectTrigger className="w-28 h-6 text-xs border-gray-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                              </SelectContent>
                            </Select>
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">
                            {formatDate(createdAt)}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">
                            {formatDate(updatedAt)}
                      </TableCell>
                    </TableRow>
                        )
                      })
                )}
              </TableBody>
            </Table>
          </div>
              {data && data.total > 0 && (
                <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
                  <div className="text-xs text-gray-600">
                    Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, data.total)} of{' '}
                    {data.total} users
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={!hasPrevPage || isLoading}
                      className="h-8 text-xs"
                    >
                      <ChevronLeft className="h-3 w-3" />
                      Previous
                    </Button>
                    <span className="text-xs text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!hasNextPage || isLoading}
                      className="h-8 text-xs"
                    >
                      Next
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
