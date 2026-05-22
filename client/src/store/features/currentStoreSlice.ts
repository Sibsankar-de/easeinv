import { CustomerDto } from "@/types/dto/customerDto";
import {
  StoreAccessorDto,
  StoreDto,
  StoreSettingsDto,
} from "@/types/dto/storeDto";
import { createApiThunk, setState } from "../utils";
import api from "@/configs/axios-config";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { createInvoiceThunk } from "./invoiceSlice";

export const fetchCurrentStore: any = createApiThunk(
  "/current-store/store",
  async (storeId: string) => await api.get(`/stores/${storeId}`),
);

export const fetchCustomerList: any = createApiThunk(
  "/current-store/customers",
  async (storeId: string) => await api.get(`/stores/${storeId}/customer-list`),
);

export const updateStoreDetailsThunk: any = createApiThunk(
  "/current-store/update-store-details",
  async (data: { storeId: string; updateData: Partial<StoreDto> }) =>
    await api.patch(`/stores/${data.storeId}`, data.updateData),
);

export const updateStoreSettingsThunk: any = createApiThunk(
  "/current-store/update-store-settings",
  async (data: { storeId: string; updateData: Partial<StoreDto> }) =>
    await api.post(`/stores/${data.storeId}/update-settings`, data.updateData),
);

export const uploadStoreLogoThunk: any = createApiThunk(
  "/current-store/upload-store-logo",
  async (data: { storeId: string; formData: FormData }) =>
    await api.post(`/stores/${data.storeId}/upload-logo`, data.formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
);

export const uploadQRCodeThunk: any = createApiThunk(
  "/current-store/upload-qr-logo",
  async (data: { storeId: string; formData: FormData }) =>
    await api.post(`/stores/${data.storeId}/upload-qr`, data.formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
);

export const fetchAccessorsListThunk: any = createApiThunk(
  "/current-store/fetch-accessors",
  async (storeId: string) => await api.get(`/stores/${storeId}/users`),
);

export const addStoreAccessorThunk: any = createApiThunk(
  "/current-store/add-accessor",
  async (data: { storeId: string; userData: any }) =>
    await api.post(`/stores/${data.storeId}/users`, data.userData),
);

export const updateStoreAccessorRoleThunk: any = createApiThunk(
  "/current-store/update-accessor-role",
  async (data: { storeId: string; userId: string; newRole: string }) =>
    await api.patch(`/stores/${data.storeId}/users/${data.userId}`, {
      role: data.newRole,
    }),
);

export const removeStoreAccessorThunk: any = createApiThunk(
  "/current-store/remove-accessor",
  async (data: { storeId: string; userId: string }) =>
    await api.delete(`/stores/${data.storeId}/users/${data.userId}`),
);

const initialState = {
  data: {
    currentStore: {} as StoreDto,
    storeSettings: {} as StoreSettingsDto,
    customerList: [] as CustomerDto[],
    accessorsList: [] as StoreAccessorDto[],
  },
  status: "idle",
  customerStatus: "idle",
  storeUpdateStatus: "idle",
  settingsUpdateStatus: "idle",
  logoUploadStatus: "idle",
  qrUploadStatus: "idle",
  accessorsStatus: "idle",
  accessorAddStatus: "idle",
  accessorUpdateStatus: "idle",
  accessorDeleteStatus: "idle",
  error: null,
};

const currentStoreSlice = createSlice({
  name: "currentStore",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchCurrentStore.pending, setState)
      .addCase(fetchCurrentStore.rejected, setState)
      .addCase(fetchCurrentStore.fulfilled, (state, action) => {
        state.status = "success";
        state.data.currentStore = action.payload;
        state.data.storeSettings = action.payload.storeSettings;
        state.error = null;
      })
      .addCase(fetchCustomerList.pending, (state, action) =>
        setState(state, action, "customerStatus"),
      )
      .addCase(fetchCustomerList.rejected, (state, action) =>
        setState(state, action, "customerStatus"),
      )
      .addCase(fetchCustomerList.fulfilled, (state, action) => {
        state.customerStatus = "success";
        state.data.customerList = action.payload;
        state.error = null;
      })
      .addCase(updateStoreDetailsThunk.pending, (state, action) =>
        setState(state, action, "storeUpdateStatus"),
      )
      .addCase(updateStoreDetailsThunk.rejected, (state, action) =>
        setState(state, action, "storeUpdateStatus"),
      )
      .addCase(updateStoreDetailsThunk.fulfilled, (state, action) => {
        state.storeUpdateStatus = "success";
        state.data.currentStore = action.payload;
        state.error = null;
      })
      .addCase(updateStoreSettingsThunk.pending, (state, action) =>
        setState(state, action, "settingsUpdateStatus"),
      )
      .addCase(updateStoreSettingsThunk.rejected, (state, action) =>
        setState(state, action, "settingsUpdateStatus"),
      )
      .addCase(updateStoreSettingsThunk.fulfilled, (state, action) => {
        state.settingsUpdateStatus = "success";
        state.data.storeSettings = action.payload;
        state.error = null;
      })
      .addCase(createInvoiceThunk.fulfilled, (state, action) => {
        state.data.currentStore.lastInvoiceNumber =
          action.payload.invoiceNumber;
      })
      .addCase(uploadStoreLogoThunk.pending, (state, action) =>
        setState(state, action, "logoUploadStatus"),
      )
      .addCase(uploadStoreLogoThunk.rejected, (state, action) =>
        setState(state, action, "logoUploadStatus"),
      )
      .addCase(uploadStoreLogoThunk.fulfilled, (state, action) => {
        state.logoUploadStatus = "success";
        state.data.storeSettings.invoiceStoreLogoUrl = action.payload.logoUrl;
        state.error = null;
      })
      .addCase(uploadQRCodeThunk.pending, (state, action) =>
        setState(state, action, "qrUploadStatus"),
      )
      .addCase(uploadQRCodeThunk.rejected, (state, action) =>
        setState(state, action, "qrUploadStatus"),
      )
      .addCase(uploadQRCodeThunk.fulfilled, (state, action) => {
        state.qrUploadStatus = "success";
        state.data.storeSettings.invoicePaymentQrCode =
          action.payload.qrCodeUrl;
        state.error = null;
      })
      .addCase(fetchAccessorsListThunk.pending, (state, action) =>
        setState(state, action, "accessorsStatus"),
      )
      .addCase(fetchAccessorsListThunk.rejected, (state, action) =>
        setState(state, action, "accessorsStatus"),
      )
      .addCase(fetchAccessorsListThunk.fulfilled, (state, action) => {
        state.accessorsStatus = "success";
        state.data.accessorsList = action.payload;
        state.error = null;
      })
      .addCase(addStoreAccessorThunk.pending, (state, action) =>
        setState(state, action, "accessorAddStatus"),
      )
      .addCase(addStoreAccessorThunk.rejected, (state, action) =>
        setState(state, action, "accessorAddStatus"),
      )
      .addCase(addStoreAccessorThunk.fulfilled, (state, action) => {
        state.accessorAddStatus = "success";
        state.data.accessorsList.push(action.payload);
        state.error = null;
      })
      .addCase(updateStoreAccessorRoleThunk.pending, (state, action) =>
        setState(state, action, "accessorUpdateStatus"),
      )
      .addCase(updateStoreAccessorRoleThunk.rejected, (state, action) =>
        setState(state, action, "accessorUpdateStatus"),
      )
      .addCase(updateStoreAccessorRoleThunk.fulfilled, (state, action) => {
        state.accessorUpdateStatus = "success";
        const index = state.data.accessorsList.findIndex(
          (a) => a.userId === action.payload.userId,
        );
        if (index !== -1) {
          state.data.accessorsList[index].role = action.payload.role;
        }
        state.error = null;
      })
      .addCase(removeStoreAccessorThunk.pending, (state, action) =>
        setState(state, action, "accessorDeleteStatus"),
      )
      .addCase(removeStoreAccessorThunk.rejected, (state, action) =>
        setState(state, action, "accessorDeleteStatus"),
      )
      .addCase(removeStoreAccessorThunk.fulfilled, (state, action) => {
        state.accessorDeleteStatus = "success";
        state.data.accessorsList = state.data.accessorsList.filter(
          (a) => a.userId !== action.payload.userId,
        );
        state.error = null;
      });
  },
});

export const selectCurrentStoreState = (state: RootState) => state.currentStore;
export default currentStoreSlice.reducer;
