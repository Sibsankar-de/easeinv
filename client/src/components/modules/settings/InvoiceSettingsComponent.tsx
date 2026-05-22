"use client";

import { PrimaryBox } from "@/components/ui/PrimaryBox";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { LogoUploader } from "@/components/ui/LogoUploader";
import { ToggleButton } from "@/components/ui/ToggleButton";
import { useStoreNavigation } from "@/hooks/store-navigation";
import {
  selectCurrentStoreState,
  updateStoreSettingsThunk,
  uploadQRCodeThunk,
  uploadStoreLogoThunk,
} from "@/store/features/currentStoreSlice";
import { Building2, Landmark, Palette, ScanQrCode, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FormSkeleton } from "@/components/ui/Skeleton";
import { useNavContext } from "@/contexts/NavContext";
import { NavActionButton } from "@/components/modules/navbar/navbar";

export const InvoiceSettingsComponent = () => {
  const { storeId } = useStoreNavigation();
  const { setActionButtons } = useNavContext();

  const dispatch = useDispatch();
  const {
    data: { storeSettings },
    status,
    settingsUpdateStatus,
    logoUploadStatus,
    qrUploadStatus,
  } = useSelector(selectCurrentStoreState);

  const [formData, setFormData] = useState({
    invoiceNumberPrefix: "",
    roundupInvoiceTotal: false,
    invoiceStoreName: "",
    invoiceStoreAddress: "",
    invoiceFooterNote: "",
    invoiceStoreLogoUrl: "",
    invoicePaymentQrCode: "",
    invoiceBankDetails: {
      accountName: "",
      accountNumber: "",
      bankName: "",
      bankCode: "",
    },
  });

  const invoiceBankDetails = formData.invoiceBankDetails;

  function handleFormDataChange(key: keyof typeof formData, value: any) {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function handleBankDetailsChange(
    key: keyof typeof formData.invoiceBankDetails,
    value: string,
  ) {
    setFormData((prev) => ({
      ...prev,
      invoiceBankDetails: {
        ...prev.invoiceBankDetails,
        [key]: value,
      },
    }));
  }

  useEffect(() => {
    if (!storeSettings) return;
    let data: any = {};
    Object.keys(formData).map((key) => {
      const storeKey = key as keyof typeof storeSettings;
      if (storeSettings[storeKey]) {
        data[key] = storeSettings[storeKey];
      }
    });

    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  }, [storeSettings]);

  const handleSaveChanges = () => {
    if (settingsUpdateStatus !== "loading" && storeId) {
      dispatch(updateStoreSettingsThunk({ storeId, updateData: formData }))
        .unwrap()
        .then(() => {
          toast.success("Store settings saved!");
        });
    }
  };

  const handleLogoUpload = (file: File | undefined) => {
    if (!file || !storeId) {
      return;
    }
    const formData = new FormData();
    formData.append("storeLogo", file);
    dispatch(uploadStoreLogoThunk({ storeId, formData }))
      .unwrap()
      .then(() => {
        toast.success("Store logo uploaded!");
      });
  };

  const handleQrUpload = (file: File | undefined) => {
    if (!file || !storeId) {
      return;
    }
    const formData = new FormData();
    formData.append("qrCode", file);
    dispatch(uploadQRCodeThunk({ storeId, formData }))
      .unwrap()
      .then(() => {
        toast.success("QR code uploaded!");
      });
  };

  const isUpdating = settingsUpdateStatus === "loading";
  const isLogoUploading = logoUploadStatus === "loading";
  const isQrUploading = qrUploadStatus === "loading";

  useEffect(() => {
    setActionButtons(
      <NavActionButton
        onClick={handleSaveChanges}
        disabled={isUpdating}
        loading={isUpdating}
      >
        Save
      </NavActionButton>,
    );
  }, [setActionButtons, isUpdating, formData]);

  if (status === "loading") {
    return <FormSkeleton rows={6} />;
  }

  return (
    <div className="space-y-6">
      <PrimaryBox className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
          <Input
            id="invoicePrefix"
            value={formData.invoiceNumberPrefix}
            placeholder="INV"
            disabled={isUpdating}
            onChange={(e) => handleFormDataChange("invoiceNumberPrefix", e)}
          />
          <p className="text-xs text-gray-500">Example: INV-1001, INV-1002</p>
        </div>
        <div className="flex justify-between items-center gap-6">
          <Label htmlFor="roundup-total" className="mb-0">
            <p>Roundup Total</p>
            <p className="text-sm text-gray-600">eg: 4.5 = 5</p>
          </Label>
          <ToggleButton
            id="roundup-total"
            isActive={formData.roundupInvoiceTotal}
            disabled={isUpdating}
            onChange={(e) => handleFormDataChange("roundupInvoiceTotal", e)}
          />
        </div>
      </PrimaryBox>

      <PrimaryBox className="space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Palette className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-gray-900">Branding</h2>
            <p className="text-sm text-gray-600">Configure invoice branding</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoiceStoreName">Store name in Invoice</Label>
          <Input
            id="invoiceStoreName"
            placeholder="Write the name"
            value={formData.invoiceStoreName}
            onChange={(e) => handleFormDataChange("invoiceStoreName", e)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoiceFooter">Invoice Footer note</Label>
          <Input
            id="invoiceFooter"
            placeholder="Write the footer line. eg, Thank you!"
            value={formData.invoiceFooterNote}
            onChange={(e) => handleFormDataChange("invoiceFooterNote", e)}
          />
        </div>

        <div className="space-y-4">
          <Label>Store Logo</Label>
          <LogoUploader
            id="store-logo"
            buttonText="Upload Logo"
            fallbackIcon={Building2}
            imagePreviewUrl={formData.invoiceStoreLogoUrl}
            isUploading={isLogoUploading}
            onFileSelect={handleLogoUpload}
          />
        </div>
      </PrimaryBox>

      <PrimaryBox className="space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Landmark className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-gray-900">Banking</h2>
            <p className="text-sm text-gray-600">Configure invoice banking</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoiceBankDetals">Bank account details</Label>
          <Input
            id="invoiceBankDetals"
            placeholder="Account Name"
            value={invoiceBankDetails.accountName}
            onChange={(e) => handleBankDetailsChange("accountName", e)}
          />
          <Input
            id="accountNumber"
            placeholder="Account number"
            value={invoiceBankDetails.accountNumber}
            onChange={(e) => handleBankDetailsChange("accountNumber", e)}
          />
          <Input
            id="bankName"
            placeholder="Bank Name"
            value={invoiceBankDetails.bankName}
            onChange={(e) => handleBankDetailsChange("bankName", e)}
          />
          <Input
            id="bankCode"
            placeholder="Bank Code / IFSC code"
            value={invoiceBankDetails.bankCode}
            onChange={(e) => handleBankDetailsChange("bankCode", e)}
          />
        </div>

        <div className="space-y-4">
          <Label>Payment QR code</Label>
          <LogoUploader
            id="qr-code"
            buttonText="Upload QR code"
            fallbackIcon={ScanQrCode}
            imagePreviewUrl={formData.invoicePaymentQrCode}
            isUploading={isQrUploading}
            onFileSelect={handleQrUpload}
          />
        </div>
      </PrimaryBox>

      <div className="flex justify-end">
        <Button
          variant="dark"
          onClick={handleSaveChanges}
          disabled={isUpdating}
          loading={isUpdating}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};
