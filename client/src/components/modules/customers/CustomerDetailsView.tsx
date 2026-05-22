"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomerByIdThunk,
  selectCustomerState,
  clearCurrentCustomer,
} from "@/store/features/customerSlice";
import { MetricGrid, MetricCard } from "@/components/ui/MetricCard";
import {
  Mail,
  Phone,
  MapPin,
  FileText,
  IndianRupee,
  Pencil,
} from "lucide-react";
import { InvoiceListTable } from "../invoices/InvoiceListTable";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { EditCustomerModal } from "./EditCustomerModal";

export const CustomerDetailsView = () => {
  const { store_id: storeId, customer_id: customerId } = useParams();
  const dispatch = useDispatch();
  const {
    data: { currentCustomer },
    fetchStatus,
  } = useSelector(selectCustomerState);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCustomerByIdThunk({ storeId, customerId }));
    return () => {
      dispatch(clearCurrentCustomer());
    };
  }, [dispatch, storeId, customerId]);

  if (fetchStatus === "loading") {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!currentCustomer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">
          Customer not found
        </h2>
        <p className="text-gray-600 mt-2">
          The customer you are looking for does not exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentCustomer.name}
            </h1>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
              {currentCustomer.phoneNumber && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {currentCustomer.phoneNumber}
                </div>
              )}
              {currentCustomer.email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {currentCustomer.email}
                </div>
              )}
              {currentCustomer.address && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {currentCustomer.address}
                </div>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Pencil className="w-4 h-4" />
            Edit Customer
          </Button>
        </div>
      </div>

      <MetricGrid columns={3}>
        <MetricCard
          label="Total Invoices"
          value={String(currentCustomer.totalInvoices || 0)}
          helper="Total bills generated"
          icon={FileText}
          tone="primary"
        />
        <MetricCard
          label="Total Due"
          value={`₹${currentCustomer.totalDue || 0}`}
          helper="Outstanding balance"
          icon={IndianRupee}
          tone="danger"
        />
        <MetricCard
          label="Due Invoices"
          value={String(currentCustomer.dueCount || 0)}
          helper="Invoices with pending payment"
          icon={FileText}
          tone="warning"
        />
      </MetricGrid>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Invoice History</h2>
        <InvoiceListTable customerId={customerId as string} />
      </div>

      <EditCustomerModal
        openState={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        customer={currentCustomer}
      />
    </div>
  );
};
