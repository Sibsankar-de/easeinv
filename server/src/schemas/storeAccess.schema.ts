import { z } from "zod";
import { storeUserRoleList } from "../enums/store.enum";

export const inviteStoreUserSchema = z.object({
  email: z.email("Invalid email address"),
  role: z.enum(storeUserRoleList, "Invalid role"),
});

export const updateStoreUserRoleSchema = z.object({
  role: z.enum(storeUserRoleList, "Invalid role"),
});

export type InviteStoreUserDTO = z.infer<typeof inviteStoreUserSchema>;
export type UpdateStoreUserRoleDTO = z.infer<typeof updateStoreUserRoleSchema>;
