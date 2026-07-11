"use client";

import React, { useState } from "react";
import { Input } from "./Input";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { X, Plus, Globe } from "lucide-react";

interface WhitelistedOriginsInputProps {
  origins: string[];
  onChange: (origins: string[]) => void;
  disabled?: boolean;
}

export const WhitelistedOriginsInput = ({
  origins = [],
  onChange,
  disabled = false,
}: WhitelistedOriginsInputProps) => {
  const [newOrigin, setNewOrigin] = useState("");
  const [error, setError] = useState("");

  const handleAddOrigin = () => {
    if (disabled) return;
    const trimmed = newOrigin.trim();
    if (!trimmed) return;

    if (origins.includes(trimmed)) {
      setError("This origin is already added.");
      return;
    }

    if (/\s/.test(trimmed)) {
      setError("Origins cannot contain spaces.");
      return;
    }

    setError("");
    onChange([...origins, trimmed]);
    setNewOrigin("");
  };

  const handleRemoveOrigin = (indexToRemove: number) => {
    if (disabled) return;
    onChange(origins.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddOrigin();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={newOrigin}
            onChange={(val) => {
              setNewOrigin(val);
              if (error) setError("");
            }}
            onKeyDown={handleKeyDown}
            placeholder="e.g. https://example.com"
            disabled={disabled}
            icon={<Globe size={19} />}
            isInvalid={!!error}
          />
        </div>
        <Button
          type="button"
          disabled={disabled || !newOrigin.trim()}
          onClick={handleAddOrigin}
        >
          <Plus size={18} />
        </Button>
      </div>

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

      {origins.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {origins.map((origin, index) => (
            <Badge
              key={index}
              variant="primary"
              className="flex items-center gap-1.5 normal-case tracking-normal text-xs pr-0"
            >
              <span className="line-clamp-1 font-mono">{origin}</span>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleRemoveOrigin(index)}
                disabled={disabled}
                className="text-gray-400 rounded-full p-0.5 border-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic">
          No whitelisted origins added. It is only accessible from{" "}
          <strong>server-side</strong>.
        </p>
      )}
    </div>
  );
};
