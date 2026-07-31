"use client";

import { useStoreNavigation } from "@/hooks/store-navigation";
import {
  fetchSalesAnalyticsThunk,
  selectSalesAnalyticsState,
  setSalesFilter,
} from "@/store/features/salesAnalyticsSlice";
import { AppDispatch } from "@/store/store";
import { AnalyticsFilterState } from "@/types/AnalyticsTypes";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export const useSalesAnalytics = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { storeId } = useStoreNavigation();
  const state = useSelector(selectSalesAnalyticsState);
  const normalizedStoreId = Array.isArray(storeId) ? storeId[0] : storeId;

  useEffect(() => {
    if (!normalizedStoreId) return;
    dispatch(
      fetchSalesAnalyticsThunk({
        storeId: normalizedStoreId,
        filter: state.filter,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.filter, normalizedStoreId, dispatch]);

  const setFilter = (filter: AnalyticsFilterState) => {
    dispatch(setSalesFilter(filter));
  };

  const refetch = () => {
    if (!normalizedStoreId) return;
    dispatch(
      fetchSalesAnalyticsThunk({
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
