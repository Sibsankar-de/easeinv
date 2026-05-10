"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInvoiceListThunk,
  selectInvoiceState,
} from "@/store/features/invoiceSlice";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { PageState } from "@/types/PageableType";
import { InvoiceDto } from "@/types/dto/invoiceDto";
import { pageLimits } from "@/constants/pageLimits";
import { InvoiceListItem } from "./InvoiceListItem";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { FileText } from "lucide-react";

export const InvoiceListTable = () => {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch();
  const {
    data: { invoiceListData },
    status: invoiceFetchStatus,
  } = useSelector(selectInvoiceState);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageData, setPageData] = useState<PageState<InvoiceDto> | null>(null);

  useEffect(() => {
    if (!invoiceListData.pages[currentPage]) {
      dispatch(
        fetchInvoiceListThunk({
          storeId,
          page: currentPage,
          limit: pageLimits.INVOICE_LIST,
        }),
      )
        .unwrap()
        .then((res: any) => {
          setCurrentPage(res.page);
        });
    }
  }, [dispatch, storeId, currentPage]);

  useEffect(() => {
    const data = invoiceListData.pages[currentPage] || null;
    if (data) {
      setPageData(data);
    }
  }, [invoiceListData, currentPage]);

  return (
    <div>
      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by invoice number or client name..."
            // value={searchTerm}
            // onChange={(e) => setSearchTerm(e)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          {invoiceFetchStatus === "loading" ? (
            <TableSkeleton columns={6} rows={pageLimits.INVOICE_LIST} />
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-gray-700 px-6 py-4">
                    Invoice Number
                  </th>
                  <th className="text-center text-gray-700 px-6 py-4">
                    Customer
                  </th>
                  <th className="text-center text-gray-700 px-6 py-4">Date</th>
                  <th className="text-center text-gray-700 px-6 py-4">Total</th>
                  <th className="text-center text-gray-700 px-6 py-4">Due</th>
                  <th className="text-right text-gray-700 px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageData?.docs.map((invoice) => (
                  <InvoiceListItem
                    key={invoice._id}
                    invoice={invoice}
                    page={currentPage}
                  />
                ))}
              </tbody>
            </table>
          )}
          {invoiceFetchStatus !== "loading" && pageData?.docs.length === 0 && (
            <EmptyState
              icon={<FileText className="w-8 h-8 text-gray-400" />}
              title="No invoices found"
              description="Create your first invoice to start tracking your sales and payments."
            />
          )}
        </div>
      </div>

      {/* pagination  */}
      <Pagination
        totalPage={invoiceListData.totalPages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};
