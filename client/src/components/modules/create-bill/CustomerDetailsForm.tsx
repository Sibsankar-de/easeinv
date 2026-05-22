"use client";

import { ConditionalDiv } from "@/components/ui/ConditionalDiv";
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
import { transformPaginatedResponse } from "@/store/utils";
import { CustomerDto } from "@/types/dto/customerDto";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export const CustomerDetailsForm = ({
  onChange,
}: {
  onChange: (e: CustomerDto) => void;
}) => {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch();
  const { searchStatus } = useSelector(selectCustomerState);

  const [customerData, setCustomerData] = useState<CustomerDto>({
    name: "",
    phoneNumber: "",
    address: "",
  });

  const handleFormChange = (key: keyof typeof customerData, value: any) => {
    setCustomerData((prev) => ({
      ...prev,
      [key]: value,
    }));
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
      .then((res: any) => {
        const { docs } = transformPaginatedResponse<CustomerDto>(res);
        setSearchList(docs);
      });
  };

  useEffect(() => {
    onChange(customerData);
  }, [customerData]);

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
        onSelect={(data) => {
          setCustomerData(data);
        }}
        onSearch={handleSearch}
        onChange={(e) => {
          handleFormChange("name", e);
        }}
      >
        {(item) =>
          item.map((p, i) => (
            <SelectableItem
              key={i}
              item={p}
              index={i}
              className="flex justify-between"
            >
              <div>
                <p>{p.name}</p>
                {p.phoneNumber && <p className="text-sm">{p.phoneNumber}</p>}
              </div>
              <ConditionalDiv condition={p.totalDue}>
                <span className="text-sm">Due:</span>{" "}
                <span className="text-red-400">₹{p.totalDue}</span>
              </ConditionalDiv>
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
