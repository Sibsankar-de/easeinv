"use client";

import { PrimaryBox } from "@/components/ui/PrimaryBox";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Separator } from "@/components/ui/Separator";
import { CurrencySelector } from "@/components/ui/CurrencySelector";
import { FormSkeleton } from "@/components/ui/Skeleton";
import { useStoreNavigation } from "@/hooks/store-navigation";
import {
  selectCurrentStoreState,
  updateStoreDetailsThunk,
} from "@/store/features/currentStoreSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "@/utils/toast";
import { useNavContext } from "@/contexts/NavContext";
import { NavActionButton } from "@/components/modules/navbar/Navbar";
import { StoreType } from "@/types/dto/storeDto";
import { getNames as getCountryNames } from "country-list";
import { CloudCheck, Mail, Phone } from "lucide-react";

export const StoreInfoComponent = () => {
  const { storeId } = useStoreNavigation();
  const { setActionButtons } = useNavContext();

  const dispatch = useDispatch<any>();
  const {
    data: { currentStore },
    status,
    storeUpdateStatus,
  } = useSelector(selectCurrentStoreState);

  const [formData, setFormData] = useState({
    name: "",
    type: StoreType.HYBRID as string,
    currencyCode: "INR",
    contactEmail: "",
    contactNo: "",
    addressLine: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    registrationNumber: "",
    website: "",
  });

  const countryOptions = getCountryNames().map((name) => ({
    key: name,
    value: name,
  }));

  const storeTypeOptions = [
    { key: StoreType.RETAIL, value: "Retail" },
    { key: StoreType.WHOLESALE, value: "Wholesale" },
    { key: StoreType.ONLINE, value: "Online" },
    { key: StoreType.FRANCHISE, value: "Franchise" },
    { key: StoreType.HYBRID, value: "Hybrid" },
  ];

  function handleFormDataChange(key: keyof typeof formData, value: any) {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  useEffect(() => {
    if (currentStore) {
      setFormData({
        name: currentStore.name || "",
        type: currentStore.type || StoreType.HYBRID,
        currencyCode: currentStore.currencyCode || "INR",
        contactEmail: currentStore.contactEmail || "",
        contactNo: currentStore.contactNo || "",
        addressLine: currentStore.addressLine || "",
        city: currentStore.city || "",
        state: currentStore.state || "",
        zipCode: currentStore.zipCode || "",
        country: currentStore.country || "India",
        registrationNumber: currentStore.registrationNumber || "",
        website: currentStore.website || "",
      });
    }
  }, [currentStore]);

  const handleSaveChanges = () => {
    if (!formData.name || !formData.type || !formData.country || !formData.currencyCode) {
      toast.error("Stared fields are required!");
      return;
    }

    if (storeUpdateStatus !== "loading" && storeId) {
      dispatch(updateStoreDetailsThunk({ storeId, updateData: formData }))
        .unwrap()
        .then(() => {
          toast.success("Store details saved!");
        });
    }
  };

  const isUpdating = storeUpdateStatus === "loading";

  useEffect(() => {
    setActionButtons(
      <NavActionButton
        onClick={handleSaveChanges}
        disabled={isUpdating}
        loading={isUpdating}
      >
        <CloudCheck size={17} />
        Save Changes
      </NavActionButton>,
    );
  }, [setActionButtons, isUpdating, formData]);

  if (status === "loading") {
    return <FormSkeleton rows={6} />;
  }

  return (
    <div className="space-y-6">
      <PrimaryBox>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Section 1: Basic Store Details */}
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="storeName" required>
              Store Name
            </Label>
            <Input
              id="storeName"
              value={formData.name}
              onChange={(e) => handleFormDataChange("name", e)}
              placeholder="Enter store name"
              disabled={isUpdating}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="storeType" required>
              Store Type
            </Label>
            <Select
              id="storeType"
              value={formData.type}
              onChange={(val) => handleFormDataChange("type", val)}
              options={storeTypeOptions}
              disabled={isUpdating}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="currency-selector" required>
              Store Currency
            </Label>
            <CurrencySelector
              value={formData.currencyCode}
              onChange={(e) => handleFormDataChange("currencyCode", e)}
              placeholder="Select Currency"
              disabled={isUpdating}
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleFormDataChange("website", e)}
              placeholder="www.business.com"
              disabled={isUpdating}
            />
          </div>

          {/* Section 2: Contact details */}
          <Separator text="Contact details" className="col-span-2" />

          <div className="space-y-1.5">
            <Label htmlFor="email">Contact Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleFormDataChange("contactEmail", e)}
              placeholder="contact@business.com"
              disabled={isUpdating}
              icon={<Mail size={18} />}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Contact Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.contactNo}
              onChange={(e) => handleFormDataChange("contactNo", e)}
              placeholder="+91 (555) 000-0000"
              disabled={isUpdating}
              icon={<Phone size={18} />}
            />
          </div>

          {/* Section 3: Address & Location */}
          <Separator text="Address & Location" className="col-span-2" />

          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.addressLine}
              onChange={(e) => handleFormDataChange("addressLine", e)}
              placeholder="e.g., Street address, P.O. box, company name"
              disabled={isUpdating}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleFormDataChange("city", e)}
              placeholder="Enter city"
              disabled={isUpdating}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="state">State / Province</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => handleFormDataChange("state", e)}
              placeholder="Enter state"
              disabled={isUpdating}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="zipCode">ZIP / Postal Code</Label>
            <Input
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => handleFormDataChange("zipCode", e)}
              placeholder="Enter zip code"
              disabled={isUpdating}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="country" required>
              Country
            </Label>
            <Select
              id="country"
              value={formData.country}
              onChange={(val) => handleFormDataChange("country", val)}
              options={countryOptions}
              disabled={isUpdating}
              dropdownClass="max-h-60"
            />
          </div>

          {/* Section 4: Legal & Registration */}
          <Separator text="Legal & Registration" className="col-span-2" />

          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="taxId">Tax ID / Business Registration Number</Label>
            <Input
              id="taxId"
              value={formData.registrationNumber}
              onChange={(e) => handleFormDataChange("registrationNumber", e)}
              placeholder="e.g., 12-3456789"
              disabled={isUpdating}
            />
          </div>
        </div>
      </PrimaryBox>

      <div className="flex justify-end">
        <Button
          variant="dark"
          disabled={isUpdating}
          loading={isUpdating}
          onClick={handleSaveChanges}
        >
          <CloudCheck size={17} />
          Save Changes
        </Button>
      </div>
    </div>
  );
};
