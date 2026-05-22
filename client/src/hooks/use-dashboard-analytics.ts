"use client";

import { useStoreNavigation } from "@/hooks/store-navigation";
import {
  fetchDashboardAnalyticsThunk,
  selectAnalyticsState,
  setAnalyticsPeriod,
} from "@/store/features/analyticsSlice";
import { AppDispatch } from "@/store/store";
import { AnalyticsPeriod } from "@/types/DashboardAnalyticsType";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export const useDashboardAnalytics = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { storeId } = useStoreNavigation();
  const analyticsState = useSelector(selectAnalyticsState);
  const normalizedStoreId = Array.isArray(storeId) ? storeId[0] : storeId;

  useEffect(() => {
    if (!normalizedStoreId) return;
    dispatch(
      fetchDashboardAnalyticsThunk({
        storeId: normalizedStoreId,
        period: analyticsState.period,
      }),
    );
  }, [analyticsState.period, dispatch, normalizedStoreId]);

  const setPeriod = (period: AnalyticsPeriod) => {
    dispatch(setAnalyticsPeriod(period));
  };

  return {
    ...analyticsState,
    isLoading:
      analyticsState.status === "idle" || analyticsState.status === "loading",
    setPeriod,
  };
};
