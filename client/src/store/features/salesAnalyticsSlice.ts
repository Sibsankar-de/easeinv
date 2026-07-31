import api from "@/configs/axios-config";
import {
  AnalyticsFilterState,
  DEFAULT_ANALYTICS_FILTER,
  SalesAnalyticsResponse,
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

export const fetchSalesAnalyticsThunk = createApiThunk(
  "salesAnalytics/fetch",
  async (payload: { storeId: string; filter: AnalyticsFilterState }) =>
    await api.get(
      `/analytics/${payload.storeId}/sales?${buildQueryString(payload.filter)}`,
    ),
);

interface SalesAnalyticsState {
  data: SalesAnalyticsResponse | null;
  filter: AnalyticsFilterState;
  status: "idle" | "loading" | "success" | "failed";
  error: unknown;
}

const initialState: SalesAnalyticsState = {
  data: null,
  filter: DEFAULT_ANALYTICS_FILTER,
  status: "idle",
  error: null,
};

const salesAnalyticsSlice = createSlice({
  name: "salesAnalytics",
  initialState,
  reducers: {
    setSalesFilter: (state, action: PayloadAction<AnalyticsFilterState>) => {
      state.filter = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchSalesAnalyticsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSalesAnalyticsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchSalesAnalyticsThunk.fulfilled, (state, action) => {
        state.status = "success";
        state.data = action.payload;
        state.error = null;
      });
  },
});

export const selectSalesAnalyticsState = (state: RootState) =>
  state.salesAnalytics;
export const { setSalesFilter } = salesAnalyticsSlice.actions;
export default salesAnalyticsSlice.reducer;
