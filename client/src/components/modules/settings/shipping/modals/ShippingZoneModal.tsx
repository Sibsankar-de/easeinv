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

const zoneTypeOptions = [
  { key: ShippingZoneType.PINCODE, value: "Pincode / Postal Code" },
  { key: ShippingZoneType.STATE, value: "State / Province" },
  { key: ShippingZoneType.COUNTRY, value: "Country" },
];

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

  const [name, setName] = useState("");
  const [type, setType] = useState<ShippingZoneType>(ShippingZoneType.PINCODE);
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (zone) {
      setName(zone.name);
      setType(zone.type);
      setCode(zone.code);
    } else {
      setName("");
      setType(ShippingZoneType.PINCODE);
      setCode("");
    }
    setErrors({});
  }, [zone, openState]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = "Zone name is required";
    if (!code.trim()) newErrors.code = "Zone code is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    if (isEditing && zone) {
      dispatch(
        updateShippingZoneThunk({
          storeId,
          zoneId: zone.id,
          data: {
            name: name.trim(),
            type,
            code: code.trim(),
          },
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
          data: {
            name: name.trim(),
            type,
            code: code.trim(),
          },
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
            value={name}
            onChange={(val) => {
              setName(val);
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
            }}
            isInvalid={!!errors.name}
            errorMessage={errors.name}
            disabled={isSaving}
          />
        </div>

        <div className="space-y-1.5">
          <Label required>Zone Type</Label>
          <Select
            value={type}
            options={zoneTypeOptions}
            onChange={(val) => setType(val as ShippingZoneType)}
            disabled={isSaving}
          />
        </div>

        <div className="space-y-1.5">
          <Label required>
            {type === ShippingZoneType.PINCODE &&
              "Postal Code / Pincode (or comma-separated)"}
            {type === ShippingZoneType.STATE &&
              "State / Province Name or Code"}
            {type === ShippingZoneType.COUNTRY && "Country Name or ISO Code"}
          </Label>
          <Input
            placeholder={
              type === ShippingZoneType.PINCODE
                ? "e.g. 700001, 700002 or 90210"
                : type === ShippingZoneType.STATE
                  ? "e.g. West Bengal or WB / California or CA"
                  : "e.g. India or IN / United States or US"
            }
            value={code}
            onChange={(val) => {
              setCode(val);
              if (errors.code) setErrors((prev) => ({ ...prev, code: "" }));
            }}
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
