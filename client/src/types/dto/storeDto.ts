export enum StoreType {
  RETAIL = "RETAIL",
  WHOLESALE = "WHOLESALE",
  ONLINE = "ONLINE",
  FRANCHISE = "FRANCHISE",
  HYBRID = "HYBRID",
}

export type CustomUnitType = {
  key: string;
  value: string;
};

export type StoreSettingsDto = {
  invoiceStoreName: string;
  invoiceStoreAddress: string;
  invoiceFooterNote: string;
  invoiceStoreLogoUrl: string;
  enableInventoryTracking: boolean;
  roundupInvoiceTotal: boolean;
  defaultDiscountRate?: number;
  defaultTaxRate?: number;
  invoiceNumberPrefix: string;
  invoicePaymentQrCode: string;
  invoiceBankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    bankCode: string;
  };
  customUnits: CustomUnitType[];
};

export type StoreDto = {
  id: string;
  role: string;
  name: string;
  owner?: string;
  currencyCode: string;
  addressLine?: string;
  contactNo?: string;
  contactEmail?: string;
  type?: string;
  country?: string;
  registrationNumber?: string;
  website?: string;
  taxRate?: number;
  lastInvoiceNumber?: string;
  storeSettingsId?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type StoreAccessorDto = {
  storeId: string;
  userId: string;
  userName: string;
  email: string;
  role: string;
};

export type StoreUserInviteDto = {
  storeId: string;
  storeName: string;
  email: string;
  role: string;
};
