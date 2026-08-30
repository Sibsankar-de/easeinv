"use client";

import React, { useState } from "react";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  ShippingProfileDto,
  ShippingProfileSummaryDto,
} from "@/types/dto/shippingProfileDto";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  deleteShippingProfileThunk,
  invalidateShippingProfilePages,
  selectShippingProfileState,
} from "@/store/features/shippingProfileSlice";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { toast } from "@/utils/toast";

interface ShippingProfileDeleteModalProps {
  openState: boolean;
  onClose: () => void;
  profile: ShippingProfileSummaryDto | ShippingProfileDto | null;
  onSuccess?: () => void;
}

export const ShippingProfileDeleteModal: React.FC<
  ShippingProfileDeleteModalProps
> = ({ openState, onClose, profile, onSuccess }) => {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { deleteStatus } = useSelector(selectShippingProfileState);

  const [confirmInput, setConfirmInput] = useState("");

  if (!profile) return null;

  const confirmationTarget = `delete/${profile.name.toLowerCase().replace(/\s+/g, "-")}`;
  const isDeleting = deleteStatus === "loading";

  const handleDelete = () => {
    if (confirmInput !== confirmationTarget) {
      toast.warn("Please enter the confirmation text correctly.");
      return;
    }

    dispatch(
      deleteShippingProfileThunk({ storeId, profileId: profile.id }),
    )
      .unwrap()
      .then(() => {
        toast.success("Shipping profile deleted successfully.");
        dispatch(invalidateShippingProfilePages());
        onSuccess?.();
        onClose();
      })
      .catch((err: any) => {
        toast.error(
          err?.data?.message || "Failed to delete shipping profile",
        );
      });
  };

  return (
    <Modal
      openState={openState}
      onClose={onClose}
      className="p-4 sm:p-6 space-y-4 w-[92vw] sm:w-md"
      header={<ModalHeader title="Delete Shipping Profile" />}
    >
      <p className="text-gray-600 text-sm">
        This action will permanently delete shipping profile{" "}
        <span className="font-semibold text-gray-900">{profile.name}</span>,
        including all its delivery zones and rate rules.
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
