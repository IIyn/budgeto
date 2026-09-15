import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { db } from '@/server/db/client.server'
import { budgetMembers, budgets, categories, incomes, users } from '@/server/db/schema'
import { authMiddleware } from '../auth/auth.middleware'
import { completeOnboardingSchema } from '../budget/budget.schemas'

/** Creates the whole budget from the onboarding wizard in a single transaction. */
export const completeOnboardingFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(completeOnboardingSchema)
  .handler(({ data, context }) =>
    db.transaction(async (tx) => {
      await tx.update(users).set({ displayName: data.displayName }).where(eq(users.id, context.user.id))

      const [budget] = await tx.insert(budgets).values({ name: data.budgetName }).returning({ id: budgets.id })
      const budgetId = budget!.id

      await tx.insert(budgetMembers).values({ budgetId, userId: context.user.id, role: 'owner' })
      await tx.insert(incomes).values(data.incomes.map((income) => ({ ...income, budgetId })))

      if (data.categories.length > 0) {
        await tx
          .insert(categories)
          .values(data.categories.map((category, position) => ({ ...category, budgetId, position })))
      }

      return { budgetId }
    }),
  )
