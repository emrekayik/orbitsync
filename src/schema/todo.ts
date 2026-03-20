import { z } from "zod";

export const todoSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Todo tanımlamadan ekleyemezsin!" })
    .max(100, { message: "100 karakterden fazla giremezsin" }),
});


export type TodoFormValues = z.infer<typeof todoSchema>;
