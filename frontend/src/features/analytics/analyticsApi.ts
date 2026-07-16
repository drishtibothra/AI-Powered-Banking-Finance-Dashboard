import apiClient from "../../api/client";

export interface SummaryResponse {
  month: number;
  year: number;
  total_income: string | number;
  total_expense: string | number;
  total_savings: string | number;
  net_free_balance: string | number;
}

export const fetchMonthlySummary = (month: number, year: number) =>
  apiClient.get<SummaryResponse>("/analytics/summary", { params: { month, year } });