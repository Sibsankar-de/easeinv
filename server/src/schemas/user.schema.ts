import { z } from "zod";

export const createUserSchema = z.object({
  userName: z.string().trim().min(1, "Username is required"),
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginUserSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateUserSchema = z.object({
  userName: z.string().trim().min(1, "Username is required"),
  email: z.email("Invalid email address"),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const validateAndResetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type LoginUserDTO = z.infer<typeof loginUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type UpdatePasswordDTO = z.infer<typeof updatePasswordSchema>;
export type ValidateAndResetPasswordDTO = z.infer<
  typeof validateAndResetPasswordSchema
>;
