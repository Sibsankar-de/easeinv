"use client";

import { InvoiceDocument } from "@/components/sections/InvoiceDocument";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { pageSizes } from "@/constants/pageSizeMaps";
import { InvoiceFormState } from "@/helpers/invoiceHelper";
import { CloudCheck, PrinterCheck, CheckCheck, Printer } from "lucide-react";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { InvoiceStatus } from "@/types/dto/invoiceDto";
import { DropdownButton, DropdownMenuItem } from "@/components/ui/DropdownButton";

type PrintModalType = {
  openState: boolean;
  invoiceData: InvoiceFormState;
  isSaving: boolean;
  isInvoiceIssued: boolean;
  invoiceId?: string | null;
  onSave: (status: InvoiceStatus) => void;
  onClose: () => void;
};

export const PrintModal = ({
  openState,
  invoiceData,
  isInvoiceIssued,
  invoiceId,
  isSaving,
  onSave,
  onClose,
}: PrintModalType) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState("80mm");

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

  const handleIssueAndPrint = () => {
    if (!isInvoiceIssued) {
      onSave(InvoiceStatus.ISSUED);
    }
    handlePrint();
  };

  const issueDropdownItems: DropdownMenuItem[] = [
    {
      label: "Issue without printing",
      icon: <CheckCheck className="w-4 h-4 text-primary" />,
      onClick: () => onSave(InvoiceStatus.ISSUED),
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
      className="w-[90vw] md:w-[60vw] lg:w-[50vw] max-w-5xl space-y-4"
      onClose={onClose}
      header={
        <ModalHeader
          title={isInvoiceIssued ? "Print Invoice" : "Issue and print Invoice"}
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
        <InvoiceDocument
          invoice={invoiceData}
          ref={invoiceRef}
          pageSize={pageSize}
        />
      </div>
      <div className="flex gap-3 sticky bottom-0">
        {!isInvoiceIssued ? (
          <DropdownButton
            className="flex-1"
            onClick={handleIssueAndPrint}
            items={issueDropdownItems}
            variant="primary"
            disabled={isSaving}
            loading={isSaving}
            placement="top"
          >
            <PrinterCheck size={18} />
            Issue & print bill
          </DropdownButton>
        ) : (
          <Button
            className="w-full justify-center flex-1"
            onClick={handlePrint}
            disabled={isSaving}
            loading={isSaving}
            autoFocus
          >
            <PrinterCheck size={18} />
            Print bill
          </Button>
        )}
        <Button
          variant="outline"
          className="text-green-700 bg-gray-100"
          disabled={isSaving || isInvoiceIssued}
          loading={isSaving}
          onClick={() => onSave(InvoiceStatus.DRAFTED)}
        >
          <CloudCheck size={18} />
          {invoiceId ? "Update Draft" : "Save as Draft"}
        </Button>
      </div>
    </Modal>
  );
};
