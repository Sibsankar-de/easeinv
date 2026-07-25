/* eslint-disable */
import { UserDto } from "@/types/dto/userDto";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { createApiThunk, setState } from "../utils";
import api from "@/configs/axios-config";

export const fetchCurrentUser: any = createApiThunk("/users/get", async () => {
  try {
    return await api.get("/users/current-user");
  } catch {}
});

export const updateUserThunk: any = createApiThunk(
  "/users/update",
  async (payload: { userName: string; email: string }) => {
    return await api.patch("/users/update-user", payload);
  },
);

export const updatePasswordThunk: any = createApiThunk(
  "/users/update-password",
  async (payload: any) => {
    return await api.patch("/users/update-password", payload);
  },
);

const initialState = {
  data: {} as UserDto,
  status: "idle",
  updateProfileStatus: "idle",
  updatePasswordStatus: "idle",
  error: null,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      if (action.payload) state.data = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchCurrentUser.pending, setState)
      .addCase(fetchCurrentUser.rejected, setState)
      .addCase(fetchCurrentUser.fulfilled, setState)

      // Update Username Thunk
      .addCase(updateUserThunk.pending, (state) => {
        state.updateProfileStatus = "loading";
        state.error = null;
      })
      .addCase(updateUserThunk.rejected, (state, action) => {
        state.updateProfileStatus = "failed";
        state.error = action.payload;
      })
      .addCase(updateUserThunk.fulfilled, (state, action) => {
        state.updateProfileStatus = "success";
        state.data = action.payload;
        state.error = null;
      })

      // Update Password Thunk
      .addCase(updatePasswordThunk.pending, (state) => {
        state.updatePasswordStatus = "loading";
        state.error = null;
      })
      .addCase(updatePasswordThunk.rejected, (state, action) => {
        state.updatePasswordStatus = "failed";
        state.error = action.payload;
      })
      .addCase(updatePasswordThunk.fulfilled, (state) => {
        state.updatePasswordStatus = "success";
        state.error = null;
      });
  },
});

export const selectUserSate = (state: RootState) => state.user;
export const { setCurrentUser } = userSlice.actions;
export default userSlice.reducer;
