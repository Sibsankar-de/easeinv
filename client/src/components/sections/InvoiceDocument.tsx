"use client";

import React from "react";
import { useSelector } from "react-redux";
import { CreateInvoiceDto } from "@/types/dto/invoiceDto";
import { formatDateStr } from "@/utils/formatDate";
import { convertUnit } from "@/utils/conversion";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import { ConditionalDiv } from "../ui/ConditionalDiv";
import { cn } from "../utils";
import { Dot } from "lucide-react";

interface Props extends React.ComponentPropsWithoutRef<"div"> {
  invoice: CreateInvoiceDto;
  pageSize?: string;
}

type DetailLineProps = {
  label: string;
  value?: React.ReactNode;
  className?: string;
};

const hasValue = (value: unknown) =>
  value !== undefined && value !== null && value !== "";

const formatAmount = (value?: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const DetailLine = ({ label, value, className }: DetailLineProps) => {
  return (
    <ConditionalDiv
      condition={hasValue(value)}
      className={cn("flex justify-between gap-3 leading-snug", className)}
    >
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-900 wrap-break-word">
        {value}
      </span>
    </ConditionalDiv>
  );
};

export const InvoiceDocument = React.forwardRef<HTMLDivElement, Props>(
  ({ invoice, pageSize = "80mm", className, ...props }, ref) => {
    const {
      data: { currentStore, storeSettings },
    } = useSelector(selectCurrentStoreState);

    const customerDetails = invoice.customerDetails;
    const bankDetails = storeSettings?.invoiceBankDetails;
    const hasCustomerDetails = [
      customerDetails?.name,
      customerDetails?.phoneNumber,
      customerDetails?.email,
      customerDetails?.address,
    ].some(hasValue);
    const hasBankDetails = [
      bankDetails?.accountName,
      bankDetails?.accountNumber,
      bankDetails?.bankName,
      bankDetails?.bankCode,
    ].some(hasValue);
    const hasPaymentDetails =
      hasBankDetails || hasValue(storeSettings?.invoicePaymentQrCode);
    const storeName =
      storeSettings?.invoiceStoreName || currentStore?.name || "Invoice";
    const storeAddress =
      storeSettings?.invoiceStoreAddress || currentStore?.address;
    const isCompact = pageSize !== "112mm";

    return (
      <div
        id="print-section"
        ref={ref}
        className={cn(
          "h-full bg-white text-gray-900 border border-gray-200 rounded-lg shadow-sm",
          "print:shadow-none print:rounded-none print:m-0 print:border-none",
          isCompact ? "p-2 text-[10px]" : "p-4 text-xs",
          className,
        )}
        style={{ width: pageSize }}
        {...props}
      >
        <header
          className={cn(
            "border-b border-gray-200 pb-2",
            isCompact ? "space-y-2" : "flex items-start justify-between gap-4",
          )}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-500">
                  Invoice
                </p>
                <h1
                  className={cn(
                    "font-bold leading-tight text-gray-950 wrap-break-word",
                    isCompact ? "text-sm" : "text-xl",
                  )}
                >
                  {storeName}
                </h1>
              </div>
              <ConditionalDiv condition={storeSettings?.invoiceStoreLogoUrl}>
                <img
                  src={storeSettings.invoiceStoreLogoUrl}
                  alt={storeName}
                  className={cn(
                    "shrink-0 rounded border border-gray-200 object-contain",
                    isCompact ? "h-9 w-9" : "h-12 w-12",
                  )}
                />
              </ConditionalDiv>
            </div>
            <ConditionalDiv
              condition={
                storeAddress ||
                currentStore?.contactNo ||
                currentStore?.contactEmail
              }
              className="mt-1 text-gray-600"
            >
              <ConditionalDiv
                condition={storeAddress}
                className="whitespace-pre-line leading-tight wrap-break-word"
              >
                {storeAddress}
              </ConditionalDiv>
              <ConditionalDiv
                condition={currentStore?.contactNo || currentStore.contactEmail}
                className="flex flex-wrap items-center"
              >
                <ConditionalDiv
                  condition={currentStore?.contactNo}
                  className="wrap-break-word"
                >
                  {currentStore.contactNo}
                </ConditionalDiv>
                <Dot size={15} />
                <ConditionalDiv
                  condition={currentStore?.contactEmail}
                  className="wrap-break-word"
                >
                  {currentStore.contactEmail}
                </ConditionalDiv>
              </ConditionalDiv>
            </ConditionalDiv>
          </div>

          <div
            className={cn(
              "shrink-0 rounded bg-gray-50 p-2",
              isCompact ? "space-y-0.5" : "min-w-36 space-y-1",
            )}
          >
            <DetailLine label="No." value={invoice.invoiceNumber} />
            <DetailLine
              label="Date"
              value={formatDateStr(invoice.issueDate).dashedDate}
            />
          </div>
        </header>

        <section
          className={cn(
            "border-b border-gray-200 py-2",
            isCompact ? "space-y-2" : "grid grid-cols-2 gap-4",
          )}
        >
          <ConditionalDiv condition={hasCustomerDetails} className="min-w-0">
            <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-wide text-gray-500">
              Bill To
            </p>
            <ConditionalDiv condition={customerDetails?.name}>
              <p className="font-semibold text-gray-950 wrap-break-word">
                {customerDetails?.name}
              </p>
            </ConditionalDiv>
            <ConditionalDiv condition={customerDetails?.phoneNumber}>
              <p className="text-gray-700 wrap-break-word">
                {customerDetails?.phoneNumber}
              </p>
            </ConditionalDiv>
            <ConditionalDiv condition={customerDetails?.email}>
              <p className="text-gray-700 wrap-break-word">
                {customerDetails?.email}
              </p>
            </ConditionalDiv>
            <ConditionalDiv condition={customerDetails?.address}>
              <p className="whitespace-pre-line text-gray-700 wrap-break-word">
                {customerDetails?.address}
              </p>
            </ConditionalDiv>
          </ConditionalDiv>

          <div
            className={cn("space-y-0.5", !hasCustomerDetails && "col-span-2")}
          >
            <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-wide text-gray-500">
              Payment Summary
            </p>
            <DetailLine label="Paid" value={formatAmount(invoice.paidAmount)} />
            <DetailLine
              label="Due"
              value={formatAmount(invoice.dueAmount)}
              className={invoice.dueAmount > 0 ? "text-red-600" : undefined}
            />
          </div>
        </section>

        <section className="py-2">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-300 text-[9px] uppercase tracking-wide text-gray-500">
                <th className="py-1.5 pr-2 text-left font-semibold">Item</th>
                <th className="px-1 py-1.5 text-center font-semibold">Qty</th>
                <th className="py-1.5 pl-2 text-right font-semibold">Amount</th>
              </tr>
            </thead>

            <tbody>
              {invoice.billItems?.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="py-1.5 pr-2 align-top">
                    <p className="font-medium leading-tight text-gray-950 wrap-break-word">
                      {item.product.name}
                    </p>
                  </td>
                  <td className="px-1 py-1.5 text-center align-top text-gray-700">
                    <span className="inline-block min-w-10 wrap-break-word">
                      {item.netQuantity}{" "}
                      {convertUnit(item.stockUnit, storeSettings?.customUnits)}
                    </span>
                  </td>
                  <td className="py-1.5 pl-2 text-right align-top font-medium">
                    {formatAmount(item.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="border-t border-gray-200 pt-2">
          <div className="ml-auto space-y-0.5">
            <DetailLine
              label="Subtotal"
              value={formatAmount(invoice.subTotal)}
            />
            <ConditionalDiv condition={Number(invoice.discountAmount || 0) > 0}>
              <DetailLine
                label="Discount"
                value={`-${formatAmount(invoice.discountAmount)}`}
              />
            </ConditionalDiv>
            <ConditionalDiv condition={Number(invoice.taxRate || 0) > 0}>
              <DetailLine
                label={`Tax (${invoice.taxRate}%)`}
                value={formatAmount(invoice.taxAmount)}
              />
            </ConditionalDiv>
            <div className="mt-1.5 flex justify-between gap-3 border-t border-gray-300 pt-1.5 text-sm font-bold">
              <span>Total</span>
              <span className="text-right">{formatAmount(invoice.total)}</span>
            </div>
          </div>
        </section>

        <ConditionalDiv condition={hasPaymentDetails}>
          <section
            className={cn(
              "mt-2 border-t border-gray-200 pt-2",
              isCompact
                ? "space-y-2"
                : "flex items-start justify-between gap-4",
            )}
          >
            <ConditionalDiv
              condition={hasBankDetails}
              className="min-w-0 flex-1"
            >
              <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-wide text-gray-500">
                Bank Details
              </p>
              <DetailLine label="Name" value={bankDetails?.accountName} />
              <DetailLine label="A/C" value={bankDetails?.accountNumber} />
              <DetailLine label="Bank" value={bankDetails?.bankName} />
              <DetailLine label="Code" value={bankDetails?.bankCode} />
            </ConditionalDiv>

            <ConditionalDiv condition={storeSettings?.invoicePaymentQrCode}>
              <div
                className={cn(
                  "shrink-0",
                  isCompact ? "text-left" : "text-center",
                )}
              >
                <p className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-gray-500">
                  Scan To Pay
                </p>
                <img
                  src={storeSettings.invoicePaymentQrCode}
                  alt="Payment QR code"
                  className={cn(
                    "rounded border border-gray-200 object-contain",
                    isCompact ? "h-[72px] w-[72px]" : "h-20 w-20",
                  )}
                />
              </div>
            </ConditionalDiv>
          </section>
        </ConditionalDiv>

        <footer className="mt-2 border-t border-gray-200 pt-2 text-center text-[9px] leading-tight text-gray-500">
          {storeSettings?.invoiceFooterNote || "Thank you for your business!"}
        </footer>
      </div>
    );
  },
);

InvoiceDocument.displayName = "InvoiceDocument";
