"use client";

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { SearchableInput } from "@/components/ui/SearchableInput";
import { SelectableItem } from "@/components/ui/SelectableInputDropdown";
import { pageLimits } from "@/constants/pageLimits";
import { useStoreNavigation } from "@/hooks/store-navigation";
import {
  customerSearchThunk,
  selectCustomerState,
} from "@/store/features/customerSlice";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import { transformPaginatedResponse } from "@/store/utils";
import { CustomerDto } from "@/types/dto/customerDto";
import { PaginateResponseType } from "@/types/PaginatedResponseType";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { cn } from "@/components/utils";

export const CustomerDetailsForm = ({
  data,
  onChange,
}: {
  data?: {
    id?: string;
    name?: string;
    phoneNumber?: string | null;
    address?: string | null;
    email?: string | null;
    totalDue?: number;
  };
  onChange: (e: CustomerDto) => void;
}) => {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch();
  const { searchStatus } = useSelector(selectCustomerState);
  const {
    data: { currencySymbol },
  } = useSelector(selectCurrentStoreState);

  const [customerData, setCustomerData] = useState<CustomerDto>({
    id: data?.id,
    name: data?.name || "",
    phoneNumber: data?.phoneNumber || "",
    address: data?.address || "",
    email: data?.email || "",
    totalDue: data?.totalDue,
  });

  const handleFormChange = (key: keyof CustomerDto, value: string) => {
    const updated = {
      ...customerData,
      [key]: value,
    };
    setCustomerData(updated);
    onChange(updated);
  };

  // handle search
  const [searchList, setSearchList] = useState<CustomerDto[]>([]);

  const handleSearch = (query: string) => {
    if (!query || !query.trim() || query.trim().length < 2) return;

    dispatch(
      customerSearchThunk({
        storeId,
        query,
        page: 1,
        limit: pageLimits.CUSTOMER_SEARCH,
      }),
    )
      .unwrap()
      .then((res: unknown) => {
        const { docs } = transformPaginatedResponse<CustomerDto>(
          res as PaginateResponseType<CustomerDto>,
        );
        setSearchList(docs);
      });
  };

  const handleSelectCustomer = (selected: CustomerDto) => {
    setCustomerData(selected);
    onChange(selected);
  };

  const isSearching = searchStatus === "loading";

  return (
    <div className="space-y-2">
      <Label>Bill To</Label>
      <SearchableInput
        items={searchList}
        placeholder="Enter name"
        inputProps={{ autoFocus: true }}
        minCharsToSearch={2}
        trimQuery
        isLoading={isSearching}
        closeOnEmpty
        value={customerData.name}
        getLabel={(p) => p.name!}
        onSelect={handleSelectCustomer}
        onSearch={handleSearch}
        onChange={(e) => {
          handleFormChange("name", e);
        }}
      >
        {(item) =>
          item.map((p, i) => (
            <SelectableItem
              key={p.id || i}
              item={p}
              index={i}
              className="flex justify-between items-center py-1.5"
            >
              <div>
                <p className="text-[15px] font-medium text-gray-900">
                  {p.name}
                </p>
                {p.phoneNumber && (
                  <p className="text-sm text-gray-500">{p.phoneNumber}</p>
                )}
              </div>
              <div className="text-right shrink-0 ml-4">
                {p.totalDue !== undefined &&
                p.totalDue !== null &&
                p.totalDue > 0 ? (
                  <div
                    className={cn(
                      "inline-flex items-center gap-1 bg-red-50 text-red-600",
                      "px-2.5 py-1 rounded-md text-xs font-semibold border border-red-200/60",
                    )}
                  >
                    <span>Due:</span>
                    <span>
                      {currencySymbol}
                      {Number(p.totalDue).toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 font-normal">
                    No Due
                  </span>
                )}
              </div>
            </SelectableItem>
          ))
        }
      </SearchableInput>
      <Input
        placeholder="Phone number"
        value={customerData.phoneNumber}
        onChange={(e) => handleFormChange("phoneNumber", e)}
      />
      <Input
        placeholder="Address"
        value={customerData.address}
        onChange={(e) => handleFormChange("address", e)}
      />
    </div>
  );
};
