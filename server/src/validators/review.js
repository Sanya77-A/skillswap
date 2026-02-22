import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    recipientId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    swapRequestId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    rating: z.number().min(1).max(5),
    comment: z.string().max(500).optional(),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});
