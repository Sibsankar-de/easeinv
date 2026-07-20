import { StoreUserRole } from "@prisma/client";

export const OwnerLevelRoles = [StoreUserRole.OWNER];

export const AdminLevelRoles = [StoreUserRole.ADMIN, StoreUserRole.OWNER];

export const ManagerLevelRoles = [
  StoreUserRole.MANAGER,
  StoreUserRole.ADMIN,
  StoreUserRole.OWNER,
];

export const EmployeeLevelRoles = [
  StoreUserRole.EMPLOYEE,
  StoreUserRole.MANAGER,
  StoreUserRole.ADMIN,
  StoreUserRole.OWNER,
];
