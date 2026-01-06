import { z } from 'zod';
import { insertLeadSchema, leads } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  leads: {
    create: {
      method: 'POST' as const,
      path: '/api/leads',
      input: insertLeadSchema,
      responses: {
        201: z.custom<typeof leads.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/leads/:id',
      responses: {
        200: z.custom<typeof leads.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  ai: {
    generatePlan: {
      method: 'POST' as const,
      path: '/api/generate-plan',
      input: z.object({
        answers: z.record(z.any()),
        name: z.string(),
      }),
      responses: {
        200: z.object({
          profile: z.object({
            type: z.string(),
            batteryLevel: z.enum(["Low", "Medium", "High"]),
            mainBlocker: z.string(),
            secondaryBlocker: z.string(),
            skillTrack: z.string(),
          }),
          weeklyPlan: z.object({
            week1: z.string(),
            week2: z.string(),
            week3: z.string(),
            week4: z.string(),
          }),
          dailyMission: z.string(),
        }),
        500: errorSchemas.internal,
      },
    },
  },
};

// ============================================
// REQUIRED: buildUrl helper
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// ============================================
// TYPE HELPERS
// ============================================
export type CreateLeadInput = z.infer<typeof api.leads.create.input>;
export type PlanGenerationInput = z.infer<typeof api.ai.generatePlan.input>;
export type PlanGenerationResponse = z.infer<typeof api.ai.generatePlan.responses[200]>;
