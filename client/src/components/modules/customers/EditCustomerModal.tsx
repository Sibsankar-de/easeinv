"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { useStoreNavigation } from "@/hooks/store-navigation";
import {
  updateCustomerThunk,
  selectCustomerState,
} from "@/store/features/customerSlice";
import { CustomerDto } from "@/types/dto/customerDto";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

export function EditCustomerModal({
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
  const { updateStatus } = useSelector(selectCustomerState);

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        phoneNumber: customer.phoneNumber || "",
        email: customer.email || "",
        address: customer.address || "",
      });
    }
  }, [customer, openState]);

  const isUpdating = updateStatus === "loading";

  const handleUpdate = () => {
    if (!formData.name.trim()) {
      toast.warn("Customer name is required");
      return;
    }

    dispatch(
      updateCustomerThunk({
        storeId,
        customerId: customer._id,
        data: formData,
      }),
    )
      .unwrap()
      .then(() => {
        toast.success("Customer updated successfully!");
        onClose();
      });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      openState={openState}
      onClose={onClose}
      className="p-4 space-y-4 w-[40vw]"
    >
      <div className="flex justify-between items-center gap-2">
        <div>
          <h5 className="text-2xl font-semibold">Edit Customer</h5>
        </div>
        <Button variant="outline" className="p-2" onClick={onClose}>
          <X size={20} />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name*</Label>
          <Input
            id="name"
            placeholder="Enter customer name"
            value={formData.name}
            onChange={(val) => handleChange("name", val)}
            disabled={isUpdating}
            isInvalid={!formData.name.trim()}
          />
        </div>

        <div>
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            placeholder="Enter phone number"
            value={formData.phoneNumber}
            onChange={(val) => handleChange("phoneNumber", val)}
            disabled={isUpdating}
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
            disabled={isUpdating}
          />
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            placeholder="Enter address"
            value={formData.address}
            onChange={(val) => handleChange("address", val)}
            disabled={isUpdating}
          />
        </div>
      </div>

      <div className="pt-4 flex gap-3">
        <Button
          variant="outline"
          className="flex-1 justify-center"
          onClick={onClose}
          disabled={isUpdating}
        >
          Cancel
        </Button>
        <Button
          className="flex-1 justify-center"
          onClick={handleUpdate}
          disabled={isUpdating || !formData.name.trim()}
          loading={isUpdating}
        >
          Save Changes
        </Button>
      </div>
    </Modal>
  );
}
