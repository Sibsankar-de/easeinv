"use client";

import { useId } from "react";
import { cn } from "../utils";
import { Input, InputType } from "./Input";

interface SecondaryInputType extends InputType {
  field?: string;
}

export const SecondaryInput = ({
  id: propId,
  className,
  field,
  ...props
}: SecondaryInputType) => {
  const reactId = useId();
  const id = propId ?? reactId;

  return (
    <div className="grid grid-cols-[1fr_auto]">
      <Input
        id={id}
        type="number"
        className={cn(field && "flex-1 rounded-r-none", className)}
        {...props}
      />
      {field && (
        <label
          htmlFor={id}
          className={
            "px-3 bg-gray-200 border border-gray-300 border-l-0 rounded-r-lg h-full flex items-center justify-center text-gray-800"
          }
        >
          {field}
        </label>
      )}
    </div>
  );
};
