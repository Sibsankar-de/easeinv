import React, { useId } from "react";
import { Label } from "./Label";
import { ToggleButton } from "./ToggleButton";
import { cn } from "../utils";
import { IconTooltip } from "./IconTooltip";

export const LineToggle = ({
  id,
  title,
  subTitle,
  labelProps = {},
  toggleProps = {},
  info,
}: {
  id: string;
  title: string;
  subTitle?: string;
  info?: string;
  labelProps?: React.ComponentProps<typeof Label>;
  toggleProps?: React.ComponentProps<typeof ToggleButton>;
}) => {
  id = id || useId();
  return (
    <Label
      htmlFor={id}
      className={cn(
        "w-full flex justify-between items-center gap-6 mb-0 p-3 cursor-pointer",
        "hover:bg-gray-100 active:bg-gray-200 transition-colors rounded",
        labelProps?.className,
      )}
      {...labelProps}
    >
      <div className="mb-0 select-none text-[16px] text-foreground">
        <div className="flex items-center gap-2">
          <p>{title}</p>
          {info && <IconTooltip tooltip={info} tooltipId="toggle-tooltip" />}
        </div>
        <p className="text-xs text-gray-600">{subTitle}</p>
      </div>
      <ToggleButton id={id} {...toggleProps} />
    </Label>
  );
};
