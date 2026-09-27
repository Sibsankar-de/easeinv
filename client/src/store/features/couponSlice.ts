import api from "@/configs/axios-config";
import { CouponCreateUpdateDto, CouponDto } from "@/types/dto/couponDto";
import { PaginatedPages } from "@/types/PageableType";
import { createApiThunk, setPagedDataToState, setState } from "../utils";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

export const fetchCouponListThunk = createApiThunk(
  "/coupons/list",
  async (payload: {
    storeId: string;
    page: number;
    limit: number;
    query?: string;
    isActive?: boolean;
    discountType?: string;
    categoryId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => {
    let url = `/coupons/${payload.storeId}?page=${payload.page}&limit=${payload.limit}`;

    if (payload.query) url += `&query=${encodeURIComponent(payload.query)}`;
    if (payload.isActive !== undefined) url += `&isActive=${payload.isActive}`;
    if (payload.discountType) url += `&discountType=${payload.discountType}`;
    if (payload.categoryId) url += `&categoryId=${payload.categoryId}`;
    if (payload.sortBy) url += `&sortBy=${payload.sortBy}`;
    if (payload.sortOrder) url += `&sortOrder=${payload.sortOrder}`;

    return await api.get(url);
  },
);

export const getCouponDetailsThunk = createApiThunk(
  "/coupons/details",
  async (payload: { storeId: string; couponId: string }) =>
    await api.get(`/coupons/${payload.storeId}/${payload.couponId}`),
);

export const createCouponThunk = createApiThunk(
  "/coupons/create",
  async (payload: { storeId: string; data: CouponCreateUpdateDto }) =>
    await api.post(`/coupons/${payload.storeId}`, payload.data),
);

export const updateCouponThunk = createApiThunk(
  "/coupons/update",
  async (payload: {
    storeId: string;
    couponId: string;
    data: CouponCreateUpdateDto;
  }) =>
    await api.patch(
      `/coupons/${payload.storeId}/${payload.couponId}`,
      payload.data,
    ),
);

export const deleteCouponThunk = createApiThunk(
  "/coupons/delete",
  async (payload: { storeId: string; couponId: string }) =>
    await api.delete(`/coupons/${payload.storeId}/${payload.couponId}`),
);

const initialState = {
  data: {
    couponListData: {
      pages: {} as PaginatedPages<CouponDto>,
      totalDocs: 0,
      totalPages: 0,
    },
    currentCoupon: null as CouponDto | null,
  },
  status: "idle",
  getStatus: "idle",
  createStatus: "idle",
  updateStatus: "idle",
  deleteStatus: "idle",
  error: null,
};

const couponSlice = createSlice({
  name: "coupons",
  initialState,
  reducers: {
    invalidateCouponPages: (state) => {
      state.data.couponListData = {
        pages: {},
        totalDocs: 0,
        totalPages: 0,
      };
      state.status = "idle";
    },
    clearCurrentCoupon: (state) => {
      state.data.currentCoupon = null;
      state.getStatus = "idle";
    },
    invalidate: () => initialState,
  },
  extraReducers(builder) {
    builder
      .addCase(fetchCouponListThunk.pending, setState)
      .addCase(fetchCouponListThunk.rejected, setState)
      .addCase(fetchCouponListThunk.fulfilled, (state, action) =>
        setPagedDataToState(state, action, "couponListData", "status"),
      )
      .addCase(getCouponDetailsThunk.pending, (state, action) =>
        setState(state, action, "getStatus"),
      )
      .addCase(getCouponDetailsThunk.rejected, (state, action) =>
        setState(state, action, "getStatus"),
      )
      .addCase(getCouponDetailsThunk.fulfilled, (state, action) => {
        state.getStatus = "success";
        state.data.currentCoupon = action.payload;
        state.error = null;
      })
      .addCase(createCouponThunk.pending, (state, action) =>
        setState(state, action, "createStatus"),
      )
      .addCase(createCouponThunk.rejected, (state, action) =>
        setState(state, action, "createStatus"),
      )
      .addCase(createCouponThunk.fulfilled, (state) => {
        state.createStatus = "success";
        state.error = null;
      })
      .addCase(updateCouponThunk.pending, (state, action) =>
        setState(state, action, "updateStatus"),
      )
      .addCase(updateCouponThunk.rejected, (state, action) =>
        setState(state, action, "updateStatus"),
      )
      .addCase(updateCouponThunk.fulfilled, (state) => {
        state.updateStatus = "success";
        state.error = null;
      })
      .addCase(deleteCouponThunk.pending, (state, action) =>
        setState(state, action, "deleteStatus"),
      )
      .addCase(deleteCouponThunk.rejected, (state, action) =>
        setState(state, action, "deleteStatus"),
      )
      .addCase(deleteCouponThunk.fulfilled, (state) => {
        state.deleteStatus = "success";
        state.error = null;
      });
  },
});

export const selectCouponState = (state: RootState) => state.coupons;
export const { invalidateCouponPages, clearCurrentCoupon, invalidate } =
  couponSlice.actions;
export default couponSlice.reducer;
