import { GalleryImageDto } from "@/types/dto/galleryImageDto";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
  createApiThunk,
  setState,
  transformPaginatedResponse,
} from "../utils";
import api from "@/configs/axios-config";
import { PaginatedPages } from "@/types/PageableType";

const initialState = {
  data: {
    galleryListData: {
      pages: {} as PaginatedPages<GalleryImageDto>,
      totalDocs: 0,
      totalPages: 0,
    },
  },
  status: "idle",
  uploadStatus: "idle",
  error: null,
};

export const fetchGalleryImagesThunk: any = createApiThunk(
  "/gallery/list",
  async (payload: any) => {
    let url = `/gallery/${payload.storeId}?page=${payload.page || 1}&limit=${payload.limit}`;
    if (payload.query) url += `&query=${encodeURIComponent(payload.query)}`;
    return await api.get(url);
  },
);

export const uploadGalleryImageThunk: any = createApiThunk(
  "/gallery/upload",
  async (payload: any) => {
    const formData = new FormData();
    formData.append("image", payload.file);
    return await api.post(`/gallery/${payload.storeId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
);

const gallerySlice = createSlice({
  name: "gallery",
  initialState,
  reducers: {
    clearGalleryList: (state) => {
      state.data.galleryListData = {
        pages: {},
        totalDocs: 0,
        totalPages: 0,
      };
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchGalleryImagesThunk.pending, setState)
      .addCase(fetchGalleryImagesThunk.rejected, setState)
      .addCase(fetchGalleryImagesThunk.fulfilled, (state, action) => {
        state.status = "success";
        const { docs, pageable } = transformPaginatedResponse(action.payload);
        state.data.galleryListData = {
          pages: {
            ...state.data.galleryListData.pages,
            [pageable.page]: {
              docs: docs as GalleryImageDto[],
              pageable,
            },
          },
          totalDocs: pageable.totalDocs,
          totalPages: pageable.totalPages,
        };
        state.error = null;
      })
      .addCase(uploadGalleryImageThunk.pending, (state, action) =>
        setState(state, action, "uploadStatus"),
      )
      .addCase(uploadGalleryImageThunk.rejected, (state, action) =>
        setState(state, action, "uploadStatus"),
      )
      .addCase(uploadGalleryImageThunk.fulfilled, (state, action) => {
        state.uploadStatus = "success";
        const newImage = action.payload;

        // Follow concatPaginatedData logic manually to prepend
        const pages = state.data.galleryListData.pages;
        if (pages[1]) {
          pages[1].docs = [newImage, ...pages[1].docs];
        } else {
          state.data.galleryListData.pages[1] = {
            docs: [newImage],
            pageable: {
              page: 1,
              limit: 10, // Default limit
              totalPages: 1,
              totalDocs: 1,
            },
          };
        }
        state.data.galleryListData.totalDocs += 1;
        state.error = null;
      });
  },
});

export const selectGalleryState = (state: RootState) => state.gallery;
export const { clearGalleryList } = gallerySlice.actions;
export default gallerySlice.reducer;
