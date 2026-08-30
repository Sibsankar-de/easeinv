"use client";

import React from "react";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ShippingRuleDto } from "@/types/dto/shippingProfileDto";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  deleteShippingRuleThunk,
  selectShippingProfileState,
} from "@/store/features/shippingProfileSlice";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { toast } from "@/utils/toast";

interface ShippingRuleDeleteModalProps {
  openState: boolean;
  onClose: () => void;
  rule: ShippingRuleDto | null;
  onSuccess?: () => void;
}

export const ShippingRuleDeleteModal: React.FC<
  ShippingRuleDeleteModalProps
> = ({ openState, onClose, rule, onSuccess }) => {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { ruleActionStatus } = useSelector(selectShippingProfileState);

  if (!rule) return null;

  const isDeleting = ruleActionStatus === "loading";

  const handleDelete = () => {
    dispatch(deleteShippingRuleThunk({ storeId, ruleId: rule.id }))
      .unwrap()
      .then(() => {
        toast.success("Shipping rate rule deleted successfully.");
        onSuccess?.();
        onClose();
      })
      .catch((err: any) => {
        toast.error(err?.data?.message || "Failed to delete rate rule");
      });
  };

  return (
    <Modal
      openState={openState}
      onClose={onClose}
      className="p-4 sm:p-6 space-y-4 w-[92vw] sm:w-md"
      header={<ModalHeader title="Delete Rate Rule" />}
    >
      <p className="text-gray-600 text-sm">
        Are you sure you want to delete this {rule.type.toLowerCase()} rule (
        {rule.minValue} - {rule.maxValue ?? "∞"} ➔ ₹{rule.amount})?
      </p>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={isDeleting}
          loading={isDeleting}
        >
          Delete Rule
        </Button>
      </div>
    </Modal>
  );
};
