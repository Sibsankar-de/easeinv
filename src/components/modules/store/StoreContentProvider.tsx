"use client";

import { AccessDeniedComponent } from "@/components/sections/AccessDeniedComponent";
import {
  clearGlobalError,
  selectGlobalErrorState,
} from "@/store/features/globalErrorSlice";
import { usePathname } from "next/navigation";
import React, { createContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const StoreContentContext = createContext<null>(null);

export const StoreContentProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data: globalError } = useSelector(selectGlobalErrorState);
  const dispatch = useDispatch();
  const pathname = usePathname();

  useEffect(() => {
    if (globalError?.status) {
      dispatch(clearGlobalError());
    }
  }, [pathname, dispatch]);

  function getChildren() {
    switch (globalError?.status) {
      case 403:
        return <AccessDeniedComponent />;

      default:
        return children;
    }
  }
  return (
    <StoreContentContext.Provider value={null}>
      {getChildren()}
    </StoreContentContext.Provider>
  );
};
