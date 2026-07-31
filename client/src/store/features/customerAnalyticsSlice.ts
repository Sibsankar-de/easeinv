import api from "@/configs/axios-config";
import {
  CustomerAnalyticsFilter,
  CustomerAnalyticsResponse,
  DEFAULT_ANALYTICS_FILTER,
} from "@/types/AnalyticsTypes";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { createApiThunk } from "../utils";

const isUUID = (str?: string): boolean =>
  !!str &&
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
    str,
  );

const buildQueryString = (filter: CustomerAnalyticsFilter): string => {
  const params = new URLSearchParams({ period: filter.period || "daily" });
  if (filter.mode === "custom") {
    if (filter.startDate && /^\d{4}-\d{2}-\d{2}$/.test(filter.startDate)) {
      params.set("startDate", filter.startDate);
    }
    if (filter.endDate && /^\d{4}-\d{2}-\d{2}$/.test(filter.endDate)) {
      params.set("endDate", filter.endDate);
    }
  }
  if (filter.customerId && isUUID(filter.customerId)) {
    params.set("customerId", filter.customerId);
  }
  if (filter.customerCount) {
    params.set("customerCount", String(filter.customerCount));
  }
  return params.toString();
};

export const fetchCustomerAnalyticsThunk = createApiThunk(
  "customerAnalytics/fetch",
  async (payload: { storeId: string; filter: CustomerAnalyticsFilter }) =>
    await api.get(
      `/analytics/${payload.storeId}/customers?${buildQueryString(payload.filter)}`,
    ),
);

interface CustomerAnalyticsState {
  data: CustomerAnalyticsResponse | null;
  filter: CustomerAnalyticsFilter;
  status: "idle" | "loading" | "success" | "failed";
  error: unknown;
}

const initialState: CustomerAnalyticsState = {
  data: null,
  filter: { ...DEFAULT_ANALYTICS_FILTER, customerCount: 10 },
  status: "idle",
  error: null,
};

const customerAnalyticsSlice = createSlice({
  name: "customerAnalytics",
  initialState,
  reducers: {
    setCustomerFilter: (
      state,
      action: PayloadAction<CustomerAnalyticsFilter>,
    ) => {
      state.filter = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchCustomerAnalyticsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCustomerAnalyticsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchCustomerAnalyticsThunk.fulfilled, (state, action) => {
        state.status = "success";
        state.data = action.payload;
        state.error = null;
      });
  },
});

export const selectCustomerAnalyticsState = (state: RootState) =>
  state.customerAnalytics;
export const { setCustomerFilter } = customerAnalyticsSlice.actions;
export default customerAnalyticsSlice.reducer;
