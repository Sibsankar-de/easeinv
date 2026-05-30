import { configureStore } from "@reduxjs/toolkit";

import productReducer from "./features/productSlice";
import userReducer from "./features/userSlice";
import storeReducer from "./features/storeSlice";
import currentStoreReducer from "./features/currentStoreSlice";
import invoiceReducer from "./features/invoiceSlice";
import customerReducer from "./features/customerSlice";
import globalErrorReducer from "./features/globalErrorSlice";
import analyticsReducer from "./features/analyticsSlice";
import galleryReducer from "./features/gallerySlice";

export function makeStore() {
  return configureStore({
    reducer: {
      product: productReducer,
      user: userReducer,
      store: storeReducer,
      currentStore: currentStoreReducer,
      invoice: invoiceReducer,
      analytics: analyticsReducer,
      customers: customerReducer,
      globalError: globalErrorReducer,
      gallery: galleryReducer,
    },
  });
}

const store = makeStore();

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
