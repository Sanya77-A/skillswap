import { z } from "zod";

export const postMessageSchema = z.object({
  params: z.object({ conversationId: z.string().regex(/^[0-9a-fA-F]{24}$/) }),
  body: z.object({
    content: z.string().max(2000).optional(),
  }),
  query: z.any().optional(),
});
