"use client";

import { useStoreNavigation } from "@/hooks/store-navigation";
import {
  fetchCustomerAnalyticsThunk,
  selectCustomerAnalyticsState,
  setCustomerFilter,
} from "@/store/features/customerAnalyticsSlice";
import { AppDispatch } from "@/store/store";
import { CustomerAnalyticsFilter } from "@/types/AnalyticsTypes";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export const useCustomerAnalytics = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { storeId } = useStoreNavigation();
  const state = useSelector(selectCustomerAnalyticsState);
  const normalizedStoreId = Array.isArray(storeId) ? storeId[0] : storeId;

  useEffect(() => {
    if (!normalizedStoreId) return;
    dispatch(
      fetchCustomerAnalyticsThunk({
        storeId: normalizedStoreId,
        filter: state.filter,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.filter, normalizedStoreId, dispatch]);

  const setFilter = (filter: CustomerAnalyticsFilter) => {
    dispatch(setCustomerFilter(filter));
  };

  const refetch = () => {
    if (!normalizedStoreId) return;
    dispatch(
      fetchCustomerAnalyticsThunk({
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
