import { z } from "zod";

export const submitCustomerQuerySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  message: z.string().trim().min(5, "Message must be at least 5 characters"),
  turnstileToken: z.string().min(1, "Turnstile verification token is required"),
});

export type SubmitCustomerQueryDTO = z.infer<typeof submitCustomerQuerySchema>;

// Alias for backwards compatibility
export const submitContactSchema = submitCustomerQuerySchema;
export type SubmitContactDTO = SubmitCustomerQueryDTO;
