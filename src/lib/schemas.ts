import { z } from "zod";
import { STATUSES } from "./status";

const optional = z.string().trim().max(2000).transform((v) => v || null);

export const applicationSchema = z.object({
  company: z.string().trim().min(1, "Company is required").max(120),
  role: z.string().trim().min(1, "Role is required").max(120),
  status: z.enum(STATUSES),
  location: optional,
  salary: optional,
  url: optional.refine((v) => !v || /^https?:\/\//.test(v), "Link must start with http(s)://"),
  notes: optional,
});

export const credentialsSchema = z.object({
  email: z.email("Enter a valid email").transform((v) => v.toLowerCase()),
  password: z.string().min(8, "Password needs at least 8 characters"),
});
