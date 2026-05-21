import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    bio: z.string().max(1000).optional(),
    location: z.string().max(200).optional(),
    availability: z.array(z.string()).optional(),
    experienceLevel: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
    skillsOffered: z.union([z.array(z.string().trim()), z.string()]).optional(),
    skillsWanted: z.union([z.array(z.string().trim()), z.string()]).optional(),
  }).passthrough(),
  query: z.any().optional(),
  params: z.any().optional(),
});
