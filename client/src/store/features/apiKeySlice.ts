import { ApiKeyDto } from "@/types/dto/apiKeyDto";
import { createSlice } from "@reduxjs/toolkit";
import { createApiThunk, setState } from "../utils";
import api from "@/configs/axios-config";
import { RootState } from "../store";

export const fetchApiKeyListThunk: any = createApiThunk(
  "/api-key/list",
  async (storeId: string) => await api.get(`api-keys/${storeId}`),
);

export const createApiKeyThunk: any = createApiThunk(
  "/api-key/create",
  async (data: { storeId: string; formData: Partial<ApiKeyDto> }) =>
    await api.post(`api-keys/${data.storeId}`, data.formData),
);

export const renameApiKeyThunk: any = createApiThunk(
  "/api-key/rename",
  async (data: {
    storeId: string;
    keyId: string;
    formData: Partial<ApiKeyDto>;
  }) =>
    await api.patch(
      `api-keys/rename/${data.storeId}/${data.keyId}`,
      data.formData,
    ),
);

export const deleteApiKeyThunk: any = createApiThunk(
  "/api-key/delete",
  async (data: { storeId: string; keyId: string }) =>
    await api.delete(`api-keys/${data.storeId}/${data.keyId}`),
);

const initialState = {
  data: {
    apiKeyList: [] as ApiKeyDto[],
  },
  createStatus: "idle",
  renameStatus: "idle",
  deleteStatus: "idle",
  status: "idle",
  error: null,
};

const apiKeySlice = createSlice({
  name: "apiKey",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchApiKeyListThunk.pending, setState)
      .addCase(fetchApiKeyListThunk.rejected, setState)
      .addCase(fetchApiKeyListThunk.fulfilled, (state, action) => {
        state.status = "success";
        state.error = null;
        state.data.apiKeyList = action.payload;
      })
      .addCase(createApiKeyThunk.pending, (state, action) =>
        setState(state, action, "createStatus"),
      )
      .addCase(createApiKeyThunk.rejected, (state, action) =>
        setState(state, action, "createStatus"),
      )
      .addCase(createApiKeyThunk.fulfilled, (state, action) => {
        state.createStatus = "success";
        state.error = null;
        state.data.apiKeyList.push(action.payload);
      })
      .addCase(renameApiKeyThunk.pending, (state, action) =>
        setState(state, action, "renameStatus"),
      )
      .addCase(renameApiKeyThunk.rejected, (state, action) =>
        setState(state, action, "renameStatus"),
      )
      .addCase(renameApiKeyThunk.fulfilled, (state, action) => {
        state.renameStatus = "success";
        state.error = null;
        state.data.apiKeyList = state.data.apiKeyList.map((item) =>
          item._id === action.payload._id ? action.payload : item,
        );
      })
      .addCase(deleteApiKeyThunk.pending, (state, action) =>
        setState(state, action, "deleteStatus"),
      )
      .addCase(deleteApiKeyThunk.rejected, (state, action) =>
        setState(state, action, "deleteStatus"),
      )
      .addCase(deleteApiKeyThunk.fulfilled, (state, action) => {
        state.deleteStatus = "success";
        state.error = null;
        state.data.apiKeyList = state.data.apiKeyList.filter(
          (item) => item._id !== action.meta.arg.keyId,
        );
      });
  },
});

export const selectApiKeyState = (state: RootState) => state.apiKey;
export default apiKeySlice.reducer;
