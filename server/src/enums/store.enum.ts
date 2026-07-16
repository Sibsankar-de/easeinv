import { StoreType, StoreUserRole } from "@prisma/client";

export const storeTypeList = Object.values(StoreType);

export enum StoreStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

export const storeStatusList = Object.values(StoreStatus) as [
  string,
  ...string[],
];

export const storeUserRoleList = Object.values(StoreUserRole);

export enum StockUnit {
  KG = "KG",
  LITRE = "LITRE",
  PCS = "PCS",
}
