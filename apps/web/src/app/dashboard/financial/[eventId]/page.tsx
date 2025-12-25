"use client";

import React, { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Users,
  ArrowLeft,
  Loader2,
  PieChart as PieChartIcon,
  AlertCircle,
  CheckCircle,
  Plus,
  Receipt,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useEvent } from "@/hooks/api/useEvent";
import { useGiftsByEvent } from "@/hooks/api/useGift";
import { useGuestsByEvent } from "@/hooks/api/useGuest";
import { format } from "date-fns";
import Empty from "@/components/Empty";

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  currency: "USD" | "KHR";
  date: string;
  notes?: string;
}

interface EventFinancialDetailPageProps {
  params: Promise<{ eventId: string }>;
}

export default function EventFinancialDetailPage({
  params,
}: EventFinancialDetailPageProps) {
  const resolvedParams = use(params);
  const { eventId } = resolvedParams;
  const router = useRouter();

  // Fetch data
  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const { data: gifts = [], isLoading: giftsLoading } =
    useGiftsByEvent(eventId);
  const { data: guests = [], isLoading: guestsLoading } =
    useGuestsByEvent(eventId);

  // Load expenses from localStorage - use lazy initial state
  const [expenses] = useState<Expense[]>(() => {
    if (typeof window !== "undefined") {
      const storedExpenses = localStorage.getItem(`expenses_${eventId}`);
      if (storedExpenses) {
        try {
          return JSON.parse(storedExpenses);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  // Calculate total expenses
  const totalExpenses = useMemo(() => {
    const totalUsd = expenses
      .filter((e) => e.currency === "USD")
      .reduce((sum, e) => sum + e.amount, 0);

    const totalKhr = expenses
      .filter((e) => e.currency === "KHR")
      .reduce((sum, e) => sum + e.amount, 0);

    const totalExpensesUsd = totalUsd + totalKhr / 4000;

    return { totalUsd, totalKhr, totalExpensesUsd };
  }, [expenses]);

  // Calculate financial metrics
  const financialMetrics = useMemo(() => {
    const totalUsd = gifts
      .filter((g) => g.currency === "usd")
      .reduce((sum, g) => sum + g.amount, 0);

    const totalKhr = gifts
      .filter((g) => g.currency === "khr")
      .reduce((sum, g) => sum + g.amount, 0);

    const totalCash = gifts
      .filter((g) => g.paymentMethod === "cash")
      .reduce((sum, g) => {
        return sum + (g.currency === "usd" ? g.amount : g.amount / 4000); // rough conversion
      }, 0);

    const totalKhqr = gifts
      .filter((g) => g.paymentMethod === "khqr")
      .reduce((sum, g) => {
        return sum + (g.currency === "usd" ? g.amount : g.amount / 4000); // rough conversion
      }, 0);

    const contributingGuests = guests.filter((g) => g.hasGivenGift).length;
    const totalGuests = guests.length;
    const contributionRate =
      totalGuests > 0 ? (contributingGuests / totalGuests) * 100 : 0;

    // Calculate average contribution per guest
    const avgUsdPerGuest =
      contributingGuests > 0 ? totalUsd / contributingGuests : 0;
    const avgKhrPerGuest =
      contributingGuests > 0 ? totalKhr / contributingGuests : 0;

    // Payment method breakdown
    const cashPayments = gifts.filter((g) => g.paymentMethod === "cash").length;
    const khqrPayments = gifts.filter((g) => g.paymentMethod === "khqr").length;
    const totalPayments = gifts.length;

    const cashPercentage =
      totalPayments > 0 ? (cashPayments / totalPayments) * 100 : 0;
    const khqrPercentage =
      totalPayments > 0 ? (khqrPayments / totalPayments) * 100 : 0;

    // Currency breakdown
    const usdPayments = gifts.filter((g) => g.currency === "usd").length;
    const khrPayments = gifts.filter((g) => g.currency === "khr").length;

    const usdPercentage =
      totalPayments > 0 ? (usdPayments / totalPayments) * 100 : 0;
    const khrPercentage =
      totalPayments > 0 ? (khrPayments / totalPayments) * 100 : 0;

    return {
      totalUsd,
      totalKhr,
      totalCash,
      totalKhqr,
      contributingGuests,
      totalGuests,
      contributionRate,
      avgUsdPerGuest,
      avgKhrPerGuest,
      cashPayments,
      khqrPayments,
      totalPayments,
      cashPercentage,
      khqrPercentage,
      usdPayments,
      khrPayments,
      usdPercentage,
      khrPercentage,
    };
  }, [gifts, guests]);

  // Budget analysis - rough estimates
  const budgetAnalysis = useMemo(() => {
    // Convert KHR to USD for easier comparison (rough rate: 4000 KHR = 1 USD)
    const totalCollectedUsd =
      financialMetrics.totalUsd + financialMetrics.totalKhr / 4000;

    // Use actual expenses if available, otherwise estimate
    const actualTotalCost = totalExpenses.totalExpensesUsd;
    const hasActualExpenses = expenses.length > 0;

    // Estimate typical event costs based on guest count (fallback)
    const estimatedCostPerGuest = 50; // USD - this is a rough estimate
    const estimatedTotalCost = hasActualExpenses
      ? actualTotalCost
      : financialMetrics.totalGuests * estimatedCostPerGuest;

    // Calculate budget status
    const budgetCoverage =
      estimatedTotalCost > 0
        ? (totalCollectedUsd / estimatedTotalCost) * 100
        : 0;

    const surplus = totalCollectedUsd - estimatedTotalCost;
    const isSurplus = surplus >= 0;

    // Break down costs by category
    const expensesByCategory = expenses.reduce(
      (acc, expense) => {
        const amountUsd =
          expense.currency === "USD" ? expense.amount : expense.amount / 4000;
        acc[expense.category] = (acc[expense.category] || 0) + amountUsd;
        return acc;
      },
      {} as Record<string, number>
    );

    // If no expenses, use rough estimates
    const venueAndCateringCost =
      expensesByCategory["Venue & Catering"] || estimatedTotalCost * 0.6;
    const decorationCost =
      expensesByCategory["Decoration"] || estimatedTotalCost * 0.15;
    const entertainmentCost =
      expensesByCategory["Entertainment"] || estimatedTotalCost * 0.15;
    const otherCosts = expensesByCategory["Other"] || estimatedTotalCost * 0.1;

    return {
      totalCollectedUsd,
      estimatedTotalCost,
      budgetCoverage,
      surplus,
      isSurplus,
      venueAndCateringCost,
      decorationCost,
      entertainmentCost,
      otherCosts,
      hasActualExpenses,
      expensesByCategory,
    };
  }, [financialMetrics, expenses, totalExpenses]);

  const formatCurrency = (amount: number, currency: "USD" | "KHR") => {
    if (currency === "USD") {
      return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${amount.toLocaleString()} ៛`;
  };

  const isLoading = eventLoading || giftsLoading || guestsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Loading financial details...
          </p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/financial")}
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 w-full flex  flex-col">
          <div className=" w-full flex justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/financial")}
              className="mb-4 text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={() =>
                router.push(`/dashboard/financial/${eventId}/expense`)
              }
            >
              <Receipt className="h-4 w-4 mr-2" />
              Manage Expenses
            </Button>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            <p className="text-muted-foreground mt-2">
              {format(new Date(event.date), "EEEE, MMMM dd, yyyy")} •{" "}
              {event.venue}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total USD */}
        <Card className="border border-gray-200 p-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total USD
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(financialMetrics.totalUsd, "USD")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg: {formatCurrency(financialMetrics.avgUsdPerGuest, "USD")}
                  /guest
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total KHR */}
        <Card className="border border-gray-200 p-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total KHR
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(financialMetrics.totalKhr, "KHR")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg: {formatCurrency(financialMetrics.avgKhrPerGuest, "KHR")}
                  /guest
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contribution Rate */}
        <Card className="border border-gray-200 p-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Contribution Rate
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {financialMetrics.contributionRate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {financialMetrics.contributingGuests}/
                  {financialMetrics.totalGuests} guests
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Payments */}
        <Card className="border border-gray-200 p-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total Payments
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {financialMetrics.totalPayments}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Recorded contributions
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <PieChartIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Analysis */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">
                Budget Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Estimated costs vs. actual contributions
              </p>
            </div>
            {budgetAnalysis.isSurplus ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Budget Surplus
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                Budget Deficit
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Budget Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Total Collected
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(budgetAnalysis.totalCollectedUsd, "USD")}
              </p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm font-medium text-orange-900 mb-1">
                Estimated Cost
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(budgetAnalysis.estimatedTotalCost, "USD")}
              </p>
            </div>

            <div
              className={`p-4 rounded-lg ${budgetAnalysis.isSurplus ? "bg-green-50" : "bg-red-50"}`}
            >
              <p
                className={`text-sm font-medium mb-1 ${budgetAnalysis.isSurplus ? "text-green-900" : "text-red-900"}`}
              >
                {budgetAnalysis.isSurplus ? "Surplus" : "Deficit"}
              </p>
              <p
                className={`text-2xl font-bold ${budgetAnalysis.isSurplus ? "text-green-600" : "text-red-600"}`}
              >
                {formatCurrency(Math.abs(budgetAnalysis.surplus), "USD")}
              </p>
            </div>
          </div>

          {/* Budget Coverage Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-900">
                Budget Coverage
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {budgetAnalysis.budgetCoverage.toFixed(1)}%
              </p>
            </div>
            <Progress
              value={Math.min(budgetAnalysis.budgetCoverage, 100)}
              className="h-3"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {budgetAnalysis.budgetCoverage >= 100
                ? "Budget goal achieved! "
                : `${(100 - budgetAnalysis.budgetCoverage).toFixed(1)}% remaining to reach estimated cost`}
            </p>
          </div>

          {/* Cost Breakdown */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Estimated Cost Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Venue & Catering (60%)</span>
                </div>
                <span className="text-sm font-semibold">
                  {formatCurrency(budgetAnalysis.venueAndCateringCost, "USD")}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Decoration (15%)</span>
                </div>
                <span className="text-sm font-semibold">
                  {formatCurrency(budgetAnalysis.decorationCost, "USD")}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Entertainment (15%)</span>
                </div>
                <span className="text-sm font-semibold">
                  {formatCurrency(budgetAnalysis.entertainmentCost, "USD")}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-sm">Other Costs (10%)</span>
                </div>
                <span className="text-sm font-semibold">
                  {formatCurrency(budgetAnalysis.otherCosts, "USD")}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">Note</p>
                <p className="text-sm text-amber-800 mt-1">
                  {budgetAnalysis.hasActualExpenses
                    ? "Costs shown are based on your recorded expenses. Add more expenses below for accurate tracking."
                    : "The cost estimates are based on typical event expenses. Add actual expenses below for accurate budget tracking."}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Method Breakdown */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Cash</span>
                <span className="text-sm font-semibold">
                  {financialMetrics.cashPayments} (
                  {financialMetrics.cashPercentage.toFixed(1)}%)
                </span>
              </div>
              <Progress
                value={financialMetrics.cashPercentage}
                className="h-2"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">KHQR</span>
                <span className="text-sm font-semibold">
                  {financialMetrics.khqrPayments} (
                  {financialMetrics.khqrPercentage.toFixed(1)}%)
                </span>
              </div>
              <Progress
                value={financialMetrics.khqrPercentage}
                className="h-2"
              />
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Total Payments</span>
                <span className="font-semibold">
                  {financialMetrics.totalPayments}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Currency Breakdown */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Currency Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">USD</span>
                <span className="text-sm font-semibold">
                  {financialMetrics.usdPayments} (
                  {financialMetrics.usdPercentage.toFixed(1)}%)
                </span>
              </div>
              <Progress
                value={financialMetrics.usdPercentage}
                className="h-2"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">KHR</span>
                <span className="text-sm font-semibold">
                  {financialMetrics.khrPayments} (
                  {financialMetrics.khrPercentage.toFixed(1)}%)
                </span>
              </div>
              <Progress
                value={financialMetrics.khrPercentage}
                className="h-2"
              />
            </div>

            <div className="pt-4 border-t">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Total USD</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(financialMetrics.totalUsd, "USD")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Total KHR</span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(financialMetrics.totalKhr, "KHR")}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
