"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";
import {
  createNewStoreThunk,
  selectStoreState,
} from "@/store/features/storeSlice";
import { Store } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

export const StoreCreateModal = ({
  openState,
  onClose,
}: {
  openState: boolean;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: "",
    businessType: "",
    contactEmail: "",
    address: "",
  });

  function handleFormData(key: keyof typeof formData, value: any) {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  const dispatch = useDispatch();
  const { createStatus } = useSelector(selectStoreState);
  const isLoading = createStatus === "loading";

  const handleCreateStore = () => {
    if (!formData.name || !formData.businessType) {
      toast.error("Stared fields are required!");
      return;
    }
    dispatch(createNewStoreThunk(formData))
      .unwrap()
      .then(() => {
        toast.success("Store created successfully");
        onClose();
      });
  };

  return (
    <Modal openState={openState} onClose={onClose} className="min-w-[70vh]">
      <div className="p-3 space-y-6">
        <div>
          <h2 className="text-gray-900 mb-1 text-2xl font-semibold">
            Create new store
          </h2>
          <p className="text-sm text-gray-600">
            Fill the details to create the store
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storeName" required>
              Store Name
            </Label>
            <Input
              id="storeName"
              value={formData.name}
              onChange={(e) => handleFormData("name", e)}
              placeholder="Enter store name"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessType" required>
              Business Type
            </Label>
            <Input
              id="businessType"
              value={formData.businessType}
              onChange={(e) => handleFormData("businessType", e)}
              placeholder="e.g., Retail, Technology, Food & Beverage"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessEmail">Contact email</Label>
            <Input
              type="email"
              id="businessEmail"
              value={formData.contactEmail}
              onChange={(e) => handleFormData("contactEmail", e)}
              placeholder="Enter business email or personal"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="storeLocation">Address</Label>
            <Input
              id="storeLocation"
              value={formData.address}
              onChange={(e) => handleFormData("address", e)}
              placeholder="e.g., Jalpaiguri, WB-735102, India"
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateStore}
            disabled={isLoading}
            loading={isLoading}
          >
            <Store size={15} />
            Create store
          </Button>
        </div>
      </div>
    </Modal>
  );
};
