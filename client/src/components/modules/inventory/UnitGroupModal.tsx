"use client";

import { useEffect, useState } from "react";
import { Modal, ModalHeader } from "../../ui/Modal";
import { Input } from "../../ui/Input";
import { Label } from "../../ui/Label";
import { Button } from "../../ui/Button";
import { StockUnitInput } from "../../ui/StockUnitInput";
import { UnitGroupType } from "@/types/dto/productDto";
import { convertUnit } from "@/utils/conversion";
import { useSelector } from "react-redux";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import { ArrowRight, Layers } from "lucide-react";
import { cn } from "@/components/utils";

interface UnitGroupModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (group: UnitGroupType) => void;
  editingGroup?: UnitGroupType | null;
  baseUnit: string;
}

const EMPTY_FORM = {
  name: "",
  unit: "PKT",
  multiplierStr: "",
};

export const UnitGroupModal = ({
  open,
  onClose,
  onSave,
  editingGroup,
  baseUnit,
}: UnitGroupModalProps) => {
  const {
    data: { storeSettings },
  } = useSelector(selectCurrentStoreState);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ── Sync form when modal opens or editingGroup changes ── */
  useEffect(() => {
    if (open) {
      if (editingGroup) {
        setForm({
          name: editingGroup.name,
          unit: editingGroup.unit,
          multiplierStr: String(editingGroup.multiplier),
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
    }
  }, [open, editingGroup]);

  const multiplierNum = parseFloat(form.multiplierStr);
  const isValidMultiplier = !isNaN(multiplierNum) && multiplierNum > 0;

  const baseUnitLabel = convertUnit(baseUnit, storeSettings.customUnits);
  const groupUnitLabel = convertUnit(form.unit, storeSettings.customUnits);

  /* ── Validation ── */
  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Group name is required.";
    if (!form.unit) errs.unit = "Unit is required.";
    if (!form.multiplierStr.trim() || !isValidMultiplier || multiplierNum <= 0)
      errs.multiplier = "Multiplier must be a positive number.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onSave({
      id: editingGroup?.id ?? Date.now(),
      name: form.name.trim(),
      unit: form.unit,
      multiplier: multiplierNum,
    });
    onClose();
  }

  return (
    <Modal
      openState={open}
      onClose={onClose}
      className="w-2xl space-y-5"
      header={
        <ModalHeader
          title={editingGroup ? "Edit Unit Group" : "Add Unit Group"}
          subtitle={`Base unit: ${baseUnitLabel}`}
        />
      }
    >
      {/* Group Name */}
      <div>
        <Label htmlFor="ug-name" required>
          Group name
        </Label>
        <Input
          id="ug-name"
          placeholder="e.g. Packet, Carton, Box"
          value={form.name}
          onChange={(v) => {
            setForm((p) => ({ ...p, name: v }));
            if (errors.name) setErrors((e) => ({ ...e, name: "" }));
          }}
          errorMessage={errors.name}
        />
      </div>

      {/* Unit selector */}
      <div>
        <Label htmlFor="ug-unit" required>
          Unit
        </Label>
        <StockUnitInput
          id="ug-unit"
          value={form.unit}
          onChange={(v) => {
            setForm((p) => ({ ...p, unit: v }));
            if (errors.unit) setErrors((e) => ({ ...e, unit: "" }));
          }}
          errorMessage={errors.name}
        />
      </div>

      {/* Multiplier */}
      <div>
        <Label htmlFor="ug-multiplier" required>
          Multiplier
        </Label>
        <p className="text-xs text-gray-500 mb-1.5">
          How many <strong>{baseUnitLabel}</strong> equals 1{" "}
          <strong>{groupUnitLabel}</strong>?
        </p>
        <Input
          id="ug-multiplier"
          type="number"
          placeholder="e.g. 10"
          value={form.multiplierStr}
          onChange={(v) => {
            setForm((p) => ({ ...p, multiplierStr: v }));
            if (errors.multiplier) setErrors((e) => ({ ...e, multiplier: "" }));
          }}
          errorMessage={errors.multiplier}
        />
      </div>

      {/* Live preview */}
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg px-4 py-3",
          "bg-primary/5 border border-primary/20",
          "text-sm text-gray-700",
          !isValidMultiplier && "opacity-40",
        )}
      >
        <Layers size={16} className="text-primary shrink-0" />
        <span>
          1 <strong>{groupUnitLabel}</strong>
        </span>
        <ArrowRight size={14} className="text-gray-400 shrink-0" />
        <span>
          <strong>{isValidMultiplier ? multiplierNum : "?"}</strong>{" "}
          {baseUnitLabel}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-1">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          {editingGroup ? "Update Group" : "Add Group"}
        </Button>
      </div>
    </Modal>
  );
};
