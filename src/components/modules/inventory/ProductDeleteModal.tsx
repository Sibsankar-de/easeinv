"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";
import { useStoreNavigation } from "@/hooks/store-navigation";
import {
  deleteProductThunk,
  selectProductState,
} from "@/store/features/productSlice";
import { ProductDto } from "@/types/dto/productDto";
import { X } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

export function ProductDeleteModal({
  openState,
  onClose,
  product,
}: {
  openState: boolean;
  onClose: () => void;
  product: ProductDto;
}) {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch();
  const { deleteStatus } = useSelector(selectProductState);

  const [confInput, setConfInpt] = useState("");

  const confirmationLine = `products/${product?.name}`;
  const isDeleting = deleteStatus === "loading";

  const handleDelete = () => {
    if (confInput !== confirmationLine) {
      toast.warn("Please enter the confirmation line correctly");
      return;
    }

    dispatch(deleteProductThunk({ productId: product?._id, storeId }))
      .unwrap()
      .then(() => {
        toast.success("Product removed successfully!");
        onClose();
      });
  };

  return (
    <Modal
      openState={openState}
      onClose={onClose}
      className="p-4 space-y-4 w-[30vw]"
    >
      <div className="flex justify-between items-center gap-2">
        <div>
          <h5 className="text-2xl">Delete product</h5>
        </div>
        <Button variant="outline" className="p-2" onClick={onClose}>
          <X size={20} />
        </Button>
      </div>
      <p>This action will delete the product permanently.</p>
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
          variant="outline"
          className="w-full justify-center bg-gray-200 text-red-400 border-2 border-red-200 hover:bg-red-100"
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
