import { userRoles } from "../enums/store.enum";

export const OwnerLevelRoles = [userRoles.OWNER];

export const AdminLevelRoles = [userRoles.ADMIN, userRoles.OWNER];

export const ManagerLevelRoles = [
  userRoles.MANAGER,
  userRoles.ADMIN,
  userRoles.OWNER,
];

export const EmployeeLevelRoles = [
  userRoles.EMPLOYEE,
  userRoles.MANAGER,
  userRoles.ADMIN,
  userRoles.OWNER,
];
