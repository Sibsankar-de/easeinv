"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { useDispatch, useSelector } from "react-redux";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { PageState } from "@/types/PageableType";
import { pageLimits } from "@/constants/pageLimits";
import {
  fetchCustomerListThunk,
  selectCustomerState,
} from "@/store/features/customerSlice";
import { CustomerItem } from "./CustomerItem";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Users } from "lucide-react";

export const CustomerListTable = () => {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch();
  const {
    data: { customerListData },
    status,
  } = useSelector(selectCustomerState);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageData, setPageData] = useState<PageState<CustomerDto> | null>(null);

  useEffect(() => {
    if (!customerListData.pages[currentPage]) {
      dispatch(
        fetchCustomerListThunk({
          storeId,
          page: currentPage,
          limit: pageLimits.CUSTOMER_LIST,
        }),
      )
        .unwrap()
        .then((res: any) => {
          setCurrentPage(res.page);
        });
    }
  }, [dispatch, storeId, currentPage]);

  useEffect(() => {
    const data = customerListData.pages[currentPage] || null;
    if (data) {
      setPageData(data);
    }
  }, [customerListData, currentPage]);

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
          {status === "loading" ? (
            <TableSkeleton columns={7} rows={pageLimits.CUSTOMER_LIST} />
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-primary px-6 py-4">Sno</th>
                  <th className="text-left text-gray-700 px-6 py-4">Name</th>
                  <th className="text-center text-gray-700 px-6 py-4">
                    Address
                  </th>
                  <th className="text-center text-gray-700 px-6 py-4">
                    Phone number
                  </th>
                  <th className="text-center text-gray-700 px-6 py-4">
                    Total Invoices
                  </th>
                  <th className="text-center text-gray-700 px-6 py-4">
                    Total Due
                  </th>
                  <th className="text-right text-gray-700 px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageData?.docs.map((customer, index) => (
                  <CustomerItem
                    key={customer._id}
                    customer={customer}
                    sno={index + 1}
                  />
                ))}
              </tbody>
            </table>
          )}
          {status !== "loading" && pageData?.docs.length === 0 && (
            <EmptyState
              icon={<Users className="w-8 h-8 text-gray-400" />}
              title="No customers found"
              description="Start adding customers to manage their invoices and track their due amounts."
            />
          )}
        </div>
      </div>

      {/* pagination  */}
      <Pagination
        totalPage={customerListData.totalPages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};
