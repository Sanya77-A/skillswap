import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../utils/api";

export const fetchRequests = createAsyncThunk(
  "requests/fetchRequests",
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/requests", { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const createRequest = createAsyncThunk(
  "requests/createRequest",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/requests", payload);
      return data.request;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to send request");
    }
  }
);

export const updateRequest = createAsyncThunk(
  "requests/updateRequest",
  async ({ id, action }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/requests/${id}`, { action });
      return data.request;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed");
    }
  }
);

const requestsSlice = createSlice({
  name: "requests",
  initialState: {
    data: [],
    pagination: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequests.fulfilled, (state, { payload }) => {
        state.data = payload.data || [];
        state.pagination = payload.pagination;
      })
      .addCase(createRequest.fulfilled, (state, { payload }) => {
        state.data = [payload, ...state.data];
      })
      .addCase(updateRequest.fulfilled, (state, { payload }) => {
        const idx = state.data.findIndex((r) => r._id === payload._id);
        if (idx !== -1) state.data[idx] = payload;
      })
      .addMatcher(
        (a) => [fetchRequests.pending, createRequest.pending, updateRequest.pending].some((t) => t === a.type),
        (state) => { state.loading = true; state.error = null; }
      )
      .addMatcher(
        (a) => [fetchRequests.rejected, createRequest.rejected, updateRequest.rejected].some((t) => t === a.type),
        (state, { payload }) => { state.loading = false; state.error = payload; }
      )
      .addMatcher(
        (a) => [fetchRequests.fulfilled, createRequest.fulfilled, updateRequest.fulfilled].some((t) => t === a.type),
        (state) => { state.loading = false; }
      );
  },
});

export const { clearError } = requestsSlice.actions;
export default requestsSlice.reducer;
