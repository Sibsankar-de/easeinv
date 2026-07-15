"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { useStoreNavigation } from "@/hooks/store-navigation";
import {
  updateCustomerThunk,
  selectCustomerState,
  createCustomerThunk,
} from "@/store/features/customerSlice";
import { CustomerDto } from "@/types/dto/customerDto";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

export function CustomerCreateEditModal({
  openState,
  onClose,
  customer,
  mode = "create",
}: {
  openState: boolean;
  onClose: () => void;
  customer?: CustomerDto;
  mode?: "create" | "edit";
}) {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch();
  const { createStatus, updateStatus } = useSelector(selectCustomerState);

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    if (mode == "edit" && customer) {
      setFormData({
        name: customer.name || "",
        phoneNumber: customer.phoneNumber || "",
        email: customer.email || "",
        address: customer.address || "",
      });
    }
  }, [customer, openState]);

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast.warn("Customer name is required");
      return;
    }

    dispatch(
      createCustomerThunk({
        storeId,
        data: formData,
      }),
    )
      .unwrap()
      .then(() => {
        toast.success("Customer created successfully!");
        onClose();
      });
  };

  const handleUpdate = () => {
    if (!customer || !formData.name.trim()) {
      toast.warn("Customer name is required");
      return;
    }

    dispatch(
      updateCustomerThunk({
        storeId,
        customerId: customer.id,
        data: formData,
      }),
    )
      .unwrap()
      .then(() => {
        toast.success("Customer updated successfully!");
        onClose();
      });
  };

  const handleSave = () => {
    if (!storeId) return;

    switch (mode) {
      case "create":
        handleCreate();
        break;
      case "edit":
        handleUpdate();
        break;
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isLoading = updateStatus === "loading" || createStatus === "loading";

  return (
    <Modal
      openState={openState}
      onClose={onClose}
      className="p-4 space-y-4 w-[40vw]"
      header={
        <ModalHeader
          title={`${mode === "edit" ? "Edit" : "Create"} Customer`}
        />
      }
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" required>
            Name
          </Label>
          <Input
            id="name"
            placeholder="Enter customer name"
            value={formData.name}
            onChange={(val) => handleChange("name", val)}
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            placeholder="Enter phone number"
            value={formData.phoneNumber}
            onChange={(val) => handleChange("phoneNumber", val)}
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={(val) => handleChange("email", val)}
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            placeholder="Enter address"
            value={formData.address}
            onChange={(val) => handleChange("address", val)}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="mt-4 flex gap-3 items-center justify-end">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isLoading || !formData.name.trim()}
          loading={isLoading}
        >
          {mode === "edit" ? "Save Changes" : "Create Customer"}
        </Button>
      </div>
    </Modal>
  );
}
