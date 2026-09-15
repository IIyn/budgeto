// Applies the SQL migrations from ./drizzle. Plain JS so it runs in the production image without a build step.
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

const url = process.env.DATABASE_URL ?? 'postgres://budgeto:budgeto@localhost:5432/budgeto'
const client = postgres(url, { max: 1, onnotice: () => {} })

try {
  await migrate(drizzle(client), { migrationsFolder: new URL('../drizzle', import.meta.url).pathname })
  console.log('✔ Database migrations applied')
} catch (error) {
  console.error('✘ Migration failed', error)
  process.exitCode = 1
} finally {
  await client.end()
}
