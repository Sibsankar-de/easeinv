import api from "@/configs/axios-config";
import {
  CategoryAnalyticsFilter,
  CategoryAnalyticsResponse,
  DEFAULT_ANALYTICS_FILTER,
} from "@/types/AnalyticsTypes";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { createApiThunk } from "../utils";

const isUUID = (str?: string): boolean =>
  !!str && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);

const buildQueryString = (filter: CategoryAnalyticsFilter): string => {
  const params = new URLSearchParams({ period: filter.period || "daily" });
  if (filter.mode === "custom") {
    if (filter.startDate && /^\d{4}-\d{2}-\d{2}$/.test(filter.startDate)) {
      params.set("startDate", filter.startDate);
    }
    if (filter.endDate && /^\d{4}-\d{2}-\d{2}$/.test(filter.endDate)) {
      params.set("endDate", filter.endDate);
    }
  }
  if (filter.categoryId && isUUID(filter.categoryId)) {
    params.set("categoryId", filter.categoryId);
  }
  if (filter.categoryCount) {
    params.set("categoryCount", String(filter.categoryCount));
  }
  return params.toString();
};

export const fetchCategoryAnalyticsThunk = createApiThunk(
  "categoryAnalytics/fetch",
  async (payload: { storeId: string; filter: CategoryAnalyticsFilter }) =>
    await api.get(
      `/analytics/${payload.storeId}/categories?${buildQueryString(payload.filter)}`,
    ),
);

interface CategoryAnalyticsState {
  data: CategoryAnalyticsResponse | null;
  filter: CategoryAnalyticsFilter;
  status: "idle" | "loading" | "success" | "failed";
  error: unknown;
}

const initialState: CategoryAnalyticsState = {
  data: null,
  filter: { ...DEFAULT_ANALYTICS_FILTER, categoryCount: 10 },
  status: "idle",
  error: null,
};

const categoryAnalyticsSlice = createSlice({
  name: "categoryAnalytics",
  initialState,
  reducers: {
    setCategoryFilter: (
      state,
      action: PayloadAction<CategoryAnalyticsFilter>,
    ) => {
      state.filter = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchCategoryAnalyticsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCategoryAnalyticsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchCategoryAnalyticsThunk.fulfilled, (state, action) => {
        state.status = "success";
        state.data = action.payload;
        state.error = null;
      });
  },
});

export const selectCategoryAnalyticsState = (state: RootState) =>
  state.categoryAnalytics;
export const { setCategoryFilter } = categoryAnalyticsSlice.actions;
export default categoryAnalyticsSlice.reducer;
