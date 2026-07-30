"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { cn } from "@/components/utils";
import { CategoryDto } from "@/types/dto/categoryDto";
import {
  deleteCategoryThunk,
  selectInventoryState,
} from "@/store/features/inventorySlice";
import { useStoreNavigation } from "@/hooks/store-navigation";

export interface CategoryDeleteModalProps {
  openState: boolean;
  onClose: () => void;
  category: CategoryDto | null;
}

export function CategoryDeleteModal({
  openState,
  onClose,
  category,
}: CategoryDeleteModalProps) {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch();
  const { categoryStatus } = useSelector(selectInventoryState);
  const [confInput, setConfInput] = useState("");

  const confirmationLine = category?.name ? `categories/${category.name}` : "";
  const isDeleting = categoryStatus === "loading";

  const handleDelete = () => {
    if (!category) return;
    if (confInput !== confirmationLine) {
      toast.warn("Please enter the confirmation line correctly.");
      return;
    }

    dispatch(deleteCategoryThunk({ storeId, id: category.id }))
      .unwrap()
      .then(() => {
        toast.success("Category deleted successfully!");
        setConfInput("");
        onClose();
      });
  };

  const handleClose = () => {
    setConfInput("");
    onClose();
  };

  return (
    <Modal
      openState={openState}
      onClose={handleClose}
      className={cn("p-4 space-y-4 w-xl")}
      header={<ModalHeader title="Delete Category" />}
    >
      <p className={cn("text-gray-700 text-sm")}>
        This action will delete the category{" "}
        <span className={cn("font-semibold text-gray-900")}>
          "{category?.name}"
        </span>{" "}
        permanently.
      </p>

      <div className={cn("mb-4 space-y-1.5")}>
        <Label>
          Type{" "}
          <span className={cn("text-red-500 font-semibold")}>
            {confirmationLine}
          </span>{" "}
          for confirmation.
        </Label>
        <Input
          placeholder={confirmationLine}
          onChange={(val) => setConfInput(val)}
          value={confInput}
          isInvalid={confInput.length > 0 && confInput !== confirmationLine}
          disabled={isDeleting}
        />
      </div>

      <div className={cn("mt-6 flex items-center justify-end gap-3")}>
        <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={isDeleting || confInput !== confirmationLine}
          loading={isDeleting}
        >
          Confirm Delete
        </Button>
      </div>
    </Modal>
  );
}
