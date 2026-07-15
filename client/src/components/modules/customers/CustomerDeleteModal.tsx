"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { useStoreNavigation } from "@/hooks/store-navigation";
import {
  deleteCustomerThunk,
  selectCustomerState,
  clearCustomerListData,
} from "@/store/features/customerSlice";
import { CustomerDto } from "@/types/dto/customerDto";
import { X } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

export function CustomerDeleteModal({
  openState,
  onClose,
  customer,
}: {
  openState: boolean;
  onClose: () => void;
  customer: CustomerDto;
}) {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch();
  const { deleteStatus } = useSelector(selectCustomerState);

  const [confInput, setConfInpt] = useState("");

  const confirmationLine = `customers/${customer?.name}`;
  const isDeleting = deleteStatus === "loading";

  const handleDelete = () => {
    if (confInput !== confirmationLine) {
      toast.warn("Please enter the confirmation line correctly");
      return;
    }

    dispatch(deleteCustomerThunk({ customerId: customer?.id, storeId }))
      .unwrap()
      .then(() => {
        toast.success("Customer removed successfully!");
        dispatch(clearCustomerListData());
        onClose();
      });
  };

  return (
    <Modal
      openState={openState}
      onClose={onClose}
      className="p-4 space-y-4 w-[30vw]"
      header={<ModalHeader title="Delete Customer" />}
    >
      <p>This action will delete the customer and its data permanently.</p>
      <div className="mb-6">
        <Label>
          Type{" "}
          <span className="text-red-400 font-semibold">{confirmationLine}</span>{" "}
          for confirmation.
        </Label>
        <Input
          placeholder={confirmationLine}
          onChange={(e) => setConfInpt(e)}
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
          I want to Delete!
        </Button>
      </div>
    </Modal>
  );
}
