import { z } from "zod";

/**
 * Security Validation Layer
 * Comprehensive input validation for all API endpoints
 */

// Common validation schemas
export const idSchema = z.string().uuid("Invalid ID format");
export const emailSchema = z.string().email("Invalid email");
export const phoneSchema = z
  .string()
  .regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone number")
  .min(10)
  .max(20);
export const urlSchema = z.string().url("Invalid URL");
export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format");
export const nameSchema = z
  .string()
  .min(1, "Name required")
  .max(255, "Name too long")
  .trim();
export const descriptionSchema = z
  .string()
  .max(5000, "Description too long")
  .trim();
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Lead validation
export const leadSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  company: nameSchema.optional(),
  source: z.string().max(100).optional(),
  notes: descriptionSchema.optional(),
  status: z.enum(["new", "contacted", "qualified", "converted"]).default("new"),
});

// Contact validation
export const contactSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  company: nameSchema.optional(),
  title: z.string().max(100).optional(),
  notes: descriptionSchema.optional(),
});

// Workflow validation
export const workflowSchema = z.object({
  name: nameSchema,
  description: descriptionSchema.optional(),
  trigger: z.enum(["manual", "on_lead_create", "on_contact_update", "scheduled"]),
  // Array of actions to execute in workflow
  actions: z.array(z.record(z.string(), z.any())),
  enabled: z.boolean().default(true),
});

// Content validation
export const contentSchema = z.object({
  title: nameSchema,
  slug: slugSchema,
  type: z.enum(["page", "post", "article", "email"]),
  body: z.string().min(1, "Content required").max(50000),
  excerpt: descriptionSchema.optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  publishedAt: z.date().optional(),
});

// Agent validation
export const agentSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  systemPrompt: z.string().min(1, "Prompt required").max(5000),
  model: z.string().default("gpt-4"),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(100).max(4000).default(1000),
});

// Funnel validation
export const funnelSchema = z.object({
  name: nameSchema,
  description: descriptionSchema.optional(),
  stages: z
    .array(
      z.object({
        name: nameSchema,
        order: z.number().int().min(0),
      })
    )
    .min(1),
});

/**
 * Validate and sanitize input
 */
export function validateInput<T>(schema: z.ZodSchema, data: unknown): T {
  return schema.parse(data) as T;
}

/**
 * Safe parse with error details
 */
export function safeValidate<T>(
  schema: z.ZodSchema,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodIssue[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as T };
  }
  return { success: false, errors: result.error.issues };
}

/**
 * Sanitize string inputs (prevent XSS)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .trim();
}

/**
 * Validate pagination params
 */
export function validatePagination(query: unknown) {
  return paginationSchema.parse(query);
}

/**
 * Validate UUID
 */
export function validateUUID(id: string): boolean {
  try {
    idSchema.parse(id);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if data contains SQL injection patterns
 */
export function checkSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(-{2}|\/\*|\*\/|xp_|sp_)/i,
    /(;|'|"|\|\||&&)/,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File | undefined,
  maxSize: number = 10 * 1024 * 1024, // 10MB
  allowedTypes: string[] = ["image/jpeg", "image/png", "application/pdf"]
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  if (file.size > maxSize) {
    return { valid: false, error: "File too large" };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "File type not allowed" };
  }

  return { valid: true };
}

/**
 * Validate lead data
 */
export function validateLead(data: any) {
  const result = leadSchema.safeParse(data);
  return {
    success: result.success,
    data: result.data,
    error: result.error?.format(),
  };
}
