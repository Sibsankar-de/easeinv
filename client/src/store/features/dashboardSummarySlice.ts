import api from "@/configs/axios-config";
import {
  AnalyticsFilterState,
  DashboardAnalyticsResponse,
  DEFAULT_ANALYTICS_FILTER,
} from "@/types/AnalyticsTypes";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { createApiThunk } from "../utils";

const buildQueryString = (filter: AnalyticsFilterState): string => {
  const params = new URLSearchParams({ period: filter.period || "daily" });
  if (filter.mode === "custom") {
    if (filter.startDate && /^\d{4}-\d{2}-\d{2}$/.test(filter.startDate)) {
      params.set("startDate", filter.startDate);
    }
    if (filter.endDate && /^\d{4}-\d{2}-\d{2}$/.test(filter.endDate)) {
      params.set("endDate", filter.endDate);
    }
  }
  return params.toString();
};

export const fetchDashboardSummaryThunk = createApiThunk(
  "dashboardSummary/fetch",
  async (payload: { storeId: string; filter: AnalyticsFilterState }) =>
    await api.get(
      `/analytics/${payload.storeId}/dashboard?${buildQueryString(payload.filter)}`,
    ),
);

interface DashboardSummaryState {
  data: DashboardAnalyticsResponse | null;
  filter: AnalyticsFilterState;
  status: "idle" | "loading" | "success" | "failed";
  error: unknown;
}

const initialState: DashboardSummaryState = {
  data: null,
  filter: DEFAULT_ANALYTICS_FILTER,
  status: "idle",
  error: null,
};

const dashboardSummarySlice = createSlice({
  name: "dashboardSummary",
  initialState,
  reducers: {
    setDashboardFilter: (
      state,
      action: PayloadAction<AnalyticsFilterState>,
    ) => {
      state.filter = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchDashboardSummaryThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDashboardSummaryThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchDashboardSummaryThunk.fulfilled, (state, action) => {
        state.status = "success";
        state.data = action.payload;
        state.error = null;
      });
  },
});

export const selectDashboardSummaryState = (state: RootState) =>
  state.dashboardSummary;
export const { setDashboardFilter } = dashboardSummarySlice.actions;
export default dashboardSummarySlice.reducer;
