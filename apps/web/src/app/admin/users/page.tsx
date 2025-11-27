"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UsersTable } from "@/components/admin/users/Table";
import {
  useAdminUsers,
  useUpdateUserStatus,
  useUpdateUserRole,
  type UserListFilters,
} from "@/hooks/api/useAdmin";
import { useAdminStore } from "@/store/admin";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

export default function AdminUsersPage() {
  const {
    filters,
    setPage,
    setSearch,
    setRoleFilter,
    setStatusFilter,
  } = useAdminStore();

  // Local search term for debouncing
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, setSearch]);

  // Build filters for React Query
  const queryFilters: UserListFilters = useMemo(() => {
    const filter: UserListFilters = {
      page: filters.page,
      limit: filters.limit,
    };
    if (filters.search) filter.search = filters.search;
    if (filters.role) filter.role = filters.role;
    if (filters.status) filter.status = filters.status;
    return filter;
  }, [filters]);

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
    isRefetching,
  } = useAdminUsers(queryFilters);
  const updateStatusMutation = useUpdateUserStatus();
  const updateRoleMutation = useUpdateUserRole();

  const handleStatusChange = async (
    userId: string,
    status: "active" | "pending" | "suspended"
  ) => {
    try {
      await updateStatusMutation.mutateAsync({ userId, status });
    } catch (error) {
      console.error("Failed to update user status:", error);
    }
  };

  const handleRoleChange = async (userId: string, role: "admin" | "user") => {
    try {
      await updateRoleMutation.mutateAsync({ userId, role });
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  // Calculate pagination from API response
  const totalPages = data?.total
    ? Math.ceil(data.total / (data.pageSize || filters.limit))
    : 0;
  const currentPage = data?.page || filters.page;
  const pageSize = data?.pageSize || filters.limit;
  const hasNextPage = data ? currentPage * pageSize < data.total : false;
  const hasPrevPage = data ? currentPage > 1 : false;

  // Determine loading state (initial load vs refetch)
  const isInitialLoading = isLoading && !data;
  const isTableLoading = isFetching || isRefetching;

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-semibold text-black">
          User Management
        </h1>
        <p className="text-xs text-gray-600 mt-1">
          View and manage all registered users in the system
        </p>
      </div>

      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Select
                  value={filters.role || "all"}
                  onValueChange={setRoleFilter}
                  disabled={isTableLoading}
                >
                  <SelectTrigger className="w-full sm:w-40 h-9 text-xs">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.status || "all"}
                  onValueChange={setStatusFilter}
                  disabled={isTableLoading}
                >
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
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isInitialLoading ? (
            <div className="flex items-center justify-center py-12">
             <Spinner />
              <span className="ml-2 text-xs text-gray-600">
                Loading users...
              </span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-xs text-red-600 mb-4">
                {error instanceof Error
                  ? error.message
                  : "Failed to load users"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="text-xs h-8"
                disabled={isTableLoading}
              >
                Retry
              </Button>
            </div>
          ) : (
            <UsersTable
              data={data}
              isLoading={isTableLoading}
              onStatusChange={handleStatusChange}
              onRoleChange={handleRoleChange}
              isUpdatingStatus={updateStatusMutation.isPending}
              isUpdatingRole={updateRoleMutation.isPending}
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              hasNextPage={hasNextPage}
              hasPrevPage={hasPrevPage}
              onPageChange={handlePageChange}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
