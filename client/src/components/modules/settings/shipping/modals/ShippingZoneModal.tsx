"use client";

import React, { useState, useEffect } from "react";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import {
  ShippingZoneDto,
  ShippingZoneType,
} from "@/types/dto/shippingProfileDto";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  createShippingZoneThunk,
  updateShippingZoneThunk,
  selectShippingProfileState,
} from "@/store/features/shippingProfileSlice";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { toast } from "@/utils/toast";

interface ShippingZoneModalProps {
  openState: boolean;
  onClose: () => void;
  profileId: string;
  zone?: ShippingZoneDto | null;
  onSuccess?: () => void;
}

interface ShippingZoneFormData {
  name: string;
  type: ShippingZoneType;
  code: string;
}

const initialFormData: ShippingZoneFormData = {
  name: "",
  type: ShippingZoneType.PINCODE,
  code: "",
};

const zoneTypeOptions = [
  { key: ShippingZoneType.PINCODE, value: "Pincode / Postal Code" },
  { key: ShippingZoneType.CITY, value: "City" },
  { key: ShippingZoneType.STATE, value: "State / Province" },
  { key: ShippingZoneType.COUNTRY, value: "Country" },
];

const getZoneCodeLabel = (type: ShippingZoneType): string => {
  switch (type) {
    case ShippingZoneType.PINCODE:
      return "Postal Code / Pincode (or comma-separated)";
    case ShippingZoneType.CITY:
      return "City Name";
    case ShippingZoneType.STATE:
      return "State / Province Name or Code";
    case ShippingZoneType.COUNTRY:
      return "Country Name or ISO Code";
    default:
      return "Zone Code";
  }
};

const getZoneCodePlaceholder = (type: ShippingZoneType): string => {
  switch (type) {
    case ShippingZoneType.PINCODE:
      return "e.g. 700001, 700002 or 90210";
    case ShippingZoneType.CITY:
      return "e.g. Kolkata, Mumbai, New York";
    case ShippingZoneType.STATE:
      return "e.g. West Bengal or WB / California or CA";
    case ShippingZoneType.COUNTRY:
      return "e.g. India or IN / United States or US";
    default:
      return "Enter zone code";
  }
};

export const ShippingZoneModal: React.FC<ShippingZoneModalProps> = ({
  openState,
  onClose,
  profileId,
  zone,
  onSuccess,
}) => {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { zoneActionStatus } = useSelector(selectShippingProfileState);

  const isEditing = !!zone;
  const isSaving = zoneActionStatus === "loading";

  const [formData, setFormData] =
    useState<ShippingZoneFormData>(initialFormData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = <K extends keyof ShippingZoneFormData>(
    field: K,
    value: ShippingZoneFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  useEffect(() => {
    if (zone) {
      setFormData({
        name: zone.name,
        type: zone.type,
        code: zone.code,
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [zone, openState]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = "Zone name is required";
    if (!formData.code.trim()) newErrors.code = "Zone code is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const payload = {
      name: formData.name.trim(),
      type: formData.type,
      code: formData.code.trim(),
    };

    if (isEditing && zone) {
      dispatch(
        updateShippingZoneThunk({
          storeId,
          zoneId: zone.id,
          data: payload,
        }),
      )
        .unwrap()
        .then(() => {
          toast.success("Shipping zone updated successfully.");
          onSuccess?.();
          onClose();
        })
        .catch((err: any) => {
          toast.error(err?.data?.message || "Failed to update zone");
        });
    } else {
      dispatch(
        createShippingZoneThunk({
          storeId,
          profileId,
          data: payload,
        }),
      )
        .unwrap()
        .then(() => {
          toast.success("Shipping zone added successfully.");
          onSuccess?.();
          onClose();
        })
        .catch((err: any) => {
          toast.error(err?.data?.message || "Failed to create zone");
        });
    }
  };

  return (
    <Modal
      openState={openState}
      onClose={onClose}
      className="p-4 sm:p-6 space-y-4 w-[92vw] sm:w-md"
      header={
        <ModalHeader
          title={isEditing ? "Edit Shipping Zone" : "Add Shipping Zone"}
        />
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label required>Zone Name</Label>
          <Input
            placeholder="e.g. Local Metro, California, West Bengal, India"
            value={formData.name}
            onChange={(val) => handleInputChange("name", val)}
            isInvalid={!!errors.name}
            errorMessage={errors.name}
            disabled={isSaving}
          />
        </div>

        <div className="space-y-1.5">
          <Label required>Zone Type</Label>
          <Select
            value={formData.type}
            options={zoneTypeOptions}
            onChange={(val) =>
              handleInputChange("type", val as ShippingZoneType)
            }
            disabled={isSaving}
          />
        </div>

        <div className="space-y-1.5">
          <Label required>{getZoneCodeLabel(formData.type)}</Label>
          <Input
            placeholder={getZoneCodePlaceholder(formData.type)}
            value={formData.code}
            onChange={(val) => handleInputChange("code", val)}
            isInvalid={!!errors.code}
            errorMessage={errors.code}
            disabled={isSaving}
          />
          <p className="text-xs text-gray-500">
            This code will be matched against the customer shipping address.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving} loading={isSaving}>
          {isEditing ? "Save Changes" : "Add Zone"}
        </Button>
      </div>
    </Modal>
  );
};
