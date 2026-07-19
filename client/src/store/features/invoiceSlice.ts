import { InvoiceSummaryDto } from "@/types/dto/invoiceDto";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
  concatPaginatedData,
  createApiThunk,
  setState,
  transformPaginatedResponse,
} from "../utils";
import api from "@/configs/axios-config";
import { PaginatedPages } from "@/types/PageableType";
import { InvoiceSummary } from "@/types/InvoiceSummaryType";

const initialState = {
  data: {
    invoiceListData: {
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
  },
  status: "idle",
  createStatus: "idle",
  updateStatus: "idle",
  summaryStatus: "idle",
  error: null,
};

export const fetchInvoiceListThunk: any = createApiThunk(
  "/invoices/list",
  async (payload: any) => {
    let url = `/invoices/${payload.storeId}?page=${payload.page}&limit=${payload.limit}`;
    if (payload.status) url += `&status=${payload.status}`;
    if (payload.customerPrefix)
      url += `&customerPrefix=${payload.customerPrefix}`;
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

const invoiceSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {
    clearInvoiceList: (state) => {
      state.data.invoiceListData = {
        pages: {},
        totalDocs: 0,
        totalPages: 0,
      };
    },
    updateInvoiceDue: (state, action) => {
      const { page, invoiceId, newDueAmount } = action.payload;
      const pageData = state.data.invoiceListData.pages[page];
      if (pageData) {
        const invoiceIndex = pageData.docs.findIndex(
          (inv) => inv.id === invoiceId,
        );
        if (invoiceIndex !== -1) {
          pageData.docs[invoiceIndex].dueAmount = newDueAmount;
        }
      }
    },
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
        state.data.invoiceListData = concatPaginatedData(
          state.data.invoiceListData,
          action.payload,
        );
        state.error = null;
      })
      .addCase(fetchInvoiceListThunk.pending, setState)
      .addCase(fetchInvoiceListThunk.rejected, setState)
      .addCase(fetchInvoiceListThunk.fulfilled, (state, action) => {
        state.status = "success";
        const { docs, pageable } = transformPaginatedResponse(action.payload);
        state.data.invoiceListData = {
          pages: {
            ...state.data.invoiceListData.pages,
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
      });
  },
});

export const selectInvoiceState = (state: RootState) => state.invoice;
export const { updateInvoiceDue, clearInvoiceList } = invoiceSlice.actions;
export default invoiceSlice.reducer;
