"use client";

import React, { useState, useEffect } from "react";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import {
  ShippingRuleDto,
  ShippingRuleType,
} from "@/types/dto/shippingProfileDto";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  createShippingRuleThunk,
  updateShippingRuleThunk,
  selectShippingProfileState,
} from "@/store/features/shippingProfileSlice";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { toast } from "@/utils/toast";

interface ShippingRuleModalProps {
  openState: boolean;
  onClose: () => void;
  profileId?: string | null;
  zoneId?: string | null;
  targetName?: string;
  rule?: ShippingRuleDto | null;
  onSuccess?: () => void;
}

interface ShippingRuleFormData {
  name: string;
  type: ShippingRuleType;
  minValue: number | string;
  maxValue: number | string;
  rate: number | string;
}

const initialFormData: ShippingRuleFormData = {
  name: "",
  type: ShippingRuleType.FLAT,
  minValue: "",
  maxValue: "",
  rate: "",
};

const ruleTypeOptions = [
  { key: ShippingRuleType.FLAT, value: "Flat Rate" },
  { key: ShippingRuleType.PRICE_BASED, value: "Order Value (Price Based)" },
  { key: ShippingRuleType.WEIGHT_BASED, value: "Item Weight (Weight Based)" },
];

const getRuleModalSubtitle = (
  targetName?: string,
  zoneId?: string | null,
): string => {
  if (targetName) return `For ${targetName}`;
  if (zoneId) return "Zone specific rule";
  return "General rate rule";
};

const getRuleThresholdLabel = (
  prefix: "Min" | "Max",
  type: ShippingRuleType,
): string =>
  `${prefix} ${type === ShippingRuleType.PRICE_BASED ? "Subtotal (₹)" : "Weight"}`;

export const ShippingRuleModal: React.FC<ShippingRuleModalProps> = ({
  openState,
  onClose,
  profileId,
  zoneId,
  targetName,
  rule,
  onSuccess,
}) => {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { ruleActionStatus } = useSelector(selectShippingProfileState);

  const isEditing = !!rule;
  const isSaving = ruleActionStatus === "loading";

  const [formData, setFormData] =
    useState<ShippingRuleFormData>(initialFormData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = <K extends keyof ShippingRuleFormData>(
    field: K,
    value: ShippingRuleFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name || "",
        type: rule.type,
        minValue: rule.minValue !== null ? rule.minValue : "",
        maxValue: rule.maxValue !== null ? rule.maxValue : "",
        rate: rule.rate,
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [rule, openState]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Rule name is required";
    }

    const parsedRate = Number(formData.rate);
    if (formData.rate === "" || isNaN(parsedRate) || parsedRate < 0) {
      newErrors.rate = "Shipping rate must be non-negative";
    }

    const parsedMin =
      formData.minValue !== "" ? Number(formData.minValue) : null;
    const parsedMax =
      formData.maxValue !== "" ? Number(formData.maxValue) : null;

    if (parsedMin !== null && (isNaN(parsedMin) || parsedMin < 0)) {
      newErrors.minValue = "Minimum value must be non-negative";
    }

    if (parsedMax !== null) {
      if (isNaN(parsedMax) || parsedMax <= 0) {
        newErrors.maxValue = "Maximum value must be positive";
      } else if (parsedMin !== null && parsedMax < parsedMin) {
        newErrors.maxValue = "Maximum value must be greater than minimum value";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const parsedMin =
      formData.minValue !== "" ? Number(formData.minValue) : null;
    const parsedMax =
      formData.maxValue !== "" ? Number(formData.maxValue) : null;
    const parsedRate = Number(formData.rate);

    const payload = {
      name: formData.name.trim(),
      type: formData.type,
      rate: parsedRate,
      minValue: parsedMin,
      maxValue: parsedMax,
    };

    if (isEditing && rule) {
      dispatch(
        updateShippingRuleThunk({
          storeId,
          ruleId: rule.id,
          data: payload,
        }),
      )
        .unwrap()
        .then(() => {
          toast.success("Shipping rate rule updated successfully.");
          onSuccess?.();
          onClose();
        })
        .catch((err: any) => {
          toast.error(err?.data?.message || "Failed to update rule");
        });
    } else {
      dispatch(
        createShippingRuleThunk({
          storeId,
          data: {
            profileId: profileId || null,
            zoneId: zoneId || null,
            ...payload,
          },
        }),
      )
        .unwrap()
        .then(() => {
          toast.success("Shipping rate rule added successfully.");
          onSuccess?.();
          onClose();
        })
        .catch((err: any) => {
          toast.error(err?.data?.message || "Failed to create rule");
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
          title={isEditing ? "Edit Rate Rule" : "Add Rate Rule"}
          subtitle={getRuleModalSubtitle(targetName, zoneId)}
        />
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label required>Rule Name</Label>
          <Input
            placeholder="e.g. Standard Delivery, Free Shipping Over ₹500"
            value={formData.name}
            onChange={(val) => handleInputChange("name", val)}
            isInvalid={!!errors.name}
            errorMessage={errors.name}
            disabled={isSaving}
          />
        </div>

        <div className="space-y-1.5">
          <Label required>Rule Condition Type</Label>
          <Select
            value={formData.type}
            options={ruleTypeOptions}
            onChange={(val) =>
              handleInputChange("type", val as ShippingRuleType)
            }
            disabled={isSaving}
          />
        </div>

        {formData.type !== ShippingRuleType.FLAT && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{getRuleThresholdLabel("Min", formData.type)}</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.minValue}
                onChange={(val) => handleInputChange("minValue", val)}
                isInvalid={!!errors.minValue}
                errorMessage={errors.minValue}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-1.5">
              <Label>{getRuleThresholdLabel("Max", formData.type)}</Label>
              <Input
                type="number"
                placeholder="No limit (∞)"
                value={formData.maxValue}
                onChange={(val) => handleInputChange("maxValue", val)}
                isInvalid={!!errors.maxValue}
                errorMessage={errors.maxValue}
                disabled={isSaving}
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label required>Shipping Fee / Rate (₹)</Label>
          <Input
            type="number"
            placeholder="0.00 (Enter 0 for Free Shipping)"
            value={formData.rate}
            onChange={(val) => handleInputChange("rate", val)}
            isInvalid={!!errors.rate}
            errorMessage={errors.rate}
            disabled={isSaving}
          />
          <p className="text-xs text-gray-500">
            Enter 0 to offer free shipping for this rule.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving} loading={isSaving}>
          {isEditing ? "Save Rule" : "Add Rule"}
        </Button>
      </div>
    </Modal>
  );
};
