'use client'

import React from 'react'
import { Users as UsersIcon, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { User } from '@/types/user'

// Sample users data - TODO: Replace with API call
const sampleUsers: User[] = [
  {
    id: '1',
    email: 'admin@pkasla.com',
    name: 'Admin User',
    role: 'admin',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'admin',
    createdAt: '2024-02-20T14:30:00Z',
    updatedAt: '2024-02-20T14:30:00Z',
  },
  {
    id: '3',
    email: 'sarah.smith@example.com',
    name: 'Sarah Smith',
    role: 'user',
    createdAt: '2024-03-10T09:15:00Z',
    updatedAt: '2024-03-10T09:15:00Z',
  },
  {
    id: '4',
    email: 'demo@pkasla.com',
    name: 'Demo User',
    role: 'admin',
    createdAt: '2024-03-25T11:45:00Z',
    updatedAt: '2024-03-25T11:45:00Z',
  },
  {
    id: '5',
    email: 'mary.johnson@example.com',
    name: 'Mary Johnson',
    role: 'user',
    createdAt: '2024-04-05T16:20:00Z',
    updatedAt: '2024-04-05T16:20:00Z',
  },
  {
    id: '6',
    email: 'david.brown@example.com',
    name: 'David Brown',
    role: 'user',
    createdAt: '2024-04-12T08:30:00Z',
    updatedAt: '2024-04-12T08:30:00Z',
  },
]

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [users] = React.useState<User[]>(sampleUsers)

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-semibold text-black">User Management</h1>
        <p className="text-xs text-gray-600 mt-1">View and manage all registered users in the system</p>
      </div>

      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-sm font-semibold text-black">All Users ({filteredUsers.length})</CardTitle>
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
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="text-xs font-semibold text-black">Name</TableHead>
                  <TableHead className="text-xs font-semibold text-black">Email</TableHead>
                  <TableHead className="text-xs font-semibold text-black">Role</TableHead>
                  <TableHead className="text-xs font-semibold text-black">Registered</TableHead>
                  <TableHead className="text-xs font-semibold text-black">Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-xs text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-gray-200">
                      <TableCell className="text-xs text-black font-medium">
                        {user.name}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.role === 'admin' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">
                        {formatDate(user.updatedAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
