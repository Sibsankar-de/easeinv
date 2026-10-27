"use client";

import React, { useState, useEffect } from "react";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { OrderDto, OrderStatus, OrderSummaryDto } from "@/types/dto/orderDto";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  updateOrderStatusThunk,
  invalidateOrderPages,
  selectOrderState,
} from "@/store/features/orderSlice";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { toast } from "@/utils/toast";
import { Banner } from "@/components/ui/Banner";
import {
  Truck,
  RefreshCw,
  XCircle,
} from "lucide-react";

interface OrderStatusChangeModalProps {
  openState: boolean;
  onClose: () => void;
  order: OrderSummaryDto | OrderDto | null;
  onSuccess?: () => void;
}

const statusOptions = [
  { key: OrderStatus.PROCESSING, value: "Processing (In Progress)" },
  { key: OrderStatus.DISPATCHED, value: "Dispatched (Shipped)" },
  {
    key: OrderStatus.COMPLETED,
    value: "Completed (Issue Invoice & Deduct Stock)",
  },
  { key: OrderStatus.REJECTED, value: "Rejected (Cancelled)" },
];

export const OrderStatusChangeModal: React.FC<OrderStatusChangeModalProps> = ({
  openState,
  onClose,
  order,
  onSuccess,
}) => {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { updateStatus } = useSelector(selectOrderState);

  const [targetStatus, setTargetStatus] = useState<OrderStatus>(
    OrderStatus.PROCESSING,
  );
  const [deliveryReference, setDeliveryReference] = useState("");
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<{ deliveryReference?: string }>({});

  useEffect(() => {
    if (order) {
      // Pick next logical status
      if (order.status === OrderStatus.PENDING) {
        setTargetStatus(OrderStatus.PROCESSING);
      } else if (order.status === OrderStatus.PROCESSING) {
        setTargetStatus(OrderStatus.DISPATCHED);
      } else if (order.status === OrderStatus.DISPATCHED) {
        setTargetStatus(OrderStatus.COMPLETED);
      } else {
        setTargetStatus(OrderStatus.PROCESSING);
      }

      const extra = (order as OrderDto).extraData || {};
      setDeliveryReference(extra.delivery_reference || "");
      setNote(extra.note || "");
      setReason(extra.rejection_reason || "");
      setErrors({});
    }
  }, [order, openState]);

  if (!order) return null;

  const isUpdating = updateStatus === "loading";

  const handleSubmit = () => {
    const newErrors: { deliveryReference?: string } = {};

    if (targetStatus === OrderStatus.DISPATCHED && !deliveryReference.trim()) {
      newErrors.deliveryReference =
        "Delivery reference or tracking number is required.";
      setErrors(newErrors);
      return;
    }

    setErrors({});

    dispatch(
      updateOrderStatusThunk({
        storeId,
        orderId: order.id,
        data: {
          status: targetStatus,
          deliveryReference: deliveryReference.trim() || undefined,
          note: note.trim() || undefined,
          reason: reason.trim() || undefined,
        },
      }),
    )
      .unwrap()
      .then(() => {
        toast.success(`Order status updated to ${targetStatus}`);
        dispatch(invalidateOrderPages());
        onSuccess?.();
        onClose();
      })
      .catch((err: any) => {
        toast.error(err?.data?.message || "Failed to update order status");
      });
  };

  return (
    <Modal
      openState={openState}
      onClose={onClose}
      className="p-4 sm:p-6 space-y-5 w-[92vw] sm:w-lg"
      header={
        <ModalHeader
          title="Update Order Status"
          subtitle={`Order #${order.orderNumber}`}
        />
      }
    >
      {/* Current Status */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
        <span className="text-sm font-medium text-gray-600">
          Current Status
        </span>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Target Status Selector */}
      <div className="space-y-1.5">
        <Label>Select New Status</Label>
        <Select
          value={targetStatus}
          options={statusOptions}
          onChange={(val) => {
            setTargetStatus(val as OrderStatus);
            setErrors({});
          }}
          disabled={isUpdating}
        />
      </div>

      {/* Contextual Inputs & Warnings based on Target Status */}
      {targetStatus === OrderStatus.PROCESSING && (
        <Banner
          variant="blue"
          size="sm"
          icon={RefreshCw}
          description="The order will be marked as in-progress. The customer will receive an email notifying them that their order is being prepared."
        />
      )}

      {targetStatus === OrderStatus.DISPATCHED && (
        <div className="space-y-4 pt-1">
          <Banner
            variant="purple"
            size="sm"
            icon={Truck}
            description="Please enter the shipping or delivery reference number below. The customer will receive a dispatch notice with this tracking info."
          />

          <div className="space-y-1.5">
            <Label required>Delivery Reference / Tracking ID</Label>
            <Input
              placeholder="e.g. TRK-987654321, FEDEX-12345"
              value={deliveryReference}
              onChange={(val) => {
                setDeliveryReference(val);
                if (errors.deliveryReference) setErrors({});
              }}
              isInvalid={!!errors.deliveryReference}
              errorMessage={errors.deliveryReference}
              disabled={isUpdating}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Delivery Note / Instructions (Optional)</Label>
            <Textarea
              placeholder="e.g. Handed over to courier. Expected delivery within 2-3 business days."
              value={note}
              onChange={(val) => setNote(val)}
              disabled={isUpdating}
              rows={2}
            />
          </div>
        </div>
      )}

      {targetStatus === OrderStatus.COMPLETED && (
        <div className="space-y-3">
          <Banner
            variant="success"
            size="sm"
            title="Confirm Order Completion"
            description="Completing this order will automatically issue the linked invoice, deduct inventory stock for tracked products, record revenue, and notify the customer with their finalized receipt."
          />
        </div>
      )}

      {targetStatus === OrderStatus.REJECTED && (
        <div className="space-y-4 pt-1">
          <Banner
            variant="danger"
            size="sm"
            icon={XCircle}
            description="Rejecting this order will mark it as cancelled. The customer will receive an email stating the order was cancelled."
          />

          <div className="space-y-1.5">
            <Label>Rejection Reason</Label>
            <Input
              placeholder="e.g. Customer request / Item out of stock / Delivery location unserviceable"
              value={reason}
              onChange={(val) => setReason(val)}
              disabled={isUpdating}
            />
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <Button variant="outline" onClick={onClose} disabled={isUpdating}>
          Cancel
        </Button>
        <Button
          variant={targetStatus === OrderStatus.REJECTED ? "danger" : "primary"}
          onClick={handleSubmit}
          disabled={isUpdating}
          loading={isUpdating}
        >
          Confirm Status Update
        </Button>
      </div>
    </Modal>
  );
};
