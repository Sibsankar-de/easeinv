import { InvoiceDocument } from "@/components/sections/InvoiceDocument";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Modal, ModalHeader, ModalProps } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { InvoiceSummaryDto, InvoiceDto, InvoiceStatus } from "@/types/dto/invoiceDto";
import { Download, PrinterCheck, CheckCheck, Printer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { pageSizes } from "@/constants/pageSizeMaps";
import { useDispatch, useSelector } from "react-redux";
import {
  selectInvoiceState,
  fetchInvoiceByIdThunk,
} from "@/store/features/invoiceSlice";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { InvoiceDocumentSkeleton } from "@/components/ui/Skeleton";
import { useInvoiceDownload } from "@/hooks/use-invoice-download";
import { useInvoiceActions } from "@/hooks/use-invoice-actions";
import { DropdownButton, DropdownMenuItem } from "@/components/ui/DropdownButton";

interface InvoiceViewModalProps extends ModalProps {
  invoice?: InvoiceSummaryDto | InvoiceDto;
  invoiceId?: string;
  fetchInvoice?: boolean;
}

export const InvoiceViewModal = ({
  openState,
  onClose,
  invoice: propInvoice,
  invoiceId: propInvoiceId,
  fetchInvoice = false,
}: InvoiceViewModalProps) => {
  const dispatch = useDispatch();
  const { storeId } = useStoreNavigation();
  const {
    data: { invoiceListData },
    getStatus,
  } = useSelector(selectInvoiceState);

  const { issueInvoice, isSaving } = useInvoiceActions();

  const invoiceRef = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState("80mm");

  const invoiceId = propInvoiceId || propInvoice?.id;
  const cachedInvoice = invoiceListData.find(
    (inv: InvoiceDto) => inv.id === invoiceId,
  );
  const isLoading = getStatus === "loading" && !cachedInvoice;
  const displayInvoice = fetchInvoice ? cachedInvoice : propInvoice;

  const isDraft =
    (displayInvoice?.status ?? propInvoice?.status) === InvoiceStatus.DRAFTED;

  useEffect(() => {
    if (openState && fetchInvoice && invoiceId && !cachedInvoice && storeId) {
      dispatch(fetchInvoiceByIdThunk({ storeId, invoiceId }));
    }
  }, [openState, fetchInvoice, invoiceId, cachedInvoice, storeId, dispatch]);

  const { isDownloading, downloadInvoice, hiddenInvoiceComponent } =
    useInvoiceDownload();

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    pageStyle: `
          @page {
            margin: 0;
          }
    
          @media print {
            html, body {
              width: ${pageSize};
              margin: 0;
              padding: 0;
            }
          }
        `,
  });

  const handleIssueAndPrint = async () => {
    if (!displayInvoice) return;
    try {
      await issueInvoice(displayInvoice, storeId);
      handlePrint();
      onClose?.();
    } catch {
      // Handled
    }
  };

  const handleIssueOnly = async () => {
    if (!displayInvoice) return;
    try {
      await issueInvoice(displayInvoice, storeId);
      onClose?.();
    } catch {
      // Handled
    }
  };

  const issueDropdownItems: DropdownMenuItem[] = [
    {
      label: "Issue without printing",
      icon: <CheckCheck className="w-4 h-4 text-primary" />,
      onClick: handleIssueOnly,
    },
    {
      label: "Print without issuing",
      icon: <Printer className="w-4 h-4 text-gray-600" />,
      onClick: handlePrint,
    },
  ];

  return (
    <Modal
      openState={openState}
      onClose={onClose}
      className="w-[90vw] md:w-[60vw] lg:w-[50vw] max-w-5xl space-y-4"
      header={
        <ModalHeader
          title={isDraft ? "Draft Invoice Details" : "Invoice Details"}
        />
      }
    >
      <div className="flex justify-end items-center gap-3">
        <Label className="mb-0">Page size:</Label>
        <Select
          options={pageSizes}
          placeholder="Select page size"
          value={pageSize}
          onChange={(e) => setPageSize(e)}
        />
      </div>
      <div className="max-h-[70vh] overflow-y-auto flex justify-center">
        {isLoading ? (
          <InvoiceDocumentSkeleton />
        ) : displayInvoice ? (
          <InvoiceDocument
            invoice={displayInvoice}
            ref={invoiceRef}
            pageSize={pageSize}
          />
        ) : (
          <p className="text-gray-500 py-4 text-center">
            No invoice details found.
          </p>
        )}
      </div>

      {hiddenInvoiceComponent}

      {isDraft ? (
        <div className="flex gap-2 sticky bottom-0">
          <DropdownButton
            className="flex-1"
            onClick={handleIssueAndPrint}
            items={issueDropdownItems}
            variant="primary"
            disabled={isLoading || isSaving || isDownloading || !displayInvoice}
            loading={isSaving}
            placement="top"
          >
            <PrinterCheck size={18} />
            Issue & Print bill
          </DropdownButton>
          <Button
            variant="outline"
            onClick={() => displayInvoice && downloadInvoice(displayInvoice)}
            disabled={isLoading || isSaving || isDownloading || !displayInvoice}
            loading={isDownloading}
          >
            <Download size={18} />
            Download
          </Button>
        </div>
      ) : (
        <div className="flex gap-2 sticky bottom-0">
          <Button
            className="justify-center flex-1"
            onClick={handlePrint}
            disabled={isLoading || isDownloading || !displayInvoice}
          >
            <PrinterCheck size={18} />
            Print bill
          </Button>
          <Button
            variant="outline"
            onClick={() => displayInvoice && downloadInvoice(displayInvoice)}
            disabled={isLoading || isDownloading || !displayInvoice}
            loading={isDownloading}
          >
            <Download size={18} />
            Download
          </Button>
        </div>
      )}
    </Modal>
  );
};
