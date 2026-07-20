"use client";

import { useState } from "react";
import { Button } from "../../ui/Button";
import { ConditionalDiv } from "../../ui/ConditionalDiv";
import { UnitGroupType } from "@/types/dto/productDto";
import { UnitGroupModal } from "./UnitGroupModal";
import { convertUnit } from "@/utils/conversion";
import { useSelector } from "react-redux";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import { Edit, Layers, Plus, Trash2 } from "lucide-react";

interface UnitGroupsSectionProps {
  baseUnit: string;
  value: UnitGroupType[];
  onChange: (groups: UnitGroupType[]) => void;
  disabled?: boolean;
}

export const UnitGroupsSection = ({
  baseUnit,
  value,
  onChange,
  disabled = false,
}: UnitGroupsSectionProps) => {
  const {
    data: { storeSettings },
  } = useSelector(selectCurrentStoreState);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<UnitGroupType | null>(null);

  const baseUnitLabel = convertUnit(baseUnit, storeSettings.customUnits);

  function openCreate() {
    setEditingGroup(null);
    setModalOpen(true);
  }

  function openEdit(group: UnitGroupType) {
    setEditingGroup(group);
    setModalOpen(true);
  }

  function handleSave(group: UnitGroupType) {
    if (editingGroup) {
      onChange(value.map((g) => (g.id === group.id ? group : g)));
    } else {
      const maxId = value.reduce((m, g) => Math.max(m, g.id), 0);
      onChange([...value, { ...group, id: maxId + 1 }]);
    }
  }

  function handleDelete(id: number) {
    onChange(value.filter((g) => g.id !== id));
  }

  return (
    <div className="max-w-2xl space-y-2">
      <Button
        variant="outline"
        className="text-primary w-full justify-center"
        onClick={openCreate}
        disabled={disabled}
      >
        <Plus size={14} />
        Add new Group
      </Button>

      {/* Group list */}
      <ConditionalDiv
        condition={value.length}
        className="p-3 bg-gray-100 rounded-lg space-y-2"
      >
        {value.map((group) => (
          <GroupItem
            key={group.id}
            group={group}
            baseUnitLabel={baseUnitLabel}
            storeSettings={storeSettings}
            disabled={disabled}
            onEdit={() => openEdit(group)}
            onDelete={() => handleDelete(group.id)}
          />
        ))}
      </ConditionalDiv>

      {/* Empty state */}
      {!value.length && (
        <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-dashed">
          No unit groups added yet. Add groups like &quot;Packet (10 KG)&quot;,
          &quot;Carton (50 KG)&quot;.
        </p>
      )}

      {/* Create / Edit modal */}
      <UnitGroupModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editingGroup={editingGroup}
        baseUnit={baseUnit}
      />
    </div>
  );
};

function GroupItem({
  group,
  baseUnitLabel,
  storeSettings,
  disabled,
  onEdit,
  onDelete,
}: {
  group: UnitGroupType;
  baseUnitLabel: string;
  storeSettings: any;
  disabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const groupUnitLabel = convertUnit(group.unit, storeSettings.customUnits);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
          <Layers className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-medium text-gray-800">{group.name}</p>
          <p className="text-sm text-gray-500">
            1 {groupUnitLabel} = {group.multiplier} {baseUnitLabel}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="text-primary p-2"
          onClick={onEdit}
          disabled={disabled}
        >
          <Edit size={15} />
        </Button>
        <Button
          variant="danger"
          className="text-red-400 p-2"
          onClick={onDelete}
          disabled={disabled}
        >
          <Trash2 size={15} />
        </Button>
      </div>
    </div>
  );
}
