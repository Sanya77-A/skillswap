import { z } from "zod";

const withReq = (shape) => z.object({ ...shape, query: z.any().optional(), params: z.any().optional() });

export const registerSchema = withReq({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(6).max(100),
    location: z.string().max(200).optional(),
    availability: z.array(z.string()).optional(),
    experienceLevel: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
  }),
});

export const loginSchema = withReq({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const refreshSchema = withReq({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

export const forgotPasswordSchema = withReq({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetPasswordSchema = withReq({
  body: z.object({
    token: z.string().min(1),
    password: z.string().min(6).max(100),
  }),
});
