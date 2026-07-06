import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  phoneNumber: z.string().trim().min(1, "Phone number is required"),
  email: z.email("Invalid email").or(z.literal("")).optional(),
  address: z.string().trim().optional(),
});

export const updateCustomerSchema = z.object({
  name: z.string().trim().optional(),
  phoneNumber: z.string().trim().optional(),
  email: z.email("Invalid email").or(z.literal("")).optional(),
  address: z.string().trim().optional(),
});

export type CreateCustomerDTO = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerDTO = z.infer<typeof updateCustomerSchema>;
