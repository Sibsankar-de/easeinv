"use client";

import { CustomerDetailsForm } from "./CustomerDetailsForm";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { DateInput } from "@/components/ui/DateInput";
import { Button } from "@/components/ui/Button";
import { CloudCheck, PrinterCheck, RotateCcw } from "lucide-react";
import { BillingForm } from "./BillingForm";
import { useEffect, useRef, useState } from "react";
import { InvoiceFormState } from "@/helpers/invoiceHelper";
import { formatDateStr } from "@/utils/formatDate";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import { getNextInvoiceNumber } from "@/utils/invoicenumber-generator";
import { PrintModal } from "./PrintModal";
import { useStoreNavigation } from "@/hooks/store-navigation";
import {
  createInvoiceThunk,
  updateInvoiceThunk,
  selectInvoiceState,
  invalidateInvoicePages,
  invalidateInvoiceSummary,
} from "@/store/features/invoiceSlice";
import { invalidateCustomerPages } from "@/store/features/customerSlice";
import { InvoiceStatus } from "@/types/dto/invoiceDto";
import { transformInvoicePayload } from "@/helpers/invoiceHelper";
import { toast } from "@/utils/toast";
import { FormSkeleton } from "@/components/ui/Skeleton";
import { useNavContext } from "@/contexts/NavContext";
import { NavActionButton } from "@/components/modules/navbar/Navbar";

export const CreateBillPage = () => {
  const { storeId } = useStoreNavigation();
  const { setActionButtons } = useNavContext();
  const dispatch = useDispatch();
  const {
    data: { currentStore, storeSettings },
    status,
  } = useSelector(selectCurrentStoreState);

  const { createStatus, updateStatus } = useSelector(selectInvoiceState);

  const initialState: InvoiceFormState = {
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
    customer: {},
  };

  const [formData, setFormData] = useState<InvoiceFormState>(initialState);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [isInvoiceIssued, setIsInvoiceIssued] = useState(false);

  const handleFormChange = (key: keyof typeof formData, value: any) => {
    if (isInvoiceIssued) return;
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleBillchange = (data: Record<string, any>) => {
    if (isInvoiceIssued) return;
    const {
      subTotal,
      total,
      taxAmount,
      discountAmount,
      discountPercent,
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
      discountPercent,
      totalProfit,
      paidAmount,
      dueAmount,
      roundupTotal,
    }));
  };

  // handle print modal
  const [openPrintModal, setOpenPrintModal] = useState(false);

  const [resetKey, setResetKey] = useState(1);

  const invoiceNumber = getNextInvoiceNumber({
    prefix: storeSettings.invoiceNumberPrefix || "",
    lastInvoiceNumber: currentStore?.lastInvoiceNumber,
  });

  // update invoice number
  useEffect(() => {
    if (isInvoiceIssued || invoiceId) return;
    handleFormChange("invoiceNumber", invoiceNumber);
  }, [currentStore, invoiceNumber, isInvoiceIssued, invoiceId]);

  const invalidateRelatedPages = () => {
    dispatch(invalidateInvoicePages());
    dispatch(invalidateInvoiceSummary());
    dispatch(invalidateCustomerPages());
  };

  // handle invoice save / update / issue
  const handleInvoiceSave = async (
    targetStatus: InvoiceStatus = InvoiceStatus.DRAFTED,
  ) => {
    if (!storeId || isInvoiceIssued) return;

    const apiPayload = transformInvoicePayload({
      storeId: storeId as string,
      status: targetStatus,
      ...formData,
      ...(invoiceId ? { invoiceId, id: invoiceId } : {}),
    });

    if (invoiceId) {
      // Existing draft invoice -> update it (or issue it)
      await dispatch(updateInvoiceThunk(apiPayload))
        .unwrap()
        .then(() => {
          if (targetStatus === InvoiceStatus.ISSUED) {
            setIsInvoiceIssued(true);
            toast.success("Invoice issued successfully");
          } else {
            toast.success("Draft updated");
          }
          invalidateRelatedPages();
        })
        .catch(() => {});
    } else {
      // New invoice -> create draft or issue directly
      await dispatch(createInvoiceThunk(apiPayload))
        .unwrap()
        .then((res: any) => {
          if (res?.id) {
            setInvoiceId(res.id);
          }
          if (targetStatus === InvoiceStatus.ISSUED) {
            setIsInvoiceIssued(true);
            toast.success("Invoice issued successfully");
          } else {
            toast.success("Invoice saved as draft");
          }
          invalidateRelatedPages();
        })
        .catch(() => {});
    }
  };

  const handleReset = () => {
    setInvoiceId(null);
    setIsInvoiceIssued(false);
    setFormData({
      ...initialState,
      invoiceNumber,
    });
    setResetKey((p) => p + 1);
  };

  const isSaving = createStatus === "loading" || updateStatus === "loading";

  useEffect(() => {
    setActionButtons(
      <NavActionButton
        disabled={isSaving}
        onClick={() => setOpenPrintModal(true)}
      >
        <PrinterCheck size={16} />
        {isInvoiceIssued ? "Print bill" : "Issue & print"}
      </NavActionButton>,
    );
  }, [setActionButtons, isSaving, isInvoiceIssued, formData, storeId]);

  // keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        if (!isInvoiceIssued) {
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
  }, [isInvoiceIssued, handleInvoiceSave, handleReset]);

  if (status === "loading") {
    return <FormSkeleton rows={6} />;
  }

  return (
    <>
      <div
        className={
          isInvoiceIssued ? "opacity-95 pointer-events-none select-none" : ""
        }
      >
        {/* Invoice Header */}
        <div className="mb-8">
          <CustomerDetailsForm
            key={`cf-${resetKey}`}
            onChange={(e) => handleFormChange("customer", e)}
          />
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
          <div>
            <Label>Invoice Number</Label>
            <Input
              type="text"
              placeholder="INV-001"
              disabled={isInvoiceIssued}
              value={formData.invoiceNumber}
              onChange={(e) => handleFormChange("invoiceNumber", e)}
            />
          </div>
          <div>
            <Label>Invoice Date</Label>
            <DateInput
              disabled={isInvoiceIssued}
              value={formatDateStr(formData.issueDate).dashedDate}
              onChange={(val) => handleFormChange("issueDate", val)}
            />
          </div>
        </div>

        <BillingForm key={`bf-${resetKey}`} onBillChange={handleBillchange} />

        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-2 pointer-events-auto">
          <Button
            className="w-full justify-center flex-1"
            disabled={isSaving}
            onClick={() => setOpenPrintModal(true)}
          >
            <PrinterCheck size={18} />
            {isInvoiceIssued ? "Print bill" : "Issue & print bill"}
          </Button>
          <Button
            variant="outline"
            className="text-green-700 bg-gray-100"
            disabled={isSaving || isInvoiceIssued}
            loading={isSaving}
            onClick={() => handleInvoiceSave(InvoiceStatus.DRAFTED)}
          >
            <CloudCheck size={18} />
            {invoiceId ? "Update Draft" : "Save as Draft"}
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
        isInvoiceIssued={isInvoiceIssued}
        invoiceId={invoiceId}
        isSaving={isSaving}
        onSave={handleInvoiceSave}
        onClose={() => setOpenPrintModal(false)}
      />
    </>
  );
};
