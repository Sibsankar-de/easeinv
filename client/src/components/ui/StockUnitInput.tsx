"use client";

import { unitMap } from "@/constants/UnitMaps";
import { Select } from "./Select";
import { SelectOptionType } from "@/types/SelectType";
import { useSelector } from "react-redux";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";

export const StockUnitInput = ({
  id,
  onChange,
  value,
  disabled,
}: {
  id?: string;
  onChange?: (e: string) => void;
  value?: string;
  className?: string;
  disabled?: boolean;
}) => {
  const {
    data: { storeSettings },
  } = useSelector(selectCurrentStoreState);

  const options: SelectOptionType[] = [
    ...unitMap,
    ...(storeSettings.customUnits || []),
  ];
  return (
    <Select
      id={id}
      options={options}
      value={value || "PCS"}
      onChange={onChange}
      disabled={disabled}
    />
  );
};
