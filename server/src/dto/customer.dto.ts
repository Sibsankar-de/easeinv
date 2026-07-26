import { Customer } from "@prisma/client";

export interface CustomerResponseDto {
  id: string;
  storeId: string;
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  totalDue: number;
  advance: number;
  paymentBehaviour: string;
  mark: string;
  createdAt: Date;
  updatedAt: Date;
  totalInvoices: number;
  dueCount: number;
}

export const toCustomerDto = (
  customer: Customer,
  totalInvoices: number = 0,
  dueCount: number = 0,
): CustomerResponseDto => {
  return {
    id: customer.id,
    storeId: customer.storeId,
    name: customer.name,
    phoneNumber: customer.phoneNumber ?? "",
    email: customer.email ?? "",
    address: customer.address ?? "",
    totalDue: customer.totalDue,
    advance: customer.advance,
    paymentBehaviour: customer.paymentBehaviour,
    mark: customer.mark,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
    totalInvoices,
    dueCount,
  };
};

export interface CustomerSummaryResponseDto {
  id: string;
  name: string;
  phoneNumber: string;
  address: string;
  email: string;
  totalDue: number;
  totalInvoices: number;
  dueCount: number;
}

export const toCustomerSummaryDto = (
  customer: Customer,
  totalInvoices: number = 0,
  dueCount: number = 0,
): CustomerSummaryResponseDto => {
  return {
    id: customer.id,
    name: customer.name,
    phoneNumber: customer.phoneNumber ?? "",
    address: customer.address ?? "",
    email: customer.email ?? "",
    totalDue: customer.totalDue,
    totalInvoices,
    dueCount,
  };
};
