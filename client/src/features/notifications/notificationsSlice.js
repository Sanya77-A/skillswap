import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../utils/api";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/notifications", { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/notifications/unread-count");
      return data.count;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id, { rejectWithValue }) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await api.patch("/notifications/read-all");
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    data: [],
    pagination: null,
    unreadCount: 0,
    loading: false,
  },
  reducers: {
    addNotification: (state, { payload }) => {
      state.data = [payload, ...state.data];
      state.unreadCount += 1;
    },
    setUnreadCount: (state, { payload }) => {
      state.unreadCount = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, { payload }) => {
        state.data = payload.data || [];
        state.pagination = payload.pagination;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, { payload }) => {
        state.unreadCount = payload;
      })
      .addCase(markAsRead.fulfilled, (state, { payload }) => {
        const n = state.data.find((x) => x._id === payload);
        if (n) n.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.data.forEach((n) => (n.read = true));
        state.unreadCount = 0;
      });
  },
});

export const { addNotification, setUnreadCount } = notificationsSlice.actions;
export default notificationsSlice.reducer;
