import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInvoiceByIdThunk,
  selectInvoiceState,
} from "@/store/features/invoiceSlice";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { downloadElementAsPdf } from "@/utils/downloadPdf";
import { InvoiceDocument } from "@/components/sections/InvoiceDocument";
import { InvoiceSummaryDto, InvoiceDto } from "@/types/dto/invoiceDto";
import { toast } from "react-toastify";

export const useInvoiceDownload = () => {
  const dispatch = useDispatch();
  const { storeId } = useStoreNavigation();
  const {
    data: { invoiceListData },
  } = useSelector(selectInvoiceState);

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<
    string | null
  >(null);
  const hiddenRef = useRef<HTMLDivElement>(null);

  const fullInvoice = invoiceListData.find(
    (inv) => inv.id === downloadingInvoiceId,
  );

  const downloadInvoice = async (invoice: InvoiceSummaryDto | InvoiceDto) => {
    setIsDownloading(true);
    setDownloadingInvoiceId(invoice.id);

    try {
      let currentFullInvoice = invoiceListData.find(
        (inv) => inv.id === invoice.id,
      );
      if (!currentFullInvoice) {
        currentFullInvoice = await dispatch(
          fetchInvoiceByIdThunk({ storeId, invoiceId: invoice.id }),
        ).unwrap();
      }

      // Wait a microtask to allow the hidden DOM container to render with the fullInvoice
      setTimeout(() => {
        if (hiddenRef.current) {
          const docElement = hiddenRef.current.querySelector(
            "#print-section",
          ) as HTMLElement;
          downloadElementAsPdf(
            docElement || hiddenRef.current,
            invoice.invoiceNumber,
          );
        }
        setIsDownloading(false);
        setDownloadingInvoiceId(null);
      }, 150);
    } catch (error) {
      console.error("Failed to download PDF invoice:", error);
      toast.error("Failed to download invoice.");
      setIsDownloading(false);
      setDownloadingInvoiceId(null);
    }
  };

  const hiddenInvoiceComponent =
    isDownloading && fullInvoice && typeof window !== "undefined"
      ? createPortal(
          <div
            ref={hiddenRef}
            style={{
              position: "fixed",
              left: "100vw",
              top: "100vh",
              width: "210mm",
              zIndex: -9999,
              pointerEvents: "none",
              backgroundColor: "#ffffff",
            }}
          >
            <InvoiceDocument invoice={fullInvoice} pageSize="210mm" />
          </div>,
          document.body,
        )
      : null;

  return {
    isDownloading,
    downloadInvoice,
    hiddenInvoiceComponent,
  };
};
