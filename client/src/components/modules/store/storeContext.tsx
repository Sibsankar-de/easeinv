"use client";

import { fetchCurrentStore } from "@/store/features/currentStoreSlice";
import {
  fetchCategoriesThunk,
  invalidate as invalidateProducts,
} from "@/store/features/inventorySlice";
import { invalidate as invalidateCustomers } from "@/store/features/customerSlice";
import { invalidate as invalidateInvoices } from "@/store/features/invoiceSlice";
import { useParams } from "next/navigation";
import React, { createContext, useEffect } from "react";
import { useDispatch } from "react-redux";

const storeContext = createContext<undefined>(undefined);

export const StoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const params = useParams();
  const storeId = params?.store_id;
  const dispatch = useDispatch();

  useEffect(() => {
    if (storeId) {
      dispatch(fetchCurrentStore(storeId));
      dispatch(invalidateProducts());
      dispatch(invalidateCustomers());
      dispatch(invalidateInvoices());
      dispatch(fetchCategoriesThunk(storeId));
    }
  }, [storeId, dispatch]);

  return (
    <storeContext.Provider value={undefined}>{children}</storeContext.Provider>
  );
};
