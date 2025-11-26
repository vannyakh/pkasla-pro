"use client";

import React, { useState, useMemo } from "react";
import { Search, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/hooks/api/useAdmin";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const limit = 20;

  // Debounce search term
  const [debouncedSearch, setDebouncedSearch] = useState("");
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page when search changes
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Build filters
  const filters = useMemo(() => {
    const filter: {
      page: number;
      limit: number;
      search?: string;
      role?: string;
      status?: string;
    } = {
      page,
      limit,
    };
    if (debouncedSearch) filter.search = debouncedSearch;
    if (roleFilter !== "all") filter.role = roleFilter;
    if (statusFilter !== "all") filter.status = statusFilter;
    return filter;
  }, [page, debouncedSearch, roleFilter, statusFilter]);

  const { data, isLoading, error, refetch } = useAdminUsers(filters);
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

  // Calculate pagination from new API structure
  const totalPages = data?.total
    ? Math.ceil(data.total / (data.pageSize || limit))
    : 0;
  const currentPage = data?.page || page;
  const pageSize = data?.pageSize || limit;
  const hasNextPage = data ? currentPage * pageSize < data.total : false;
  const hasPrevPage = data ? currentPage > 1 : false;

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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
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
              >
                Retry
              </Button>
            </div>
          ) : (
            <UsersTable
              data={data}
              isLoading={isLoading}
              onStatusChange={handleStatusChange}
              onRoleChange={handleRoleChange}
              isUpdatingStatus={updateStatusMutation.isPending}
              isUpdatingRole={updateRoleMutation.isPending}
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              hasNextPage={hasNextPage}
              hasPrevPage={hasPrevPage}
              onPageChange={setPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
