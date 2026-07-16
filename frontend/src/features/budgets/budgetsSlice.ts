import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { fetchBudgetsRequest, createBudgetRequest, updateBudgetRequest, deleteBudgetRequest } from "./budgetsApi";
import type { Budget, BudgetPayload } from "./budgetsApi";

interface BudgetsState {
  items: Budget[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: BudgetsState = { items: [], status: "idle", error: null };

export const fetchBudgets = createAsyncThunk(
  "budgets/fetchBudgets",
  async (params: { month?: number; year?: number } | undefined) => {
    const { data } = await fetchBudgetsRequest(params);
    return data;
  }
);

export const addBudget = createAsyncThunk("budgets/addBudget", async (payload: BudgetPayload) => {
  const { data } = await createBudgetRequest(payload);
  return data;
});

export const editBudget = createAsyncThunk(
  "budgets/editBudget",
  async ({ id, limit_amount }: { id: number; limit_amount: number }) => {
    const { data } = await updateBudgetRequest(id, limit_amount);
    return data;
  }
);

export const removeBudget = createAsyncThunk("budgets/removeBudget", async (id: number) => {
  await deleteBudgetRequest(id);
  return id;
});

const budgetsSlice = createSlice({
  name: "budgets",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgets.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(fetchBudgets.fulfilled, (state, action: PayloadAction<Budget[]>) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to load budgets";
      })
      .addCase(addBudget.fulfilled, (state, action: PayloadAction<Budget>) => {
        state.items.push(action.payload);
      })
      .addCase(editBudget.fulfilled, (state, action: PayloadAction<Budget>) => {
        const idx = state.items.findIndex((b) => b.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(removeBudget.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((b) => b.id !== action.payload);
      });
  },
});

export default budgetsSlice.reducer;