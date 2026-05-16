import api from "@/configs/axios-config";
import { CustomerDto } from "@/types/dto/customerDto";
import { PaginatedPages } from "@/types/PageableType";
import { createApiThunk, setState, transformPaginatedResponse } from "../utils";
import { createSlice } from "@reduxjs/toolkit";

export const fetchCustomerListThunk: any = createApiThunk(
  "/customers/list",
  async (payload: any) => {
    let url = payload.query
      ? `/search/${payload.storeId}/customers?query=${payload.query}&page=${payload.page}&limit=${payload.limit}`
      : `/customers/${payload.storeId}/list?page=${payload.page}&limit=${payload.limit}`;

    if (payload.sortBy) url += `&sortBy=${payload.sortBy}`;
    if (payload.sortOrder) url += `&sortOrder=${payload.sortOrder}`;

    return await api.get(url);
  },
);

export const customerSearchThunk: any = createApiThunk(
  "/customers/search",
  async (payload: any) =>
    await api.get(
      `/search/${payload.storeId}/customers?query=${payload.query}&page=${payload.page}&limit=${payload.limit}`,
    ),
);

const initialState = {
  data: {
    customerListData: {
      pages: {} as PaginatedPages<CustomerDto>,
      totalDocs: 0,
      totalPages: 0,
    },
    customerSearchData: {
      pages: {} as PaginatedPages<CustomerDto>,
      totalDocs: 0,
      totalPages: 0,
    },
  },
  status: "idle",
  createStatus: "idle",
  searchStatus: "idle",
  error: null,
};

const customerSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    clearCustomerListData: (state) => {
      state.data.customerListData = {
        pages: {},
        totalDocs: 0,
        totalPages: 0,
      };
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchCustomerListThunk.pending, setState)
      .addCase(fetchCustomerListThunk.rejected, setState)
      .addCase(fetchCustomerListThunk.fulfilled, (state, action) => {
        state.status = "success";
        const { docs, pageable } = transformPaginatedResponse(action.payload);
        state.data.customerListData = {
          pages: {
            ...state.data.customerListData.pages,
            [pageable.page]: {
              docs: docs as CustomerDto[],
              pageable,
            },
          },
          totalDocs: action.payload.totalDocs,
          totalPages: action.payload.totalPages,
        };
        state.error = null;
      })
      .addCase(customerSearchThunk.pending, (state, action) =>
        setState(state, action, "searchStatus"),
      )
      .addCase(customerSearchThunk.rejected, (state, action) =>
        setState(state, action, "searchStatus"),
      )
      .addCase(customerSearchThunk.fulfilled, (state, action) => {
        state.searchStatus = "success";
        state.error = null;
      });
  },
});

export const selectCustomerState = (state: any) => state.customers;
export const { clearCustomerListData } = customerSlice.actions;
export default customerSlice.reducer;
