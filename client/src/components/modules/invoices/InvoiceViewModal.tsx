import { InvoiceDocument } from "@/components/sections/InvoiceDocument";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Modal, ModalProps } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { InvoiceDto } from "@/types/dto/invoiceDto";
import { PrinterCheck, X } from "lucide-react";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { pageSizes } from "@/constants/pageSizeMaps";

interface InvoiceViewModalProps extends ModalProps {
  invoice: InvoiceDto;
}

export const InvoiceViewModal = ({
  openState,
  onClose,
  invoice,
}: InvoiceViewModalProps) => {
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

  return (
    <Modal
      openState={openState}
      onClose={onClose}
      className="min-w-[50vw] space-y-4"
    >
      <div className="flex items-center gap-3 justify-between">
        <h3 className="text-xl">Invoice Details</h3>
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
          invoice={invoice}
          ref={invoiceRef}
          pageSize={pageSize}
        />
      </div>
      <div className="flex gap-3 sticky bottom-0">
        <Button className="w-full justify-center flex-1" onClick={handlePrint}>
          <PrinterCheck size={18} />
          Print bill
        </Button>
      </div>
    </Modal>
  );
};
