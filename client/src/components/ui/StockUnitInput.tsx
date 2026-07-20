"use client";

import { unitMap } from "@/constants/UnitMaps";
import { Select } from "./Select";
import { SelectOptionType, SelectType } from "@/types/SelectType";
import { useSelector } from "react-redux";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";

type StockUnitInputType = Omit<SelectType, "options">;

export const StockUnitInput = ({
  id,
  onChange,
  value,
  disabled,
  ...props
}: StockUnitInputType) => {
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
      {...props}
    />
  );
};
