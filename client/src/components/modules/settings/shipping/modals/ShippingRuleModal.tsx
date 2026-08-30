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

const ruleTypeOptions = [
  { key: ShippingRuleType.PRICE, value: "Order Value (Price Based)" },
  { key: ShippingRuleType.WEIGHT, value: "Item Weight (Weight Based)" },
];

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

  const [type, setType] = useState<ShippingRuleType>(ShippingRuleType.PRICE);
  const [minValue, setMinValue] = useState<number | string>(0);
  const [maxValue, setMaxValue] = useState<number | string>("");
  const [amount, setAmount] = useState<number | string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (rule) {
      setType(rule.type);
      setMinValue(rule.minValue);
      setMaxValue(rule.maxValue !== null ? rule.maxValue : "");
      setAmount(rule.amount);
    } else {
      setType(ShippingRuleType.PRICE);
      setMinValue(0);
      setMaxValue("");
      setAmount("");
    }
    setErrors({});
  }, [rule, openState]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    const parsedMin = Number(minValue);
    const parsedMax = maxValue !== "" ? Number(maxValue) : null;
    const parsedAmount = Number(amount);

    if (isNaN(parsedMin) || parsedMin < 0) {
      newErrors.minValue = "Minimum value must be non-negative";
    }

    if (parsedMax !== null) {
      if (isNaN(parsedMax) || parsedMax <= 0) {
        newErrors.maxValue = "Maximum value must be positive";
      } else if (parsedMax < parsedMin) {
        newErrors.maxValue = "Maximum value must be greater than minimum value";
      }
    }

    if (amount === "" || isNaN(parsedAmount) || parsedAmount < 0) {
      newErrors.amount = "Shipping charge must be non-negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const parsedMin = Number(minValue);
    const parsedMax = maxValue !== "" ? Number(maxValue) : null;
    const parsedAmount = Number(amount);

    if (isEditing && rule) {
      dispatch(
        updateShippingRuleThunk({
          storeId,
          ruleId: rule.id,
          data: {
            type,
            minValue: parsedMin,
            maxValue: parsedMax,
            amount: parsedAmount,
          },
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
            shippingProfileId: profileId || null,
            shippingZoneId: zoneId || null,
            type,
            minValue: parsedMin,
            maxValue: parsedMax,
            amount: parsedAmount,
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
          subtitle={
            targetName
              ? `For ${targetName}`
              : zoneId
                ? "Zone specific rule"
                : "General rate rule"
          }
        />
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label required>Rule Condition Type</Label>
          <Select
            value={type}
            options={ruleTypeOptions}
            onChange={(val) => setType(val as ShippingRuleType)}
            disabled={isSaving}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label required>Min {type === ShippingRuleType.PRICE ? "Subtotal" : "Weight"}</Label>
            <Input
              type="number"
              placeholder="0"
              value={minValue}
              onChange={(val) => {
                setMinValue(val);
                if (errors.minValue)
                  setErrors((prev) => ({ ...prev, minValue: "" }));
              }}
              isInvalid={!!errors.minValue}
              errorMessage={errors.minValue}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Max {type === ShippingRuleType.PRICE ? "Subtotal" : "Weight"} (Optional)</Label>
            <Input
              type="number"
              placeholder="No limit (∞)"
              value={maxValue}
              onChange={(val) => {
                setMaxValue(val);
                if (errors.maxValue)
                  setErrors((prev) => ({ ...prev, maxValue: "" }));
              }}
              isInvalid={!!errors.maxValue}
              errorMessage={errors.maxValue}
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label required>Shipping Fee (Amount)</Label>
          <Input
            type="number"
            placeholder="0.00 (Enter 0 for Free Shipping)"
            value={amount}
            onChange={(val) => {
              setAmount(val);
              if (errors.amount)
                setErrors((prev) => ({ ...prev, amount: "" }));
            }}
            isInvalid={!!errors.amount}
            errorMessage={errors.amount}
            disabled={isSaving}
          />
          <p className="text-xs text-gray-500">
            Enter 0 to offer free shipping for this bracket.
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
