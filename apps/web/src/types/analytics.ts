export interface RevenueStats {
  totalTemplateRevenue: number;
  totalSubscriptionRevenue: number;
  totalRevenue: number;
  templatePurchases: {
    count: number;
    revenue: number;
  };
  activeSubscriptions: {
    count: number;
    monthlyRecurring: number;
    yearlyRecurring: number;
  };
  revenueByPeriod: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
  };
}

export interface RevenueByDateRange {
  templateRevenue: number;
  subscriptionRevenue?: number;
  totalRevenue?: number;
}

export interface SiteMetrics {
  totalUsers: number;
  activeUsers: number;
  activeUsersCount: number;
}

export interface UserMetrics {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  byRole: Record<string, number>;
  companyApprovals?: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

