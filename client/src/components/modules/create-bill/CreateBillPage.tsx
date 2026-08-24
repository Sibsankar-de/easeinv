"use client";

import { CustomerDetailsForm } from "./CustomerDetailsForm";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { DateInput } from "@/components/ui/DateInput";
import { Button } from "@/components/ui/Button";
import { CloudCheck, PrinterCheck, RotateCcw } from "lucide-react";
import { BillingForm, BillCalculationsType } from "./BillingForm";
import { useEffect, useState, useCallback, useMemo } from "react";
import { InvoiceFormState } from "@/helpers/invoiceHelper";
import { formatDateStr } from "@/utils/formatDate";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import { getNextInvoiceNumber } from "@/utils/invoicenumber-generator";
import { PrintModal } from "./PrintModal";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { useSearchParams } from "next/navigation";
import {
  createInvoiceThunk,
  updateInvoiceThunk,
  fetchInvoiceByIdThunk,
  selectInvoiceState,
  invalidateInvoicePages,
  invalidateInvoiceSummary,
} from "@/store/features/invoiceSlice";
import { invalidateCustomerPages } from "@/store/features/customerSlice";
import {
  InvoiceDto,
  InvoiceStatus,
  BillItemType,
} from "@/types/dto/invoiceDto";
import { transformInvoicePayload } from "@/helpers/invoiceHelper";
import { toast } from "@/utils/toast";
import { FormSkeleton } from "@/components/ui/Skeleton";
import { useNavContext } from "@/contexts/NavContext";
import { NavActionButton } from "@/components/modules/navbar/Navbar";

export const CreateBillPage = () => {
  const { storeId, router, basePath } = useStoreNavigation();
  const searchParams = useSearchParams();
  const invoiceQueryId = searchParams.get("invoice");
  const { setActionButtons } = useNavContext();
  const dispatch = useDispatch();
  const {
    data: { currentStore, storeSettings },
    status,
  } = useSelector(selectCurrentStoreState);

  const { createStatus, updateStatus } = useSelector(selectInvoiceState);

  const invoiceNumber = getNextInvoiceNumber({
    prefix: storeSettings.invoiceNumberPrefix || "",
    lastInvoiceNumber: currentStore?.lastInvoiceNumber,
  });

  const initialState: InvoiceFormState = useMemo(
    () => ({
      invoiceNumber: invoiceNumber || "",
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
    }),
    [invoiceNumber],
  );

  const [formData, setFormData] = useState<InvoiceFormState>(initialState);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [isInvoiceIssued, setIsInvoiceIssued] = useState(false);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(
    Boolean(invoiceQueryId),
  );

  const handleFormChange = useCallback(
    (key: keyof InvoiceFormState, value: unknown) => {
      if (isInvoiceIssued) return;
      setFormData((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [isInvoiceIssued],
  );

  const handleBillchange = useCallback(
    (data: { items: BillItemType[]; calculations: BillCalculationsType }) => {
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
    },
    [isInvoiceIssued],
  );

  // handle print modal
  const [openPrintModal, setOpenPrintModal] = useState(false);

  const [resetKey, setResetKey] = useState(1);

  // Fetch invoice details if invoice query param is provided
  useEffect(() => {
    if (!invoiceQueryId || !storeId) return;

    dispatch(
      fetchInvoiceByIdThunk({
        storeId: storeId as string,
        invoiceId: invoiceQueryId,
      }),
    )
      .unwrap()
      .then((invoice: InvoiceDto) => {
        setInvoiceId(invoice.id);
        const isIssued = invoice.status === InvoiceStatus.ISSUED;
        setIsInvoiceIssued(isIssued);

        const formattedItems: BillItemType[] = (invoice.billItems || []).map(
          (bi, idx) => ({
            id: bi.id || `item-${idx}`,
            product: bi.product || {
              id: "",
              name: (bi as { productName?: string }).productName || "",
              sku: "",
            },
            productName:
              (bi as { productName?: string }).productName || bi.product?.name,
            pricePerQuantity: bi.pricePerQuantity,
            netQuantity: bi.netQuantity,
            totalPrice: bi.totalPrice,
            stockUnit: bi.stockUnit,
            totalProfit: bi.totalProfit,
          }),
        );

        setFormData({
          invoiceNumber: invoice.invoiceNumber,
          issueDate: new Date(invoice.issueDate),
          customer: invoice.customer || {},
          billItems: formattedItems,
          subTotal: invoice.subTotal,
          total: invoice.total,
          totalProfit: invoice.totalProfit,
          discountAmount: invoice.discountAmount || 0,
          discountPercent: invoice.discountPercent || 0,
          taxAmount: invoice.taxAmount || 0,
          dueAmount: invoice.dueAmount || 0,
          paidAmount: invoice.paidAmount || 0,
          roundupTotal: invoice.roundupTotal || false,
          note: invoice.note || "",
        });
        setResetKey((k) => k + 1);
      })
      .catch(() => {
        toast.error("Failed to load invoice details");
      })
      .finally(() => {
        setIsLoadingInvoice(false);
      });
  }, [invoiceQueryId, storeId, dispatch]);

  const invalidateRelatedPages = useCallback(() => {
    dispatch(invalidateInvoicePages());
    dispatch(invalidateInvoiceSummary());
    dispatch(invalidateCustomerPages());
  }, [dispatch]);

  // handle invoice save / update / issue
  const handleInvoiceSave = useCallback(
    async (targetStatus: InvoiceStatus = InvoiceStatus.DRAFTED) => {
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
          .then((res: { id?: string }) => {
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
    },
    [
      storeId,
      isInvoiceIssued,
      formData,
      invoiceId,
      dispatch,
      invalidateRelatedPages,
    ],
  );

  const handleReset = useCallback(() => {
    setInvoiceId(null);
    setIsInvoiceIssued(false);
    setFormData({
      ...initialState,
      invoiceNumber,
    });
    setResetKey((p) => p + 1);
    if (invoiceQueryId) {
      router.replace(`${basePath}/billing`);
    }
  }, [initialState, invoiceNumber, invoiceQueryId, router, basePath]);

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

  if (status === "loading" || isLoadingInvoice) {
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
            data={formData.customer}
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

        <BillingForm
          key={`bf-${resetKey}`}
          data={{
            items: formData.billItems,
            calculations: {
              subTotal: formData.subTotal,
              total: formData.total,
              taxAmount: formData.taxAmount,
              discountAmount: formData.discountAmount,
              discountPercent: formData.discountPercent,
              totalProfit: formData.totalProfit,
              paidAmount: formData.paidAmount,
              dueAmount: formData.dueAmount,
              roundupTotal: formData.roundupTotal,
            },
          }}
          onBillChange={handleBillchange}
        />

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
