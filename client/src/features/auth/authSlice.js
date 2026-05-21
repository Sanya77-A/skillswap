import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api, setAccessToken, clearAccessToken } from "../../utils/api";

export const register = createAsyncThunk(
  "auth/register",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/register", payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Registration failed");
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/refresh");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async () => {
    try {
      await api.post("/auth/logout");
    } catch (_) {}
  }
);

export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/users/me");
      return data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  },
  reducers: {
    setCredentials: (state, { payload }) => {
      state.user = payload?.user ?? state.user;
      state.isAuthenticated = !!state.user;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.fulfilled, (state, { payload }) => {
        state.user = payload.user;
        state.isAuthenticated = true;
        state.error = null;
        if (payload.accessToken) setAccessToken(payload.accessToken);
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.user = payload.user;
        state.isAuthenticated = true;
        state.error = null;
        if (payload.accessToken) setAccessToken(payload.accessToken);
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        clearAccessToken();
      })
      .addCase(fetchMe.fulfilled, (state, { payload }) => {
        state.user = payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        clearAccessToken();
      })
      .addCase(refreshToken.fulfilled, (state, { payload }) => {
        if (payload?.accessToken) setAccessToken(payload.accessToken);
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        clearAccessToken();
      })
      .addMatcher(
        (action) => [register.pending, login.pending].includes(action.type),
        (state) => { state.loading = true; state.error = null; }
      )
      .addMatcher(
        (action) => [register.rejected, login.rejected].includes(action.type),
        (state, { payload }) => { state.loading = false; state.error = payload; }
      )
      .addMatcher(
        (action) => [register.fulfilled, login.fulfilled].includes(action.type),
        (state) => { state.loading = false; }
      );
  },
});

export const { setCredentials, clearAuth } = authSlice.actions;
export default authSlice.reducer;
