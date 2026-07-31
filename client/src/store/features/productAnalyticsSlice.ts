import api from "@/configs/axios-config";
import {
  DEFAULT_ANALYTICS_FILTER,
  ProductAnalyticsFilter,
  ProductAnalyticsResponse,
} from "@/types/AnalyticsTypes";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { createApiThunk } from "../utils";

const isUUID = (str?: string): boolean =>
  !!str &&
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
    str,
  );

const buildQueryString = (filter: ProductAnalyticsFilter): string => {
  const params = new URLSearchParams({ period: filter.period || "daily" });
  if (filter.mode === "custom") {
    if (filter.startDate && /^\d{4}-\d{2}-\d{2}$/.test(filter.startDate)) {
      params.set("startDate", filter.startDate);
    }
    if (filter.endDate && /^\d{4}-\d{2}-\d{2}$/.test(filter.endDate)) {
      params.set("endDate", filter.endDate);
    }
  }
  if (filter.productId && isUUID(filter.productId)) {
    params.set("productId", filter.productId);
  }
  if (filter.categoryId && isUUID(filter.categoryId)) {
    params.set("categoryId", filter.categoryId);
  }
  if (filter.productCount) {
    params.set("productCount", String(filter.productCount));
  }
  return params.toString();
};

export const fetchProductAnalyticsThunk = createApiThunk(
  "productAnalytics/fetch",
  async (payload: { storeId: string; filter: ProductAnalyticsFilter }) =>
    await api.get(
      `/analytics/${payload.storeId}/products?${buildQueryString(payload.filter)}`,
    ),
);

interface ProductAnalyticsState {
  data: ProductAnalyticsResponse | null;
  filter: ProductAnalyticsFilter;
  status: "idle" | "loading" | "success" | "failed";
  error: unknown;
}

const initialState: ProductAnalyticsState = {
  data: null,
  filter: { ...DEFAULT_ANALYTICS_FILTER, productCount: 10 },
  status: "idle",
  error: null,
};

const productAnalyticsSlice = createSlice({
  name: "productAnalytics",
  initialState,
  reducers: {
    setProductFilter: (
      state,
      action: PayloadAction<ProductAnalyticsFilter>,
    ) => {
      state.filter = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchProductAnalyticsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProductAnalyticsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchProductAnalyticsThunk.fulfilled, (state, action) => {
        state.status = "success";
        state.data = action.payload;
        state.error = null;
      });
  },
});

export const selectProductAnalyticsState = (state: RootState) =>
  state.productAnalytics;
export const { setProductFilter } = productAnalyticsSlice.actions;
export default productAnalyticsSlice.reducer;
