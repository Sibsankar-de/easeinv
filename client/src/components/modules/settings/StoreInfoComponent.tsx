"use client";

import { PrimaryBox } from "@/components/ui/PrimaryBox";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useStoreNavigation } from "@/hooks/store-navigation";
import {
  selectCurrentStoreState,
  updateStoreDetailsThunk,
} from "@/store/features/currentStoreSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FormSkeleton } from "@/components/ui/Skeleton";
import { useNavContext } from "@/contexts/NavContext";
import { NavActionButton } from "@/components/modules/navbar/navbar";

export const StoreInfoComponent = () => {
  const { storeId } = useStoreNavigation();
  const { setActionButtons } = useNavContext();

  const dispatch = useDispatch();
  const {
    data: { currentStore },
    status,
    storeUpdateStatus,
  } = useSelector(selectCurrentStoreState);

  const [formData, setFormData] = useState({
    name: "",
    contactEmail: "",
    contactNo: "",
    address: "",
    registrationNumber: "",
    website: "",
  });

  function handleFormDataChange(key: keyof typeof formData, value: any) {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  useEffect(() => {
    let data: any = {};
    Object.keys(formData).map((key) => {
      const storeKey = key as keyof typeof currentStore;
      if (currentStore[storeKey]) {
        data[key] = currentStore[storeKey];
      }
    });

    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  }, [currentStore]);

  const handleSaveChanges = () => {
    if (storeUpdateStatus !== "loading" && storeId) {
      dispatch(updateStoreDetailsThunk({ storeId, updateData: formData }))
        .unwrap()
        .then(() => {
          toast.success("Store details saved!");
        });
    }
  };

  const isUpdating = storeUpdateStatus === "loading";

  useEffect(() => {
    setActionButtons(
      <NavActionButton
        onClick={handleSaveChanges}
        disabled={isUpdating}
        loading={isUpdating}
      >
        Save
      </NavActionButton>,
    );
  }, [setActionButtons, isUpdating, formData]);

  if (status === "loading") {
    return <FormSkeleton rows={4} />;
  }

  return (
    <div className="space-y-6">
      <PrimaryBox>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="storeName" required>
              Store Name
            </Label>
            <Input
              id="storeName"
              value={formData.name}
              onChange={(e) => handleFormDataChange("name", e)}
              placeholder="Enter business name"
              disabled={isUpdating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleFormDataChange("contactEmail", e)}
              placeholder="contact@business.com"
              disabled={isUpdating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.contactNo}
              onChange={(e) => handleFormDataChange("contactNo", e)}
              placeholder="+91 (555) 000-0000"
              disabled={isUpdating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleFormDataChange("website", e)}
              placeholder="www.business.com"
              disabled={isUpdating}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Store Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleFormDataChange("address", e)}
              placeholder="123 Business Street"
              disabled={isUpdating}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="taxId">Tax ID / Business Registration Number</Label>
            <Input
              id="taxId"
              value={formData.registrationNumber}
              onChange={(e) => handleFormDataChange("registrationNumber", e)}
              placeholder="12-3456789"
              disabled={isUpdating}
            />
          </div>
        </div>
      </PrimaryBox>

      <div className="flex justify-end">
        <Button
          variant="dark"
          disabled={isUpdating}
          loading={isUpdating}
          onClick={handleSaveChanges}
        >
          Save changes
        </Button>
      </div>
    </div>
  );
};
