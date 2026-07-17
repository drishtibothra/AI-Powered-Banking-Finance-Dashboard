import apiClient from "../../api/client";

export interface Entry {
  id: number;
  category_id: number;
  amount: string | number;
  entry_type: "income" | "expense" | "savings";
  description: string | null;
  date: string;
  frequency: "one_time" | "recurring_monthly";
  recurrence_day: number | null;
}

export interface Category {
  id: number;
  name: string;
  entry_type: "income" | "expense" | "savings";
  user_id: number | null;
}

export interface EntryPayload {
  category_id: number;
  amount: number;
  entry_type: "income" | "expense" | "savings";
  description?: string;
  date: string;
  frequency: "one_time" | "recurring_monthly";
  recurrence_day?: number | null;
}

export const fetchEntriesRequest = (params?: { month?: number; year?: number }) =>
  apiClient.get<Entry[]>("/entries", { params });

export const fetchCategoriesRequest = () => apiClient.get<Category[]>("/categories");

export const createEntryRequest = (payload: EntryPayload) =>
  apiClient.post<Entry>("/entries", payload);

export const updateEntryRequest = (id: number, payload: Partial<EntryPayload>) =>
  apiClient.put<Entry>(`/entries/${id}`, payload);

export const deleteEntryRequest = (id: number) => apiClient.delete(`/entries/${id}`);

export const importCsvRequest = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.post<{ created: number; errors: string[] }>("/entries/import-csv", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const createCategoryRequest = (payload: { name: string; entry_type: "income" | "expense" | "savings" }) =>
  apiClient.post<Category>("/categories", payload);