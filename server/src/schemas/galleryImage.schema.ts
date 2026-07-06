import { z } from "zod";

export const updateImageNameSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export type UpdateImageNameDTO = z.infer<typeof updateImageNameSchema>;
