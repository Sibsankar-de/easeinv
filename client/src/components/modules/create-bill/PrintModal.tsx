"use client";

import { InvoiceDocument } from "@/components/sections/InvoiceDocument";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { pageSizes } from "@/constants/pageSizeMaps";
import { CreateInvoiceDto } from "@/types/dto/invoiceDto";
import { CloudCheck, PrinterCheck, X } from "lucide-react";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

type PrintModalType = {
  openState: boolean;
  invoiceData: CreateInvoiceDto;
  isSaving: boolean;
  isInvoiceSaved: boolean;
  onSave: (status: string) => void;
  onClose: () => void;
};

export const PrintModal = ({
  openState,
  invoiceData,
  isInvoiceSaved,
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

  const handleSaveAndPrint = () => {
    if (!isInvoiceSaved) {
      onSave("PRINTED");
    }
    handlePrint();
  };

  return (
    <Modal
      openState={openState}
      className="min-w-[50vw] space-y-4"
      onClose={onClose}
    >
      <div className="flex items-center gap-3 justify-between">
        <h3 className="text-xl">Save and print Invoice</h3>
        <Button variant="outline" className="p-2" onClick={onClose}>
          <X size={18} />
        </Button>
      </div>
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
        <Button
          className="w-full justify-center flex-1"
          onClick={handleSaveAndPrint}
          disabled={isSaving}
          loading={isSaving}
          autoFocus
        >
          <PrinterCheck size={18} />
          {isInvoiceSaved ? "Print bill" : "Save & print bill"}
        </Button>
        <Button
          variant="outline"
          className="text-green-700 bg-gray-100"
          disabled={isSaving || isInvoiceSaved}
          loading={isSaving}
          onClick={() => onSave("DRAFTED")}
        >
          <CloudCheck size={18} />
          Save as Draft
        </Button>
      </div>
    </Modal>
  );
};
