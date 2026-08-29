import api from "@/configs/axios-config";
import {
  OrderDto,
  OrderSummaryDto,
  UpdateOrderStatusDto,
} from "@/types/dto/orderDto";
import { PaginatedPages } from "@/types/PageableType";
import { createApiThunk, setPagedDataToState, setState } from "../utils";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

export const fetchOrderListThunk = createApiThunk(
  "/orders/list",
  async (payload: {
    storeId: string;
    page: number;
    limit: number;
    status?: string;
    customerId?: string;
    query?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => {
    let url = `/orders/${payload.storeId}?page=${payload.page}&limit=${payload.limit}`;
    if (payload.status) url += `&status=${payload.status}`;
    if (payload.customerId) url += `&customerId=${payload.customerId}`;
    if (payload.query) url += `&query=${encodeURIComponent(payload.query)}`;
    if (payload.sortBy) url += `&sortBy=${payload.sortBy}`;
    if (payload.sortOrder) url += `&sortOrder=${payload.sortOrder}`;
    return await api.get(url);
  },
);

export const fetchOrderByIdThunk = createApiThunk(
  "/orders/fetch-by-id",
  async (payload: { storeId: string; orderId: string }) =>
    await api.get(`/orders/${payload.storeId}/${payload.orderId}`),
);

export const updateOrderStatusThunk = createApiThunk(
  "/orders/update-status",
  async (payload: {
    storeId: string;
    orderId: string;
    data: UpdateOrderStatusDto;
  }) =>
    await api.patch(
      `/orders/${payload.storeId}/${payload.orderId}/status`,
      payload.data,
    ),
);

export const deleteOrderThunk = createApiThunk(
  "/orders/delete",
  async (payload: { storeId: string; orderId: string }) =>
    await api.delete(`/orders/${payload.storeId}/${payload.orderId}`),
);

const initialState = {
  data: {
    orderPagedData: {
      pages: {} as PaginatedPages<OrderSummaryDto>,
      totalDocs: 0,
      totalPages: 0,
    },
    currentOrder: null as OrderDto | null,
  },
  status: "idle",
  getStatus: "idle",
  updateStatus: "idle",
  deleteStatus: "idle",
  error: null,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    invalidateOrderPages: (state) => {
      state.data.orderPagedData = {
        pages: {},
        totalDocs: 0,
        totalPages: 0,
      };
      state.status = "idle";
    },
    clearCurrentOrder: (state) => {
      state.data.currentOrder = null;
      state.getStatus = "idle";
    },
    invalidate: () => initialState,
  },
  extraReducers(builder) {
    // List
    builder.addCase(fetchOrderListThunk.pending, (state, action) => {
      setState(state, action);
    });
    builder.addCase(fetchOrderListThunk.fulfilled, (state, action) => {
      setPagedDataToState<OrderSummaryDto>(
        state,
        action,
        "orderPagedData",
        "status",
      );
    });
    builder.addCase(fetchOrderListThunk.rejected, (state, action) => {
      setState(state, action);
    });

    // Get by ID
    builder.addCase(fetchOrderByIdThunk.pending, (state, action) => {
      setState(state, action, "getStatus");
    });
    builder.addCase(fetchOrderByIdThunk.fulfilled, (state, action) => {
      state.getStatus = "success";
      state.data.currentOrder = action.payload;
      state.error = null;
    });
    builder.addCase(fetchOrderByIdThunk.rejected, (state, action) => {
      setState(state, action, "getStatus");
    });

    // Update Status
    builder.addCase(updateOrderStatusThunk.pending, (state, action) => {
      setState(state, action, "updateStatus");
    });
    builder.addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
      state.updateStatus = "success";
      state.data.currentOrder = action.payload;
      state.error = null;
    });
    builder.addCase(updateOrderStatusThunk.rejected, (state, action) => {
      setState(state, action, "updateStatus");
    });

    // Delete
    builder.addCase(deleteOrderThunk.pending, (state, action) => {
      setState(state, action, "deleteStatus");
    });
    builder.addCase(deleteOrderThunk.fulfilled, (state, action) => {
      setState(state, action, "deleteStatus");
    });
    builder.addCase(deleteOrderThunk.rejected, (state, action) => {
      setState(state, action, "deleteStatus");
    });
  },
});

export const { invalidateOrderPages, clearCurrentOrder, invalidate } =
  orderSlice.actions;

export const selectOrderState = (state: RootState) => state.order;

export default orderSlice.reducer;
