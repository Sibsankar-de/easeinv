"use client";

import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useStoreNavigation } from "./store-navigation";
import {
  createInvoiceThunk,
  updateInvoiceThunk,
  invalidateInvoicePages,
  invalidateInvoiceSummary,
} from "@/store/features/invoiceSlice";
import { invalidateCustomerPages } from "@/store/features/customerSlice";
import {
  InvoiceStatus,
  InvoiceDto,
  InvoiceSummaryDto,
} from "@/types/dto/invoiceDto";
import {
  transformInvoicePayload,
  InvoiceFormState,
} from "@/helpers/invoiceHelper";
import { toast } from "@/utils/toast";

export const useInvoiceActions = () => {
  const dispatch = useDispatch();
  const { storeId } = useStoreNavigation();
  const [isSaving, setIsSaving] = useState(false);

  const invalidateRelatedPages = useCallback(() => {
    dispatch(invalidateInvoicePages());
    dispatch(invalidateInvoiceSummary());
    dispatch(invalidateCustomerPages());
  }, [dispatch]);

  const saveInvoice = useCallback(
    async (
      data: InvoiceFormState | InvoiceDto | InvoiceSummaryDto,
      targetStatus: InvoiceStatus = InvoiceStatus.DRAFTED,
      customStoreId?: string,
    ) => {
      const activeStoreId =
        customStoreId || storeId || (data as InvoiceDto).storeId;
      if (!activeStoreId) {
        toast.error("Store ID is required");
        return null;
      }

      setIsSaving(true);
      try {
        const invoiceId =
          (data as { invoiceId?: string; id?: string }).invoiceId ||
          (data as { id?: string }).id;
        const apiPayload = transformInvoicePayload({
          ...(data as unknown as InvoiceFormState),
          storeId: activeStoreId,
          status: targetStatus,
          ...(invoiceId ? { invoiceId, id: invoiceId } : {}),
        });

        let result: InvoiceDto;
        if (invoiceId) {
          result = await dispatch(updateInvoiceThunk(apiPayload)).unwrap();
          if (targetStatus === InvoiceStatus.ISSUED) {
            toast.success("Invoice issued successfully");
          } else {
            toast.success("Draft updated");
          }
        } else {
          result = await dispatch(createInvoiceThunk(apiPayload)).unwrap();
          if (targetStatus === InvoiceStatus.ISSUED) {
            toast.success("Invoice issued successfully");
          } else {
            toast.success("Invoice saved as draft");
          }
        }

        invalidateRelatedPages();
        return result;
      } catch (error: unknown) {
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [dispatch, storeId, invalidateRelatedPages],
  );

  const draftInvoice = useCallback(
    (
      data: InvoiceFormState | InvoiceDto | InvoiceSummaryDto,
      customStoreId?: string,
    ) => saveInvoice(data, InvoiceStatus.DRAFTED, customStoreId),
    [saveInvoice],
  );

  const issueInvoice = useCallback(
    (
      data: InvoiceFormState | InvoiceDto | InvoiceSummaryDto,
      customStoreId?: string,
    ) => saveInvoice(data, InvoiceStatus.ISSUED, customStoreId),
    [saveInvoice],
  );

  return {
    saveInvoice,
    draftInvoice,
    issueInvoice,
    invalidateRelatedPages,
    isSaving,
  };
};
