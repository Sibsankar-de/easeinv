"use client";

import React, { useEffect, useState } from "react";
import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";
import { Plus, X } from "lucide-react";
import { Dropdown } from "../../ui/Dropdown";
import { CategoryDto } from "@/types/dto/categoryDto";
import { useDispatch, useSelector } from "react-redux";
import {
  createCategoryThunk,
  selectProductState,
} from "@/store/features/productSlice";
import { useParams } from "next/navigation";
import { LocalSearchableInput } from "@/components/ui/LocalSearchableInputDropdown";
import { SelectableItem } from "@/components/ui/SelectableInputDropdown";

export const CategorySelector = ({
  value,
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

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [inputValue, setInputValue] = useState<string>("");

  useEffect(() => {
    if (value && value.length > 0) {
      setCategories(value);
    }
  }, [value]);

  const handleAddCategory = () => {
    if (
      inputValue.trim() &&
      !categories.some((e) => e.name === inputValue.trim())
    ) {
      dispatch(createCategoryThunk({ storeId, name: inputValue }))
        .unwrap()
        .then((res: CategoryDto) => {
          setCategories((prev) => [...prev, res]);
          setInputValue("");
        });
    }
  };

  const handleRemoveCategory = (id: string) => {
    setCategories(categories.filter((cat) => cat._id !== id));
  };

  useEffect(() => {
    if (value !== categories) {
      onChange(categories);
    }
  }, [categories]);

  const searchRule: any = [
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
            if (!categories.some((e) => e._id === item._id)) {
              setCategories((prev) => [...prev, item]);
              setInputValue("");
            }
          }}
          onChange={setInputValue}
        >
          {(p, i) => (
            <SelectableItem key={p._id} item={p} index={i}>
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
          {categories.map((category, index) => (
            <li
              key={index}
              className="bg-blue-100 w-fit px-3 py-1 flex items-center gap-2 rounded-lg border border-blue-300"
            >
              <span>{category.name}</span>
              <X
                size={15}
                className="cursor-pointer"
                onClick={() => handleRemoveCategory(category._id)}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
