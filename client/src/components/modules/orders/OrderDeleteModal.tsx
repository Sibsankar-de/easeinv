"use client";

import React, { useState } from "react";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { OrderDto, OrderSummaryDto } from "@/types/dto/orderDto";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  deleteOrderThunk,
  invalidateOrderPages,
  selectOrderState,
} from "@/store/features/orderSlice";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { toast } from "@/utils/toast";

interface OrderDeleteModalProps {
  openState: boolean;
  onClose: () => void;
  order: OrderSummaryDto | OrderDto | null;
  onSuccess?: () => void;
}

export const OrderDeleteModal: React.FC<OrderDeleteModalProps> = ({
  openState,
  onClose,
  order,
  onSuccess,
}) => {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { deleteStatus } = useSelector(selectOrderState);

  const [confirmInput, setConfirmInput] = useState("");

  if (!order) return null;

  const confirmationTarget = `delete/${order.orderNumber}`;
  const isDeleting = deleteStatus === "loading";

  const handleDelete = () => {
    if (confirmInput !== confirmationTarget) {
      toast.warn("Please enter the confirmation text correctly.");
      return;
    }

    dispatch(deleteOrderThunk({ storeId, orderId: order.id }))
      .unwrap()
      .then(() => {
        toast.success("Order deleted successfully.");
        dispatch(invalidateOrderPages());
        onSuccess?.();
        onClose();
      })
      .catch((err: any) => {
        toast.error(err?.data?.message || "Failed to delete order");
      });
  };

  return (
    <Modal
      openState={openState}
      onClose={onClose}
      className="p-4 sm:p-6 space-y-4 w-[92vw] sm:w-md"
      header={<ModalHeader title="Delete Order" />}
    >
      <p className="text-gray-600 text-sm">
        This action will permanently delete order{" "}
        <span className="font-semibold text-gray-900">
          #{order.orderNumber}
        </span>{" "}
        and its associated draft invoice.
      </p>

      <div className="space-y-1.5">
        <Label>
          Type{" "}
          <span className="text-red-500 font-semibold">
            {confirmationTarget}
          </span>{" "}
          to confirm:
        </Label>
        <Input
          placeholder={confirmationTarget}
          value={confirmInput}
          onChange={(val) => setConfirmInput(val)}
          isInvalid={
            confirmInput.length > 0 && confirmInput !== confirmationTarget
          }
          disabled={isDeleting}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={isDeleting || confirmInput !== confirmationTarget}
          loading={isDeleting}
        >
          Confirm Delete
        </Button>
      </div>
    </Modal>
  );
};
