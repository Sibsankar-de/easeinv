import { StoreDto } from "@/types/dto/storeDto";
import { createSlice } from "@reduxjs/toolkit";
import { createApiThunk, setState } from "../utils";
import api from "@/configs/axios-config";
import { RootState } from "../store";
import { CustomerDto } from "@/types/dto/customerDto";

export const fetchStoreList: any = createApiThunk(
  "/stores/list",
  async () => await api.get("/stores/list")
);

export const createNewStoreThunk: any = createApiThunk(
  "/stores/create",
  async (payload) => await api.post("/stores/create", payload)
);

const initialState = {
  data: {
    storeList: [] as StoreDto[],
  },
  status: "idle",
  createStatus: "idle",
  error: null,
};

const storeSlice = createSlice({
  name: "stores",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchStoreList.pending, setState)
      .addCase(fetchStoreList.rejected, setState)
      .addCase(fetchStoreList.fulfilled, (state, action) => {
        state.status = "success";
        state.data.storeList = action.payload;
        state.error = null;
      })
      .addCase(createNewStoreThunk.pending, (state, action) =>
        setState(state, action, "createStatus")
      )
      .addCase(createNewStoreThunk.rejected, (state, action) =>
        setState(state, action, "createStatus")
      )
      .addCase(createNewStoreThunk.fulfilled, (state, action) => {
        state.createStatus = "success";
        state.data.storeList.push(action.payload);
        state.error = null;
      });
  },
});

export const selectStoreState = (state: RootState) => state.store;
export default storeSlice.reducer;
