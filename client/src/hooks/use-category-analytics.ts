"use client";

import { useStoreNavigation } from "@/hooks/store-navigation";
import {
  fetchCategoryAnalyticsThunk,
  selectCategoryAnalyticsState,
  setCategoryFilter,
} from "@/store/features/categoryAnalyticsSlice";
import { AppDispatch } from "@/store/store";
import { CategoryAnalyticsFilter } from "@/types/AnalyticsTypes";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export const useCategoryAnalytics = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { storeId } = useStoreNavigation();
  const state = useSelector(selectCategoryAnalyticsState);
  const normalizedStoreId = Array.isArray(storeId) ? storeId[0] : storeId;

  useEffect(() => {
    if (!normalizedStoreId) return;
    dispatch(
      fetchCategoryAnalyticsThunk({
        storeId: normalizedStoreId,
        filter: state.filter,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.filter, normalizedStoreId, dispatch]);

  const setFilter = (filter: CategoryAnalyticsFilter) => {
    dispatch(setCategoryFilter(filter));
  };

  const refetch = () => {
    if (!normalizedStoreId) return;
    dispatch(
      fetchCategoryAnalyticsThunk({
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
