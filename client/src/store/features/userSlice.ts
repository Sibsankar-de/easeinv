import { UserDto } from "@/types/dto/userDto";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { createApiThunk, setState } from "../utils";
import api from "@/configs/axios-config";

export const fetchCurrentUser: any = createApiThunk("/users/get", async () => {
  try {
    return await api.get("/users/current-user");
  } catch (error) {}
});

const initialState = {
  data: {} as UserDto,
  status: "idle",
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
      .addCase(fetchCurrentUser.fulfilled, setState);
  },
});

export const selectUserSate = (state: RootState) => state.user;
export const { setCurrentUser } = userSlice.actions;
export default userSlice.reducer;
