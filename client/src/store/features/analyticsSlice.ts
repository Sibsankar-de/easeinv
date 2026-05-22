import api from "@/configs/axios-config";
import {
  AnalyticsPeriod,
  DashboardAnalytics,
} from "@/types/DashboardAnalyticsType";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { createApiThunk, setState } from "../utils";

const emptyDashboardAnalytics: DashboardAnalytics = {
  period: "daily",
  generatedAt: "",
  kpis: {
    totalRevenue: 0,
    totalPaid: 0,
    totalDue: 0,
    totalInvoices: 0,
    totalProductsSold: 0,
    totalProfit: 0,
    totalProducts: 0,
    totalCustomers: 0,
  },
  salesTrend: [],
  topProducts: [],
  categorySales: [],
  billingStatus: {
    paid: 0,
    partial: 0,
    unpaid: 0,
  },
  topCustomers: [],
  recentInvoices: [],
};

const initialState = {
  data: emptyDashboardAnalytics,
  period: "daily" as AnalyticsPeriod,
  status: "idle",
  error: null,
};

export const fetchDashboardAnalyticsThunk = createApiThunk(
  "/analytics/dashboard",
  async (payload: { storeId: string; period: AnalyticsPeriod }) =>
    await api.get(
      `/analytics/${payload.storeId}?period=${payload.period}`,
    ),
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    setAnalyticsPeriod: (state, action: { payload: AnalyticsPeriod }) => {
      state.period = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchDashboardAnalyticsThunk.pending, setState)
      .addCase(fetchDashboardAnalyticsThunk.rejected, setState)
      .addCase(fetchDashboardAnalyticsThunk.fulfilled, (state, action) => {
        state.status = "success";
        state.data = action.payload;
        state.period = action.payload.period;
        state.error = null;
      });
  },
});

export const selectAnalyticsState = (state: RootState) => state.analytics;
export const { setAnalyticsPeriod } = analyticsSlice.actions;
export default analyticsSlice.reducer;
