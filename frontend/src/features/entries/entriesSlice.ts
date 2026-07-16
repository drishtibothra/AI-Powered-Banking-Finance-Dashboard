import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { fetchEntriesRequest, fetchCategoriesRequest, createEntryRequest, updateEntryRequest, deleteEntryRequest} from "./entriesApi";
import type { Entry, Category, EntryPayload } from "./entriesApi";

interface EntriesState {
  items: Entry[];
  categories: Category[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: EntriesState = { items: [], categories: [], status: "idle", error: null };

export const fetchEntries = createAsyncThunk(
  "entries/fetchEntries",
  async (params: { month?: number; year?: number } | undefined) => {
    const { data } = await fetchEntriesRequest(params);
    return data;
  }
);

export const fetchCategories = createAsyncThunk("entries/fetchCategories", async () => {
  const { data } = await fetchCategoriesRequest();
  return data;
});

export const addEntry = createAsyncThunk("entries/addEntry", async (payload: EntryPayload) => {
  const { data } = await createEntryRequest(payload);
  return data;
});

export const editEntry = createAsyncThunk(
  "entries/editEntry",
  async ({ id, payload }: { id: number; payload: Partial<EntryPayload> }) => {
    const { data } = await updateEntryRequest(id, payload);
    return data;
  }
);

export const removeEntry = createAsyncThunk("entries/removeEntry", async (id: number) => {
  await deleteEntryRequest(id);
  return id;
});

const entriesSlice = createSlice({
  name: "entries",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEntries.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(fetchEntries.fulfilled, (state, action: PayloadAction<Entry[]>) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchEntries.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to load entries";
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.categories = action.payload;
      })
      .addCase(addEntry.fulfilled, (state, action: PayloadAction<Entry>) => {
        state.items.unshift(action.payload);
      })
      .addCase(editEntry.fulfilled, (state, action: PayloadAction<Entry>) => {
        const idx = state.items.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(removeEntry.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((e) => e.id !== action.payload);
      });
  },
});

export default entriesSlice.reducer;