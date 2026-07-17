import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { refreshTokenRequest, fetchCurrentUser } from "./authApi";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: { id: number; email: string } | null;
  isAuthenticated: boolean;
  bootstrapStatus: "idle" | "loading" | "done";
}

const initialState: AuthState = {
  accessToken: null, refreshToken: null, user: null,
  isAuthenticated: false, bootstrapStatus: "idle",
};

export const bootstrapAuth = createAsyncThunk(
  "auth/bootstrap",
  async (_, { dispatch, rejectWithValue }) => {
    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (!storedRefreshToken) return rejectWithValue("No stored session");

    try {
      const { data: tokenData } = await refreshTokenRequest(storedRefreshToken);
      dispatch(setAccessToken(tokenData.access_token));
      const { data: user } = await fetchCurrentUser();
      return { accessToken: tokenData.access_token, refreshToken: storedRefreshToken, user };
    } catch {
      localStorage.removeItem("refreshToken");
      return rejectWithValue("Session expired");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ accessToken: string; refreshToken: string; user: { id: number; email: string } }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem("refreshToken", action.payload.refreshToken);
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("refreshToken");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.pending, (state) => { state.bootstrapStatus = "loading"; })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.bootstrapStatus = "done";
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.accessToken = null; state.refreshToken = null; state.user = null;
        state.isAuthenticated = false; state.bootstrapStatus = "done";
      });
  },
});

export const { setCredentials, setAccessToken, logout } = authSlice.actions;
export default authSlice.reducer;