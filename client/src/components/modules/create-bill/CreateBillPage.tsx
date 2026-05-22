"use client";

import { CustomerDetailsForm } from "./CustomerDetailsForm";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CloudCheck, PrinterCheck, RotateCcw } from "lucide-react";
import { BillingForm } from "./BillingForm";
import { useEffect, useRef, useState } from "react";
import { CreateInvoiceDto } from "@/types/dto/invoiceDto";
import { formatDateStr } from "@/utils/formatDate";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import { getNextInvoiceNumber } from "@/utils/invoicenumber-generator";
import { PrintModal } from "./PrintModal";
import { useStoreNavigation } from "@/hooks/store-navigation";
import {
  createInvoiceThunk,
  selectInvoiceState,
} from "@/store/features/invoiceSlice";
import { toast } from "react-toastify";
import { FormSkeleton } from "@/components/ui/Skeleton";
import { useNavContext } from "@/contexts/NavContext";
import { NavActionButton } from "@/components/modules/navbar/navbar";

export const CreateBillPage = () => {
  const { storeId } = useStoreNavigation();
  const { setActionButtons } = useNavContext();
  const dispatch = useDispatch();
  const {
    data: { currentStore, storeSettings },
    status,
  } = useSelector(selectCurrentStoreState);

  const { createStatus } = useSelector(selectInvoiceState);

  const initialState: CreateInvoiceDto = {
    invoiceNumber: "",
    billItems: [],
    issueDate: new Date(),
    subTotal: 0,
    total: 0,
    totalProfit: 0,
    discountAmount: 0,
    paidAmount: 0,
    dueAmount: 0,
    taxAmount: 0,
    customerDetails: {},
  };

  const [formData, setFormData] = useState<CreateInvoiceDto>(initialState);

  const handleFormChange = (key: keyof typeof formData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleBillchange = (data: Record<string, any>) => {
    const {
      subTotal,
      total,
      taxAmount,
      discountAmount,
      totalProfit,
      paidAmount,
      dueAmount,
      roundupTotal,
    } = data.calculations;
    setFormData((prev) => ({
      ...prev,
      billItems: data.items,
      subTotal,
      total,
      taxAmount,
      discountAmount,
      totalProfit,
      paidAmount,
      dueAmount,
      roundupTotal,
    }));
  };

  // handle print modal
  const [openPrintModal, setOpenPrintModal] = useState(false);

  const [isInvoiceSaved, setIsInvoiceSaved] = useState(false);

  const [resetKey, setResetKey] = useState(1);

  const invoiceNumber = getNextInvoiceNumber({
    prefix: storeSettings.invoiceNumberPrefix || "",
    lastInvoiceNumber: currentStore?.lastInvoiceNumber,
  });

  // update invoice number
  useEffect(() => {
    if (isInvoiceSaved) return;
    handleFormChange("invoiceNumber", invoiceNumber);
  }, [currentStore, invoiceNumber, isInvoiceSaved]);

  // handle invoice save
  const handleInvoiceSave = (status: string = "DRAFTED") => {
    if (!storeId || isInvoiceSaved) return;

    setIsInvoiceSaved(true);
    dispatch(createInvoiceThunk({ storeId, status, ...formData }))
      .unwrap()
      .then(() => {
        toast.success(`Invoice saved`);
      })
      .catch(() => {
        setIsInvoiceSaved(false);
      });
  };

  const handleReset = () => {
    setIsInvoiceSaved(false);
    setFormData({
      ...initialState,
      invoiceNumber,
    });
    setResetKey((p) => p + 1);
  };

  const isSaving = createStatus === "loading";

  useEffect(() => {
    setActionButtons(
      <NavActionButton
        disabled={isSaving}
        onClick={() => setOpenPrintModal(true)}
      >
        <PrinterCheck size={16} />
        {isInvoiceSaved ? "Print bill" : "Save & print"}
      </NavActionButton>,
    );
  }, [setActionButtons, isSaving, isInvoiceSaved, formData, storeId]);

  // keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        if (!isInvoiceSaved) {
          handleInvoiceSave();
        }
      }
      if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
        setOpenPrintModal(true);
      }
      if (e.ctrlKey && e.key === "r") {
        e.preventDefault();
        handleReset();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isInvoiceSaved, handleInvoiceSave, handleReset]);

  if (status === "loading") {
    return <FormSkeleton rows={6} />;
  }

  return (
    <>
      <div>
        {/* Invoice Header */}
        <div className="mb-8">
          <CustomerDetailsForm
            key={`cf-${resetKey}`}
            onChange={(e) => handleFormChange("customerDetails", e)}
          />
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <Label>Invoice Number</Label>
            <Input
              type="text"
              placeholder="INV-001"
              value={formData.invoiceNumber}
              onChange={(e) => handleFormChange("invoiceNumber", e)}
            />
          </div>
          <div>
            <Label>Invoice Date</Label>
            <Input
              type="date"
              value={formatDateStr(formData.issueDate).dashedDate}
              onChange={(e) => handleFormChange("issueDate", e)}
            />
          </div>
        </div>

        <BillingForm key={`bf-${resetKey}`} onBillChange={handleBillchange} />

        <div className="mt-12 flex gap-2">
          <Button
            className="w-full justify-center flex-1"
            disabled={isSaving}
            onClick={() => setOpenPrintModal(true)}
          >
            <PrinterCheck size={18} />
            {isInvoiceSaved ? "Print bill" : "Save & print bill"}
          </Button>
          <Button
            variant="outline"
            className="text-green-700 bg-gray-100"
            disabled={isSaving || isInvoiceSaved}
            loading={isSaving}
            onClick={() => handleInvoiceSave()}
          >
            <CloudCheck size={18} />
            Save as Draft
          </Button>
          <Button
            variant="outline"
            disabled={isSaving}
            className="text-red-400 bg-gray-100"
            onClick={handleReset}
          >
            <RotateCcw size={18} />
            Reset
          </Button>
        </div>
      </div>

      <PrintModal
        openState={openPrintModal}
        invoiceData={formData}
        isInvoiceSaved={isInvoiceSaved}
        isSaving={isSaving}
        onSave={handleInvoiceSave}
        onClose={() => setOpenPrintModal(false)}
      />
    </>
  );
};
