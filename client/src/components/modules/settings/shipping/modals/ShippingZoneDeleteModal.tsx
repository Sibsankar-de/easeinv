"use client";

import React from "react";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ShippingZoneDto } from "@/types/dto/shippingProfileDto";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  deleteShippingZoneThunk,
  selectShippingProfileState,
} from "@/store/features/shippingProfileSlice";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { toast } from "@/utils/toast";

interface ShippingZoneDeleteModalProps {
  openState: boolean;
  onClose: () => void;
  zone: ShippingZoneDto | null;
  onSuccess?: () => void;
}

export const ShippingZoneDeleteModal: React.FC<
  ShippingZoneDeleteModalProps
> = ({ openState, onClose, zone, onSuccess }) => {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { zoneActionStatus } = useSelector(selectShippingProfileState);

  if (!zone) return null;

  const isDeleting = zoneActionStatus === "loading";

  const handleDelete = () => {
    dispatch(deleteShippingZoneThunk({ storeId, zoneId: zone.id }))
      .unwrap()
      .then(() => {
        toast.success("Shipping zone deleted successfully.");
        onSuccess?.();
        onClose();
      })
      .catch((err: any) => {
        toast.error(err?.data?.message || "Failed to delete shipping zone");
      });
  };

  return (
    <Modal
      openState={openState}
      onClose={onClose}
      className="p-4 sm:p-6 space-y-4 w-[92vw] sm:w-md"
      header={<ModalHeader title="Delete Shipping Zone" />}
    >
      <p className="text-gray-600 text-sm">
        Are you sure you want to delete zone{" "}
        <span className="font-semibold text-gray-900">{zone.name}</span> (
        {zone.type}: {zone.code})? All specific rate rules under this zone will
        also be removed.
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
          Delete Zone
        </Button>
      </div>
    </Modal>
  );
};
