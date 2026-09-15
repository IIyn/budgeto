import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '../env.server'
import * as schema from './schema'

const globalForDb = globalThis as unknown as { pgClient?: ReturnType<typeof postgres> }

// Reuse the connection pool across Vite HMR reloads in development.
const client = globalForDb.pgClient ?? postgres(env.DATABASE_URL, { max: env.DATABASE_POOL_MAX })
globalForDb.pgClient = client

export const db = drizzle(client, { schema })

export type Database = typeof db
export type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0]
