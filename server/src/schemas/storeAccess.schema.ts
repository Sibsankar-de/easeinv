import { z } from "zod";

export const inviteStoreUserSchema = z.object({
  email: z.email("Invalid email address"),
  role: z.string().trim().min(1, "Role is required"),
});

export const updateStoreUserRoleSchema = z.object({
  role: z.string().trim().min(1, "Role is required"),
});

export type InviteStoreUserDTO = z.infer<typeof inviteStoreUserSchema>;
export type UpdateStoreUserRoleDTO = z.infer<typeof updateStoreUserRoleSchema>;
