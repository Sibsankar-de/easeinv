"use client";

import {
  fetchCurrentStore,
  fetchCustomerList,
  selectCurrentStoreState,
} from "@/store/features/currentStoreSlice";
import {
  fetchCategoriesThunk,
  fetchProducts,
  selectProductState,
} from "@/store/features/productSlice";
import { useParams } from "next/navigation";
import React, { createContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const storeContext = createContext<undefined>(undefined);

export const StoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const params = useParams();
  const storeId = params?.store_id;
  const dispatch = useDispatch();
  const { customerStatus } = useSelector(selectCurrentStoreState);
  const { status: listStatus, categoryStatus } =
    useSelector(selectProductState);

  useEffect(() => {
    if (storeId) {
      dispatch(fetchCurrentStore(storeId));

      if (categoryStatus === "idle") {
        dispatch(fetchCategoriesThunk(storeId));
      }
    }
  }, [storeId, dispatch]);

  return (
    <storeContext.Provider value={undefined}>{children}</storeContext.Provider>
  );
};
