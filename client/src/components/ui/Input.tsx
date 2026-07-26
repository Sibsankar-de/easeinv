"use client";

import React, { useState } from "react";
import { cn } from "../utils";
import { Eye, EyeOff, OctagonAlert } from "lucide-react";

export interface InputType extends Omit<
  React.ComponentProps<"input">,
  "onChange"
> {
  onChange?: (e: string) => void;
  isInvalid?: boolean;
  icon?: React.ReactElement;
  errorMessage?: string;
  inputClass?: string;
}

export const Input = ({
  className,
  onChange,
  isInvalid = false,
  icon,
  errorMessage,
  inputClass,
  ...props
}: InputType) => {
  const [showPassword, setShowPassword] = useState(false);
  const isTypePassword = props.type === "password";
  const hasError = isInvalid || !!errorMessage;

  return (
    <div
      className={cn(
        "relative group w-full flex items-center",
        "pl-3 pr-4 py-1 border border-gray-300 rounded-lg",
        "focus-within:outline-none focus-within:ring-2 focus-within:ring-primary transition-all duration-200",
        hasError && "border-red-300 focus-within:ring-red-200",
        props.disabled && "bg-gray-100 cursor-not-allowed",
        icon && "pl-10",
        (isTypePassword || hasError) && "pr-10",
        errorMessage && "mb-7",
        className,
      )}
    >
      {icon && (
        <div
          className={cn(
            "w-fit h-fit absolute left-3 flex items-center justify-center",
            "text-gray-500! group-focus-within:text-primary!",
          )}
        >
          {icon}
        </div>
      )}
      <input
        className={cn(
          "w-full h-full py-1 bg-transparent outline-none border-none",
          inputClass,
        )}
        onChange={(e) => onChange?.(e.target.value)}
        onWheel={(e) => e.currentTarget.blur()}
        {...props}
        type={showPassword ? "text" : (props.type ?? "text")}
      />
      {isTypePassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      )}
      {hasError && (
        <div className="absolute right-3">
          <OctagonAlert className="w-5 h-5 text-red-300" />
        </div>
      )}
      {errorMessage && (
        <p className="absolute left-0 top-full mt-1 text-red-400 text-xs">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
