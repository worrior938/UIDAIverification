import { z } from 'zod';
import { insertUploadSchema, insertRecordSchema, uploads, records } from './schema';

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

export const api = {
  uploads: {
    create: {
      method: 'POST' as const,
      path: '/api/upload',
      // Input is FormData, handled specially in implementation
      responses: {
        201: z.custom<typeof uploads.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/uploads',
      responses: {
        200: z.array(z.custom<typeof uploads.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/uploads/:id',
      responses: {
        200: z.custom<typeof uploads.$inferSelect & { records: typeof records.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    records: {
      method: 'GET' as const,
      path: '/api/uploads/:id/records',
      input: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        search: z.string().optional(),
        status: z.enum(['Verified', 'Mismatch', 'NotFound']).optional(),
      }).optional(),
      responses: {
        200: z.object({
          data: z.array(z.custom<typeof records.$inferSelect>()),
          total: z.number(),
          page: z.number(),
          totalPages: z.number()
        }),
      },
    }
  },
  analytics: {
    stats: {
      method: 'GET' as const,
      path: '/api/analytics/stats',
      input: z.object({ uploadId: z.string().optional() }).optional(),
      responses: {
        200: z.object({
          total: z.number(),
          verified: z.number(),
          mismatch: z.number(),
          notFound: z.number(),
          verificationRate: z.number(),
        }),
      },
    },
    charts: {
      method: 'GET' as const,
      path: '/api/analytics/charts',
      input: z.object({ uploadId: z.string().optional() }).optional(),
      responses: {
        200: z.object({
          stateDistribution: z.array(z.object({
            state: z.string(),
            verified: z.number(),
            mismatch: z.number(),
            notFound: z.number(),
          })),
          districtAnalysis: z.array(z.object({
            district: z.string(),
            total: z.number(),
            verifiedRate: z.number(),
          })),
          ageDistribution: z.array(z.object({
            name: z.string(),
            value: z.number(),
          })),
          temporalTrends: z.array(z.object({
            date: z.string(),
            count: z.number(),
            verified: z.number(),
          })),
        }),
      },
    },
    insights: {
      method: 'GET' as const,
      path: '/api/analytics/insights',
      input: z.object({ uploadId: z.string().optional() }).optional(),
      responses: {
        200: z.object({
          topStates: z.array(z.string()),
          dominantAgeGroup: z.string(),
          verificationRate: z.number(),
          dateRange: z.object({ start: z.string(), end: z.string() }),
          anomalies: z.array(z.string()),
        }),
      },
    },
  },
};

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
