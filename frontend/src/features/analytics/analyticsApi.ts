import apiClient from "../../api/client";

export interface SummaryResponse {
  month: number;
  year: number;
  total_income: string | number;
  total_expense: string | number;
  total_savings: string | number;
  net_free_balance: string | number;
}

export interface TrendPoint {
  month: number;
  year: number;
  total_income: string | number;
  total_expense: string | number;
  total_savings: string | number;
}

export interface CategoryBreakdownItem {
  category_id: number;
  category_name: string;
  total_amount: string | number;
}

export interface BurnRateResponse {
  current_balance: string | number;
  average_daily_spend: string | number;
  days_remaining: number | null;
}

export const fetchMonthlySummary = (month: number, year: number) =>
  apiClient.get<SummaryResponse>("/analytics/summary", { params: { month, year } });

export const fetchTrend = (months: number = 6) =>
  apiClient.get<TrendPoint[]>("/analytics/trend", { params: { months } });

export const fetchCategoryBreakdown = (month: number, year: number, entry_type: string = "expense") =>
  apiClient.get<CategoryBreakdownItem[]>("/analytics/category-breakdown", { params: { month, year, entry_type } });

export const fetchBurnRate = () => apiClient.get<BurnRateResponse>("/analytics/burn-rate");