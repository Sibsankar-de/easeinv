import React, { useId } from "react";
import { Label } from "./Label";
import { ToggleButton } from "./ToggleButton";
import { cn } from "../utils";

export const LineToggle = ({
  id,
  title,
  subTitle,
  labelProps = {},
  toggleProps = {},
}: {
  id: string;
  title: string;
  subTitle?: string;
  labelProps?: React.ComponentProps<typeof Label>;
  toggleProps?: React.ComponentProps<typeof ToggleButton>;
}) => {
  id = id || useId();
  return (
    <Label
      htmlFor={id}
      className={cn(
        "flex justify-between items-center gap-6 mb-0 p-3 cursor-pointer",
        "hover:bg-gray-100 active:bg-gray-200 transition-colors rounded",
        labelProps?.className,
      )}
      {...labelProps}
    >
      <div className="mb-0 select-none">
        <p>{title}</p>
        <p className="text-sm text-gray-600">{subTitle}</p>
      </div>
      <ToggleButton id={id} {...toggleProps} />
    </Label>
  );
};
