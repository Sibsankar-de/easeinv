import { StoreDto, StoreUserInviteDto } from "@/types/dto/storeDto";
import { createSlice } from "@reduxjs/toolkit";
import { createApiThunk, setState } from "../utils";
import api from "@/configs/axios-config";
import { RootState } from "../store";

export const fetchStoreList: any = createApiThunk(
  "/stores/list",
  async () => await api.get("/stores/list"),
);

export const createNewStoreThunk: any = createApiThunk(
  "/stores/create",
  async (payload) => await api.post("/stores/create", payload),
);

export const fetchStoreUserInviteThunk: any = createApiThunk(
  "/stores/fetch-invite",
  async (inviteToken: string) =>
    await api.get(`/stores/user-invite/${inviteToken}`),
);

export const acceptStoreUserInviteThunk: any = createApiThunk(
  "/stores/accept-invite",
  async (inviteToken: string) =>
    await api.post(`/stores/user-invite/accept?token=${inviteToken}`),
);

const initialState = {
  data: {
    storeList: [] as StoreDto[],
    userInvite: {} as StoreUserInviteDto,
  },
  status: "idle",
  createStatus: "idle",
  userInviteGetStatus: "idle",
  userInviteAcceptStatus: "idle",
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
        setState(state, action, "createStatus"),
      )
      .addCase(createNewStoreThunk.rejected, (state, action) =>
        setState(state, action, "createStatus"),
      )
      .addCase(createNewStoreThunk.fulfilled, (state, action) => {
        state.createStatus = "success";
        state.data.storeList.push(action.payload);
        state.error = null;
      })
      .addCase(fetchStoreUserInviteThunk.pending, (state, action) =>
        setState(state, action, "userInviteGetStatus"),
      )
      .addCase(fetchStoreUserInviteThunk.rejected, (state, action) =>
        setState(state, action, "userInviteGetStatus"),
      )
      .addCase(fetchStoreUserInviteThunk.fulfilled, (state, action) => {
        state.userInviteGetStatus = "success";
        state.data.userInvite = action.payload;
        state.error = null;
      })
      .addCase(acceptStoreUserInviteThunk.pending, (state, action) =>
        setState(state, action, "userInviteAcceptStatus"),
      )
      .addCase(acceptStoreUserInviteThunk.rejected, (state, action) =>
        setState(state, action, "userInviteAcceptStatus"),
      )
      .addCase(acceptStoreUserInviteThunk.fulfilled, (state, action) => {
        state.userInviteAcceptStatus = "success";
        state.data.userInvite = {} as StoreUserInviteDto;
        state.error = null;
      });
  },
});

export const selectStoreState = (state: RootState) => state.store;
export default storeSlice.reducer;
