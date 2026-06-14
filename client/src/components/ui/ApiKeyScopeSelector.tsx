import {
  customerScope,
  invoiceScope,
  productScope,
} from "@/constants/apiKeyConstants";
import { useEffect, useState } from "react";
import { Checkbox } from "./Checkbox";

const apiKeyScopeData = [
  {
    key: "invoice:all",
    value: "Invoice scopes",
    subScopes: Object.values(invoiceScope),
  },
  {
    key: "product:all",
    value: "Product scopes",
    subScopes: Object.values(productScope),
  },
  {
    key: "customer:all",
    value: "Customer scopes",
    subScopes: Object.values(customerScope),
  },
];

type ApiKeyScopeSelectorType = {
  selectedScopes: string[];
  disabled?: boolean;
  onSelect: (scopes: string[]) => void;
};

export const ApiKeyScopeSelector = ({
  selectedScopes,
  disabled = false,
  onSelect,
}: ApiKeyScopeSelectorType) => {
  const [localSelections, setLocalSelections] =
    useState<string[]>(selectedScopes);

  useEffect(() => {
    setLocalSelections(selectedScopes);
  }, [selectedScopes]);

  const handleSubScopeSelect = (scope: string) => {
    if (disabled) return;
    let nextSelections = localSelections.includes(scope)
      ? localSelections.filter((s) => s !== scope)
      : [...localSelections, scope];

    apiKeyScopeData.forEach((parent) => {
      const allSubScopesSelected = parent.subScopes.every((sub) =>
        nextSelections.includes(sub),
      );
      if (allSubScopesSelected) {
        if (!nextSelections.includes(parent.key)) {
          nextSelections.push(parent.key);
        }
      } else {
        if (nextSelections.includes(parent.key)) {
          nextSelections = nextSelections.filter((s) => s !== parent.key);
        }
      }
    });

    setLocalSelections(nextSelections);
    onSelect(nextSelections);
  };

  const handleParentScopeSelect = (scope: string) => {
    if (disabled) return;
    const parentScopeData = apiKeyScopeData.find((s) => s.key === scope);
    if (!parentScopeData) return;

    const subScopes = parentScopeData.subScopes;

    let nextSelections: string[];
    if (localSelections.includes(scope)) {
      // Unselect parent scope and all its subscopes
      nextSelections = localSelections.filter(
        (s) => s !== scope && !subScopes.includes(s),
      );
    } else {
      // Select parent scope and all its subscopes
      const newSubScopes = subScopes.filter(
        (s) => !localSelections.includes(s),
      );
      nextSelections = [...localSelections, scope, ...newSubScopes];
    }

    setLocalSelections(nextSelections);
    onSelect(nextSelections);
  };

  return (
    <div className="w-full border border-border rounded-lg p-3 h-50 overflow-y-auto select-none">
      {apiKeyScopeData.map((scope, index) => {
        return (
          <div key={index} className="mb-3">
            <label
              htmlFor={scope.key}
              className="flex items-center gap-2 my-1 font-medium cursor-pointer"
            >
              <Checkbox
                id={scope.key}
                checked={localSelections.includes(scope.key)}
                disabled={disabled}
                onChange={() => handleParentScopeSelect(scope.key)}
              />
              <p>{scope.value}</p>
            </label>
            <ul className="px-4">
              {scope.subScopes.map((subScope, index2) => (
                <li key={index2} className="my-1 text-gray-600">
                  <label
                    htmlFor={subScope}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      id={subScope}
                      checked={localSelections.includes(subScope)}
                      disabled={disabled}
                      onChange={() => handleSubScopeSelect(subScope)}
                    />
                    <p>{subScope}</p>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
};
