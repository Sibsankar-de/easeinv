"use client";

import { PrimaryBox } from "@/components/ui/PrimaryBox";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { ToggleButton } from "@/components/ui/ToggleButton";
import { useStoreNavigation } from "@/hooks/store-navigation";
import {
  selectCurrentStoreState,
  updateStoreSettingsThunk,
} from "@/store/features/currentStoreSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { ProductUnitAddSection } from "./ProductUnitAddSection";
import { FormSkeleton } from "@/components/ui/Skeleton";
import { useNavContext } from "@/contexts/NavContext";
import { NavActionButton } from "@/components/modules/navbar/navbar";

export const InventorySettingsComponent = () => {
  const { storeId } = useStoreNavigation();
  const { setActionButtons } = useNavContext();

  const dispatch = useDispatch();
  const {
    data: { storeSettings },
    status,
    settingsUpdateStatus,
  } = useSelector(selectCurrentStoreState);

  const [formData, setFormData] = useState({
    enableInventoryTracking: false,
    customUnits: [],
  });

  function handleFormDataChange(key: keyof typeof formData, value: any) {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  useEffect(() => {
    if (!storeSettings) return;
    let data: any = {};
    Object.keys(formData).map((key) => {
      const storeKey = key as keyof typeof storeSettings;
      if (storeSettings[storeKey]) {
        data[key] = storeSettings[storeKey];
      }
    });

    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  }, [storeSettings]);

  const handleSaveChanges = () => {
    if (settingsUpdateStatus !== "loading" && storeId) {
      dispatch(updateStoreSettingsThunk({ storeId, updateData: formData }))
        .unwrap()
        .then(() => {
          toast.success("Store settings saved!");
        });
    }
  };

  const isUpdating = settingsUpdateStatus === "loading";

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
    return <FormSkeleton rows={3} />;
  }

  return (
    <div className="space-y-6">
      <PrimaryBox>
        <div className="space-y-6">
          <div className="">
            <div className="flex justify-between items-center gap-6">
              <Label htmlFor="stock-tracking" className="mb-0">
                <p>Enable Stock tracking</p>
                <p className="text-sm text-gray-600">
                  It will track your stock.
                </p>
              </Label>
              <ToggleButton
                id="stock-tracking"
                isActive={formData.enableInventoryTracking}
                disabled={isUpdating}
                onChange={(e) =>
                  handleFormDataChange("enableInventoryTracking", e)
                }
              />
            </div>
          </div>
          <div>
            <Label>Add custom Units</Label>
            <ProductUnitAddSection
              onChange={(e) => handleFormDataChange("customUnits", e)}
            />
          </div>
        </div>
      </PrimaryBox>

      <div className="flex justify-end">
        <Button
          variant="dark"
          onClick={handleSaveChanges}
          disabled={isUpdating}
          loading={isUpdating}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};
