import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.url().default('postgres://budgeto:budgeto@localhost:5432/budgeto'),
  /** Public URL of the app. */
  // docker-compose passes an empty string when APP_URL is not set.
  APP_URL: z.preprocess((value) => (value === '' ? undefined : value), z.url().optional()),
  DATABASE_POOL_MAX: z.coerce.number().int().positive().default(10),
  SESSION_DAYS: z.coerce.number().int().positive().default(30),
})

export const env = envSchema.parse(process.env)
