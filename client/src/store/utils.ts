import {
  defaultPage,
  PageableType,
  PaginatedListData,
} from "@/types/PageableType";
import { PaginateResponseType } from "@/types/PaginatedResponseType";
import { createAsyncThunk, WritableDraft } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

export const createApiThunk = (
  type: string,
  func: (payload?: any) => Promise<any>,
) => {
  return createAsyncThunk(type, async (payload: any, { rejectWithValue }) => {
    try {
      const response = await func(payload);
      return response.data.data;
    } catch (err) {
      const error = err as any;
      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      if (status && status >= 400 && status < 500) {
        toast.error(message || "Something went wrong!");
      }

      const errorData = {
        data: error?.response?.data,
        status,
      };
      return rejectWithValue(errorData);
    }
  });
};

export const setState = (
  state: WritableDraft<any>,
  action: { type: string; payload: any },
  key: string = "status",
): void => {
  if (action.type.endsWith("/pending")) {
    state[key] = "loading";
    state.error = null;
  } else if (action.type.endsWith("/fulfilled")) {
    state[key] = "success";
    state.data = action.payload;
    state.error = null;
  } else if (action.type.endsWith("/rejected")) {
    state[key] = "failed";
    state.error = action.payload;
  }
};

export function concatPaginatedData<T>(
  listData: PaginatedListData<T>,
  doc: T,
): PaginatedListData<T> {
  const pages = listData.pages;

  if (Object.keys(pages).length === 0) {
    return {
      ...listData,
      pages: {
        1: {
          docs: [doc],
          pageable: { ...defaultPage, page: 1 },
        },
      },
    };
  }

  const lastPage = Math.max(...Object.keys(pages).map(Number));

  return {
    ...listData,
    pages: {
      ...pages,
      [lastPage]: {
        ...pages[lastPage],
        docs: [...pages[lastPage].docs, doc],
      },
    },
  };
}

export function transformPaginatedResponse<T>(
  response: PaginateResponseType<T>,
): { docs: T[]; pageable: PageableType } {
  return {
    docs: response.docs || [],
    pageable: {
      page: response.page,
      limit: response.limit,
      totalPages: response.totalPages,
      totalDocs: response.totalDocs,
    },
  };
}

export function setPagedDataToState<T>(
  state: WritableDraft<any>,
  action: { type: string; payload: any },
  dataKey: string,
  key: string,
): void {
  state[key] = "success";
  state.error = null;

  const { docs, pageable } = transformPaginatedResponse<T>(action.payload);

  state.data[dataKey] = {
    pages: {
      ...state.data[dataKey].pages,
      [pageable.page]: {
        docs: docs as T[],
        pageable,
      },
    },
    totalDocs: action.payload.totalDocs,
    totalPages: action.payload.totalPages,
  };
}
