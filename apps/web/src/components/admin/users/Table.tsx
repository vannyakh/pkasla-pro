'use client'

import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
import type { UserRole, UserStatus } from '@/types'
import type { UserListResponse } from '@/hooks/api/useAdmin'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface UsersTableProps {
  data?: UserListResponse
  isLoading?: boolean
  onStatusChange: (userId: string, status: UserStatus) => Promise<void>
  onRoleChange: (userId: string, role: UserRole) => Promise<void>
  isUpdatingStatus?: boolean
  isUpdatingRole?: boolean
  currentPage: number
  totalPages: number
  pageSize: number
  hasNextPage: boolean
  hasPrevPage: boolean
  onPageChange: (page: number) => void
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function UsersTable({
  data,
  isLoading = false,
  onStatusChange,
  onRoleChange,
  isUpdatingStatus = false,
  isUpdatingRole = false,
  currentPage,
  totalPages,
  pageSize,
  hasNextPage,
  hasPrevPage,
  onPageChange,
}: UsersTableProps) {
  const users = data?.items || []

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200">
              <TableHead className="text-xs font-semibold text-black">No</TableHead>
              <TableHead className="text-xs font-semibold text-black">Avatar</TableHead>
              <TableHead className="text-xs font-semibold text-black">Name</TableHead>
              <TableHead className="text-xs font-semibold text-black">Email</TableHead>
              <TableHead className="text-xs font-semibold text-black">Role</TableHead>
              <TableHead className="text-xs font-semibold text-black">Status</TableHead>
              <TableHead className="text-xs font-semibold text-black">Provider</TableHead>
              <TableHead className="text-xs font-semibold text-black">Registered</TableHead>
              <TableHead className="text-xs font-semibold text-black">Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-xs text-gray-500">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, index) => {
                const userId = user.id
                const userRole = user.role || 'user'
                const userStatus = user.status || 'active'
                const userName = user.name || 'N/A'
                const userEmail = user.email || 'N/A'
                const createdAt = user.createdAt
                const updatedAt = user.updatedAt
                const userProvider = user.provider || 'N/A'
                const rowIndex = (currentPage - 1) * pageSize + index + 1
                return (
                  <TableRow key={userId} className="border-gray-200">
                    <TableCell className="text-xs text-black font-medium">
                      {rowIndex}
                    </TableCell>
                    <TableCell className="text-xs text-black font-medium">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
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
                          onRoleChange(userId, value as UserRole)
                        }
                        disabled={isUpdatingRole || isLoading}
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
                          onStatusChange(userId, value as UserStatus)
                        }
                        disabled={isUpdatingStatus || isLoading}
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
                      {userProvider}
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
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, data.total)} of {data.total} users
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
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
              onClick={() => onPageChange(currentPage + 1)}
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
  )
}

