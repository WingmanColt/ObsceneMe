export enum CommissionStatus {
  Pending = 0,
  Approved = 1,
  Paid = 2
}

export interface AffiliateUser {
  id?: number;
  userId?: string;
  paymentEmail: string;
  paymentGateway: string;
  referralCode?: string;

  referralCount?: number;
  totalEarnings?: number;
  commissionRate?: number;
  status?: CommissionStatus;

  points?: number;
  paidCash?: number;
  approvedCash?: number;
  pendingCash?: number;
}

export interface PerformanceChart {
  date: string;
  totalRevenue: number;
  orderCount: number;
}

export interface PaymentDetails {
  userId: string;
  paymentEmail: string;
  paymentGateway: string;
}
