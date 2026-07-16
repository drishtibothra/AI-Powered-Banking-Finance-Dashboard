import apiClient from "../../api/client";

export interface Budget {
  id: number;
  category_id: number;
  limit_amount: string | number;
  month: number;
  year: number;
}

export interface BudgetPayload {
  category_id: number;
  limit_amount: number;
  month: number;
  year: number;
}

export const fetchBudgetsRequest = (params?: { month?: number; year?: number }) =>
  apiClient.get<Budget[]>("/budgets", { params });

export const createBudgetRequest = (payload: BudgetPayload) =>
  apiClient.post<Budget>("/budgets", payload);

export const updateBudgetRequest = (id: number, limit_amount: number) =>
  apiClient.put<Budget>(`/budgets/${id}`, { limit_amount });

export const deleteBudgetRequest = (id: number) => apiClient.delete(`/budgets/${id}`);