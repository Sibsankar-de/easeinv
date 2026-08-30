import api from "@/configs/axios-config";
import {
  ShippingProfileCreateDto,
  ShippingProfileDto,
  ShippingProfileSummaryDto,
  ShippingProfileUpdateDto,
  ShippingRuleCreateDto,
  ShippingRuleUpdateDto,
  ShippingZoneCreateDto,
  ShippingZoneUpdateDto,
} from "@/types/dto/shippingProfileDto";
import { PaginatedPages } from "@/types/PageableType";
import { createApiThunk, setPagedDataToState, setState } from "../utils";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

export const fetchShippingProfilesThunk = createApiThunk(
  "/shipping-profiles/list",
  async (payload: {
    storeId: string;
    page: number;
    limit: number;
    query?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => {
    let url = `/shipping-profiles/${payload.storeId}?page=${payload.page}&limit=${payload.limit}`;
    if (payload.query) url += `&query=${encodeURIComponent(payload.query)}`;
    if (payload.isActive !== undefined) url += `&isActive=${payload.isActive}`;
    if (payload.sortBy) url += `&sortBy=${payload.sortBy}`;
    if (payload.sortOrder) url += `&sortOrder=${payload.sortOrder}`;
    return await api.get(url);
  },
);

export const fetchShippingProfileByIdThunk = createApiThunk(
  "/shipping-profiles/fetch-by-id",
  async (payload: { storeId: string; profileId: string }) =>
    await api.get(`/shipping-profiles/${payload.storeId}/${payload.profileId}`),
);

export const createShippingProfileThunk = createApiThunk(
  "/shipping-profiles/create",
  async (payload: { storeId: string; data: ShippingProfileCreateDto }) =>
    await api.post(`/shipping-profiles/${payload.storeId}`, payload.data),
);

export const updateShippingProfileThunk = createApiThunk(
  "/shipping-profiles/update",
  async (payload: {
    storeId: string;
    profileId: string;
    data: ShippingProfileUpdateDto;
  }) =>
    await api.patch(
      `/shipping-profiles/${payload.storeId}/${payload.profileId}`,
      payload.data,
    ),
);

export const deleteShippingProfileThunk = createApiThunk(
  "/shipping-profiles/delete",
  async (payload: { storeId: string; profileId: string }) =>
    await api.delete(
      `/shipping-profiles/${payload.storeId}/${payload.profileId}`,
    ),
);

export const createShippingZoneThunk = createApiThunk(
  "/shipping-profiles/zones/create",
  async (payload: {
    storeId: string;
    profileId: string;
    data: ShippingZoneCreateDto;
  }) =>
    await api.post(
      `/shipping-profiles/${payload.storeId}/${payload.profileId}/zones`,
      payload.data,
    ),
);

export const updateShippingZoneThunk = createApiThunk(
  "/shipping-profiles/zones/update",
  async (payload: {
    storeId: string;
    zoneId: string;
    data: ShippingZoneUpdateDto;
  }) =>
    await api.patch(
      `/shipping-profiles/${payload.storeId}/zones/${payload.zoneId}`,
      payload.data,
    ),
);

export const deleteShippingZoneThunk = createApiThunk(
  "/shipping-profiles/zones/delete",
  async (payload: { storeId: string; zoneId: string }) =>
    await api.delete(
      `/shipping-profiles/${payload.storeId}/zones/${payload.zoneId}`,
    ),
);

export const createShippingRuleThunk = createApiThunk(
  "/shipping-profiles/rules/create",
  async (payload: { storeId: string; data: ShippingRuleCreateDto }) =>
    await api.post(`/shipping-profiles/${payload.storeId}/rules`, payload.data),
);

export const updateShippingRuleThunk = createApiThunk(
  "/shipping-profiles/rules/update",
  async (payload: {
    storeId: string;
    ruleId: string;
    data: ShippingRuleUpdateDto;
  }) =>
    await api.patch(
      `/shipping-profiles/${payload.storeId}/rules/${payload.ruleId}`,
      payload.data,
    ),
);

export const deleteShippingRuleThunk = createApiThunk(
  "/shipping-profiles/rules/delete",
  async (payload: { storeId: string; ruleId: string }) =>
    await api.delete(
      `/shipping-profiles/${payload.storeId}/rules/${payload.ruleId}`,
    ),
);

const initialState = {
  data: {
    shippingProfilePagedData: {
      pages: {} as PaginatedPages<ShippingProfileSummaryDto>,
      totalDocs: 0,
      totalPages: 0,
    },
    currentProfile: null as ShippingProfileDto | null,
  },
  status: "idle",
  getStatus: "idle",
  createStatus: "idle",
  updateStatus: "idle",
  deleteStatus: "idle",
  zoneActionStatus: "idle",
  ruleActionStatus: "idle",
  error: null,
};

const shippingProfileSlice = createSlice({
  name: "shippingProfiles",
  initialState,
  reducers: {
    invalidateShippingProfilePages: (state) => {
      state.data.shippingProfilePagedData = {
        pages: {},
        totalDocs: 0,
        totalPages: 0,
      };
      state.status = "idle";
    },
    clearCurrentShippingProfile: (state) => {
      state.data.currentProfile = null;
      state.getStatus = "idle";
    },
    invalidate: () => initialState,
  },
  extraReducers(builder) {
    // List
    builder.addCase(fetchShippingProfilesThunk.pending, (state, action) => {
      setState(state, action);
    });
    builder.addCase(fetchShippingProfilesThunk.fulfilled, (state, action) => {
      setPagedDataToState<ShippingProfileSummaryDto>(
        state,
        action,
        "shippingProfilePagedData",
        "status",
      );
    });
    builder.addCase(fetchShippingProfilesThunk.rejected, (state, action) => {
      setState(state, action);
    });

    // Get by ID
    builder.addCase(fetchShippingProfileByIdThunk.pending, (state, action) => {
      setState(state, action, "getStatus");
    });
    builder.addCase(
      fetchShippingProfileByIdThunk.fulfilled,
      (state, action) => {
        state.getStatus = "success";
        state.data.currentProfile = action.payload;
        state.error = null;
      },
    );
    builder.addCase(fetchShippingProfileByIdThunk.rejected, (state, action) => {
      setState(state, action, "getStatus");
    });

    // Create Profile
    builder.addCase(createShippingProfileThunk.pending, (state, action) => {
      setState(state, action, "createStatus");
    });
    builder.addCase(createShippingProfileThunk.fulfilled, (state) => {
      state.createStatus = "success";
      state.error = null;
    });
    builder.addCase(createShippingProfileThunk.rejected, (state, action) => {
      setState(state, action, "createStatus");
    });

    // Update Profile
    builder.addCase(updateShippingProfileThunk.pending, (state, action) => {
      setState(state, action, "updateStatus");
    });
    builder.addCase(updateShippingProfileThunk.fulfilled, (state, action) => {
      state.updateStatus = "success";
      state.data.currentProfile = action.payload;
      state.error = null;
    });
    builder.addCase(updateShippingProfileThunk.rejected, (state, action) => {
      setState(state, action, "updateStatus");
    });

    // Delete Profile
    builder.addCase(deleteShippingProfileThunk.pending, (state, action) => {
      setState(state, action, "deleteStatus");
    });
    builder.addCase(deleteShippingProfileThunk.fulfilled, (state) => {
      state.deleteStatus = "success";
      state.error = null;
    });
    builder.addCase(deleteShippingProfileThunk.rejected, (state, action) => {
      setState(state, action, "deleteStatus");
    });

    // Zones
    builder.addCase(createShippingZoneThunk.pending, (state, action) => {
      setState(state, action, "zoneActionStatus");
    });
    builder.addCase(createShippingZoneThunk.fulfilled, (state) => {
      state.zoneActionStatus = "success";
      state.error = null;
    });
    builder.addCase(createShippingZoneThunk.rejected, (state, action) => {
      setState(state, action, "zoneActionStatus");
    });
    builder.addCase(updateShippingZoneThunk.pending, (state, action) => {
      setState(state, action, "zoneActionStatus");
    });
    builder.addCase(updateShippingZoneThunk.fulfilled, (state) => {
      state.zoneActionStatus = "success";
      state.error = null;
    });
    builder.addCase(updateShippingZoneThunk.rejected, (state, action) => {
      setState(state, action, "zoneActionStatus");
    });
    builder.addCase(deleteShippingZoneThunk.pending, (state, action) => {
      setState(state, action, "zoneActionStatus");
    });
    builder.addCase(deleteShippingZoneThunk.fulfilled, (state) => {
      state.zoneActionStatus = "success";
      state.error = null;
    });
    builder.addCase(deleteShippingZoneThunk.rejected, (state, action) => {
      setState(state, action, "zoneActionStatus");
    });

    // Rules
    builder.addCase(createShippingRuleThunk.pending, (state, action) => {
      setState(state, action, "ruleActionStatus");
    });
    builder.addCase(createShippingRuleThunk.fulfilled, (state) => {
      state.ruleActionStatus = "success";
      state.error = null;
    });
    builder.addCase(createShippingRuleThunk.rejected, (state, action) => {
      setState(state, action, "ruleActionStatus");
    });
    builder.addCase(updateShippingRuleThunk.pending, (state, action) => {
      setState(state, action, "ruleActionStatus");
    });
    builder.addCase(updateShippingRuleThunk.fulfilled, (state) => {
      state.ruleActionStatus = "success";
      state.error = null;
    });
    builder.addCase(updateShippingRuleThunk.rejected, (state, action) => {
      setState(state, action, "ruleActionStatus");
    });
    builder.addCase(deleteShippingRuleThunk.pending, (state, action) => {
      setState(state, action, "ruleActionStatus");
    });
    builder.addCase(deleteShippingRuleThunk.fulfilled, (state) => {
      state.ruleActionStatus = "success";
      state.error = null;
    });
    builder.addCase(deleteShippingRuleThunk.rejected, (state, action) => {
      setState(state, action, "ruleActionStatus");
    });
  },
});

export const {
  invalidateShippingProfilePages,
  clearCurrentShippingProfile,
  invalidate,
} = shippingProfileSlice.actions;

export const selectShippingProfileState = (state: RootState) =>
  state.shippingProfile;

export default shippingProfileSlice.reducer;
