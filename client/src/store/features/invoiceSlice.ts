import { InvoiceSummaryDto, InvoiceDto } from "@/types/dto/invoiceDto";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { createApiThunk, setState, transformPaginatedResponse } from "../utils";
import api from "@/configs/axios-config";
import { PaginatedPages } from "@/types/PageableType";
import { InvoiceSummary } from "@/types/InvoiceSummaryType";

export const fetchInvoiceListThunk: any = createApiThunk(
  "/invoices/list",
  async (payload: any) => {
    let url = `/invoices/${payload.storeId}?page=${payload.page}&limit=${payload.limit}`;
    if (payload.status) url += `&status=${payload.status}`;
    if (payload.paymentStatus) url += `&paymentStatus=${payload.paymentStatus}`;
    if (payload.query) url += `&query=${payload.query}`;
    else if (payload.customerPrefix) url += `&query=${payload.customerPrefix}`;
    if (payload.customerId) url += `&customerId=${payload.customerId}`;
    if (payload.sortBy) url += `&sortBy=${payload.sortBy}`;
    if (payload.sortOrder) url += `&sortOrder=${payload.sortOrder}`;
    return await api.get(url);
  },
);

export const createInvoiceThunk: any = createApiThunk(
  "/invoices/create",
  async (payload: any) =>
    await api.post(`/invoices/${payload.storeId}`, payload),
);

export const updateInvoiceThunk: any = createApiThunk(
  "/invoices/update",
  async (payload: any) =>
    await api.put(`/invoices/${payload.storeId}/${payload.invoiceId}`, payload),
);

export const updateInvoiceDueThunk: any = createApiThunk(
  "/invoices/update-due",
  async (payload: any) =>
    await api.patch(
      `/invoices/${payload.storeId}/${payload.invoiceId}`,
      payload,
    ),
);

export const fetchInvoiceSummaryThunk: any = createApiThunk(
  "/invoices/summary",
  async (payload: any) => await api.get(`/invoices/${payload.storeId}/summary`),
);

export const fetchInvoiceByIdThunk: any = createApiThunk(
  "/invoices/fetch-by-id",
  async (payload: { storeId: string; invoiceId: string }) =>
    await api.get(`/invoices/${payload.storeId}/${payload.invoiceId}`),
);

export const deleteInvoiceThunk: any = createApiThunk(
  "/invoices/delete",
  async (payload: { storeId: string; invoiceId: string }) =>
    await api.delete(`/invoices/${payload.storeId}/${payload.invoiceId}`),
);

const initialState = {
  data: {
    invoicePagedData: {
      pages: {} as PaginatedPages<InvoiceSummaryDto>,
      totalDocs: 0,
      totalPages: 0,
    },
    summaryData: {
      totalInvoices: 0,
      totalRevenue: 0,
      totalDue: 0,
      totalPaid: 0,
    } as InvoiceSummary,
    invoiceListData: [] as InvoiceDto[],
  },
  status: "idle",
  getStatus: "idle",
  createStatus: "idle",
  updateStatus: "idle",
  deleteStatus: "idle",
  summaryStatus: "idle",
  error: null,
};

const invoiceSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {
    invalidateInvoicePages: (state) => {
      state.data.invoicePagedData = {
        pages: {},
        totalDocs: 0,
        totalPages: 0,
      };
      state.status = "idle";
    },
    invalidateInvoiceSummary: (state) => {
      state.data.summaryData = initialState.data.summaryData;
      state.summaryStatus = "idle";
    },
    updateInvoiceDue: (state, action) => {
      const { page, invoiceId, newDueAmount } = action.payload;
      const pageData = state.data.invoicePagedData.pages[page];
      if (pageData) {
        const invoiceIndex = pageData.docs.findIndex(
          (inv) => inv.id === invoiceId,
        );
        if (invoiceIndex !== -1) {
          pageData.docs[invoiceIndex].dueAmount = newDueAmount;
        }
      }
    },
    invalidate: () => initialState,
  },
  extraReducers(builder) {
    builder
      .addCase(createInvoiceThunk.pending, (state, action) =>
        setState(state, action, "createStatus"),
      )
      .addCase(createInvoiceThunk.rejected, (state, action) =>
        setState(state, action, "createStatus"),
      )
      .addCase(createInvoiceThunk.fulfilled, (state, action) => {
        state.createStatus = "success";
        state.error = null;
      })
      .addCase(updateInvoiceThunk.pending, (state, action) =>
        setState(state, action, "updateStatus"),
      )
      .addCase(updateInvoiceThunk.rejected, (state, action) =>
        setState(state, action, "updateStatus"),
      )
      .addCase(updateInvoiceThunk.fulfilled, (state, action) => {
        state.updateStatus = "success";
        state.error = null;
        const updatedInvoice = action.payload;
        const existingIndex = state.data.invoiceListData.findIndex(
          (inv) => inv.id === updatedInvoice.id,
        );
        if (existingIndex !== -1) {
          state.data.invoiceListData[existingIndex] = updatedInvoice;
        }
      })
      .addCase(fetchInvoiceListThunk.pending, setState)
      .addCase(fetchInvoiceListThunk.rejected, setState)
      .addCase(fetchInvoiceListThunk.fulfilled, (state, action) => {
        state.status = "success";
        const { docs, pageable } = transformPaginatedResponse(action.payload);
        state.data.invoicePagedData = {
          pages: {
            ...state.data.invoicePagedData.pages,
            [pageable.page]: {
              docs: docs as InvoiceSummaryDto[],
              pageable,
            },
          },
          totalDocs: pageable.totalDocs,
          totalPages: pageable.totalPages,
        };
        state.error = null;
      })
      .addCase(updateInvoiceDueThunk.pending, (state, action) =>
        setState(state, action, "updateStatus"),
      )
      .addCase(updateInvoiceDueThunk.rejected, (state, action) =>
        setState(state, action, "updateStatus"),
      )
      .addCase(updateInvoiceDueThunk.fulfilled, (state, action) => {
        state.updateStatus = "success";
        state.error = null;
        // update invoice list invoice
        const updatedInvoice = action.payload;
        const existingIndex = state.data.invoiceListData.findIndex(
          (inv) => inv.id === updatedInvoice.id,
        );
        if (existingIndex !== -1) {
          state.data.invoiceListData[existingIndex] = updatedInvoice;
        }
      })
      .addCase(fetchInvoiceSummaryThunk.pending, (state, action) =>
        setState(state, action, "summaryStatus"),
      )
      .addCase(fetchInvoiceSummaryThunk.rejected, (state, action) =>
        setState(state, action, "summaryStatus"),
      )
      .addCase(fetchInvoiceSummaryThunk.fulfilled, (state, action) => {
        state.summaryStatus = "success";
        state.data.summaryData = action.payload;
        state.error = null;
      })
      .addCase(fetchInvoiceByIdThunk.pending, (state, action) =>
        setState(state, action, "getStatus"),
      )
      .addCase(fetchInvoiceByIdThunk.rejected, (state, action) =>
        setState(state, action, "getStatus"),
      )
      .addCase(fetchInvoiceByIdThunk.fulfilled, (state, action) => {
        state.getStatus = "success";
        state.error = null;
        const fetchedInvoice = action.payload;
        const existingIndex = state.data.invoiceListData.findIndex(
          (inv) => inv.id === fetchedInvoice.id,
        );
        if (existingIndex !== -1) {
          state.data.invoiceListData[existingIndex] = fetchedInvoice;
        } else {
          state.data.invoiceListData.push(fetchedInvoice);
        }
      })
      .addCase(deleteInvoiceThunk.pending, (state, action) =>
        setState(state, action, "deleteStatus"),
      )
      .addCase(deleteInvoiceThunk.rejected, (state, action) =>
        setState(state, action, "deleteStatus"),
      )
      .addCase(deleteInvoiceThunk.fulfilled, (state) => {
        state.deleteStatus = "success";
        state.error = null;
      });
  },
});

export const selectInvoiceState = (state: RootState) => state.invoice;
export const {
  updateInvoiceDue,
  invalidateInvoicePages,
  invalidateInvoiceSummary,
  invalidate,
} = invoiceSlice.actions;
export default invoiceSlice.reducer;
