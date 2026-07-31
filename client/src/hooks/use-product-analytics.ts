"use client";

import { useStoreNavigation } from "@/hooks/store-navigation";
import {
  fetchProductAnalyticsThunk,
  selectProductAnalyticsState,
  setProductFilter,
} from "@/store/features/productAnalyticsSlice";
import { AppDispatch } from "@/store/store";
import { ProductAnalyticsFilter } from "@/types/AnalyticsTypes";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export const useProductAnalytics = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { storeId } = useStoreNavigation();
  const state = useSelector(selectProductAnalyticsState);
  const normalizedStoreId = Array.isArray(storeId) ? storeId[0] : storeId;

  useEffect(() => {
    if (!normalizedStoreId) return;
    dispatch(
      fetchProductAnalyticsThunk({
        storeId: normalizedStoreId,
        filter: state.filter,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.filter, normalizedStoreId, dispatch]);

  const setFilter = (filter: ProductAnalyticsFilter) => {
    dispatch(setProductFilter(filter));
  };

  const refetch = () => {
    if (!normalizedStoreId) return;
    dispatch(
      fetchProductAnalyticsThunk({
        storeId: normalizedStoreId,
        filter: state.filter,
      }),
    );
  };

  return {
    data: state.data,
    filter: state.filter,
    isLoading: state.status === "idle" || state.status === "loading",
    isError: state.status === "failed",
    setFilter,
    refetch,
  };
};
