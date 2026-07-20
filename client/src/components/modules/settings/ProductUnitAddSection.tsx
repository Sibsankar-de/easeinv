"use client";

import { Button } from "@/components/ui/Button";
import { ConditionalDiv } from "@/components/ui/ConditionalDiv";
import { Input } from "@/components/ui/Input";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import { CustomUnitType } from "@/types/dto/storeDto";
import { Edit, Plus, Ruler, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

export const ProductUnitAddSection = ({
  onChange,
}: {
  onChange: (item: CustomUnitType[]) => void;
}) => {
  const {
    data: { storeSettings },
  } = useSelector(selectCurrentStoreState);

  const [unitList, setUnitList] = useState<CustomUnitType[]>([]);
  const [input, setInput] = useState({
    key: "",
    value: "",
  });

  const [editItem, setEditItem] = useState<CustomUnitType | null>(null);

  useEffect(() => {
    if (storeSettings.customUnits?.length) {
      setUnitList(storeSettings.customUnits);
    }
  }, [storeSettings]);

  const handleAddUnit = () => {
    if (!input.value || !input.key) {
      toast.warn("Value and label is required!");
      return;
    }

    if (unitList.find((e) => e.key === input.key)) {
      toast.warn(`Unit with key "${input.key}" already exists`);
      return;
    }

    setUnitList((p) => [...p, input]);
    setInput({
      key: "",
      value: "",
    });
  };

  const handleEdit = () => {
    if (!editItem) return;

    if (!input.value || !input.key) {
      toast.warn("Value and label is required!");
      return;
    }
    if (
      editItem.key !== input.key &&
      unitList.find((e) => e.key === input.key)
    ) {
      toast.warn(`Unit with key "${input.key}" already exists`);
      return;
    }

    setUnitList((prev) =>
      prev.map((item) => {
        if (item.key === editItem.key) {
          return input;
        }
        return item;
      }),
    );

    handleCancelEdit();
  };

  const handleDelete = (key: string) => {
    setUnitList((prev) => prev.filter((item) => item.key !== key));
    handleCancelEdit();
  };

  const handleCancelEdit = () => {
    setEditItem(null);
    setInput({
      key: "",
      value: "",
    });
  };

  useEffect(() => {
    onChange(unitList);
  }, [unitList]);

  return (
    <div className="w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Input
            placeholder="Unit key. eg, CARTON"
            value={input.key}
            onChange={(e) => setInput((p) => ({ ...p, key: e }))}
          />
        </div>
        <div className="flex-1">
          <Input
            placeholder="Unit value. eg, Carton"
            value={input.value}
            onChange={(e) => setInput((p) => ({ ...p, value: e }))}
          />
        </div>

        {!editItem ? (
          <Button disabled={!input.value || !input.key} onClick={handleAddUnit}>
            <Plus size={18} />
          </Button>
        ) : (
          <>
            <Button disabled={!input.value || !input.key} onClick={handleEdit}>
              <Save size={18} />
            </Button>
            <Button
              variant="outline"
              className="text-red-300 p-2"
              onClick={handleCancelEdit}
            >
              <X size={18} />
            </Button>
          </>
        )}
      </div>

      <ConditionalDiv
        condition={unitList.length}
        className="p-3 bg-gray-100 rounded-lg space-y-2"
      >
        {unitList.map((item) => (
          <UnitItem
            key={item.key}
            unitData={item}
            onEdit={(e) => {
              setEditItem(e);
              setInput(e);
            }}
            onDelete={handleDelete}
          />
        ))}
      </ConditionalDiv>
      {!unitList.length && (
        <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-dashed">
          No units added yet. Add custom units like "KG", "PCS", etc.
        </p>
      )}
    </div>
  );
};

function UnitItem({
  unitData,
  onEdit,
  onDelete,
}: {
  unitData: CustomUnitType;
  onEdit: (item: CustomUnitType) => void;
  onDelete: (key: string) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Ruler className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p>{unitData.value}</p>
          <p className="text-sm">{unitData.key}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="text-primary p-2"
          onClick={() => onEdit(unitData)}
        >
          <Edit size={15} />
        </Button>
        <Button
          variant="danger"
          className="text-red-400 p-2"
          onClick={() => onDelete(unitData.key)}
        >
          <Trash2 size={15} />
        </Button>
      </div>
    </div>
  );
}
