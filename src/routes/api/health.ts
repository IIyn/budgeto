import { createFileRoute } from '@tanstack/react-router'
import { sql } from 'drizzle-orm'
import { db } from '@/server/db/client.server'

/** Used by the Docker healthcheck: checks that the server answers and the database is reachable. */
export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: async () => {
        try {
          await db.execute(sql`select 1`)
          return Response.json({ status: 'ok' })
        } catch {
          return Response.json({ status: 'database-unreachable' }, { status: 503 })
        }
      },
    },
  },
})
