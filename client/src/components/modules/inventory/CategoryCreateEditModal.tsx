"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "@/utils/toast";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/utils";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { CategoryDto } from "@/types/dto/categoryDto";
import {
  createCategoryThunk,
  updateCategoryThunk,
  selectInventoryState,
} from "@/store/features/inventorySlice";

export interface CategoryCreateEditModalProps {
  openState: boolean;
  onClose: () => void;
  category?: CategoryDto | null;
  mode?: "create" | "edit";
}

export function CategoryCreateEditModal({
  openState,
  onClose,
  category,
  mode = "create",
}: CategoryCreateEditModalProps) {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch();
  const { categoryStatus } = useSelector(selectInventoryState);

  const [name, setName] = useState("");

  useEffect(() => {
    if (openState) {
      if (mode === "edit" && category) {
        setName(category.name || "");
      } else {
        setName("");
      }
    }
  }, [openState, mode, category]);

  const isLoading = categoryStatus === "loading";

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.warn("Category name is required.");
      return;
    }

    if (mode === "create") {
      dispatch(createCategoryThunk({ storeId, name: trimmedName }))
        .unwrap()
        .then(() => {
          toast.success("Category created successfully!");
          onClose();
        });
    } else if (mode === "edit" && category) {
      dispatch(
        updateCategoryThunk({
          id: category.id,
          storeId,
          name: trimmedName,
        }),
      )
        .unwrap()
        .then(() => {
          toast.success("Category updated successfully!");
          onClose();
        });
    }
  };

  const modalTitle = mode === "edit" ? "Edit Category" : "Create Category";

  return (
    <Modal
      openState={openState}
      onClose={onClose}
      className={cn("p-4 space-y-5 w-xl")}
      header={<ModalHeader title={modalTitle} />}
    >
      <div className={cn("space-y-4")}>
        <div>
          <Label htmlFor="category-name" required>
            Category Name
          </Label>
          <Input
            id="category-name"
            placeholder="Enter category name"
            value={name}
            onChange={(val) => setName(val)}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className={cn("mt-6 flex items-center justify-end gap-3")}>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isLoading || !name.trim()}
          loading={isLoading}
        >
          {mode === "edit" ? "Save Changes" : "Create Category"}
        </Button>
      </div>
    </Modal>
  );
}
