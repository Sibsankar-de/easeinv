"use client";

import { Button } from "@/components/ui/Button";
import { CurrencySelector } from "@/components/ui/CurrencySelector";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Separator } from "@/components/ui/Separator";
import {
  createNewStoreThunk,
  selectStoreState,
} from "@/store/features/storeSlice";
import { StoreType } from "@/types/dto/storeDto";
import { getNames as getCountryNames } from "country-list";
import { Mail, Phone, Store } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

export const StoreCreateModal = ({
  openState,
  onClose,
}: {
  openState: boolean;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: "",
    currencyCode: "INR",
    businessType: "",
    storeType: StoreType.ONLINE,
    contactEmail: "",
    contactNo: "",
    registrationNumber: "",
    website: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
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

  function handleFormData(key: keyof typeof formData, value: string) {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  const dispatch = useDispatch();
  const { createStatus } = useSelector(selectStoreState);
  const isLoading = createStatus === "loading";

  const handleCreateStore = () => {
    if (!formData.name || !formData.businessType) {
      toast.error("Stared fields are required!");
      return;
    }
    dispatch(createNewStoreThunk(formData))
      .unwrap()
      .then(() => {
        toast.success("Store created successfully");
        onClose();
      });
  };

  return (
    <Modal
      openState={openState}
      onClose={onClose}
      className="px-4 py-3 space-y-6 w-5xl"
      header={
        <ModalHeader
          title="Create New Store"
          subtitle="Fill the details to create your new store."
        />
      }
    >
      <div className="p-2 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="storeName" required>
              Store Name
            </Label>
            <Input
              id="storeName"
              value={formData.name}
              onChange={(e) => handleFormData("name", e)}
              placeholder="Enter store name"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="storeType" required>
              Store Type
            </Label>
            <Select
              id="storeType"
              value={formData.storeType}
              onChange={(val) => handleFormData("storeType", val)}
              options={storeTypeOptions}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="currency-selector" required>
              Store Currency
            </Label>
            <CurrencySelector
              value={formData.currencyCode}
              onChange={(e) => handleFormData("currencyCode", e)}
              placeholder="Select Currency"
              disabled={isLoading}
            />
          </div>

          {/* Section: Contact Details */}
          <Separator text="Contact details" className="col-span-2" />

          <div className="space-y-1.5">
            <Label htmlFor="businessEmail">Contact Email</Label>
            <Input
              type="email"
              id="businessEmail"
              value={formData.contactEmail}
              onChange={(e) => handleFormData("contactEmail", e)}
              placeholder="Enter business email or personal"
              disabled={isLoading}
              icon={<Mail size={18} />}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contactNo">Contact Number</Label>
            <Input
              id="contactNo"
              value={formData.contactNo}
              onChange={(e) => handleFormData("contactNo", e)}
              placeholder="Enter contact phone number"
              disabled={isLoading}
              icon={<Phone size={18} />}
            />
          </div>

          {/* Section: Address */}
          <Separator text="Address & Location" className="col-span-2" />

          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleFormData("address", e)}
              placeholder="e.g., Street address, P.O. box, company name"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleFormData("city", e)}
              placeholder="Enter city"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="state">State / Province</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => handleFormData("state", e)}
              placeholder="Enter state"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="zipCode">ZIP / Postal Code</Label>
            <Input
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => handleFormData("zipCode", e)}
              placeholder="Enter zip code"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="country" required>
              Country
            </Label>
            <Select
              id="country"
              value={formData.country}
              onChange={(val) => handleFormData("country", val)}
              options={countryOptions}
              disabled={isLoading}
              dropdownClass="max-h-60"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateStore}
            disabled={isLoading}
            loading={isLoading}
          >
            <Store size={15} />
            Create store
          </Button>
        </div>
      </div>
    </Modal>
  );
};
