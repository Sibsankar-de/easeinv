import { createSlice } from "@reduxjs/toolkit";
import { createApiThunk, setState } from "../utils";
import api from "@/configs/axios-config";
import { NotificationDto } from "@/types/dto/notificationDto";
import { RootState } from "../store";

export const fetchNotificationsThunk: any = createApiThunk(
  "/notifications/list",
  async (payload: { page?: number; limit?: number; isRead?: boolean } = {}) => {
    const { page = 1, limit = 20, isRead } = payload;
    let url = `/notifications?page=${page}&limit=${limit}`;
    if (isRead !== undefined) url += `&isRead=${isRead}`;
    return await api.get(url);
  },
);

export const markNotificationReadThunk: any = createApiThunk(
  "/notifications/mark-read",
  async (notificationId: string) =>
    await api.patch(`/notifications/${notificationId}/read`),
);

export const markAllNotificationsReadThunk: any = createApiThunk(
  "/notifications/mark-all-read",
  async () => await api.patch("/notifications/read-all"),
);

export const deleteNotificationThunk: any = createApiThunk(
  "/notifications/delete",
  async (notificationId: string) =>
    await api.delete(`/notifications/${notificationId}`),
);

const initialState = {
  docs: [] as NotificationDto[],
  unreadCount: 0,
  totalDocs: 0,
  totalPages: 1,
  page: 1,
  hasNextPage: false,
  status: "idle",
  actionStatus: "idle",
  error: null,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    clearNotifications: (state) => {
      state.docs = [];
      state.unreadCount = 0;
      state.status = "idle";
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchNotificationsThunk.pending, (state, action) => {
        if ((action.meta.arg?.page || 1) === 1) {
          state.status = "loading";
        }
        state.error = null;
      })
      .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
        state.status = "success";
        const payload = action.payload;
        if (!payload) return;
        const page = payload.page || 1;
        state.unreadCount = payload.unreadCount ?? 0;
        state.totalDocs = payload.totalDocs || 0;
        state.totalPages = payload.totalPages || 1;
        state.page = page;
        state.hasNextPage = payload.hasNextPage || false;

        if (page === 1) {
          state.docs = payload.docs || [];
        } else {
          const existingIds = new Set(state.docs.map((d) => d.id));
          const newDocs = (payload.docs || []).filter(
            (d: NotificationDto) => !existingIds.has(d.id),
          );
          state.docs = [...state.docs, ...newDocs];
        }
      })
      .addCase(fetchNotificationsThunk.rejected, (state, action) => {
        setState(state, action);
      })
      .addCase(markNotificationReadThunk.fulfilled, (state, action) => {
        const notificationId = action.meta.arg;
        const target = state.docs.find((d) => d.id === notificationId);
        if (target && !target.isRead) {
          target.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsReadThunk.fulfilled, (state) => {
        state.docs.forEach((d) => (d.isRead = true));
        state.unreadCount = 0;
      })
      .addCase(deleteNotificationThunk.fulfilled, (state, action) => {
        const notificationId = action.meta.arg;
        const target = state.docs.find((d) => d.id === notificationId);
        if (target && !target.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.docs = state.docs.filter((d) => d.id !== notificationId);
        state.totalDocs = Math.max(0, state.totalDocs - 1);
      });
  },
});

export const { clearNotifications } = notificationSlice.actions;
export const selectNotificationState = (state: RootState) => state.notification;
export default notificationSlice.reducer;
