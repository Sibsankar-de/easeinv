import { configureStore } from "@reduxjs/toolkit";

import inventoryReducer from "./features/inventorySlice";
import userReducer from "./features/userSlice";
import storeReducer from "./features/storeSlice";
import currentStoreReducer from "./features/currentStoreSlice";
import invoiceReducer from "./features/invoiceSlice";
import customerReducer from "./features/customerSlice";
import globalErrorReducer from "./features/globalErrorSlice";
import analyticsReducer from "./features/analyticsSlice";
import galleryReducer from "./features/gallerySlice";
import apikeyReducer from "./features/apiKeySlice";
import dashboardSummaryReducer from "./features/dashboardSummarySlice";
import salesAnalyticsReducer from "./features/salesAnalyticsSlice";
import productAnalyticsReducer from "./features/productAnalyticsSlice";
import customerAnalyticsReducer from "./features/customerAnalyticsSlice";
import categoryAnalyticsReducer from "./features/categoryAnalyticsSlice";
import notificationReducer from "./features/notificationSlice";
import couponReducer from "./features/couponSlice";

export function makeStore() {
  return configureStore({
    reducer: {
      inventory: inventoryReducer,
      user: userReducer,
      store: storeReducer,
      currentStore: currentStoreReducer,
      invoice: invoiceReducer,
      analytics: analyticsReducer,
      customers: customerReducer,
      coupons: couponReducer,
      globalError: globalErrorReducer,
      gallery: galleryReducer,
      apiKey: apikeyReducer,
      notification: notificationReducer,
      // Analytics domain slices (one per API endpoint)
      dashboardSummary: dashboardSummaryReducer,
      salesAnalytics: salesAnalyticsReducer,
      productAnalytics: productAnalyticsReducer,
      customerAnalytics: customerAnalyticsReducer,
      categoryAnalytics: categoryAnalyticsReducer,
    },
  });
}

const store = makeStore();

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
