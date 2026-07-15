"use client";

import React, { useState } from "react";
import { Button } from "../../ui/Button";
import { Plus, X } from "lucide-react";
import { CategoryDto } from "@/types/dto/categoryDto";
import { useDispatch, useSelector } from "react-redux";
import {
  createCategoryThunk,
  selectProductState,
} from "@/store/features/productSlice";
import { useParams } from "next/navigation";
import { LocalSearchableInput } from "@/components/ui/LocalSearchableInputDropdown";
import { SelectableItem } from "@/components/ui/SelectableInputDropdown";
import { SearchRule } from "@/utils/genericSearch";

export const CategorySelector = ({
  value = [],
  onChange,
}: {
  value?: CategoryDto[];
  onChange: (e: CategoryDto[]) => void;
}) => {
  const params = useParams();
  const storeId = params.store_id;

  const dispatch = useDispatch();
  const {
    data: { categoryList },
    categoryStatus,
  } = useSelector(selectProductState);

  const [inputValue, setInputValue] = useState<string>("");

  const handleAddCategory = () => {
    if (inputValue.trim() && !value.some((e) => e.name === inputValue.trim())) {
      dispatch(createCategoryThunk({ storeId, name: inputValue }))
        .unwrap()
        .then((res: CategoryDto) => {
          onChange([...value, res]);
          setInputValue("");
        });
    }
  };

  const handleRemoveCategory = (id: string) => {
    onChange(value.filter((cat) => cat.id !== id));
  };

  const searchRule: SearchRule<CategoryDto>[] = [
    { field: "name", priority: 1000, mode: "prefix" },
    { field: "name", priority: 800, mode: "substring" },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 w-2xl">
        <LocalSearchableInput
          items={categoryList}
          rules={searchRule}
          value={inputValue}
          placeholder="Type a category..."
          getLabel={(c) => c.name}
          onSelect={(item) => {
            if (!value.some((e) => e.id === item.id)) {
              onChange([...value, item]);
              setInputValue("");
            }
          }}
          onChange={setInputValue}
        >
          {(p, i) => (
            <SelectableItem key={p.id} item={p} index={i}>
              <p>{p.name}</p>
            </SelectableItem>
          )}
        </LocalSearchableInput>
        <Button
          className="py-2"
          onClick={handleAddCategory}
          disabled={inputValue.trim() === "" || categoryStatus === "loading"}
          loading={categoryStatus === "loading"}
        >
          <Plus />
        </Button>
      </div>

      <div className="mt-3">
        <ul className="flex flex-wrap gap-2">
          {value.map((category, index) => (
            <li
              key={index}
              className="bg-blue-100 w-fit px-3 py-1 flex items-center gap-2 rounded-lg border border-blue-300"
            >
              <span>{category.name}</span>
              <X
                size={15}
                className="cursor-pointer"
                onClick={() => handleRemoveCategory(category.id)}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
