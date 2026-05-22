"use client";

import React from "react";

interface ToggleButtonProps {
  isActive?: boolean;
  onChange?: (isActive: boolean) => void;
  disabled?: boolean;
  name?: string; // radios need a name to group them
  id?: string;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  isActive = false,
  onChange,
  disabled = false,
  name = "",
  id,
}) => {
  id = id || `toogle-${Math.round(Math.random() * 100)}`;
  return (
    <label
      htmlFor={id}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        isActive ? "bg-primary" : "bg-gray-300"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={isActive}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />

      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          isActive ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </label>
  );
};
