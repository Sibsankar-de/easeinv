"use client";

import { useStoreNavigation } from "@/hooks/store-navigation";
import {
  fetchDashboardSummaryThunk,
  selectDashboardSummaryState,
  setDashboardFilter,
} from "@/store/features/dashboardSummarySlice";
import { AppDispatch } from "@/store/store";
import { AnalyticsFilterState } from "@/types/AnalyticsTypes";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export const useDashboardSummary = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { storeId } = useStoreNavigation();
  const state = useSelector(selectDashboardSummaryState);
  const normalizedStoreId = Array.isArray(storeId) ? storeId[0] : storeId;

  useEffect(() => {
    if (!normalizedStoreId) return;
    dispatch(
      fetchDashboardSummaryThunk({
        storeId: normalizedStoreId,
        filter: state.filter,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.filter, normalizedStoreId, dispatch]);

  const setFilter = (filter: AnalyticsFilterState) => {
    dispatch(setDashboardFilter(filter));
  };

  const refetch = () => {
    if (!normalizedStoreId) return;
    dispatch(
      fetchDashboardSummaryThunk({
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
