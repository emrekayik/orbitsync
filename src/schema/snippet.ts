import { z } from "zod";

export const snippetSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Snippet tanımlamadan ekleyemezsin!" })
    .max(100, { message: "100 karakterden fazla giremezsin" }),
  content: z
    .string()
    .min(1, { message: "Snippet içeriği olmadan ekleyemezsin!" })
    .max(100, { message: "100 karakterden fazla giremezsin" }),
  image: z.string().optional(),
  copyCount: z.number().optional(),
});

export type SnippetFormValues = z.infer<typeof snippetSchema>;
