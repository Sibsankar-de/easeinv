"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrderByIdThunk,
  selectOrderState,
  clearCurrentOrder,
} from "@/store/features/orderSlice";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderStatusChangeModal } from "./OrderStatusChangeModal";
import { OrderDeleteModal } from "./OrderDeleteModal";
import { InvoiceViewModal } from "../invoices/InvoiceViewModal";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDateStr } from "@/utils/formatDate";
import { OrderStatus } from "@/types/dto/orderDto";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Truck,
  FileText,
  SlidersHorizontal,
  Trash2,
  Ticket,
  Printer,
  Calendar,
  AlertCircle,
  ExternalLink,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { AppDispatch } from "@/store/store";

export const OrderDetailsView: React.FC = () => {
  const { store_id: storeId, order_id: orderId } = useParams() as {
    store_id: string;
    order_id: string;
  };
  const { navigate } = useStoreNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const {
    data: { currentOrder },
    getStatus,
  } = useSelector(selectOrderState);

  const {
    data: { currencySymbol },
  } = useSelector(selectCurrentStoreState);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInvoiceViewOpen, setIsInvoiceViewOpen] = useState(false);

  useEffect(() => {
    if (storeId && orderId) {
      dispatch(fetchOrderByIdThunk({ storeId, orderId }));
    }
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, storeId, orderId]);

  if (getStatus === "loading" && !currentOrder) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-200 p-8">
        <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Order not found</h2>
        <p className="text-gray-600 mt-2">
          The order you are looking for does not exist or has been removed.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => navigate("/orders")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    );
  }

  const extraData = currentOrder.extraData || {};
  const isCompleted = currentOrder.status === OrderStatus.COMPLETED;
  const isRejected = currentOrder.status === OrderStatus.REJECTED;

  const billItems = currentOrder.invoice?.billItems || [];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link
          href={`/stores/${storeId}/orders`}
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Orders
        </Link>
      </div>

      {/* Main Order Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{currentOrder.orderNumber}
              </h1>
              <OrderStatusBadge status={currentOrder.status} />
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Placed on {formatDateStr(currentOrder.orderDate).dateStr}</span>
              </div>
              {currentOrder.coupon && (
                <div className="flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-indigo-500" />
                  <Badge variant="primary" className="normal-case">
                    Coupon: {currentOrder.coupon.code}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              onClick={() => setIsStatusModalOpen(true)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Update Status
            </Button>

            {currentOrder.invoice && (
              <Button
                variant="outline"
                onClick={() => setIsInvoiceViewOpen(true)}
                className="flex items-center gap-2 text-gray-700"
              >
                <Printer className="w-4 h-4" />
                View Invoice
              </Button>
            )}

            {!isCompleted && (
              <Button
                variant="danger"
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 3-Column Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Details */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-900 text-sm">Customer Details</h3>
            </div>
            {currentOrder.customerId && (
              <Link
                href={`/stores/${storeId}/customers/${currentOrder.customerId}`}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Profile <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>

          {currentOrder.customer ? (
            <div className="space-y-2.5 text-sm">
              <div className="font-medium text-gray-900">
                {currentOrder.customer.name}
              </div>
              {currentOrder.customer.phoneNumber && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>{currentOrder.customer.phoneNumber}</span>
                </div>
              )}
              {currentOrder.customer.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>{currentOrder.customer.email}</span>
                </div>
              )}
              {currentOrder.customer.address && (
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                  <span>{currentOrder.customer.address}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-sm italic">No customer profile linked.</p>
          )}
        </Card>

        {/* Shipping & Delivery Info */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Truck className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900 text-sm">Delivery & Tracking</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-gray-500 block mb-0.5">Delivery Reference</span>
              {extraData.delivery_reference ? (
                <span className="font-semibold text-gray-900 font-mono text-sm">
                  {extraData.delivery_reference}
                </span>
              ) : (
                <span className="text-gray-400 italic text-xs">Not dispatched yet</span>
              )}
            </div>

            {extraData.note && (
              <div>
                <span className="text-xs text-gray-500 block mb-0.5">Instructions / Note</span>
                <p className="text-gray-700 bg-gray-50 p-2.5 rounded border border-gray-200 text-xs">
                  {extraData.note}
                </p>
              </div>
            )}

            {isRejected && extraData.rejection_reason && (
              <div>
                <span className="text-xs text-red-500 font-medium block mb-0.5">
                  Rejection Reason
                </span>
                <p className="text-red-700 bg-red-50 p-2.5 rounded border border-red-200 text-xs">
                  {extraData.rejection_reason}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Linked Invoice */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-900 text-sm">Linked Invoice</h3>
            </div>
            {currentOrder.invoice && (
              <Badge
                variant={currentOrder.invoice.status === "ISSUED" ? "success" : "warning"}
                className="text-[10px]"
              >
                {currentOrder.invoice.status}
              </Badge>
            )}
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-gray-500 block mb-0.5">Invoice Number</span>
              <span className="font-semibold text-gray-900">
                {currentOrder.invoice?.invoiceNumber || "Draft Invoice"}
              </span>
            </div>

            <div>
              <span className="text-xs text-gray-500 block mb-0.5">Payment Status</span>
              <span className="font-medium text-gray-800">
                {currentOrder.invoice?.dueAmount && currentOrder.invoice.dueAmount > 0
                  ? `Due (${currencySymbol}${currentOrder.invoice.dueAmount.toFixed(2)})`
                  : "Paid"}
              </span>
            </div>

            {currentOrder.invoice && (
              <Button
                variant="outline"
                className="w-full mt-2 justify-center text-xs py-1.5"
                onClick={() => setIsInvoiceViewOpen(true)}
              >
                Preview Invoice Document
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Order Items Table & Financial Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ordered Items Table */}
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-sm">Ordered Items</h3>
              <span className="text-xs text-gray-500">
                {billItems.length} item{billItems.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th scope="col" className="px-4 py-3">Product</th>
                    <th scope="col" className="px-4 py-3 text-center">Unit</th>
                    <th scope="col" className="px-4 py-3 text-center">Qty</th>
                    <th scope="col" className="px-4 py-3 text-right">Price</th>
                    <th scope="col" className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {billItems.map((item, idx) => {
                    const unitPrice =
                      item.netQuantity > 0
                        ? (item.totalPrice / item.netQuantity).toFixed(2)
                        : item.totalPrice.toFixed(2);

                    return (
                      <tr key={item.id || idx} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-gray-900">
                            {item.product?.name || "Product"}
                          </div>
                          {item.product?.sku && (
                            <div className="text-xs text-gray-500">SKU: {item.product.sku}</div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center text-gray-600">
                          {item.stockUnit}
                        </td>
                        <td className="px-4 py-3.5 text-center font-medium text-gray-900">
                          {item.netQuantity}
                        </td>
                        <td className="px-4 py-3.5 text-right text-gray-600">
                          {currencySymbol}
                          {unitPrice}
                        </td>
                        <td className="px-4 py-3.5 text-right font-medium text-gray-900">
                          {currencySymbol}
                          {item.totalPrice?.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}

                  {billItems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-400 italic">
                        No bill items found for this order.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Financial Summary Breakdown */}
        <div>
          <Card className="p-5 space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm border-b border-gray-100 pb-3">
              Payment Breakdown
            </h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between text-gray-600">
                <span>Subtotal</span>
                <span>
                  {currencySymbol}
                  {currentOrder.subtotal?.toFixed(2)}
                </span>
              </div>

              {currentOrder.discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-600">
                  <span className="flex items-center gap-1.5">
                    Discount
                    {currentOrder.coupon && (
                      <span className="text-[11px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                        {currentOrder.coupon.code}
                      </span>
                    )}
                  </span>
                  <span>
                    -{currencySymbol}
                    {currentOrder.discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              {currentOrder.taxAmount > 0 && (
                <div className="flex items-center justify-between text-gray-600">
                  <span>Taxes & GST</span>
                  <span>
                    +{currencySymbol}
                    {currentOrder.taxAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-gray-600">
                <span>Shipping & Delivery</span>
                <span>
                  {currentOrder.shippingAmount > 0
                    ? `+${currencySymbol}${currentOrder.shippingAmount.toFixed(2)}`
                    : "Free"}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-3 flex items-center justify-between font-bold text-gray-900 text-base">
                <span>Total Amount</span>
                <span>
                  {currencySymbol}
                  {currentOrder.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <OrderStatusChangeModal
        openState={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        order={currentOrder}
        onSuccess={() => {
          if (storeId && orderId) {
            dispatch(fetchOrderByIdThunk({ storeId, orderId }));
          }
        }}
      />

      <OrderDeleteModal
        openState={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        order={currentOrder}
        onSuccess={() => navigate("/orders")}
      />

      {currentOrder.invoice && (
        <InvoiceViewModal
          openState={isInvoiceViewOpen}
          onClose={() => setIsInvoiceViewOpen(false)}
          invoice={currentOrder.invoice}
          invoiceId={currentOrder.invoiceId}
          fetchInvoice={true}
        />
      )}
    </div>
  );
};
