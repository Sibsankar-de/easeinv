import {
  customerScope,
  invoiceScope,
  productScope,
} from "@/constants/apiKeyConstants";
import { useEffect, useState } from "react";
import { Checkbox } from "./Checkbox";

export const apiKeyScopeData = [
  {
    key: "invoice:all",
    value: "Invoice scopes",
    subScopes: [
      { key: invoiceScope.INVOICE_READ, isClientSideAllowed: true },
      { key: invoiceScope.INVOICE_WRITE, isClientSideAllowed: false },
      { key: invoiceScope.INVOICE_DELETE, isClientSideAllowed: false },
    ],
  },
  {
    key: "product:all",
    value: "Product scopes",
    subScopes: [
      { key: productScope.PRODUCT_READ, isClientSideAllowed: true },
      { key: productScope.PRODUCT_WRITE, isClientSideAllowed: false },
      { key: productScope.PRODUCT_DELETE, isClientSideAllowed: false },
    ],
  },
  {
    key: "customer:all",
    value: "Customer scopes",
    subScopes: [
      { key: customerScope.CUSTOMER_READ, isClientSideAllowed: true },
      { key: customerScope.CUSTOMER_WRITE, isClientSideAllowed: false },
      { key: customerScope.CUSTOMER_DELETE, isClientSideAllowed: false },
    ],
  },
];

export const getClientSideAllowedScopes = (scopes: string[]): string[] => {
  const allowedSubScopes = apiKeyScopeData
    .flatMap((p) => p.subScopes)
    .filter((s) => s.isClientSideAllowed)
    .map((s) => s.key);
  return scopes.filter((s) => allowedSubScopes.includes(s));
};

type ApiKeyScopeSelectorType = {
  selectedScopes: string[];
  disabled?: boolean;
  onSelect: (scopes: string[]) => void;
  allowClientRequest?: boolean;
};

export const ApiKeyScopeSelector = ({
  selectedScopes,
  disabled = false,
  onSelect,
  allowClientRequest = false,
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
        nextSelections.includes(sub.key),
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
    if (disabled || allowClientRequest) return;
    const parentScopeData = apiKeyScopeData.find((s) => s.key === scope);
    if (!parentScopeData) return;

    const subScopes = parentScopeData.subScopes.map((s) => s.key);

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
        const isParentDisabled = disabled || allowClientRequest;
        return (
          <div key={index} className="mb-3">
            <label
              htmlFor={scope.key}
              className="flex items-center gap-2 my-1 font-medium cursor-pointer"
            >
              <Checkbox
                id={scope.key}
                checked={localSelections.includes(scope.key)}
                disabled={isParentDisabled}
                onChange={() => handleParentScopeSelect(scope.key)}
              />
              <p className={isParentDisabled ? "text-gray-400" : ""}>
                {scope.value}
              </p>
            </label>
            <ul className="px-4">
              {scope.subScopes.map((subScope, index2) => {
                const isSubScopeDisabled =
                  disabled ||
                  (allowClientRequest && !subScope.isClientSideAllowed);
                return (
                  <li key={index2} className="my-1 text-gray-600">
                    <label
                      htmlFor={subScope.key}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        id={subScope.key}
                        checked={localSelections.includes(subScope.key)}
                        disabled={isSubScopeDisabled}
                        onChange={() => handleSubScopeSelect(subScope.key)}
                      />
                      <p className={isSubScopeDisabled ? "text-gray-400" : ""}>
                        {subScope.key}
                      </p>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
};
