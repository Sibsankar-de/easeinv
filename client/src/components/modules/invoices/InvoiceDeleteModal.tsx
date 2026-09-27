"use client";

import { Button } from "@/components/ui/Button";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { useStoreNavigation } from "@/hooks/store-navigation";
import {
  deleteInvoiceThunk,
  invalidateInvoicePages,
  invalidateInvoiceSummary,
  selectInvoiceState,
} from "@/store/features/invoiceSlice";
import { InvoiceSummaryDto } from "@/types/dto/invoiceDto";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "@/utils/toast";

export function InvoiceDeleteModal({
  openState,
  onClose,
  invoice,
}: {
  openState: boolean;
  onClose: () => void;
  invoice: InvoiceSummaryDto;
}) {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch();
  const { deleteStatus } = useSelector(selectInvoiceState);

  const isDeleting = deleteStatus === "loading";

  const handleDelete = () => {
    if (!storeId || !invoice?.id) return;

    dispatch(deleteInvoiceThunk({ storeId, invoiceId: invoice.id }))
      .unwrap()
      .then(() => {
        toast.success("Draft invoice deleted successfully");
        dispatch(invalidateInvoicePages());
        dispatch(invalidateInvoiceSummary());
        onClose();
      })
      .catch(() => {});
  };

  return (
    <Modal
      openState={openState}
      onClose={onClose}
      className="p-4 space-y-4 w-[90vw] sm:w-104"
      header={
        <ModalHeader
          title="Delete Draft Invoice"
          subtitle="This action cannot be undone."
        />
      }
    >
      <p className="text-gray-600 text-sm">
        Are you sure you want to delete draft invoice{" "}
        <span className="font-semibold text-gray-900">
          {invoice.invoiceNumber || invoice.id}
        </span>
        ?
      </p>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={isDeleting}
          loading={isDeleting}
        >
          Delete Draft
        </Button>
      </div>
    </Modal>
  );
}
