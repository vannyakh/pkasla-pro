"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentLogTable } from "@/components/admin/payment-logs/PaymentLogTable";
import { PaymentLogToolbar } from "@/components/admin/payment-logs/PaymentLogToolbar";
import { PaymentLogDialog } from "@/components/admin/payment-logs/PaymentLogDialog";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { usePaymentLogs, type PaymentLog } from "@/hooks/api/usePaymentLog";
import { usePaymentLogFilters } from "@/hooks/usePaymentLogFilters";

const ITEMS_PER_PAGE = 20;

export default function AdminPaymentLogsPage() {
  const [selectedLog, setSelectedLog] = useState<PaymentLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Use custom hook for filter management
  const {
    searchTerm,
    paymentMethodFilter,
    paymentTypeFilter,
    eventTypeFilter,
    statusFilter,
    currentPage,
    handleSearchChange,
    handlePaymentMethodFilterChange,
    handlePaymentTypeFilterChange,
    handleEventTypeFilterChange,
    handleStatusFilterChange,
    setCurrentPage,
    apiFilters,
  } = usePaymentLogFilters({ itemsPerPage: ITEMS_PER_PAGE });

  // Fetch payment logs from API
  const { data: logsData, isLoading } = usePaymentLogs(apiFilters);

  const logs = logsData?.items || [];
  const totalItems = logsData?.total || 0;
  const totalPages = logsData?.totalPages || 0;
  const startIndex = logsData ? (logsData.page - 1) * logsData.limit : 0;

  const handleViewDetails = (log: PaymentLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  if (isLoading && !logsData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
        <span className="ml-2 text-xs text-gray-600">
          Loading payment logs...
        </span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col gap-2 mb-2">
          <h1 className="text-xl md:text-2xl font-semibold text-black">
            Payment Transaction Logs
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            Detailed view of all payment transactions and events
          </p>
        </div>
      </div>

      <Card className="border gap-0 border-gray-200">
        <CardHeader className="pb-3">
          <PaymentLogToolbar
            searchTerm={searchTerm}
            paymentMethodFilter={paymentMethodFilter}
            paymentTypeFilter={paymentTypeFilter}
            eventTypeFilter={eventTypeFilter}
            statusFilter={statusFilter}
            onSearchChange={handleSearchChange}
            onPaymentMethodFilterChange={handlePaymentMethodFilterChange}
            onPaymentTypeFilterChange={handlePaymentTypeFilterChange}
            onEventTypeFilterChange={handleEventTypeFilterChange}
            onStatusFilterChange={handleStatusFilterChange}
          />
        </CardHeader>
        <CardContent className="p-4">
          {logs.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-xs text-gray-500 mb-4">
                No payment logs found
              </p>
            </div>
          ) : (
            <PaymentLogTable
              logs={logs}
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={ITEMS_PER_PAGE}
              startIndex={startIndex}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
              onViewDetails={handleViewDetails}
            />
          )}
        </CardContent>
      </Card>

      <PaymentLogDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        log={selectedLog}
      />
    </div>
  );
}
