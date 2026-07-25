import { createSlice } from "@reduxjs/toolkit";
import { createApiThunk, setPagedDataToState, setState } from "../utils";
import api from "@/configs/axios-config";
import { ProductDto } from "@/types/dto/productDto";
import { RootState } from "../store";
import { CategoryDto } from "@/types/dto/categoryDto";
import { PaginatedPages } from "@/types/PageableType";

export const fetchProducts: any = createApiThunk(
  "products/list",
  async (payload: any) => {
    let url = `/products/${payload.storeId}?page=${payload.page}&limit=${payload.limit}`;
    if (payload.query) url += `&query=${encodeURIComponent(payload.query)}`;
    if (payload.sortBy) url += `&sortBy=${payload.sortBy}`;
    if (payload.sortOrder) url += `&sortOrder=${payload.sortOrder}`;
    return await api.get(url);
  },
);

export const getProductDetailsThunk: any = createApiThunk(
  "products/details",
  async (payload) =>
    await api.get(`/products/${payload.storeId}/${payload.productId}`),
);

export const addNewProductThunk: any = createApiThunk(
  "/products/create",
  async (payload) => await api.post(`/products/${payload.storeId}`, payload),
);

export const updateProductThunk: any = createApiThunk(
  "/products/update",
  async (payload) =>
    await api.patch(
      `/products/${payload.storeId}/${payload.productId}`,
      payload,
    ),
);

export const deleteProductThunk: any = createApiThunk(
  "/products/delete",
  async (payload) =>
    await api.delete(`/products/${payload.storeId}/${payload.productId}`),
);

export const rearrangeProductImagesThunk: any = createApiThunk(
  "/products/rearrange-images",
  async (payload: any) =>
    await api.patch(
      `/products/${payload.storeId}/${payload.productId}/rearrange-images`,
      { imagePriorities: payload.imagePriorities },
    ),
);

export const fetchCategoriesThunk: any = createApiThunk(
  "categories/list",
  async (storeId) => await api.get(`/categories/${storeId}/list`),
);

export const createCategoryThunk: any = createApiThunk(
  "categories/create",
  async (payload) => await api.post(`/categories/${payload.storeId}`, payload),
);

export const searchProductsThunk: any = createApiThunk(
  "products/search",
  async (payload) =>
    await api.get(
      `/search/${payload.storeId}/products?query=${encodeURIComponent(
        payload.query,
      )}`,
    ),
);

const initialState = {
  data: {
    productList: {
      pages: {} as PaginatedPages<ProductDto>,
      totalDocs: 0,
      totalPages: 0,
    },
    categoryList: [] as CategoryDto[],
  },
  status: "idle",
  getStatus: "idle",
  createStatus: "idle",
  updateStatus: "idle",
  deleteStatus: "idle",
  categoryStatus: "idle",
  searchStatus: "idle",
  rearrangeStatus: "idle",
  error: null,
};

const inventorySlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearProductList: (state) => {
      state.data.productList = {
        pages: {},
        totalDocs: 0,
        totalPages: 0,
      };
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchProducts.pending, setState)
      .addCase(fetchProducts.rejected, setState)
      .addCase(fetchProducts.fulfilled, (state, action) =>
        setPagedDataToState(state, action, "productList", "status"),
      )
      .addCase(addNewProductThunk.pending, (state, action) =>
        setState(state, action, "createStatus"),
      )
      .addCase(addNewProductThunk.rejected, (state, action) =>
        setState(state, action, "createStatus"),
      )
      .addCase(addNewProductThunk.fulfilled, (state, action) => {
        state.createStatus = "success";
        state.error = null;
      })
      .addCase(updateProductThunk.pending, (state, action) =>
        setState(state, action, "updateStatus"),
      )
      .addCase(updateProductThunk.rejected, (state, action) =>
        setState(state, action, "updateStatus"),
      )
      .addCase(updateProductThunk.fulfilled, (state, action) => {
        state.updateStatus = "success";
        state.error = null;
      })

      .addCase(deleteProductThunk.pending, (state, action) =>
        setState(state, action, "deleteStatus"),
      )
      .addCase(deleteProductThunk.rejected, (state, action) =>
        setState(state, action, "deleteStatus"),
      )
      .addCase(deleteProductThunk.fulfilled, (state, action) => {
        state.deleteStatus = "success";
        state.error = null;
      })
      .addCase(rearrangeProductImagesThunk.pending, (state, action) =>
        setState(state, action, "rearrangeStatus"),
      )
      .addCase(rearrangeProductImagesThunk.rejected, (state, action) =>
        setState(state, action, "rearrangeStatus"),
      )
      .addCase(rearrangeProductImagesThunk.fulfilled, (state, action) => {
        state.rearrangeStatus = "success";
        state.error = null;
      })
      .addCase(fetchCategoriesThunk.pending, (state, action) =>
        setState(state, action, "categoryStatus"),
      )
      .addCase(fetchCategoriesThunk.rejected, (state, action) =>
        setState(state, action, "categoryStatus"),
      )
      .addCase(fetchCategoriesThunk.fulfilled, (state, action) => {
        state.categoryStatus = "success";
        state.error = null;
        state.data.categoryList = action.payload;
      })
      .addCase(createCategoryThunk.pending, (state, action) =>
        setState(state, action, "categoryStatus"),
      )
      .addCase(createCategoryThunk.rejected, (state, action) =>
        setState(state, action, "categoryStatus"),
      )
      .addCase(createCategoryThunk.fulfilled, (state, action) => {
        state.categoryStatus = "success";
        state.error = null;
        state.data.categoryList.push(action.payload);
      })
      .addCase(searchProductsThunk.pending, (state, action) =>
        setState(state, action, "searchStatus"),
      )
      .addCase(searchProductsThunk.rejected, (state, action) =>
        setState(state, action, "searchStatus"),
      )
      .addCase(searchProductsThunk.fulfilled, (state, action) => {
        state.searchStatus = "success";
        state.error = null;
      })
      .addCase(getProductDetailsThunk.pending, (state, action) =>
        setState(state, action, "getStatus"),
      )
      .addCase(getProductDetailsThunk.rejected, (state, action) =>
        setState(state, action, "getStatus"),
      )
      .addCase(getProductDetailsThunk.fulfilled, (state, action) => {
        state.getStatus = "success";
        state.error = null;
      });
  },
});

export const selectInventoryState = (state: RootState) => state.inventory;
export const { clearProductList } = inventorySlice.actions;
export default inventorySlice.reducer;
