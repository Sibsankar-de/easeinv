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

export const revokeApiKeyThunk: any = createApiThunk(
  "/api-key/revoke",
  async (data: { storeId: string; keyId: string }) =>
    await api.patch(`api-keys/revoke/${data.storeId}/${data.keyId}`),
);

const initialState = {
  data: {
    apiKeyList: [] as ApiKeyDto[],
  },
  createStatus: "idle",
  renameStatus: "idle",
  revokeStatus: "idle",
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
        state.data.apiKeyList.map((item) =>
          item._id === action.payload._id ? action.payload : item,
        );
      })
      .addCase(revokeApiKeyThunk.pending, (state, action) =>
        setState(state, action, "revokeStatus"),
      )
      .addCase(revokeApiKeyThunk.rejected, (state, action) =>
        setState(state, action, "revokeStatus"),
      )
      .addCase(revokeApiKeyThunk.fulfilled, (state, action) => {
        state.revokeStatus = "success";
        state.error = null;
        state.data.apiKeyList.filter((item) =>
          item._id === action.payload._id ? action.payload : item,
        );
      });
  },
});

export const selectApiKeyState = (state: RootState) => state.apiKey;
export default apiKeySlice.reducer;
