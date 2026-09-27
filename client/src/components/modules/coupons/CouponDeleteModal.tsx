"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { useStoreNavigation } from "@/hooks/store-navigation";
import {
  deleteCouponThunk,
  invalidateCouponPages,
  selectCouponState,
} from "@/store/features/couponSlice";
import { CouponDto } from "@/types/dto/couponDto";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import { toast } from "@/utils/toast";

export function CouponDeleteModal({
  openState,
  onClose,
  coupon,
}: {
  openState: boolean;
  onClose: () => void;
  coupon: CouponDto;
}) {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { deleteStatus } = useSelector(selectCouponState);

  const [confInput, setConfInput] = useState("");

  const confirmationLine = `coupons/${coupon?.code}`;
  const isDeleting = deleteStatus === "loading";

  const handleDelete = () => {
    if (confInput !== confirmationLine) {
      toast.warn("Please enter the confirmation line correctly");
      return;
    }

    dispatch(deleteCouponThunk({ couponId: coupon?.id, storeId }))
      .unwrap()
      .then(() => {
        toast.success("Coupon deleted successfully!");
        dispatch(invalidateCouponPages());
        onClose();
      });
  };

  return (
    <Modal
      openState={openState}
      onClose={onClose}
      className="p-4 space-y-4 w-[90vw] sm:w-[26rem]"
      header={<ModalHeader title="Delete Coupon" />}
    >
      <p className="text-gray-600 text-sm">
        This action will delete coupon <span className="font-semibold text-gray-900">{coupon?.name} ({coupon?.code})</span> permanently.
      </p>
      <div className="mb-6">
        <Label>
          Type{" "}
          <span className="text-red-500 font-semibold">{confirmationLine}</span>{" "}
          for confirmation.
        </Label>
        <Input
          placeholder={confirmationLine}
          onChange={(e) => setConfInput(e)}
          value={confInput}
          isInvalid={confInput.length > 0 && confInput !== confirmationLine}
          disabled={isDeleting}
        />
      </div>
      <div>
        <Button
          variant="danger"
          className="w-full justify-center"
          onClick={handleDelete}
          disabled={isDeleting || confInput !== confirmationLine}
          loading={isDeleting}
        >
          Confirm Delete!
        </Button>
      </div>
    </Modal>
  );
}
