import { Store, StoreSettings } from "@prisma/client";

export type StoreWithSettings = Store & {
  settings: StoreSettings | null;
};

export interface StoreBankDetailsDto {
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
}

export interface StoreSettingsResponseDto {
  id: string;
  storeId: string;
  invoiceStoreName: string;
  invoiceStoreAddress: string;
  invoiceFooterNote: string;
  invoiceStoreLogoUrl: string;
  enableInventoryTracking: boolean;
  roundupInvoiceTotal: boolean;
  defaultDiscountRate: number;
  defaultTaxRate: number;
  invoiceNumberPrefix: string;
  invoicePaymentQrCode: string;
  invoiceBankDetails?: StoreBankDetailsDto;
  customUnits: { key: string; value: string }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreResponseDto {
  id: string;
  name: string;
  ownerId: string;
  type: string;
  status: string;
  currencyCode: string;
  contactNo?: string;
  contactEmail?: string;
  addressLine: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  registrationNumber?: string;
  website?: string;
  logoUrl?: string;
  lastInvoiceNumber?: string;
  settings: StoreSettingsResponseDto | null;
  /** Role of the requesting user in this store */
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreSummaryResponseDto {
  id: string;
  name: string;
  type: string;
  status: string;
  currencyCode: string;
  country: string;
  contactEmail?: string;
  contactNo?: string;
  role: string;
  createdAt: Date;
}

export const toStoreSettingsDto = (
  settings: StoreSettings,
): StoreSettingsResponseDto => ({
  id: settings.id,
  storeId: settings.storeId,
  invoiceStoreName: settings.invoiceStoreName,
  invoiceStoreAddress: settings.invoiceStoreAddress,
  invoiceFooterNote: settings.invoiceFooterNote,
  invoiceStoreLogoUrl: settings.invoiceStoreLogoUrl,
  enableInventoryTracking: settings.enableInventoryTracking,
  roundupInvoiceTotal: settings.roundupInvoiceTotal,
  defaultDiscountRate: settings.defaultDiscountRate,
  defaultTaxRate: settings.defaultTaxRate,
  invoiceNumberPrefix: settings.invoiceNumberPrefix,
  invoicePaymentQrCode: settings.invoicePaymentQrCode,
  invoiceBankDetails: settings.invoiceBankDetails
    ? (settings.invoiceBankDetails as unknown as StoreBankDetailsDto)
    : undefined,
  customUnits: (settings.customUnits as { key: string; value: string }[]) ?? [],
  createdAt: settings.createdAt,
  updatedAt: settings.updatedAt,
});

export const toStoreDto = (
  store: StoreWithSettings,
  role: string,
): StoreResponseDto => ({
  id: store.id,
  name: store.name,
  ownerId: store.ownerId,
  type: store.type,
  status: store.status,
  currencyCode: store.currencyCode,
  contactNo: store.contactNo ?? undefined,
  contactEmail: store.contactEmail ?? undefined,
  addressLine: store.addressLine,
  city: store.city,
  state: store.state,
  zipCode: store.zipCode,
  country: store.country,
  registrationNumber: store.registrationNumber ?? undefined,
  website: store.website ?? undefined,
  logoUrl: store.logoUrl ?? undefined,
  lastInvoiceNumber: store.lastInvoiceNumber ?? undefined,
  settings: store.settings ? toStoreSettingsDto(store.settings) : null,
  role,
  createdAt: store.createdAt,
  updatedAt: store.updatedAt,
});

export const toStoreSummaryDto = (
  storeWithRole: Store,
  role: string,
): StoreSummaryResponseDto => ({
  id: storeWithRole.id,
  name: storeWithRole.name,
  type: storeWithRole.type,
  status: storeWithRole.status,
  currencyCode: storeWithRole.currencyCode,
  country: storeWithRole.country,
  contactEmail: storeWithRole.contactEmail ?? undefined,
  contactNo: storeWithRole.contactNo ?? undefined,
  role: role,
  createdAt: storeWithRole.createdAt,
});
